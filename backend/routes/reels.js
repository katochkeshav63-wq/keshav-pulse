const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/reelController');
const { protect } = require('../middleware/auth');
const { uploadReel } = require('../config/cloudinary');

router.get('/feed',         protect, getReelsFeed);
router.get('/explore',      protect, getExploreReels);
router.get('/user/:userId', protect, getUserReels);

router.post('/',            protect, uploadReel.single('video'), createReel);
router.get('/:id',          protect, getReel);
router.delete('/:id',       protect, deleteReel);
router.put('/:id/like',     protect, toggleLike);
router.put('/:id/save',     protect, toggleSave);
router.put('/:id/view',     protect, recordView);
router.post('/:id/comment', protect, addComment);

module.exports = router;
