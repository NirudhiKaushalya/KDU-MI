const Admin = require("../models/admin");

//create new admin
exports.createAdmin = async (req, res) => {
    try {
        const admin = new Admin(req.body);
        await admin.save();
        res.status(201).json(admin);
        } catch (error) {
            res.status(400).json({ message: error.message});
        }
    };

// Get all admins
exports.getAdmins = async (req,res) => {
    try{
        const admins = await Admin.find();
        res.json(admins);
    } catch (error) {
        res.status(500).json ({message: error.message});
    }
};

//Get single admin
exports.getAdminById = async (req,res) => {
    try{
        const admin = await Admin.findById(req.params.id);
        if (!admin) return res.status(404).json({message:"Admin not found"});
        res.json(admin);
       }catch (error) {
        res.status(500).json({message:error.message});
       }
};

//Update admin
exports.updateAdmin = async (req, res) => {
    try{
        const updated = await Admin.findByIdAndUpdate(
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

//Delete admin
exports.deleteAdmin = async (req, res) => {
    try{
        const deleted = await Admin.findByIdAndDelete(req.params.id);
        if(!deleted) return res.status(404).json({message:"Admin not found"});
        res.json({message:"Admin deleted"});
    }catch (error) {
        res.status(500).json({message: error.message});
    }
};
