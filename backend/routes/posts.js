const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const { uploadPost } = require('../config/cloudinary');

router.get('/feed', protect, getFeed);
router.get('/explore', protect, getExplorePosts);
router.get('/saved', protect, getSavedPosts);
router.get('/user/:userId', protect, getUserPosts);

router.post('/', protect, uploadPost.array('media', 10), createPost);
router.get('/:id', protect, getPost);
router.delete('/:id', protect, deletePost);
router.put('/:id/like', protect, toggleLike);
router.put('/:id/save', protect, toggleSave);
router.post('/:id/comment', protect, addComment);
router.delete('/:id/comment/:commentId', protect, deleteComment);

module.exports = router;
