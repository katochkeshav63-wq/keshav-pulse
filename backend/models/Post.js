const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  replies: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, maxlength: 500 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

const mediaSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  type: { type: String, enum: ['image', 'video'], default: 'image' },
  width: Number,
  height: Number,
  duration: Number, // for videos
});

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  caption: {
    type: String,
    maxlength: 2200,
    default: '',
  },
  media: [mediaSchema],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  comments: [commentSchema],
  location: {
    type: String,
    default: '',
  },
  tags: [String],
  taggedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  isArchived: {
    type: Boolean,
    default: false,
  },
  hideLikesCount: {
    type: Boolean,
    default: false,
  },
  disableComments: {
    type: Boolean,
    default: false,
  },
  saves: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, { timestamps: true });

// Index for feed queries
postSchema.index({ user: 1, createdAt: -1 });
postSchema.index({ tags: 1 });

module.exports = mongoose.model('Post', postSchema);
