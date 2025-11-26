const express = require("express");
const router = express.Router();
const {
    createMedicine,
    getMedicines,
    getAllMedicines,
    getMedicineById,
    updateMedicine,
    deleteMedicine,
    getMedicineByName,
    searchMedicines,
    getMedicineStats,
    getMedicinesByCategory
  } = require("../controllers/medicineController");


router.post("/",createMedicine);  //create
router.get("/",getMedicines);     //Read recent medicines (last 7 days by default)
router.get("/all",getAllMedicines);     //Read all medicines
router.get("/stats", getMedicineStats);   //Get medicine statistics
router.get("/search", searchMedicines);  //Search medicines - MUST be before /:id
router.get("/category/:category", getMedicinesByCategory);  //Get by category - MUST be before /:id
router.get("/name/:medicineName", getMedicineByName);  //Read by name
router.get("/:id", getMedicineById);  //Read one - MUST be after specific routes
router.put("/:id",updateMedicine);     //update
router.delete("/:id",deleteMedicine);     //delete

module.exports = router;