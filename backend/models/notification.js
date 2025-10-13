const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
       notificationID: {type:Number, required:true},
       patientID: {type:Number, required:true},
       message: {type:String, required:true}
       
      

    }, {timestamps: true});

    module.exports = mongoose.model ("Notification", notificationSchema);