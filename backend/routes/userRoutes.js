const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getUserByEmail, getUserByIndexNo, updateUser, getAllUsers } = require("../controllers/authController");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
// Register
router.post("/register", upload.single('photo'), registerUser);

// Login
router.post("/login", loginUser);

// Get user by email
router.get("/getByEmail/:email", getUserByEmail);

// Get user by index number
router.get("/getByIndexNo/:indexNo", getUserByIndexNo);

// Update user by ID
router.put("/update/:id", updateUser);

// Get all registered users (for admin dashboard)
router.get("/all", getAllUsers);

module.exports = router;
