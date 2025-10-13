const express = require("express");
const router = express.Router();
const{
    createNotification,
    getNotifications,
    getNotificationById,
    updateNotification,
    deleteNotification
} = require("../controllers/notificationController");

router.post("/",createNotification);  //create
router.get("/",getNotifications);     //Read all
router.get("/:id", getNotificationById);  //Read one
router.put("/:id",updateNotification);     //update
router.delete("/:id",deleteNotification);     //delete

module.exports = router;