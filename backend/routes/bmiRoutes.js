const express = require("express");
const router = express.Router();
const bmiController = require("../controllers/bmiController");

// GET /api/bmi/:userId -> get BMI for user
router.get("/:userId", bmiController.getBmi);

// PUT /api/bmi/:userId -> upsert BMI
router.put("/:userId", bmiController.upsertBmi);

// DELETE /api/bmi/:userId -> delete BMI
router.delete("/:userId", bmiController.deleteBmi);

module.exports = router;








