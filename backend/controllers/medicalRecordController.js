const MedicalRecord = require("../models/medicalRecord");

//create new medicalRecord
exports.createMedicalRecord = async (req, res) => {
    try {
        const medicalRecord = new MedicalRecord(req.body);
        await medicalRecord.save();
        
        // Create notification for new medical record
        const Notification = require("../models/notification");
        const notification = new Notification({
            notificationID: Date.now(),
            patientID: medicalRecord.patientID,
            message: `New medical record created for patient ${medicalRecord.patientID} - Diagnosis: ${medicalRecord.Diagnosis}`
        });
        await notification.save();
        
        res.status(201).json({
            medicalRecord,
            notification: {
                message: "Medical record created and notification sent"
            }
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
        if(!updated) return res.status(404).json({message: "User not found"});
        res.json(updated);
    } catch (error) {
        res.status(400).json({message:error.message});
    }
};

//Delete medicalRecord
exports.deleteMedicalRecord = async (req, res) => {
    try{
        const deleted = await MedicalRecord.findByIdAndDelete(req.params.id);
        if(!deleted) return res.status(404).json({message:"MedicalRecord not found"});
        res.json({message:"MedicalRecord deleted"});
    }catch (error) {
        res.status(500).json({message: error.message});
    }
};