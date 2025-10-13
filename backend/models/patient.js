const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
    {
       NIC: {type:Number, required:true},
       patientName: {type:String, required:true},
       patientID: {type:Number, required:true},
       gender: {type:String, required:true},
       Age: {type:Number, required:false},
       Inatake: {type:String, required:true},
       contactNumber: {type:Number, required:true}
       
       
    }, {timestamps: true});

    module.exports = mongoose.model ("Patient", patientSchema);