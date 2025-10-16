const DeletionRequest = require("../models/deletionRequestModel");
const MedicalRecord = require("../models/medicalRecord");
const Patient = require("../models/patient");
const User = require("../models/userModel");

// Create a new deletion request
exports.createDeletionRequest = async (req, res) => {
  try {
    const { medicalRecordId, patientIndexNo, reason, consultedDate, condition } = req.body;
    const { id: adminId, userName: adminName } = req.user || { id: 'admin', userName: 'System Administrator' };

    // Find the patient by index number
    const patient = await User.findOne({ indexNo: patientIndexNo });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // For this system, we'll create a deletion request without requiring an existing medical record
    // This allows the admin to request deletion of patient data even if no formal medical record exists
    // The user can then approve or reject the deletion of their patient information
    
    let finalMedicalRecordId = null;
    
    // Try to find an existing medical record if we have a valid ObjectId
    if (medicalRecordId && medicalRecordId.match(/^[0-9a-fA-F]{24}$/)) {
      const existingRecord = await MedicalRecord.findById(medicalRecordId);
      if (existingRecord) {
        finalMedicalRecordId = existingRecord._id;
      }
    }
    
    // If no existing record, we'll create a placeholder record for the deletion request
    if (!finalMedicalRecordId) {
      const newRecord = await MedicalRecord.create({
        recordID: Date.now(),
        patientID: parseInt(patientIndexNo.replace(/\D/g, '')) || 1,
        role: 'Student',
        Diagnosis: condition || 'General',
        consultedTime: consultedDate || new Date().toISOString()
      });
      finalMedicalRecordId = newRecord._id;
    }

    // Check if there's already a pending request for this record
    const existingRequest = await DeletionRequest.findOne({
      medicalRecordId: finalMedicalRecordId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ message: "A deletion request for this record is already pending" });
    }

    // Create the deletion request
    const deletionRequest = await DeletionRequest.create({
      medicalRecordId: finalMedicalRecordId,
      patientIndexNo,
      patientEmail: patient.email,
      adminId,
      adminName,
      reason
    });

    // Create notification for the patient about the deletion request
    const Notification = require("../models/notification");
    const notification = new Notification({
      notificationID: Date.now(),
      patientID: patientIndexNo,
      message: `You have received a deletion request for your medical record. Please review and respond.`,
      type: 'deletion_request_received',
      category: 'patient'
    });
    await notification.save();

    res.status(201).json({
      message: "Deletion request sent successfully",
      request: deletionRequest
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all deletion requests for a patient
exports.getDeletionRequestsByPatient = async (req, res) => {
  try {
    const { indexNo } = req.params;

    const requests = await DeletionRequest.find({ patientIndexNo: indexNo })
      .populate('medicalRecordId')
      .sort({ requestedAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all deletion requests (admin view)
exports.getAllDeletionRequests = async (req, res) => {
  try {
    const requests = await DeletionRequest.find()
      .populate('medicalRecordId')
      .sort({ requestedAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Respond to a deletion request (approve/reject)
exports.respondToDeletionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { response, patientResponse } = req.body; // response: 'approved' or 'rejected'

    const deletionRequest = await DeletionRequest.findById(requestId);
    if (!deletionRequest) {
      return res.status(404).json({ message: "Deletion request not found" });
    }

    if (deletionRequest.status !== 'pending') {
      return res.status(400).json({ message: "This request has already been responded to" });
    }

    // Update the request status
    deletionRequest.status = response;
    deletionRequest.respondedAt = new Date();
    deletionRequest.patientResponse = patientResponse || '';

    await deletionRequest.save();

    // If approved, delete both the medical record and the corresponding patient record
    if (response === 'approved') {
      // Delete the medical record
      await MedicalRecord.findByIdAndDelete(deletionRequest.medicalRecordId);
      
      // Delete the corresponding patient record from the patient collection
      // We need to find the patient record that matches the deletion request
      const patientRecord = await Patient.findOne({ indexNo: deletionRequest.patientIndexNo });
      if (patientRecord) {
        await Patient.findByIdAndDelete(patientRecord._id);
        console.log(`Patient record deleted for index: ${deletionRequest.patientIndexNo}`);
      }
      
      // Create notification for approved deletion request
      const Notification = require("../models/notification");
      const notification = new Notification({
        notificationID: Date.now(),
        patientID: deletionRequest.patientIndexNo,
        message: `Patient deletion request approved - Index: ${deletionRequest.patientIndexNo}`,
        type: 'deletion_request_approved',
        category: 'patient'
      });
      await notification.save();
    } else {
      // Create notification for rejected deletion request
      const Notification = require("../models/notification");
      const notification = new Notification({
        notificationID: Date.now(),
        patientID: deletionRequest.patientIndexNo,
        message: `Patient deletion request rejected - Index: ${deletionRequest.patientIndexNo}`,
        type: 'deletion_request_rejected',
        category: 'patient'
      });
      await notification.save();
    }

    res.status(200).json({
      message: `Deletion request ${response} successfully`,
      request: deletionRequest,
      deletedPatientIndex: response === 'approved' ? deletionRequest.patientIndexNo : null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get pending deletion requests count for notifications
exports.getPendingRequestsCount = async (req, res) => {
  try {
    const { indexNo } = req.params;

    const count = await DeletionRequest.countDocuments({
      patientIndexNo: indexNo,
      status: 'pending'
    });

    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
