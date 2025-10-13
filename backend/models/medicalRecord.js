const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema(
    {
       recordID: {type:Number, required:true},
       patientID: {type:Number, required:true},
       role: {type:String, required:true},
       Diagnosis: {type:String, required:true},
       consultedTime: {type:String, required:true}
       
    }, {timestamps: true});

    module.exports = mongoose.model ("MedicalRecord", medicalRecordSchema);