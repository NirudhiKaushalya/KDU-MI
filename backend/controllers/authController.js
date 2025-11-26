const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

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

// Forgot Password - Send reset email
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No account found with that email address" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save token to user with 1 hour expiry
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Create email transporter
    // Configure with your email service (Gmail, SendGrid, etc.)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
      }
    });

    // Reset URL - points to frontend reset page
    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

    // Email content
    const mailOptions = {
      from: '"KDU Medical Unit" <noreply@kdu-medical.com>',
      to: user.email,
      subject: 'Password Reset Request - KDU Medical Unit',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">KDU Medical Inspection Unit</h1>
          </div>
          <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1f2937;">Password Reset Request</h2>
            <p style="color: #4b5563;">Hello ${user.userName},</p>
            <p style="color: #4b5563;">We received a request to reset your password. Click the button below to create a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: #1e40af; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">This link will expire in 1 hour.</p>
            <p style="color: #6b7280; font-size: 14px;">If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              KDU Medical Inspection Unit<br>
              This is an automated message, please do not reply.
            </p>
          </div>
        </div>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      message: "Password reset email sent successfully",
      email: user.email 
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: "Error sending reset email. Please try again later." });
  }
};

// Reset Password - Verify token and update password
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Hash the token to compare with stored hash
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful. You can now login with your new password." });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: "Error resetting password. Please try again." });
  }
};

// Verify reset token (check if token is valid)
exports.verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ valid: false, message: "Invalid or expired reset token" });
    }

    res.status(200).json({ valid: true, email: user.email });

  } catch (error) {
    res.status(500).json({ valid: false, message: "Error verifying token" });
  }
};
