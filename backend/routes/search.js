const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const { protect } = require('../middleware/auth');

// Search users and posts
router.get('/', protect, async (req, res) => {
  try {
    const { q, type } = req.query;

    if (!q || q.trim().length < 1) {
      return res.json({ users: [], posts: [] });
    }

    const searchRegex = new RegExp(q.trim(), 'i');

    if (type === 'users' || !type) {
      const users = await User.find({
        $or: [
          { username: searchRegex },
          { fullName: searchRegex },
        ],
        _id: { $ne: req.user._id },
      })
        .select('username fullName avatar isVerified followers')
        .limit(20);

      if (type === 'users') return res.json({ users });
    }

    if (type === 'tags' || !type) {
      const posts = await Post.find({
        tags: { $in: [q.toLowerCase()] },
        isArchived: false,
      })
        .limit(12)
        .populate('user', 'username avatar');

      if (type === 'tags') return res.json({ posts });
    }

    const [users, posts] = await Promise.all([
      User.find({
        $or: [{ username: searchRegex }, { fullName: searchRegex }],
        _id: { $ne: req.user._id },
      })
        .select('username fullName avatar isVerified followers')
        .limit(10),
      Post.find({
        tags: { $in: [q.toLowerCase()] },
        isArchived: false,
      })
        .limit(6)
        .populate('user', 'username avatar'),
    ]);

    res.json({ users, posts });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
