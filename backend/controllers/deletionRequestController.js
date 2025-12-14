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
    const patientNotification = new Notification({
      notificationID: Date.now(),
      patientID: patientIndexNo,
      message: `You have received a deletion request for your medical record. Please review and respond.`,
      type: 'deletion_request_received',
      category: 'patient'
    });
    await patientNotification.save();

    // Create notification for admin/system about the deletion request
    const adminNotification = new Notification({
      notificationID: Date.now() + 1, // Ensure unique ID
      patientID: 'admin', // Mark as admin notification
      message: `You have received a medical record deletion request for patient ${patientIndexNo}. Reason: ${reason}`,
      type: 'deletion_request_admin',
      category: 'admin'
    });
    await adminNotification.save();

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

    const requests = await DeletionRequest.find({ 
      patientIndexNo: indexNo,
      dismissedByPatient: false // Only return non-dismissed requests
    })
      .populate('medicalRecordId')
      .sort({ requestedAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all deletion requests (admin view) - includes dismissed requests
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

// User responds to a deletion request (approve/reject) - Step 1
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

    // Update the request status based on user response
    // If user approves, it goes to 'user_approved' for admin final confirmation
    // If user rejects, it goes to 'user_rejected' and process ends
    deletionRequest.status = response === 'approved' ? 'user_approved' : 'user_rejected';
    deletionRequest.userRespondedAt = new Date();
    deletionRequest.patientResponse = patientResponse || '';

    await deletionRequest.save();

    const Notification = require("../models/notification");

    if (response === 'approved') {
      // User approved - send notification to admin for final confirmation
      const adminNotification = new Notification({
        notificationID: Date.now(),
        patientID: 'admin',
        message: `Patient ${deletionRequest.patientIndexNo} has approved the deletion request. Awaiting your final confirmation to delete the record.`,
        type: 'deletion_user_approved',
        category: 'admin'
      });
      await adminNotification.save();

      // Also notify the user that their approval is pending admin confirmation
      const userNotification = new Notification({
        notificationID: Date.now() + 1,
        patientID: deletionRequest.patientIndexNo,
        message: `Your approval for the deletion request has been sent to the admin for final confirmation.`,
        type: 'deletion_pending_admin',
        category: 'patient'
      });
      await userNotification.save();

      res.status(200).json({
        message: "Your approval has been sent to admin for final confirmation",
        request: deletionRequest,
        awaitingAdminConfirmation: true
      });
    } else {
      // User rejected - notify admin and end process
      const adminNotification = new Notification({
        notificationID: Date.now(),
        patientID: 'admin',
        message: `Patient ${deletionRequest.patientIndexNo} has rejected the deletion request.`,
        type: 'deletion_user_rejected',
        category: 'admin'
      });
      await adminNotification.save();

      res.status(200).json({
        message: "Deletion request rejected successfully",
        request: deletionRequest
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin confirms or rejects the user-approved deletion request - Step 2
exports.adminConfirmDeletion = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { response, adminResponse } = req.body; // response: 'confirm' or 'reject'

    const deletionRequest = await DeletionRequest.findById(requestId);
    if (!deletionRequest) {
      return res.status(404).json({ message: "Deletion request not found" });
    }

    if (deletionRequest.status !== 'user_approved') {
      return res.status(400).json({ message: "This request is not awaiting admin confirmation" });
    }

    const Notification = require("../models/notification");

    if (response === 'confirm') {
      // Admin confirms - delete the records
      deletionRequest.status = 'admin_confirmed';
      deletionRequest.adminConfirmedAt = new Date();
      deletionRequest.adminFinalResponse = adminResponse || 'Deletion confirmed';

      await deletionRequest.save();

      // Delete the medical record
      await MedicalRecord.findByIdAndDelete(deletionRequest.medicalRecordId);
      
      // Delete the corresponding patient record from the patient collection
      const patientRecord = await Patient.findOne({ indexNo: deletionRequest.patientIndexNo });
      if (patientRecord) {
        await Patient.findByIdAndDelete(patientRecord._id);
        console.log(`Patient record deleted for index: ${deletionRequest.patientIndexNo}`);
      }
      
      // Notify the patient that their record has been deleted
      const userNotification = new Notification({
        notificationID: Date.now(),
        patientID: deletionRequest.patientIndexNo,
        message: `Your medical record has been permanently deleted as per your approval.`,
        type: 'deletion_completed',
        category: 'patient'
      });
      await userNotification.save();

      res.status(200).json({
        message: "Medical record deleted successfully",
        request: deletionRequest,
        deletedPatientIndex: deletionRequest.patientIndexNo
      });
    } else {
      // Admin rejects - cancel the deletion
      deletionRequest.status = 'admin_rejected';
      deletionRequest.adminConfirmedAt = new Date();
      deletionRequest.adminFinalResponse = adminResponse || 'Deletion cancelled by admin';

      await deletionRequest.save();

      // Notify the patient that the deletion was cancelled by admin
      const userNotification = new Notification({
        notificationID: Date.now(),
        patientID: deletionRequest.patientIndexNo,
        message: `The deletion request was cancelled by the admin. Your medical record remains intact.`,
        type: 'deletion_cancelled',
        category: 'patient'
      });
      await userNotification.save();

      res.status(200).json({
        message: "Deletion request cancelled",
        request: deletionRequest
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get deletion requests awaiting admin confirmation
exports.getPendingAdminConfirmation = async (req, res) => {
  try {
    const requests = await DeletionRequest.find({ 
      status: 'user_approved'
    })
      .populate('medicalRecordId')
      .sort({ userRespondedAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Dismiss a deletion request (hide from patient view)
exports.dismissDeletionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { patientIndexNo } = req.body; // Get patient index from request body

    console.log(`Dismiss request - RequestId: ${requestId}, PatientIndexNo: ${patientIndexNo}`);

    // Find the specific deletion request
    const deletionRequest = await DeletionRequest.findById(requestId);
    if (!deletionRequest) {
      console.log(`Deletion request not found: ${requestId}`);
      return res.status(404).json({ message: "Deletion request not found" });
    }

    console.log(`Found deletion request - PatientIndexNo: ${deletionRequest.patientIndexNo}, Status: ${deletionRequest.status}, Dismissed: ${deletionRequest.dismissedByPatient}`);

    // Verify that the request belongs to the patient making the dismiss request
    if (deletionRequest.patientIndexNo !== patientIndexNo) {
      console.log(`Permission denied - Request belongs to ${deletionRequest.patientIndexNo}, but user is ${patientIndexNo}`);
      return res.status(403).json({ 
        message: "You can only dismiss your own deletion requests" 
      });
    }

    // Check if already dismissed
    if (deletionRequest.dismissedByPatient) {
      console.log(`Request already dismissed: ${requestId}`);
      return res.status(400).json({ 
        message: "This deletion request has already been dismissed" 
      });
    }

    // Mark as dismissed by patient
    deletionRequest.dismissedByPatient = true;
    deletionRequest.dismissedAt = new Date();

    await deletionRequest.save();

    console.log(`Successfully dismissed request: ${requestId} for patient: ${patientIndexNo}`);

    res.status(200).json({
      message: "Deletion request dismissed successfully",
      request: deletionRequest
    });
  } catch (error) {
    console.error('Error dismissing deletion request:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get pending deletion requests count for notifications
exports.getPendingRequestsCount = async (req, res) => {
  try {
    const { indexNo } = req.params;

    const count = await DeletionRequest.countDocuments({
      patientIndexNo: indexNo,
      status: 'pending',
      dismissedByPatient: false // Only count non-dismissed requests
    });

    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Clean up old pending requests (admin only)
exports.cleanupOldRequests = async (req, res) => {
  try {
    // Delete all requests with old 'pending' status (from before the two-step flow was implemented)
    // Also delete requests with 'approved' or 'rejected' status (old system)
    const result = await DeletionRequest.deleteMany({
      status: { $in: ['pending', 'approved', 'rejected'] }
    });

    console.log(`Cleaned up ${result.deletedCount} old deletion requests`);

    res.status(200).json({
      message: `Successfully cleaned up ${result.deletedCount} old deletion requests`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error cleaning up old requests:', error);
    res.status(500).json({ message: error.message });
  }
};

// Remove a single deletion request from the list (admin only)
exports.removeDeletionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const deletionRequest = await DeletionRequest.findById(requestId);
    if (!deletionRequest) {
      return res.status(404).json({ message: "Deletion request not found" });
    }

    await DeletionRequest.findByIdAndDelete(requestId);

    console.log(`Removed deletion request: ${requestId}`);

    res.status(200).json({
      message: "Deletion request removed successfully",
      requestId: requestId
    });
  } catch (error) {
    console.error('Error removing deletion request:', error);
    res.status(500).json({ message: error.message });
  }
};
