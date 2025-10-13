const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
    {
       reportName: {type:String, required:true},
       generatedDate: {type:Date,required:true} 

    }, {timestamps: true});

    module.exports = mongoose.model ("Report", reportSchema);