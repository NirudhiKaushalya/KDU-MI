const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true },
    indexNo: { type: String, required: true },
    gender: { type: String, required: true },
    dob: { type: String, required: true }, // Changed to String to match frontend
    email: { type: String, required: true, unique: true },
    contactNo: { type: String, required: true },
    role: { type: String, required: true },
    department: { type: String, required: true },
    intake: { type: String },
    password: { type: String, required: true },
    additionalNotes: { type: String, default: '' }, // Added for frontend compatibility
    photoData: {
      name: { type: String },
      size: { type: Number },
      type: { type: String },
      data: { type: String }, // Base64 encoded photo data (for frontend uploads)
      path: { type: String }, // File path (for multer uploads)
      filename: { type: String } // Generated filename
    },
    photoPreview: { type: String }, // Added for frontend photo preview
    pdfFile: {
      name: { type: String },
      size: { type: Number },
      type: { type: String }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
