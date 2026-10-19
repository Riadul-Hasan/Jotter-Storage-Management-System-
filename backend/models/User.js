const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: "",
  },
  resetCode: {
    type: String,
    default: null,
  },
  resetCodeExpiry: {
    type: Date,
    default: null,
  },
  // 'account' = resetting the login password, 'vault' = resetting the private
  // vault password. resetPassword reads this to know which hash to replace.
  resetPurpose: {
    type: String,
    enum: ['account', 'vault', null],
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  hasLockPassword: {
    type: Boolean,
    default: false,
  },
  lockPassword: {
    type: String,
    default: "",
  },
});

module.exports = mongoose.model("User", userSchema);
