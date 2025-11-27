const express = require("express");
const router = express.Router();
const path = require("path");
const { registerUser, loginUser, getUserByEmail, getUserByIndexNo, updateUser, getAllUsers, forgotPassword, resetPassword, verifyResetToken } = require("../controllers/authController");
const multer = require("multer");

// Configure multer for user photo uploads with disk storage
const photoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profiles/');
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const photoUpload = multer({ 
  storage: photoStorage,
  fileFilter: (req, file, cb) => {
    // Allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for profile photos'), false);
    }
  },
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit for photos (reduced to prevent field too long)
  }
});

// Register with error handling for multer
router.post("/register", (req, res, next) => {
  photoUpload.single('photo')(req, res, (err) => {
    if (err) {
      // Handle multer errors
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Photo file size too large. Maximum size is 2MB.' });
      }
      if (err.message.includes('Only image files')) {
        return res.status(400).json({ message: 'Only image files are allowed for profile photos.' });
      }
      return res.status(400).json({ message: 'Photo upload error: ' + err.message });
    }
    next();
  });
}, registerUser);

// Login
router.post("/login", loginUser);

// Get user by email
router.get("/getByEmail/:email", getUserByEmail);

// Get user by index number
router.get("/getByIndexNo/:indexNo", getUserByIndexNo);

// Update user by ID (with photo upload support)
router.put("/update/:id", (req, res, next) => {
  photoUpload.single('photo')(req, res, (err) => {
    if (err) {
      // Handle multer errors
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Photo file size too large. Maximum size is 2MB.' });
      }
      if (err.message.includes('Only image files')) {
        return res.status(400).json({ message: 'Only image files are allowed for profile photos.' });
      }
      return res.status(400).json({ message: 'Photo upload error: ' + err.message });
    }
    next();
  });
}, updateUser);

// Get all registered users (for admin dashboard)
router.get("/all", getAllUsers);

// Forgot password - send reset email
router.post("/forgot-password", forgotPassword);

// Verify reset token
router.get("/reset-password/:token", verifyResetToken);

// Reset password with token
router.post("/reset-password/:token", resetPassword);

module.exports = router;
