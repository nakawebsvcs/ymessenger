import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import LoginScreen from './components/LoginScreen';
import ChatWindow from './components/ChatWindow';
import './App.css';

function App() {
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

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

    return () => {
      newSocket.close();
    };
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    if (socket && isConnected) {
      socket.emit('user:join', userData);
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

  return (
    <div className="app">
      {!user ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <ChatWindow socket={socket} user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
