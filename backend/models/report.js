const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
    {
       id: {type: String, required: true},
       title: {type: String, required: true},
       type: {type: String, required: true}, // 'medicine', 'patient', 'inventory', etc.
       generatedDate: {type: String, required: true},
       generatedTime: {type: String, required: true},
       data: {type: mongoose.Schema.Types.Mixed, required: true}, // Store the actual report data
       filters: {type: mongoose.Schema.Types.Mixed, default: {}}, // Store any filters applied
       totalRecords: {type: Number, default: 0},
       generatedBy: {type: String, default: 'System'}
    }, {timestamps: true});

    module.exports = mongoose.model ("Report", reportSchema);