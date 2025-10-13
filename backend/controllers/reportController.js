const Report = require("../models/report");

//create new report
exports.createReport = async (req, res) => {
    try {
        const report = new Report(req.body);
        await report.save();
        res.status(201).json(report);
        } catch (error) {
            res.status(400).json({ message: error.message});
        }
    };

// Get all reports
exports.getReports = async (req,res) => {
    try{
        const reports = await Report.find();
        res.json(reports);
    } catch (error) {
        res.status(500).json ({message: error.message});
    }
};

//Get single report
exports.getReportById = async (req,res) => {
    try{
        const report = await Report.findById(req.params.id);
        if (!report) return res.status(404).json({message:"Report not found"});
        res.json(report);
       }catch (error) {
        res.status(500).json({message:error.message});
       }
};

//Update report
exports.updateReport = async (req, res) => {
    try{
        const updated = await Report.findByIdAndUpdate(
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

//Delete report
exports.deleteReport = async (req, res) => {
    try{
        const deleted = await Report.findByIdAndDelete(req.params.id);
        if(!deleted) return res.status(404).json({message:"Report not found"});
        res.json({message:"Report deleted"});
    }catch (error) {
        res.status(500).json({message: error.message});
    }
};
