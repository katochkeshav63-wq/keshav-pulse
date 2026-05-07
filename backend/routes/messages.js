const express = require('express');
const router = express.Router();
const { sendMessage, getConversation, getInbox } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getInbox);
router.post('/', protect, sendMessage);
router.get('/:userId', protect, getConversation);

module.exports = router;
