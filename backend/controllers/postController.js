const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { cloudinary } = require('../config/cloudinary');

// @desc    Create post
// @route   POST /api/posts
const createPost = async (req, res) => {
  try {
    const { caption, location, tags, taggedUsers } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'At least one image or video is required.' });
    }

    const media = req.files.map(file => ({
      url: file.path,
      publicId: file.filename,
      type: file.mimetype.startsWith('video/') ? 'video' : 'image',
    }));

    const post = await Post.create({
      user: req.user._id,
      caption,
      location,
      tags: tags ? tags.split(',').map(t => t.trim().toLowerCase()) : [],
      taggedUsers: taggedUsers ? JSON.parse(taggedUsers) : [],
      media,
    });

    // Add post to user's posts array
    await User.findByIdAndUpdate(req.user._id, { $push: { posts: post._id } });

    const populatedPost = await Post.findById(post._id)
      .populate('user', 'username avatar fullName isVerified')
      .populate('taggedUsers', 'username avatar');

    res.status(201).json({ post: populatedPost });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error creating post.' });
  }
};

// @desc    Get feed posts
// @route   GET /api/posts/feed
const getFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user._id);
    const followingIds = [...user.following, req.user._id];

    const posts = await Post.find({
      user: { $in: followingIds },
      isArchived: false,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username avatar fullName isVerified')
      .populate('comments.user', 'username avatar')
      .populate('taggedUsers', 'username');

    const total = await Post.countDocuments({
      user: { $in: followingIds },
      isArchived: false,
    });

    res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching feed.' });
  }
};

// @desc    Get explore posts
// @route   GET /api/posts/explore
const getExplorePosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user._id);
    const excludeIds = [...user.following, req.user._id];

    const posts = await Post.find({
      user: { $nin: excludeIds },
      isArchived: false,
    })
      .sort({ likes: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username avatar fullName isVerified');

    res.json({ posts });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Get single post
// @route   GET /api/posts/:id
const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'username avatar fullName isVerified bio')
      .populate('comments.user', 'username avatar fullName isVerified')
      .populate('comments.replies.user', 'username avatar')
      .populate('likes', 'username avatar fullName')
      .populate('taggedUsers', 'username avatar');

    if (!post) return res.status(404).json({ message: 'Post not found.' });

    res.json({ post });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Like / Unlike post
// @route   PUT /api/posts/:id/like
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    const isLiked = post.likes.includes(req.user._id);

    if (isLiked) {
      post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      post.likes.push(req.user._id);

      // Create notification (don't notify self)
      if (post.user.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: post.user,
          sender: req.user._id,
          type: 'like',
          post: post._id,
        });

        // Emit socket notification
        const io = req.app.get('io');
        if (io) {
          io.emit(`notification_${post.user}`, {
            type: 'like',
            sender: req.user,
            postId: post._id,
          });
        }
      }
    }

    await post.save();

    res.json({
      liked: !isLiked,
      likesCount: post.likes.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Add comment
// @route   POST /api/posts/:id/comment
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ message: 'Comment text is required.' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });
    if (post.disableComments) {
      return res.status(403).json({ message: 'Comments are disabled for this post.' });
    }

    const comment = {
      user: req.user._id,
      text,
    };

    post.comments.push(comment);
    await post.save();

    // Notify post owner
    if (post.user.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.user,
        sender: req.user._id,
        type: 'comment',
        post: post._id,
        comment: text.substring(0, 100),
      });
    }

    await post.populate('comments.user', 'username avatar fullName isVerified');

    const newComment = post.comments[post.comments.length - 1];

    res.status(201).json({ comment: newComment });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Delete comment
// @route   DELETE /api/posts/:id/comment/:commentId
const deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found.' });

    if (comment.user.toString() !== req.user._id.toString() &&
        post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    comment.deleteOne();
    await post.save();

    res.json({ message: 'Comment deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Save / Unsave post
// @route   PUT /api/posts/:id/save
const toggleSave = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    const user = await User.findById(req.user._id);
    const isSaved = user.savedPosts.includes(req.params.id);

    if (isSaved) {
      user.savedPosts = user.savedPosts.filter(id => id.toString() !== req.params.id);
      post.saves = post.saves.filter(id => id.toString() !== req.user._id.toString());
    } else {
      user.savedPosts.push(req.params.id);
      post.saves.push(req.user._id);
    }

    await user.save();
    await post.save();

    res.json({ saved: !isSaved });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    // Delete media from Cloudinary
    for (const media of post.media) {
      try {
        await cloudinary.uploader.destroy(media.publicId, {
          resource_type: media.type === 'video' ? 'video' : 'image',
        });
      } catch (err) {
        console.error('Cloudinary delete error:', err);
      }
    }

    await Post.findByIdAndDelete(req.params.id);
    await User.findByIdAndUpdate(req.user._id, { $pull: { posts: req.params.id } });

    res.json({ message: 'Post deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Get user posts
// @route   GET /api/posts/user/:userId
const getUserPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;

    const posts = await Post.find({
      user: req.params.userId,
      isArchived: false,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username avatar');

    res.json({ posts });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Get saved posts
// @route   GET /api/posts/saved
const getSavedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedPosts',
      populate: { path: 'user', select: 'username avatar' },
      options: { sort: { createdAt: -1 } },
    });

    res.json({ posts: user.savedPosts });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  createPost,
  getFeed,
  getExplorePosts,
  getPost,
  toggleLike,
  addComment,
  deleteComment,
  toggleSave,
  deletePost,
  getUserPosts,
  getSavedPosts,
};
