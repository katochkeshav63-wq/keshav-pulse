const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

dotenv.config();

const app = express();

const server = http.createServer(app);

// SOCKET.IO
const io = new Server(server, {
  cors: {
    origin:
      process.env.CLIENT_URL ||
      'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// MIDDLEWARE
app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      'http://localhost:5173',
    credentials: true,
  })
);

app.use(
  express.json({
    limit: '50mb',
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '50mb',
  })
);

// STATIC FILES
app.use(
  '/uploads',
  express.static(
    path.join(__dirname, 'uploads')
  )
);

// ROUTES
app.use(
  '/api/auth',
  require('./routes/auth')
);

app.use(
  '/api/users',
  require('./routes/users')
);

app.use(
  '/api/posts',
  require('./routes/posts')
);

app.use(
  '/api/stories',
  require('./routes/stories')
);

app.use(
  '/api/notifications',
  require('./routes/notifications')
);

app.use(
  '/api/messages',
  require('./routes/messages')
);

app.use(
  '/api/search',
  require('./routes/search')
);

app.use(
  '/api/reels',
  require('./routes/reels')
);

// =========================
// SOCKET.IO
// =========================

const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log(
    '✅ Socket connected:',
    socket.id
  );

  // USER CONNECTED
  socket.on(
    'user_connected',
    (userId) => {
      console.log(
        '👤 User online:',
        userId
      );

      // save user socket
      connectedUsers.set(
        userId.toString(),
        socket.id
      );

      // join personal room
      socket.join(userId.toString());

      // send online users
      io.emit(
        'online_users',
        Array.from(
          connectedUsers.keys()
        )
      );
    }
  );

  // =====================
  // SEND MESSAGE
  // =====================

  socket.on(
    'send_message',
    (messageData) => {
      try {
        const receiverId =
          messageData.receiverId?.toString();

        console.log(
          '📩 New message:',
          receiverId
        );

        // SEND ONLY TO RECEIVER
        io.to(receiverId).emit(
          'receive_message',
          messageData
        );
      } catch (error) {
        console.log(error);
      }
    }
  );

  // =====================
  // TYPING
  // =====================

  socket.on('typing', (data) => {
    try {
      io.to(
        data.receiverId.toString()
      ).emit('user_typing', {
        senderId: data.senderId,
      });
    } catch (error) {
      console.log(error);
    }
  });

  socket.on(
    'stop_typing',
    (data) => {
      try {
        io.to(
          data.receiverId.toString()
        ).emit(
          'user_stop_typing',
          {
            senderId: data.senderId,
          }
        );
      } catch (error) {
        console.log(error);
      }
    }
  );

  // =====================
  // DISCONNECT
  // =====================

  socket.on('disconnect', () => {
    console.log(
      '❌ Socket disconnected:',
      socket.id
    );

    // remove user
    connectedUsers.forEach(
      (socketId, userId) => {
        if (socketId === socket.id) {
          connectedUsers.delete(userId);
        }
      }
    );

    // update online users
    io.emit(
      'online_users',
      Array.from(
        connectedUsers.keys()
      )
    );
  });
});

// Make io accessible in routes
app.set('io', io);

// =========================
// DATABASE
// =========================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log(
      '✅ MongoDB Connected'
    );
  })
  .catch((err) => {
    console.error(
      '❌ MongoDB Error:',
      err
    );
  });

// =========================
// SERVER
// =========================

const PORT =
  process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(
    `🚀 Server running on port ${PORT}`
  );
});