const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
       notificationID: {type: String, required:true},
       patientID: {type: String, required:false},
       medicineID: {type: String, required:false},
       message: {type:String, required:true},
       type: {type: String, required:false},
       category: {type: String, required:false}
    }, {timestamps: true});

    module.exports = mongoose.model ("Notification", notificationSchema);