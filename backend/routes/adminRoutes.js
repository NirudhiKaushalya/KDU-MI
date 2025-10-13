const express = require("express");
const router = express.Router();
const{
    createAdmin,
    getAdmins,
    getAdminById,
    updateAdmin,
    deleteAdmin
} = require ("../controllers/adminController");

router.post("/",createAdmin);  //create
router.get("/",getAdmins);     //Read all
router.get("/:id", getAdminById);  //Read one
router.put("/:id",updateAdmin);     //update
router.delete("/:id",deleteAdmin);     //delete

module.exports = router;