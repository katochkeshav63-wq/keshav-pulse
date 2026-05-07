const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  toggleFollow,
  getSuggestions,
  getFollowers,
  getFollowing,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { uploadAvatar } = require('../config/cloudinary');

router.get('/suggestions', protect, getSuggestions);
router.put('/profile', protect, uploadAvatar.single('avatar'), updateProfile);
router.get('/:username', protect, getProfile);
router.put('/:id/follow', protect, toggleFollow);
router.get('/:id/followers', protect, getFollowers);
router.get('/:id/following', protect, getFollowing);

module.exports = router;
