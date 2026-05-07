const express = require('express');
const router = express.Router();
const {
  createStory,
  getStoriesFeed,
  viewStory,
  deleteStory,
} = require('../controllers/storyController');
const { protect } = require('../middleware/auth');
const { uploadStory } = require('../config/cloudinary');

router.get('/feed', protect, getStoriesFeed);
router.post('/', protect, uploadStory.single('media'), createStory);
router.put('/:id/view', protect, viewStory);
router.delete('/:id', protect, deleteStory);

module.exports = router;
