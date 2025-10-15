const express = require("express");
const router = express.Router();
const {
    createPatient,
    getPatients,
    getPatientById,
    updatePatient,
    deletePatient,
    getPatientByIndexNo
  } = require("../controllers/patientController");


router.post("/",createPatient);  //create
router.get("/",getPatients);     //Read all
router.get("/index/:indexNo", getPatientByIndexNo);  //Read by index number
router.get("/:id", getPatientById);  //Read one
router.put("/:id",updatePatient);     //update
router.delete("/:id",deletePatient);     //delete

module.exports = router;