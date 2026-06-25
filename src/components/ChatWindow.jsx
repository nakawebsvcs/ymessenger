import { useState, useEffect, useRef } from 'react';
import { emoticons, getAllEmoticons } from '../utils/emoticons';
import './ChatWindow.css';

function ChatWindow({ socket, user, onLogout, roomId }) {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [users, setUsers] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messageColor, setMessageColor] = useState(user.color);
  const [messageFontStyle, setMessageFontStyle] = useState(user.fontStyle);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [buzzCount, setBuzzCount] = useState(0);
  const [buzzDisabled, setBuzzDisabled] = useState(false);
  const [buzzCooldownSeconds, setBuzzCooldownSeconds] = useState(0);
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const buzzCooldownIntervalRef = useRef(null);

  // Audio refs for all Yahoo! Messenger sounds
  const buzzAudioRef = useRef(null);
  const knockAudioRef = useRef(null);
  const doorAudioRef = useRef(null);
  const chimeAudioRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cleanup buzz cooldown interval on unmount
  useEffect(() => {
    return () => {
      if (buzzCooldownIntervalRef.current) {
        clearInterval(buzzCooldownIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    socket.on('message:receive', (message) => {
      console.log('Received message:', message);
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
      const messageData = {
        text: messageInput,
        username: user.username,
        usernameColor: user.color,  // Original color from sign-in
        messageColor: messageColor,  // Current message formatting color
        fontStyle: messageFontStyle
      };
      console.log('Sending message:', messageData);
      socket.emit('message:send', messageData);
      setMessageInput('');
      // Play chime sound when sending a message
      playChimeSound();
    }
  };

  const handleBuzz = () => {
    if (buzzDisabled) return;

    const newCount = buzzCount + 1;
    setBuzzCount(newCount);
    socket.emit('buzz:send', { username: user.username });

    // If reached 5 buzzes, disable for 1 minute
    if (newCount >= 5) {
      setBuzzDisabled(true);
      setBuzzCooldownSeconds(60);

      // Clear any existing interval
      if (buzzCooldownIntervalRef.current) {
        clearInterval(buzzCooldownIntervalRef.current);
      }

      // Update countdown every second
      buzzCooldownIntervalRef.current = setInterval(() => {
        setBuzzCooldownSeconds(prev => {
          if (prev <= 1) {
            clearInterval(buzzCooldownIntervalRef.current);
            setBuzzDisabled(false);
            setBuzzCount(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const insertEmoticon = (shortcut) => {
    setMessageInput(prev => prev + shortcut);
    setShowEmojiPicker(false);
    // Auto-focus the message input after inserting emoticon
    messageInputRef.current?.focus();
  };

  const toggleMessageStyle = (style) => {
    setMessageFontStyle(prev => ({
      ...prev,
      [style]: !prev[style]
    }));
  };

  const colors = [
    '#0000FF', '#FF0000', '#008000', '#FF00FF',
    '#008B8B', '#800080', '#FFA500', '#000000', 'rainbow'
  ];

  const fonts = ['Arial', 'Comic Sans MS', 'Courier New', 'Times New Roman', 'Verdana'];

  const fontSizes = ['10px', '12px', '14px', '16px', '18px', '20px', '24px'];

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getMessageStyle = (msg) => ({
    color: msg.messageColor !== 'rainbow' ? (msg.messageColor || '#000000') : undefined,
    fontFamily: msg.fontStyle?.fontFamily || 'Arial',
    fontWeight: msg.fontStyle?.bold ? 'bold' : 'normal',
    fontStyle: msg.fontStyle?.italic ? 'italic' : 'normal',
    textDecoration: msg.fontStyle?.underline ? 'underline' : 'none',
    fontSize: msg.fontStyle?.fontSize || '14px'
  });

  const handlePrintChat = () => {
    window.print();
  };

  return (
    <div className="chat-container">
      {/* Yahoo! Messenger authentic sounds */}
      <audio ref={buzzAudioRef} src="/sounds/buzz.mp3" preload="auto" />
      <audio ref={knockAudioRef} src="/sounds/knock.wav" preload="auto" />
      <audio ref={doorAudioRef} src="/sounds/door.wav" preload="auto" />
      <audio ref={chimeAudioRef} src="/sounds/chimeup.wav" preload="auto" />

      <div className="chat-header">
        <div className="header-left">
          <img src="/favicon.svg" alt="Y!" className="header-logo" />
          <span className="header-title">Yahoo! Messenger</span>
          {roomId && <span className="room-code-display">Room: {roomId}</span>}
        </div>
        <div className="header-right">
          <button className="print-btn" onClick={handlePrintChat}>Print Chat</button>
          <button className="logout-btn" onClick={onLogout}>Sign Out</button>
        </div>
      </div>

      <div className="chat-body">
        <div className="users-sidebar">
          <div className="sidebar-header">Online ({users.length})</div>
          <div className="users-list">
            {users.map((u) => {
              // Helper function to create gradient colors
              const getGradientColors = (hexColor) => {
                if (hexColor === 'rainbow') return { light: '', dark: '' };

                // Convert hex to RGB
                const r = parseInt(hexColor.slice(1, 3), 16);
                const g = parseInt(hexColor.slice(3, 5), 16);
                const b = parseInt(hexColor.slice(5, 7), 16);

                // Calculate brightness
                const brightness = (r + g + b) / 3;

                // For bright colors, darken instead of lighten
                if (brightness > 180) {
                  const darker = (val) => Math.max(0, val - 60);
                  return {
                    light: `rgb(${r}, ${g}, ${b})`,
                    dark: `rgb(${darker(r)}, ${darker(g)}, ${darker(b)})`
                  };
                } else {
                  // For dark colors, lighten
                  const lighter = (val) => Math.min(255, val + 80);
                  return {
                    light: `rgb(${lighter(r)}, ${lighter(g)}, ${lighter(b)})`,
                    dark: `rgb(${r}, ${g}, ${b})`
                  };
                }
              };

              const gradientColors = getGradientColors(u.color);

              return (
                <div key={u.id} className="user-item">
                  <div
                    className={`user-avatar ${u.color === 'rainbow' ? 'rainbow-avatar' : ''}`}
                    style={u.color !== 'rainbow' ? {
                      background: `radial-gradient(circle at 30% 30%, ${gradientColors.light}, ${gradientColors.dark})`
                    } : {}}
                  ></div>
                  <span style={{ color: u.color }}>{u.username}</span>
                </div>
              );
            })}
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
                    <span className={`username ${msg.usernameColor === 'rainbow' ? 'rainbow-text' : ''}`} style={{ color: msg.usernameColor !== 'rainbow' ? msg.usernameColor : undefined }}>
                      {msg.username}:
                    </span>
                    <span className={`message-text ${msg.messageColor === 'rainbow' ? 'rainbow-text' : ''}`} style={getMessageStyle(msg)}>
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
                disabled={buzzDisabled}
              >
                {buzzDisabled ? `⚡ Buzz (${buzzCooldownSeconds}s)` : '⚡ Buzz'}
              </button>

              <div className="toolbar-divider"></div>

              <select
                value={messageFontStyle.fontFamily}
                onChange={(e) => setMessageFontStyle(prev => ({ ...prev, fontFamily: e.target.value }))}
                className="format-select font-select-toolbar"
                title="Font"
              >
                {fonts.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>

              <select
                value={messageFontStyle.fontSize || '14px'}
                onChange={(e) => setMessageFontStyle(prev => ({ ...prev, fontSize: e.target.value }))}
                className="format-select size-select"
                title="Font Size"
              >
                {fontSizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>

              <button
                type="button"
                className={`format-btn ${messageFontStyle.bold ? 'active' : ''}`}
                onClick={() => toggleMessageStyle('bold')}
                title="Bold"
              >
                <strong>B</strong>
              </button>
              <button
                type="button"
                className={`format-btn ${messageFontStyle.italic ? 'active' : ''}`}
                onClick={() => toggleMessageStyle('italic')}
                title="Italic"
              >
                <em>I</em>
              </button>
              <button
                type="button"
                className={`format-btn ${messageFontStyle.underline ? 'active' : ''}`}
                onClick={() => toggleMessageStyle('underline')}
                title="Underline"
              >
                <u>U</u>
              </button>

              <div className="color-picker-container">
                <button
                  type="button"
                  className="color-btn"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  title="Text Color"
                >
                  <div
                    className={`color-indicator ${messageColor === 'rainbow' ? 'rainbow-indicator' : ''}`}
                    style={messageColor !== 'rainbow' ? { backgroundColor: messageColor } : {}}
                  />
                </button>
                {showColorPicker && (
                  <div className="color-dropdown">
                    <div className="color-swatches-grid">
                      {colors.map(c => (
                        <button
                          key={c}
                          type="button"
                          className={`color-swatch-toolbar ${messageColor === c ? 'selected' : ''} ${c === 'rainbow' ? 'rainbow' : ''}`}
                          style={c !== 'rainbow' ? { backgroundColor: c } : {}}
                          onClick={() => {
                            setMessageColor(c);
                            setShowColorPicker(false);
                          }}
                          title={c === 'rainbow' ? 'Rainbow' : c}
                        />
                      ))}
                    </div>
                    <div className="custom-color-picker">
                      <label htmlFor="custom-color" className="custom-color-label">Custom:</label>
                      <input
                        id="custom-color"
                        type="color"
                        value={messageColor !== 'rainbow' && messageColor.startsWith('#') ? messageColor : '#000000'}
                        onChange={(e) => {
                          setMessageColor(e.target.value);
                        }}
                        className="custom-color-input"
                        title="Pick custom color"
                      />
                    </div>
                  </div>
                )}
              </div>
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
                ref={messageInputRef}
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
