const express = require("express");
const router = express.Router();
const{
    createReport,
    getReports,
    getReportById,
    updateReport,
    deleteReport,
    generateReport
} = require("../controllers/reportController");

router.post("/",createReport);  //create
router.post("/generate",generateReport);  //generate report from data
router.get("/",getReports);     //Read all
router.get("/:id", getReportById);  //Read one
router.put("/:id",updateReport);     //update
router.delete("/:id",deleteReport);     //delete

module.exports = router;