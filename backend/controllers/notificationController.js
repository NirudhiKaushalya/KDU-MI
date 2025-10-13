const Notification = require("../models/notification");

//create new notification
exports.createNotification = async (req, res) => {
    try {
        const notification = new Notification(req.body);
        await notification.save();
        res.status(201).json(notification);
        } catch (error) {
            res.status(400).json({ message: error.message});
        }
    };

// Get all notifications
exports.getNotifications = async (req,res) => {
    try{
        const notifications = await Notification.find();
        res.json(notifications);
    } catch (error) {
        res.status(500).json ({message: error.message});
    }
};

//Get single notification
exports.getNotificationById = async (req,res) => {
    try{
        const notification = await Notification.findById(req.params.id);
        if (!notification) return res.status(404).json({message:"Notification not found"});
        res.json(notification);
       }catch (error) {
        res.status(500).json({message:error.message});
       }
};

//Update notification
exports.updateNotification = async (req, res) => {
    try{
        const updated = await Notification.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new: true}
        );
        if(!updated) return res.status(404).json({message: "User not found"});
        res.json(updated);
    } catch (error) {
        res.status(400).json({message:error.message});
    }
};

//Delete notification
exports.deleteNotification = async (req, res) => {
    try{
        const deleted = await Notification.findByIdAndDelete(req.params.id);
        if(!deleted) return res.status(404).json({message:"Notification not found"});
        res.json({message:"Notification deleted"});
    }catch (error) {
        res.status(500).json({message: error.message});
    }
};
