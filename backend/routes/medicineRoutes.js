const express = require("express");
const router = express.Router();
const {
    createMedicine,
    getMedicines,
    getMedicineById,
    updateMedicine,
    deleteMedicine
  } = require("../controllers/medicineController");


router.post("/",createMedicine);  //create
router.get("/",getMedicines);     //Read all
router.get("/:id", getMedicineById);  //Read one
router.put("/:id",updateMedicine);     //update
router.delete("/:id",deleteMedicine);     //delete

module.exports = router;