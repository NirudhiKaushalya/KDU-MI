const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
    {
       adminName: {type:String, required:true},
       adminId: {type:Number, required:true},
       email: {type:String, required:false}
       
    }, {timestamps: true});

    module.exports = mongoose.model ("Admin", adminSchema);


