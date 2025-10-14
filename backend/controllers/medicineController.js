const Medicine = require("../models/medicine");

//create new medicine
exports.createMedicine = async (req, res) => {
    try {
        const medicine = new Medicine(req.body);
        await medicine.save();
        res.status(201).json(medicine);
        } catch (error) {
            res.status(400).json({ message: error.message});
        }
    };

// Get all medicines
exports.getMedicines = async (req,res) => {
    try{
        const medicines = await Medicine.find();
        res.json(medicines);
    } catch (error) {
        res.status(500).json ({message: error.message});
    }
};

//Get single medicine
exports.getMedicineById = async (req,res) => {
    try{
        const medicine = await Medicine.findById(req.params.id);
        if (!medicine) return res.status(404).json({message:"Medicine not found"});
        res.json(medicine);
       }catch (error) {
        res.status(500).json({message:error.message});
       }
};

//Update medicine
exports.updateMedicine = async (req, res) => {
    try{
        const updated = await Medicine.findByIdAndUpdate(
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

//Delete medicine
exports.deleteMedicine = async (req, res) => {
    try{
        const deleted = await Medicine.findByIdAndDelete(req.params.id);
        if(!deleted) return res.status(404).json({message:"Medicine not found"});
        
        // Create notification for medicine deletion
        const Notification = require("../models/notification");
        const notification = new Notification({
            notificationID: Date.now(),
            medicineID: req.params.id,
            message: `Medicine "${deleted.name}" has been removed from stock`,
            type: 'medicine_deleted',
            category: 'medicine'
        });
        await notification.save();
        
        res.json({
            message: "Medicine deleted",
            notification: {
                message: "Medicine deleted and notification sent"
            }
        });
    }catch (error) {
        res.status(500).json({message: error.message});
    }
};
