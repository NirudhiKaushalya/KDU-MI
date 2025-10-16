const express = require("express");
const router = express.Router();
const {
  createDeletionRequest,
  getDeletionRequestsByPatient,
  getAllDeletionRequests,
  respondToDeletionRequest,
  getPendingRequestsCount
} = require("../controllers/deletionRequestController");

// Create a new deletion request (admin only)
router.post("/create", createDeletionRequest);

// Get deletion requests for a specific patient
router.get("/patient/:indexNo", getDeletionRequestsByPatient);

// Get all deletion requests (admin view)
router.get("/all", getAllDeletionRequests);

// Respond to a deletion request (approve/reject)
router.put("/respond/:requestId", respondToDeletionRequest);

// Get pending requests count for notifications
router.get("/pending-count/:indexNo", getPendingRequestsCount);

module.exports = router;


