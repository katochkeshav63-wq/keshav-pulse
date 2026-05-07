const Story = require('../models/Story');
const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');

// @desc    Create story
// @route   POST /api/stories
const createStory = async (req, res) => {
  try {
    const { caption } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Media is required for a story.' });
    }

    const story = await Story.create({
      user: req.user._id,
      media: {
        url: req.file.path,
        publicId: req.file.filename,
        type: req.file.mimetype.startsWith('video/') ? 'video' : 'image',
      },
      caption,
    });

    await story.populate('user', 'username avatar fullName isVerified');

    res.status(201).json({ story });
  } catch (error) {
    res.status(500).json({ message: 'Server error creating story.' });
  }
};

// @desc    Get stories feed (following + own)
// @route   GET /api/stories/feed
const getStoriesFeed = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const followingIds = [...user.following, req.user._id];

    const stories = await Story.find({
      user: { $in: followingIds },
      expiresAt: { $gt: new Date() },
    })
      .sort({ createdAt: -1 })
      .populate('user', 'username avatar fullName isVerified');

    // Group stories by user
    const grouped = {};
    stories.forEach(story => {
      const userId = story.user._id.toString();
      if (!grouped[userId]) {
        grouped[userId] = {
          user: story.user,
          stories: [],
          hasUnviewed: false,
        };
      }
      grouped[userId].stories.push(story);

      // Check if story is viewed by current user
      const viewed = story.viewers.some(v => v.user.toString() === req.user._id.toString());
      if (!viewed) grouped[userId].hasUnviewed = true;
    });

    const result = Object.values(grouped).sort((a, b) => {
      // Own stories first, then unviewed
      if (a.user._id.toString() === req.user._id.toString()) return -1;
      if (b.user._id.toString() === req.user._id.toString()) return 1;
      if (a.hasUnviewed && !b.hasUnviewed) return -1;
      if (!a.hasUnviewed && b.hasUnviewed) return 1;
      return 0;
    });

    res.json({ stories: result });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    View story
// @route   PUT /api/stories/:id/view
const viewStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found.' });

    const alreadyViewed = story.viewers.some(
      v => v.user.toString() === req.user._id.toString()
    );

    if (!alreadyViewed) {
      story.viewers.push({ user: req.user._id });
      await story.save();
    }

    res.json({ viewed: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Delete story
// @route   DELETE /api/stories/:id
const deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found.' });

    if (story.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(story.media.publicId, {
        resource_type: story.media.type === 'video' ? 'video' : 'image',
      });
    } catch (err) {
      console.error('Cloudinary delete error:', err);
    }

    await Story.findByIdAndDelete(req.params.id);

    res.json({ message: 'Story deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { createStory, getStoriesFeed, viewStory, deleteStory };
