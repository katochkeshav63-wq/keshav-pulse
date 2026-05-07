const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Post image/video storage
const postStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith('video/');
    return {
      folder: 'instagram-clone/posts',
      resource_type: isVideo ? 'video' : 'image',
      allowed_formats: isVideo
        ? ['mp4', 'mov', 'avi', 'webm']
        : ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      transformation: isVideo
        ? [{ quality: 'auto' }]
        : [{ quality: 'auto', fetch_format: 'auto' }],
    };
  },
});

// Avatar storage
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'instagram-clone/avatars',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  },
});

// Story storage
const storyStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith('video/');
    return {
      folder: 'instagram-clone/stories',
      resource_type: isVideo ? 'video' : 'image',
      allowed_formats: isVideo
        ? ['mp4', 'mov', 'webm']
        : ['jpg', 'jpeg', 'png', 'webp'],
    };
  },
});

// Reel storage — video only, max 10 s enforced in controller
const reelStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'instagram-clone/reels',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'webm'],
    transformation: [{ quality: 'auto', fetch_format: 'mp4' }],
    eager: [
      { width: 540, crop: 'scale', format: 'jpg', start_offset: '0' },
    ],
    eager_async: true,
  },
});

const uploadPost = multer({
  storage: postStorage,
  limits: { fileSize: 100 * 1024 * 1024 },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const uploadStory = multer({
  storage: storyStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

const uploadReel = multer({
  storage: reelStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('video/')) {
      return cb(new Error('Only video files are allowed for Reels.'), false);
    }
    cb(null, true);
  },
});

module.exports = { cloudinary, uploadPost, uploadAvatar, uploadStory, uploadReel };
