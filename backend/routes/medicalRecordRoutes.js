const express = require("express");
const router = express.Router();
const {
    createMedicalRecord,
    getMedicalRecords,
    getMedicalRecordById,
    updateMedicalRecord,
    deleteMedicalRecord
  } = require("../controllers/medicalRecordController");


router.post("/",createMedicalRecord);  //create
router.get("/",getMedicalRecords);     //Read all
router.get("/:id", getMedicalRecordById);  //Read one
router.put("/:id",updateMedicalRecord);     //update
router.delete("/:id",deleteMedicalRecord);     //delete

module.exports = router;