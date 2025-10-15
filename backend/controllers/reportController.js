const Report = require("../models/report");

//create new report
exports.createReport = async (req, res) => {
    try {
        const reportData = req.body;
        
        // Generate unique ID if not provided
        if (!reportData.id) {
            reportData.id = `R${Date.now()}`;
        }

        const report = new Report(reportData);
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
        if(!updated) return res.status(404).json({message: "Report not found"});
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

// Generate report from data
exports.generateReport = async (req, res) => {
    try {
        const { type, title, data, filters = {} } = req.body;
        
        // Generate report data based on type
        let reportData = [];
        
        if (type === 'medicine') {
            const Medicine = require("../models/medicine");
            reportData = await Medicine.find();
        } else if (type === 'patient') {
            const Patient = require("../models/patient");
            reportData = await Patient.find();
        } else if (type === 'inventory') {
            const Medicine = require("../models/medicine");
            reportData = await Medicine.find();
        } else if (type === 'custom' && data) {
            reportData = data; // Use provided data
        }

        // Create report record
        const reportId = `R${Date.now()}`;
        const currentDate = new Date().toISOString().split('T')[0];
        const currentTime = new Date().toLocaleTimeString();

        const report = new Report({
            id: reportId,
            title: title || `${type} Report`,
            type: type,
            generatedDate: currentDate,
            generatedTime: currentTime,
            data: reportData,
            filters: filters,
            totalRecords: reportData.length,
            generatedBy: 'System'
        });

        await report.save();
        res.status(201).json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
