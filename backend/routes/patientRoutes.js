const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
    createPatient,
    getPatients,
    getPatientById,
    updatePatient,
    deletePatient,
    getPatientByIndexNo,
    searchPatients,
    filterPatients,
    getPatientStats
  } = require("../controllers/patientController");


router.post("/", upload.array('labReports', 5), createPatient);  //create with file upload
router.get("/",getPatients);     //Read all
router.get("/stats", getPatientStats);  //Get patient statistics
router.get("/search", searchPatients);  //Search patients by index number
router.get("/filter", filterPatients);  //Filter patients with multiple criteria
router.get("/index/:indexNo", getPatientByIndexNo);  //Read by index number
router.get("/:id", getPatientById);  //Read one
router.put("/:id", upload.array('labReports', 5), updatePatient);     //update with file upload
router.delete("/:id",deletePatient);     //delete

module.exports = router;