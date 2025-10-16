const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getUserByEmail, getUserByIndexNo, updateUser } = require("../controllers/authController");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Get user by email
router.get("/getByEmail/:email", getUserByEmail);

// Get user by index number
router.get("/getByIndexNo/:indexNo", getUserByIndexNo);

// Update user by ID
router.put("/update/:id", updateUser);
router.post("/register", upload.single("pdfFile"), registerUser);


module.exports = router;
