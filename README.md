# 📸 Instagram Clone — MERN + Cloudinary + Tailwind CSS

A full-featured Instagram clone built with the MERN stack, Cloudinary for media storage, Socket.IO for real-time features, and Tailwind CSS for styling.

---

## ✨ Features

| Feature | Details |
|---|---|
| **Auth** | JWT-based register / login / logout |
| **Feed** | Infinite-scroll, following-only feed |
| **Posts** | Upload images & videos (up to 10 per post), captions, locations, hashtags |
| **Stories** | 24-hour stories with progress bar viewer, auto-expire via MongoDB TTL |
| **Likes** | Like / unlike with double-tap animation |
| **Comments** | Add, delete, nested replies |
| **Save** | Bookmark posts, view saved collection on profile |
| **Explore** | Mosaic grid of posts from non-followed users, search users |
| **Profile** | Grid view, followers/following counts, edit profile, avatar upload |
| **Messages** | Real-time DMs via Socket.IO with typing indicators |
| **Notifications** | Like, comment, follow notifications |
| **Cloudinary** | Images + videos stored in Cloudinary with auto-optimization |
| **Responsive** | Desktop sidebar + mobile bottom nav |

---

## 🗂 Project Structure

```
instagram-clone/
├── backend/                 # Express API
│   ├── config/
│   │   └── cloudinary.js    # Cloudinary + Multer config
│   ├── controllers/         # Route handlers
│   ├── middleware/
│   │   └── auth.js          # JWT middleware
│   ├── models/              # Mongoose schemas
│   │   ├── User.js
│   │   ├── Post.js
│   │   ├── Story.js
│   │   ├── Notification.js
│   │   └── Message.js
│   ├── routes/              # Express routers
│   ├── server.js            # Entry point + Socket.IO
│   └── .env.example
│
├── frontend/                # React app
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/      # Layout, Sidebar nav
│   │   │   ├── post/        # PostCard, CreatePostModal
│   │   │   ├── story/       # StoriesBar, StoryViewer
│   │   │   └── ui/          # Avatar, LoadingSpinner, SearchModal
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Explore.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── PostDetail.jsx
│   │   │   ├── Messages.jsx
│   │   │   ├── Notifications.jsx
│   │   │   ├── EditProfile.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── NotFound.jsx
│   │   ├── utils/
│   │   │   └── api.js        # Axios instance + all API calls
│   │   ├── App.jsx
│   │   └── index.css         # Tailwind + custom utilities
│   ├── tailwind.config.js
│   └── .env.example
│
├── docker-compose.yml
└── package.json              # Root dev scripts
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account (free tier works)

### 1. Clone & Install

```bash
git clone <your-repo>
cd instagram-clone
npm run install:all
```

### 2. Configure Environment Variables

**Backend** — copy and fill in `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/instagram_clone
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

CLIENT_URL=http://localhost:3000
```

**Frontend** — copy and fill in `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Get Cloudinary Credentials

1. Sign up at [cloudinary.com](https://cloudinary.com) (free)
2. Go to Dashboard
3. Copy `Cloud name`, `API Key`, `API Secret` into `backend/.env`

### 4. Start Development

```bash
# Run both backend + frontend concurrently
npm run dev
```

Or separately:
```bash
npm run dev:backend   # http://localhost:5000
npm run dev:frontend  # http://localhost:3000
```

---

## 🐳 Docker

```bash
# Build and start everything (MongoDB included)
npm run docker:up

# Stop
npm run docker:down
```

---

## 📡 API Endpoints

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Posts
| Method | Route | Description |
|---|---|---|
| POST | `/api/posts` | Create post (multipart) |
| GET | `/api/posts/feed` | Get feed (paginated) |
| GET | `/api/posts/explore` | Explore posts |
| GET | `/api/posts/:id` | Get single post |
| PUT | `/api/posts/:id/like` | Toggle like |
| PUT | `/api/posts/:id/save` | Toggle save |
| POST | `/api/posts/:id/comment` | Add comment |
| DELETE | `/api/posts/:id` | Delete post |

### Users
| Method | Route | Description |
|---|---|---|
| GET | `/api/users/:username` | Get profile |
| PUT | `/api/users/profile` | Update profile |
| PUT | `/api/users/:id/follow` | Follow / unfollow |
| GET | `/api/users/suggestions` | Suggested users |

### Stories
| Method | Route | Description |
|---|---|---|
| GET | `/api/stories/feed` | Grouped stories feed |
| POST | `/api/stories` | Create story |
| PUT | `/api/stories/:id/view` | Mark viewed |

### Messages
| Method | Route | Description |
|---|---|---|
| GET | `/api/messages` | Inbox |
| GET | `/api/messages/:userId` | Conversation |
| POST | `/api/messages` | Send message |

---

## 🔌 Socket.IO Events

| Event | Direction | Data |
|---|---|---|
| `user_connected` | Client → Server | `userId` |
| `online_users` | Server → Client | `[userId, ...]` |
| `send_message` | Client → Server | message object |
| `receive_message` | Server → Client | message object |
| `typing` | Client → Server | `{senderId, receiverId}` |
| `user_typing` | Server → Client | `{senderId}` |
| `notification_{userId}` | Server → Client | notification object |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, **Vite 4** |
| Styling | Tailwind CSS 3 + PostCSS |
| State | React Context + hooks |
| HTTP | Axios |
| Backend | Node.js, Express 4 |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| Media | Cloudinary + Multer |
| Real-time | Socket.IO |
| Dev | nodemon, concurrently |
| Container | Docker + Docker Compose |
