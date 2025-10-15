const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
    {
       id: {type: String, required: true},
       medicineName: {type: String, required: true},
       category: {type: String, required: true},
       brand: {type: String, required: false},
       quantity: {type: Number, required: true},
       lowStockThreshold: {type: Number, required: false, default: 10},
       expiryDate: {type: String, required: true},
       stockLevel: {type: String, required: false, default: 'In Stock'}
    }, {timestamps: true});

    module.exports = mongoose.model ("Medicine", medicineSchema);