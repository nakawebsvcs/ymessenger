import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

app.use(cors());

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));

  // Catch-all route for React Router (Express 5 compatible)
  app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? true  // Allow same-origin in production
      : "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

const users = new Map();
const rooms = new Map(); // Map of roomId -> Set of socket IDs

// Generate a random 6-character room code
function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('room:create', ({ username, color, fontStyle }) => {
    const roomId = generateRoomCode();
    console.log('Creating room:', roomId, 'for user:', username);
    socket.join(roomId);

    users.set(socket.id, {
      id: socket.id,
      username,
      color,
      fontStyle,
      roomId
    });

    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId).add(socket.id);

    // Send room code back to creator
    console.log('Emitting room:created with roomId:', roomId);
    socket.emit('room:created', { roomId });

    // Update users list for this room
    const roomUsers = Array.from(rooms.get(roomId)).map(id => users.get(id)).filter(Boolean);
    io.to(roomId).emit('users:update', roomUsers);

    io.to(roomId).emit('message:receive', {
      type: 'system',
      text: `${username} created the room`,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('room:join', ({ roomId, username, color, fontStyle }) => {
    // Check if room exists
    if (!rooms.has(roomId)) {
      socket.emit('room:error', { message: 'Room not found' });
      return;
    }

    socket.join(roomId);

    users.set(socket.id, {
      id: socket.id,
      username,
      color,
      fontStyle,
      roomId
    });

    rooms.get(roomId).add(socket.id);

    // Confirm join to the user
    socket.emit('room:joined', { roomId });

    // Update users list for this room
    const roomUsers = Array.from(rooms.get(roomId)).map(id => users.get(id)).filter(Boolean);
    io.to(roomId).emit('users:update', roomUsers);

    io.to(roomId).emit('message:receive', {
      type: 'system',
      text: `${username} has joined the chat`,
      timestamp: new Date().toISOString()
    });
  });

  // Legacy support for old user:join (for backward compatibility)
  socket.on('user:join', ({ username, color, fontStyle }) => {
    users.set(socket.id, {
      id: socket.id,
      username,
      color,
      fontStyle
    });

    io.emit('users:update', Array.from(users.values()));

    io.emit('message:receive', {
      type: 'system',
      text: `${username} has joined the chat`,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('message:send', ({ text, username, usernameColor, messageColor, fontStyle }) => {
    const user = users.get(socket.id);
    const roomId = user?.roomId;

    if (roomId) {
      // Send to specific room
      io.to(roomId).emit('message:receive', {
        type: 'user',
        username,
        usernameColor,
        messageColor,
        fontStyle,
        text,
        timestamp: new Date().toISOString()
      });
    } else {
      // Legacy: broadcast to everyone
      io.emit('message:receive', {
        type: 'user',
        username,
        usernameColor,
        messageColor,
        fontStyle,
        text,
        timestamp: new Date().toISOString()
      });
    }
  });

  socket.on('buzz:send', ({ username }) => {
    const user = users.get(socket.id);
    const roomId = user?.roomId;

    if (roomId) {
      // Send to specific room
      io.to(roomId).emit('buzz:receive', {
        username,
        timestamp: new Date().toISOString()
      });
    } else {
      // Legacy: broadcast to everyone
      io.emit('buzz:receive', {
        username,
        timestamp: new Date().toISOString()
      });
    }
  });

  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      const roomId = user.roomId;

      if (roomId) {
        // Remove from room
        rooms.get(roomId)?.delete(socket.id);

        // Clean up empty rooms
        if (rooms.get(roomId)?.size === 0) {
          rooms.delete(roomId);
        } else {
          // Update room users
          const roomUsers = Array.from(rooms.get(roomId)).map(id => users.get(id)).filter(Boolean);
          io.to(roomId).emit('users:update', roomUsers);
        }

        io.to(roomId).emit('message:receive', {
          type: 'system',
          text: `${user.username} has left the chat`,
          timestamp: new Date().toISOString()
        });
      } else {
        // Legacy: broadcast to everyone
        io.emit('message:receive', {
          type: 'system',
          text: `${user.username} has left the chat`,
          timestamp: new Date().toISOString()
        });
        io.emit('users:update', Array.from(users.values()));
      }

      users.delete(socket.id);
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
