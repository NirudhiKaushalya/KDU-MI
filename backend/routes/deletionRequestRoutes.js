const express = require("express");
const router = express.Router();
const {
  createDeletionRequest,
  getDeletionRequestsByPatient,
  getAllDeletionRequests,
  respondToDeletionRequest,
  dismissDeletionRequest,
  getPendingRequestsCount,
  adminConfirmDeletion,
  getPendingAdminConfirmation,
  cleanupOldRequests,
  removeDeletionRequest
} = require("../controllers/deletionRequestController");

// Create a new deletion request (admin only)
router.post("/create", createDeletionRequest);

// Get deletion requests for a specific patient
router.get("/patient/:indexNo", getDeletionRequestsByPatient);

// Get all deletion requests (admin view)
router.get("/all", getAllDeletionRequests);

// Get deletion requests awaiting admin confirmation
router.get("/pending-admin-confirmation", getPendingAdminConfirmation);

// Respond to a deletion request (approve/reject by user)
router.put("/respond/:requestId", respondToDeletionRequest);

// Admin confirms or rejects user-approved deletion request
router.put("/admin-confirm/:requestId", adminConfirmDeletion);

// Dismiss a deletion request (hide from patient view)
router.put("/dismiss/:requestId", dismissDeletionRequest);

// Get pending requests count for notifications
router.get("/pending-count/:indexNo", getPendingRequestsCount);

// Clean up old pending requests (admin only)
router.delete("/cleanup-old", cleanupOldRequests);

// Remove a single deletion request (admin only)
router.delete("/remove/:requestId", removeDeletionRequest);

module.exports = router;






