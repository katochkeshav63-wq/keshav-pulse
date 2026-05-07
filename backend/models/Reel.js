const mongoose = require('mongoose');

const reelSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  video: {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    duration: { type: Number }, // seconds, enforced ≤ 10 on upload
    thumbnail: { type: String, default: '' },
  },
  caption: {
    type: String,
    maxlength: 2200,
    default: '',
  },
  audio: {
    type: String,
    default: '',
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, maxlength: 500 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now },
  }],
  views: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  saves: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  tags: [String],
  isArchived: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

reelSchema.index({ createdAt: -1 });
reelSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Reel', reelSchema);
