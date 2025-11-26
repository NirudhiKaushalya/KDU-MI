const mongoose = require("mongoose");

const bmiSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true, unique: true },
    heightCm: { type: Number, required: true },
    weightKg: { type: Number, required: true },
    bmiValue: { type: Number, required: true },
    bmiCategory: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bmi", bmiSchema);








