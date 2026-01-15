const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['note', 'image', 'pdf', 'folder'],
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    default: ''
  },
  filePath: {
    type: String,
    default: ''
  },
  fileSize: {
    type: Number,
    default: 0
  },
  parentFolder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    default: null
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    default: null
  },
  shareLink: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isLocked: {
  type: Boolean,
  default: false
}
});

itemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Item', itemSchema);