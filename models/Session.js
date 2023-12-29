// Import necessary libraries
const mongoose = require("mongoose");

// Session schema
const sessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required:true,
    },
    token:  {
        type: String,
        required:true,
        index:true,
    },
}, 
{ timestamps: true });

// Session model
module.exports = mongoose.model("Session", sessionSchema);
