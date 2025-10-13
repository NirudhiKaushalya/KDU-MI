const Patient = require("../models/patient");

//create new patient
exports.createPatient = async (req, res) => {
    try {
        const patient = new Patient(req.body);
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
        res.json({message:"Patient deleted"});
    }catch (error) {
        res.status(500).json({message: error.message});
    }
};
