const Patient = require("../models/patient");

//create new patient (admit patient)
exports.createPatient = async (req, res) => {
    try {
        const patientData = req.body;
        
        // Generate unique ID if not provided
        if (!patientData.id) {
            patientData.id = `P${Date.now()}`;
        }

        // Handle data type conversions for FormData
        if (patientData.age && patientData.age !== 'null' && patientData.age !== '') {
            patientData.age = parseInt(patientData.age);
        } else {
            patientData.age = null;
        }

        // Parse prescribedMedicines if it's a string (from FormData)
        if (typeof patientData.prescribedMedicines === 'string') {
            try {
                patientData.prescribedMedicines = JSON.parse(patientData.prescribedMedicines);
            } catch (e) {
                console.error('Error parsing prescribedMedicines:', e);
                patientData.prescribedMedicines = [];
            }
        }

        // Ensure prescribedMedicines is an array
        if (!Array.isArray(patientData.prescribedMedicines)) {
            patientData.prescribedMedicines = [];
        }

        // Convert quantity to number for each medicine
        if (Array.isArray(patientData.prescribedMedicines)) {
            patientData.prescribedMedicines = patientData.prescribedMedicines.map(medicine => ({
                ...medicine,
                quantity: parseInt(medicine.quantity) || 0
            }));
        }

        // Handle uploaded lab report files
        if (req.files && req.files.length > 0) {
            const labReports = req.files.map(file => ({
                name: file.originalname,
                filename: file.filename,
                path: file.path,
                size: file.size,
                type: file.mimetype,
                url: `http://localhost:8000/uploads/${file.filename}`
            }));
            patientData.labReports = labReports;
        }

        console.log('Processed patient data:', patientData);
        const patient = new Patient(patientData);
        await patient.save();
        res.status(201).json(patient);
        } catch (error) {
            console.error('Error creating patient:', error);
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
        const updateData = req.body;
        
        // Handle data type conversions for FormData
        if (updateData.age && updateData.age !== 'null' && updateData.age !== '') {
            updateData.age = parseInt(updateData.age);
        } else if (updateData.age === 'null' || updateData.age === '') {
            updateData.age = null;
        }

        // Parse prescribedMedicines if it's a string (from FormData)
        if (typeof updateData.prescribedMedicines === 'string') {
            try {
                updateData.prescribedMedicines = JSON.parse(updateData.prescribedMedicines);
            } catch (e) {
                console.error('Error parsing prescribedMedicines:', e);
                updateData.prescribedMedicines = [];
            }
        }

        // Ensure prescribedMedicines is an array
        if (!Array.isArray(updateData.prescribedMedicines)) {
            updateData.prescribedMedicines = [];
        }

        // Convert quantity to number for each medicine
        if (Array.isArray(updateData.prescribedMedicines)) {
            updateData.prescribedMedicines = updateData.prescribedMedicines.map(medicine => ({
                ...medicine,
                quantity: parseInt(medicine.quantity) || 0
            }));
        }
        
        // Handle uploaded lab report files
        if (req.files && req.files.length > 0) {
            const labReports = req.files.map(file => ({
                name: file.originalname,
                filename: file.filename,
                path: file.path,
                size: file.size,
                type: file.mimetype,
                url: `http://localhost:8000/uploads/${file.filename}`
            }));
            updateData.labReports = labReports;
        }

        console.log('Processed update data:', updateData);
        const updated = await Patient.findByIdAndUpdate(
            req.params.id,
            updateData,
            {new: true}
        );
        if(!updated) return res.status(404).json({message: "User not found"});
        res.json(updated);
    } catch (error) {
        console.error('Error updating patient:', error);
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
