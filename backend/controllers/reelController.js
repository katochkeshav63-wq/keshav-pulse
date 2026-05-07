const Reel = require('../models/Reel');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { cloudinary } = require('../config/cloudinary');
// const { getVideoDurationInSeconds } = require('../utils/videoDuration');

const MAX_DURATION = 10; // seconds

// @desc    Upload reel
// @route   POST /api/reels
const createReel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'A video file is required.' });
    }

    // Fetch video metadata from Cloudinary to get duration
    const resource = await cloudinary.api.resource(req.file.filename, {
      resource_type: 'video',
    });

    const duration = resource.duration || 0;

    if (duration > MAX_DURATION) {
      // Delete the uploaded video — it's too long
      await cloudinary.uploader.destroy(req.file.filename, { resource_type: 'video' });
      return res.status(400).json({
        message: `Reels must be ${MAX_DURATION} seconds or shorter. Your video is ${Math.ceil(duration)}s.`,
      });
    }

    const { caption, audio, tags } = req.body;

    // Extract thumbnail from eager transformation if available
    const thumbnail = resource.eager?.[0]?.secure_url || '';

    const reel = await Reel.create({
      user: req.user._id,
      video: {
        url: req.file.path,
        publicId: req.file.filename,
        duration: Math.round(duration * 10) / 10,
        thumbnail,
      },
      caption: caption || '',
      audio: audio || '',
      tags: tags ? tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) : [],
    });

    await reel.populate('user', 'username avatar fullName isVerified');

    res.status(201).json({ reel });
  } catch (error) {
    console.error('Create reel error:', error);
    res.status(500).json({ message: 'Server error creating reel.' });
  }
};

// @desc    Get reels feed (following + own, newest first)
// @route   GET /api/reels/feed
const getReelsFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user._id);
    const ids = [...user.following, req.user._id];

    const reels = await Reel.find({ user: { $in: ids }, isArchived: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username avatar fullName isVerified')
      .populate('comments.user', 'username avatar');

    const total = await Reel.countDocuments({ user: { $in: ids }, isArchived: false });

    res.json({
      reels,
      pagination: {
        page,
        limit,
        total,
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching reels.' });
  }
};

// @desc    Get explore reels (everyone except self, sorted by likes)
// @route   GET /api/reels/explore
const getExploreReels = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reels = await Reel.find({ isArchived: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username avatar fullName isVerified')
      .populate('comments.user', 'username avatar');

    res.json({ reels, hasMore: reels.length === limit });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Get single reel
// @route   GET /api/reels/:id
const getReel = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id)
      .populate('user', 'username avatar fullName isVerified bio')
      .populate('likes', 'username avatar')
      .populate('comments.user', 'username avatar fullName isVerified');

    if (!reel) return res.status(404).json({ message: 'Reel not found.' });

    res.json({ reel });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Get reels by user
// @route   GET /api/reels/user/:userId
const getUserReels = async (req, res) => {
  try {
    const reels = await Reel.find({ user: req.params.userId, isArchived: false })
      .sort({ createdAt: -1 })
      .populate('user', 'username avatar fullName isVerified');

    res.json({ reels });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Like / unlike reel
// @route   PUT /api/reels/:id/like
const toggleLike = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ message: 'Reel not found.' });

    const isLiked = reel.likes.some(id => id.toString() === req.user._id.toString());

    if (isLiked) {
      reel.likes = reel.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      reel.likes.push(req.user._id);

      if (reel.user.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: reel.user,
          sender: req.user._id,
          type: 'like',
        });
      }
    }

    await reel.save();
    res.json({ liked: !isLiked, likesCount: reel.likes.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Add comment
// @route   POST /api/reels/:id/comment
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Comment text required.' });

    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ message: 'Reel not found.' });

    reel.comments.push({ user: req.user._id, text });
    await reel.save();
    await reel.populate('comments.user', 'username avatar fullName isVerified');

    const newComment = reel.comments[reel.comments.length - 1];

    if (reel.user.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: reel.user,
        sender: req.user._id,
        type: 'comment',
        comment: text.substring(0, 100),
      });
    }

    res.status(201).json({ comment: newComment });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Record a view
// @route   PUT /api/reels/:id/view
const recordView = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ message: 'Reel not found.' });

    const alreadyViewed = reel.views.some(id => id.toString() === req.user._id.toString());
    if (!alreadyViewed) {
      reel.views.push(req.user._id);
      await reel.save();
    }

    res.json({ views: reel.views.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Save / unsave reel
// @route   PUT /api/reels/:id/save
const toggleSave = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ message: 'Reel not found.' });

    const isSaved = reel.saves.some(id => id.toString() === req.user._id.toString());

    if (isSaved) {
      reel.saves = reel.saves.filter(id => id.toString() !== req.user._id.toString());
    } else {
      reel.saves.push(req.user._id);
    }

    await reel.save();
    res.json({ saved: !isSaved });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Delete reel
// @route   DELETE /api/reels/:id
const deleteReel = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ message: 'Reel not found.' });

    if (reel.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    await cloudinary.uploader.destroy(reel.video.publicId, { resource_type: 'video' });
    await Reel.findByIdAndDelete(req.params.id);

    res.json({ message: 'Reel deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  createReel,
  getReelsFeed,
  getExploreReels,
  getReel,
  getUserReels,
  toggleLike,
  addComment,
  recordView,
  toggleSave,
  deleteReel,
};
