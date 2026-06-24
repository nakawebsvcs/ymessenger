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

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

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
    io.emit('message:receive', {
      type: 'user',
      username,
      usernameColor,
      messageColor,
      fontStyle,
      text,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('buzz:send', ({ username }) => {
    io.emit('buzz:receive', {
      username,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      io.emit('message:receive', {
        type: 'system',
        text: `${user.username} has left the chat`,
        timestamp: new Date().toISOString()
      });
      users.delete(socket.id);
      io.emit('users:update', Array.from(users.values()));
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
