const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Send message
// @route   POST /api/messages
const sendMessage = async (req, res) => {
  try {
    const { receiverId, text, postId } = req.body;

    if (!receiverId) {
      return res.status(400).json({ message: 'Receiver is required.' });
    }
    if (!text && !req.file && !postId) {
      return res.status(400).json({ message: 'Message content is required.' });
    }

    const messageData = {
      sender: req.user._id,
      receiver: receiverId,
      text,
      post: postId || undefined,
    };

    if (req.file) {
      messageData.media = {
        url: req.file.path,
        publicId: req.file.filename,
        type: req.file.mimetype.startsWith('video/') ? 'video' : 'image',
      };
    }

    const message = await Message.create(messageData);
    await message.populate('sender', 'username avatar fullName');
    await message.populate('receiver', 'username avatar fullName');
    if (postId) await message.populate('post', 'media caption');

    res.status(201).json({ message });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Get conversation
// @route   GET /api/messages/:userId
const getConversation = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id },
      ],
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'username avatar')
      .populate('receiver', 'username avatar')
      .populate('post', 'media caption');

    // Mark messages as read
    await Message.updateMany(
      { sender: req.params.userId, receiver: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ messages: messages.reverse() });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Get all conversations (inbox)
// @route   GET /api/messages
const getInbox = async (req, res) => {
  try {
    // Get unique conversation partners
    const sentTo = await Message.distinct('receiver', { sender: req.user._id });
    const receivedFrom = await Message.distinct('sender', { receiver: req.user._id });

    // FIX: Reassign the filtered array (previously the filter result was discarded)
    const allUserIds = [...new Set([...sentTo.map(String), ...receivedFrom.map(String)])]
      .filter(id => id !== req.user._id.toString());

    const conversations = await Promise.all(
      allUserIds.map(async (userId) => {
        const lastMessage = await Message.findOne({
          $or: [
            { sender: req.user._id, receiver: userId },
            { sender: userId, receiver: req.user._id },
          ],
        })
          .sort({ createdAt: -1 })
          .populate('sender', 'username avatar')
          .populate('receiver', 'username avatar');

        const unreadCount = await Message.countDocuments({
          sender: userId,
          receiver: req.user._id,
          isRead: false,
        });

        const user = await User.findById(userId).select('username avatar fullName isVerified');

        return { user, lastMessage, unreadCount };
      })
    );

    // Sort by last message time
    conversations.sort((a, b) =>
      new Date(b.lastMessage?.createdAt) - new Date(a.lastMessage?.createdAt)
    );

    res.json({ conversations });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { sendMessage, getConversation, getInbox };