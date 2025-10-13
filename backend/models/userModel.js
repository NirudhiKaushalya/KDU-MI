const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true },
    indexNo: { type: String, required: true },
    gender: { type: String, required: true },
    dob: { type: Date, required: true },
    email: { type: String, required: true, unique: true },
    contactNo: { type: String, required: true },
    role: { type: String, required: true },
    intake: { type: String },
    password: { type: String, required: true },
    pdfFile: {
      name: String,
      size: Number,
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
