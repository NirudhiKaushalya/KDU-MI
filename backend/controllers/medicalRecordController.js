const MedicalRecord = require("../models/medicalRecord");

//create new medicalRecord
exports.createMedicalRecord = async (req, res) => {
    try {
        const medicalRecord = new MedicalRecord(req.body);
        await medicalRecord.save();
        
        res.status(201).json({
            medicalRecord,
            message: "Medical record created successfully"
        });
        } catch (error) {
            res.status(400).json({ message: error.message});
        }
    };

// Get all medicalRecords
exports.getMedicalRecords = async (req,res) => {
    try{
        const medicalRecords = await MedicalRecord.find();
        res.json(medicalRecords);
    } catch (error) {
        res.status(500).json ({message: error.message});
    }
};

//Get single medicalRecord
exports.getMedicalRecordById = async (req,res) => {
    try{
        const medicalRecord = await MedicalRecord.findById(req.params.id);
        if (!medicalRecord) return res.status(404).json({message:"MedicalRecord not found"});
        res.json(medicalRecord);
       }catch (error) {
        res.status(500).json({message:error.message});
       }
};

//Update medicalRecord
exports.updateMedicalRecord = async (req, res) => {
    try{
        const updated = await MedicalRecord.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new: true}
        );
        if(!updated) return res.status(404).json({message: "MedicalRecord not found"});
        
        // Create notification for medical record update
        const Notification = require("../models/notification");
        const notification = new Notification({
            notificationID: Date.now(),
            medicalRecordID: req.params.id,
            patientID: updated.patientID,
            message: `Medical record for patient ${updated.patientID} has been updated`,
            type: 'medical_record_updated',
            category: 'medical-record'
        });
        await notification.save();
        
        res.json({
            medicalRecord: updated,
            notification: {
                message: "Medical record updated and notification sent"
            }
        });
    } catch (error) {
        res.status(400).json({message:error.message});
    }
};

//Delete medicalRecord
exports.deleteMedicalRecord = async (req, res) => {
    try{
        const deleted = await MedicalRecord.findByIdAndDelete(req.params.id);
        if(!deleted) return res.status(404).json({message:"MedicalRecord not found"});
        
        // Create notification for medical record deletion
        const Notification = require("../models/notification");
        const notification = new Notification({
            notificationID: Date.now(),
            medicalRecordID: req.params.id,
            patientID: deleted.patientID,
            message: `Medical record for patient ${deleted.patientID} has been deleted`,
            type: 'medical_record_deleted',
            category: 'medical-record'
        });
        await notification.save();
        
        res.json({
            message: "MedicalRecord deleted",
            notification: {
                message: "Medical record deleted and notification sent"
            }
        });
    }catch (error) {
        res.status(500).json({message: error.message});
    }
};