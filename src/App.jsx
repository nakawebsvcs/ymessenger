import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import LoginScreen from './components/LoginScreen';
import ChatWindow from './components/ChatWindow';
import './App.css';

function App() {
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState(null);

  useEffect(() => {
    // In production, connect to the same origin. In dev, use localhost:3001
    const serverUrl = import.meta.env.VITE_SERVER_URL ||
      (import.meta.env.DEV ? 'http://localhost:3001' : window.location.origin);
    const newSocket = io(serverUrl);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    newSocket.on('room:created', ({ roomId }) => {
      console.log('🎉 Room created event received! roomId:', roomId);
      setRoomId(roomId);
      console.log('Room state updated to:', roomId);
    });

    newSocket.on('room:joined', ({ roomId }) => {
      setRoomId(roomId);
      console.log('Joined room:', roomId);
    });

    newSocket.on('room:error', ({ message }) => {
      alert(`Error: ${message}`);
      setUser(null);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const handleLogin = (userData) => {
    const { username, color, fontStyle, chatType, mode, roomCode } = userData;
    setUser({ username, color, fontStyle });

    if (socket && isConnected) {
      if (chatType === 'public') {
        // Legacy public room - everyone sees each other
        socket.emit('user:join', { username, color, fontStyle });
        setRoomId(null); // No room code for public chat
      } else if (chatType === 'private') {
        if (mode === 'create') {
          socket.emit('room:create', { username, color, fontStyle });
        } else if (mode === 'join') {
          socket.emit('room:join', { roomId: roomCode, username, color, fontStyle });
        }
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    if (socket) {
      socket.disconnect();
      socket.connect();
    }
  };

  if (!socket || !isConnected) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Connecting to server...</p>
      </div>
    );
  }

  console.log('App render - roomId:', roomId, 'user:', user);

  return (
    <div className="app">
      {!user ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <ChatWindow socket={socket} user={user} onLogout={handleLogout} roomId={roomId} />
      )}
    </div>
  );
}

export default App;
