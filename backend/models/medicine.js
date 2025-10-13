const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
    {
       medicineID:{type:Number, required:true},
       drugName:{type:String, required:true},
       quantity: {type:Number, required:true},
       category: {type:String, required:true},
       stockLevel: {type:String, required:true},
       expDate: {type:Date, required:true}
    }, {timestamps: true});

    module.exports = mongoose.model ("Medicine", medicineSchema);