const mongoose = require("mongoose");

const relationSchema = new mongoose.Schema({
    type:String,
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    reciever:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    status:String,
}, 
{ timestamps: true });

module.exports  = mongoose.model("Relation", relationSchema);