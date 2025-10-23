const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
  try {
    // Check for multer errors first
    if (req.fileValidationError) {
      return res.status(400).json({ message: req.fileValidationError });
    }

    const { userName, indexNo, gender, dob, email, contactNo, role, intake, department, password, additionalNotes, photoPreview, photoFile } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    let pdfFile = null;
    if (req.file) {
      pdfFile = {
        name: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype
      };
    }

    // Handle photo data - store file path instead of base64 data
    let photoData = null;
    console.log('Registration - req.file:', req.file);
    console.log('Registration - req.body:', req.body);
    
    if (req.file && req.file.mimetype.startsWith('image/')) {
      // Handle multer file upload for photos - store file path
      photoData = {
        name: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,
        path: req.file.path, // Store file path instead of base64
        filename: req.file.filename
      };
      console.log('Photo uploaded via multer:', photoData.name, photoData.size, photoData.type, photoData.path);
    }
    // Note: Removed base64 handling to prevent "Field value too long" errors
    
    console.log('Registration - Final photoData:', photoData);

    const user = await User.create({
      userName,
      indexNo,
      gender,
      dob,
      email,
      contactNo,
      role,
      intake,
      department,
      additionalNotes: additionalNotes || '',
      photoPreview: null, // No longer using base64 preview
      photoData: photoData, // Will be null if no photo uploaded
      password: hashedPassword,
      pdfFile
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: user._id,
        userName: user.userName,
        indexNo: user.indexNo,
        gender: user.gender,
        dob: user.dob,
        email: user.email,
        contactNo: user.contactNo,
        role: user.role,
        department: user.department,
        intake: user.intake,
        additionalNotes: user.additionalNotes,
        photoPreview: user.photoPreview,
        photoData: user.photoData
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for admin credentials
    if (email === "Admin@gmail.com" && password === "Admin@123") {
      const token = jwt.sign(
        { 
          id: "admin", 
          email: "Admin@gmail.com", 
          role: "admin" 
        },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "24h" }
      );

      return res.status(200).json({
        message: "Admin login successful",
        token,
        user: {
          _id: "admin",
          userName: "Admin",
          indexNo: "ADMIN001",
          gender: "other",
          dob: "1990-01-01",
          email: "Admin@gmail.com",
          contactNo: "+1234567890",
          role: "admin",
          intake: "Admin",
          department: "Administration",
          additionalNotes: "System Administrator",
          photoPreview: null,
          photoData: null
        }
      });
    }

    // Regular user login
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    console.log('User login - photoPreview:', user.photoPreview);
    console.log('User login - photoData:', user.photoData);
    
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        userName: user.userName,
        indexNo: user.indexNo,
        gender: user.gender,
        dob: user.dob,
        email: user.email,
        contactNo: user.contactNo,
        role: user.role,
        intake: user.intake,
        department: user.department,
        additionalNotes: user.additionalNotes,
        photoPreview: user.photoPreview,
        photoData: user.photoData
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      _id: user._id,
      userName: user.userName,
      indexNo: user.indexNo,
      gender: user.gender,
      dob: user.dob,
      email: user.email,
      contactNo: user.contactNo,
      role: user.role,
      department: user.department,
      intake: user.intake,
      additionalNotes: user.additionalNotes,
      photoPreview: user.photoPreview,
      photoData: user.photoData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserByIndexNo = async (req, res) => {
  try {
    const { indexNo } = req.params;
    const user = await User.findOne({ indexNo });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      _id: user._id,
      userName: user.userName,
      indexNo: user.indexNo,
      gender: user.gender,
      dob: user.dob,
      email: user.email,
      contactNo: user.contactNo,
      role: user.role,
      department: user.department,
      intake: user.intake,
      additionalNotes: user.additionalNotes,
      photoPreview: user.photoPreview,
      photoData: user.photoData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If password is being updated, hash it
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      _id: updatedUser._id,
      userName: updatedUser.userName,
      indexNo: updatedUser.indexNo,
      gender: updatedUser.gender,
      dob: updatedUser.dob,
      email: updatedUser.email,
      contactNo: updatedUser.contactNo,
      role: updatedUser.role,
      department: updatedUser.department,
      intake: updatedUser.intake,
      additionalNotes: updatedUser.additionalNotes,
      photoPreview: updatedUser.photoPreview,
      photoData: updatedUser.photoData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all registered users (for admin dashboard)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, {
      _id: 1,
      userName: 1,
      indexNo: 1,
      email: 1,
      role: 1,
      department: 1,
      intake: 1,
      createdAt: 1
    }).sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
