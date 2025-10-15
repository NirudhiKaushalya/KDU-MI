const Patient = require("../models/patient");

//create new patient (admit patient)
exports.createPatient = async (req, res) => {
    try {
        const patientData = req.body;
        
        // Generate unique ID if not provided
        if (!patientData.id) {
            patientData.id = `P${Date.now()}`;
        }

        const patient = new Patient(patientData);
        await patient.save();
        res.status(201).json(patient);
        } catch (error) {
            res.status(400).json({ message: error.message});
        }
    };

// Get all patients
exports.getPatients = async (req,res) => {
    try{
        const patients = await Patient.find();
        res.json(patients);
    } catch (error) {
        res.status(500).json ({message: error.message});
    }
};

//Get single patient
exports.getPatientById = async (req,res) => {
    try{
        const patient = await Patient.findById(req.params.id);
        if (!patient) return res.status(404).json({message:"Patient not found"});
        res.json(patient);
       }catch (error) {
        res.status(500).json({message:error.message});
       }
};

//Update patient
exports.updatePatient = async (req, res) => {
    try{
        const updated = await Patient.findByIdAndUpdate(
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

//Delete patient
exports.deletePatient = async (req, res) => {
    try{
        const deleted = await Patient.findByIdAndDelete(req.params.id);
        if(!deleted) return res.status(404).json({message:"Patient not found"});
        
        // Create notification for patient deletion
        const Notification = require("../models/notification");
        const notification = new Notification({
            notificationID: Date.now(),
            patientID: req.params.id,
            message: `Patient record removed`,
            type: 'patient_deleted',
            category: 'patient'
        });
        await notification.save();
        
        res.json({
            message: "Patient deleted",
            notification: {
                message: "Patient deleted and notification sent"
            }
        });
    }catch (error) {
        res.status(500).json({message: error.message});
    }
};

// Get patient by index number
exports.getPatientByIndexNo = async (req, res) => {
    try {
        const { indexNo } = req.params;
        const patient = await Patient.findOne({ indexNo });
        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }
        res.json(patient);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
