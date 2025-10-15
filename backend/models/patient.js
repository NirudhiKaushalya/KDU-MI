const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
    {
       id: {type: String, required: true},
       indexNo: {type: String, required: true},
       name: {type: String, required: true},
       age: {type: Number, required: false},
       gender: {type: String, required: false},
       condition: {type: String, required: true},
       role: {type: String, default: 'Student'},
       admittedDate: {type: String, required: false},
       admittedTime: {type: String, required: false},
       consultedDate: {type: String, required: false},
       consultedTime: {type: String, required: false},
       reason: {type: String, required: false},
       reasonForConsultation: {type: String, required: false},
       medicalCondition: {type: String, required: false},
       prescribedMedicines: [{
         name: {type: String, required: true},
         quantity: {type: Number, required: true}
       }],
       labReports: {type: mongoose.Schema.Types.Mixed, default: null},
       additionalNotes: {type: String, default: ''}
    }, {timestamps: true});

    module.exports = mongoose.model ("Patient", patientSchema);