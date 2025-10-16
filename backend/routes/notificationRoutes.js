const express = require("express");
const router = express.Router();
const{
    createNotification,
    getNotifications,
    getNotificationById,
    getNotificationsByPatient,
    updateNotification,
    deleteNotification
} = require("../controllers/notificationController");

router.post("/",createNotification);  //create
router.get("/",getNotifications);     //Read all
router.get("/patient/:patientId", getNotificationsByPatient);  //Read by patient
router.get("/:id", getNotificationById);  //Read one
router.put("/:id",updateNotification);     //update
router.delete("/:id",deleteNotification);     //delete

module.exports = router;