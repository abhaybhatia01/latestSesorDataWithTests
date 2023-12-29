// Import necessary libraries
const mongoose = require("mongoose");
const bcrypt = require('bcrypt')


// User schema
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required:true,
    },
    password: {
      type: String,
      required:true,
    },
    name: {
      type: String,
      required:true,
    },
}, 
{ timestamps: true });

userSchema.statics.findAndValidate = async function (email,password){
  const foundUser = await this.findOne({email})
  if (!foundUser){
    return false;
  }
  const isValid = await bcrypt.compare(password,foundUser.password);
  return isValid? foundUser: false;
}

// User model
module.exports = mongoose.model("User", userSchema);
