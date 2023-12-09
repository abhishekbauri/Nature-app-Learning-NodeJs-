const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  // name, email, photo, password, passwordConfirm
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true, // transforms the email to lower case
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please Provide a password'],
    minlength: 8,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
  },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
