const Bmi = require("../models/bmi");

exports.getBmi = async (req, res) => {
  try {
    const { userId } = req.params;
    const record = await Bmi.findOne({ userId });
    if (!record) return res.status(404).json({ message: "BMI not found" });
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.upsertBmi = async (req, res) => {
  try {
    const { userId } = req.params;
    const { heightCm, weightKg, bmiValue, bmiCategory } = req.body;
    const updated = await Bmi.findOneAndUpdate(
      { userId },
      { userId, heightCm, weightKg, bmiValue, bmiCategory },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteBmi = async (req, res) => {
  try {
    const { userId } = req.params;
    await Bmi.findOneAndDelete({ userId });
    res.json({ message: "BMI deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


