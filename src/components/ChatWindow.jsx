import { useState, useEffect, useRef } from 'react';
import { emoticons, getAllEmoticons } from '../utils/emoticons';
import './ChatWindow.css';

function ChatWindow({ socket, user, onLogout }) {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [users, setUsers] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);

  // Audio refs for all Yahoo! Messenger sounds
  const buzzAudioRef = useRef(null);
  const knockAudioRef = useRef(null);
  const doorAudioRef = useRef(null);
  const chimeAudioRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    socket.on('message:receive', (message) => {
      setMessages(prev => [...prev, message]);
      // Play chime sound when receiving a message from another user
      if (message.type === 'user' && message.username !== user.username) {
        playChimeSound();
      }
      // Play knock sound when someone joins
      if (message.type === 'system' && message.text.includes('has joined')) {
        playKnockSound();
      }
      // Play door sound when someone leaves
      if (message.type === 'system' && message.text.includes('has left')) {
        playDoorSound();
      }
    });

    socket.on('users:update', (usersList) => {
      setUsers(usersList);
    });

    socket.on('buzz:receive', (data) => {
      playBuzzSound();
      setMessages(prev => [...prev, {
        type: 'buzz',
        username: data.username,
        timestamp: data.timestamp
      }]);
      shakeWindow();
    });

    return () => {
      socket.off('message:receive');
      socket.off('users:update');
      socket.off('buzz:receive');
    };
  }, [socket, user.username]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const playBuzzSound = () => {
    if (buzzAudioRef.current) {
      buzzAudioRef.current.currentTime = 0;
      buzzAudioRef.current.play().catch(err => console.log('Audio play failed:', err));
    }
  };

  const playKnockSound = () => {
    if (knockAudioRef.current) {
      knockAudioRef.current.currentTime = 0;
      knockAudioRef.current.play().catch(err => console.log('Audio play failed:', err));
    }
  };

  const playDoorSound = () => {
    if (doorAudioRef.current) {
      doorAudioRef.current.currentTime = 0;
      doorAudioRef.current.play().catch(err => console.log('Audio play failed:', err));
    }
  };

  const playChimeSound = () => {
    if (chimeAudioRef.current) {
      chimeAudioRef.current.currentTime = 0;
      chimeAudioRef.current.play().catch(err => console.log('Audio play failed:', err));
    }
  };

  const shakeWindow = () => {
    const chatContainer = document.querySelector('.chat-container');
    chatContainer?.classList.add('shake');
    setTimeout(() => {
      chatContainer?.classList.remove('shake');
    }, 500);
  };

  const parseMessageWithEmoticons = (text) => {
    const parts = [];
    let currentText = text;
    let index = 0;

    while (currentText.length > 0) {
      let foundEmoticon = null;
      let foundIndex = currentText.length;
      let foundKey = null;

      // Find the earliest emoticon in the remaining text
      Object.entries(emoticons).forEach(([key, value]) => {
        const idx = currentText.indexOf(key);
        if (idx !== -1 && idx < foundIndex) {
          foundIndex = idx;
          foundEmoticon = value;
          foundKey = key;
        }
      });

      if (foundEmoticon) {
        // Add text before emoticon
        if (foundIndex > 0) {
          parts.push({ type: 'text', content: currentText.substring(0, foundIndex), key: `text-${index++}` });
        }
        // Add emoticon
        parts.push({ type: 'emoticon', content: foundEmoticon, key: `emoji-${index++}` });
        currentText = currentText.substring(foundIndex + foundKey.length);
      } else {
        // No more emoticons, add remaining text
        if (currentText.length > 0) {
          parts.push({ type: 'text', content: currentText, key: `text-${index++}` });
        }
        break;
      }
    }

    return parts;
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim()) {
      socket.emit('message:send', {
        text: messageInput,
        username: user.username,
        color: user.color,
        fontStyle: user.fontStyle
      });
      setMessageInput('');
      // Play chime sound when sending a message
      playChimeSound();
    }
  };

  const handleBuzz = () => {
    socket.emit('buzz:send', { username: user.username });
  };

  const insertEmoticon = (shortcut) => {
    setMessageInput(prev => prev + shortcut);
    setShowEmojiPicker(false);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getMessageStyle = (msg) => ({
    color: msg.color || '#000000',
    fontFamily: msg.fontStyle?.fontFamily || 'Arial',
    fontWeight: msg.fontStyle?.bold ? 'bold' : 'normal',
    fontStyle: msg.fontStyle?.italic ? 'italic' : 'normal',
    textDecoration: msg.fontStyle?.underline ? 'underline' : 'none'
  });

  return (
    <div className="chat-container">
      {/* Yahoo! Messenger authentic sounds */}
      <audio ref={buzzAudioRef} src="/sounds/buzz.mp3" preload="auto" />
      <audio ref={knockAudioRef} src="/sounds/knock.wav" preload="auto" />
      <audio ref={doorAudioRef} src="/sounds/door.wav" preload="auto" />
      <audio ref={chimeAudioRef} src="/sounds/chimeup.wav" preload="auto" />

      <div className="chat-header">
        <div className="header-left">
          <span className="ym-logo-small">Y!</span>
          <span className="header-title">Yahoo! Messenger</span>
        </div>
        <button className="logout-btn" onClick={onLogout}>Sign Out</button>
      </div>

      <div className="chat-body">
        <div className="users-sidebar">
          <div className="sidebar-header">Online ({users.length})</div>
          <div className="users-list">
            {users.map((u) => (
              <div key={u.id} className="user-item">
                <div className="user-avatar"></div>
                <span style={{ color: u.color }}>{u.username}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chat-main">
          <div className="messages-container">
            {messages.map((msg, index) => (
              <div key={index} className={`message message-${msg.type}`}>
                {msg.type === 'system' && (
                  <div className="system-message">
                    <span>{msg.text}</span>
                    <span className="timestamp">{formatTime(msg.timestamp)}</span>
                  </div>
                )}

                {msg.type === 'user' && (
                  <div className="user-message">
                    <span className="message-time">{formatTime(msg.timestamp)}</span>
                    <span className="username" style={{ color: msg.color }}>
                      {msg.username}:
                    </span>
                    <span className="message-text" style={getMessageStyle(msg)}>
                      {parseMessageWithEmoticons(msg.text).map(part =>
                        part.type === 'text' ? (
                          <span key={part.key}>{part.content}</span>
                        ) : (
                          <img
                            key={part.key}
                            src={part.content.gif}
                            alt={part.content.name}
                            className="emoticon"
                            title={part.content.name}
                          />
                        )
                      )}
                    </span>
                  </div>
                )}

                {msg.type === 'buzz' && (
                  <div className="user-message">
                    <span className="message-time">{formatTime(msg.timestamp)}</span>
                    <span className="buzz-text">BUZZ!!!</span>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="input-container">
            <div className="toolbar">
              <button
                type="button"
                className="toolbar-btn emoticon-toolbar-btn"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                title="Emoticons"
              >
                <img src="/emoticons/smile.gif" alt="emoticons" className="toolbar-emoticon" />
              </button>
              <button
                type="button"
                className="toolbar-btn buzz-btn"
                onClick={handleBuzz}
                title="Send Buzz"
              >
                ⚡ Buzz
              </button>
            </div>

            {showEmojiPicker && (
              <div className="emoji-picker">
                {getAllEmoticons().map((emoticon) => (
                  <button
                    key={emoticon.shortcut}
                    type="button"
                    className="emoji-btn"
                    onClick={() => insertEmoticon(emoticon.shortcut)}
                    title={`${emoticon.name} - ${emoticon.shortcut}`}
                  >
                    <img
                      src={emoticon.gif}
                      alt={emoticon.name}
                      className="emoticon-preview"
                    />
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSendMessage} className="message-form">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
                className="message-input"
              />
              <button type="submit" className="send-btn" disabled={!messageInput.trim()}>
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;
