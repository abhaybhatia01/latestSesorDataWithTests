const mongoose = require('mongoose');

// Define a flexible schema
const userDeviceSchema = new mongoose.Schema({

}, { strict: false });

// Create a model using the flexible schema
module.exports =  mongoose.model('UserDevice', userDeviceSchema);
