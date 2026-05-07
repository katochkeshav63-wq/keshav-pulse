const User = require('../models/User');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get user profile
// @route   GET /api/users/:username
const getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate('followers', 'username avatar fullName isVerified')
      .populate('following', 'username avatar fullName isVerified');

    if (!user) return res.status(404).json({ message: 'User not found.' });

    const postsCount = await Post.countDocuments({ user: user._id, isArchived: false });

    res.json({
      user: {
        _id: user._id,
        username: user.username,
        fullName: user.fullName,
        bio: user.bio,
        website: user.website,
        avatar: user.avatar,
        followers: user.followers,
        following: user.following,
        postsCount,
        isVerified: user.isVerified,
        isPrivate: user.isPrivate,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Update profile
// @route   PUT /api/users/profile
const updateProfile = async (req, res) => {
  try {
    const { fullName, bio, website, isPrivate } = req.body;

    const updateData = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (bio !== undefined) updateData.bio = bio;
    if (website !== undefined) updateData.website = website;
    if (isPrivate !== undefined) updateData.isPrivate = isPrivate;

    // Handle avatar upload
    if (req.file) {
      // Delete old avatar from Cloudinary
      const currentUser = await User.findById(req.user._id);
      if (currentUser.avatarPublicId) {
        try {
          await cloudinary.uploader.destroy(currentUser.avatarPublicId);
        } catch (err) {
          console.error('Error deleting old avatar:', err);
        }
      }
      updateData.avatar = req.file.path;
      updateData.avatarPublicId = req.file.filename;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).populate('followers', 'username avatar').populate('following', 'username avatar');

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating profile.' });
  }
};

// @desc    Follow / Unfollow user
// @route   PUT /api/users/:id/follow
const toggleFollow = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself.' });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: 'User not found.' });

    const currentUser = await User.findById(req.user._id);
    const isFollowing = currentUser.following.includes(req.params.id);

    if (isFollowing) {
      // Unfollow
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: req.params.id } });
      await User.findByIdAndUpdate(req.params.id, { $pull: { followers: req.user._id } });
    } else {
      // Follow
      await User.findByIdAndUpdate(req.user._id, { $push: { following: req.params.id } });
      await User.findByIdAndUpdate(req.params.id, { $push: { followers: req.user._id } });

      // Create notification
      await Notification.create({
        recipient: req.params.id,
        sender: req.user._id,
        type: 'follow',
      });

      // Emit socket
      const io = req.app.get('io');
      if (io) {
        io.emit(`notification_${req.params.id}`, {
          type: 'follow',
          sender: req.user,
        });
      }
    }

    res.json({ following: !isFollowing });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Get suggested users
// @route   GET /api/users/suggestions
const getSuggestions = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const excludeIds = [...currentUser.following, req.user._id];

    const suggestions = await User.find({
      _id: { $nin: excludeIds },
    })
      .select('username fullName avatar isVerified followers')
      .limit(10)
      .sort({ followers: -1 });

    res.json({ suggestions });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Get followers
// @route   GET /api/users/:id/followers
const getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'username avatar fullName isVerified bio');

    if (!user) return res.status(404).json({ message: 'User not found.' });

    res.json({ followers: user.followers });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Get following
// @route   GET /api/users/:id/following
const getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('following', 'username avatar fullName isVerified bio');

    if (!user) return res.status(404).json({ message: 'User not found.' });

    res.json({ following: user.following });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  toggleFollow,
  getSuggestions,
  getFollowers,
  getFollowing,
};
