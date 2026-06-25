import { useState } from 'react';
import './LoginScreen.css';

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [color, setColor] = useState('#0000FF');
  const [fontStyle, setFontStyle] = useState({
    bold: false,
    italic: false,
    underline: false,
    fontFamily: 'Arial'
  });
  const [roomCode, setRoomCode] = useState('');
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [mode, setMode] = useState('create'); // 'create' or 'join'

  const handleChatTypeSelect = (type) => {
    if (type === 'private') {
      setShowRoomModal(true);
    } else {
      // Public chat - submit immediately if username is filled
      if (username.trim()) {
        onLogin({
          username: username.trim(),
          color,
          fontStyle,
          chatType: 'public',
          mode: null,
          roomCode: null
        });
      }
    }
  };

  const handleRoomSubmit = () => {
    if (mode === 'join' && !roomCode.trim()) {
      return;
    }

    setShowRoomModal(false);
    onLogin({
      username: username.trim(),
      color,
      fontStyle,
      chatType: 'private',
      mode,
      roomCode: mode === 'join' ? roomCode.trim().toUpperCase() : null
    });
  };

  const toggleStyle = (style) => {
    setFontStyle(prev => ({
      ...prev,
      [style]: !prev[style]
    }));
  };

  const colors = [
    '#0000FF', '#FF0000', '#008000', '#FF00FF',
    '#008B8B', '#800080', '#FFA500', '#000000', 'rainbow'
  ];

  const fonts = ['Arial', 'Comic Sans MS', 'Courier New', 'Times New Roman', 'Verdana'];

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="title-bar">
          <div className="title-bar-text">
            <img src="/favicon.svg" alt="Y!" className="title-bar-logo" />
            YAHOO! Messenger
          </div>
          <div className="title-bar-controls">
            <button className="title-bar-button" aria-label="Minimize">_</button>
            <button className="title-bar-button" aria-label="Maximize">□</button>
            <button className="title-bar-button close" aria-label="Close">×</button>
          </div>
        </div>

        <div className="window-body">
          <div className="login-header">
            <img src="/logo.png" alt="Yahoo! Messenger" className="ym-logo" />
          </div>

          <form onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label>Yahoo! ID:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your Yahoo! ID"
              maxLength={20}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Username Color:</label>
            <div className="color-picker">
              {colors.map(c => (
                <button
                  key={c}
                  type="button"
                  className={`color-swatch ${color === c ? 'selected' : ''} ${c === 'rainbow' ? 'rainbow' : ''}`}
                  style={c !== 'rainbow' ? { backgroundColor: c } : {}}
                  onClick={() => setColor(c)}
                  title={c === 'rainbow' ? 'Rainbow' : c}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Font Style:</label>
            <div className="font-controls">
              <select
                value={fontStyle.fontFamily}
                onChange={(e) => setFontStyle(prev => ({ ...prev, fontFamily: e.target.value }))}
                className="font-select"
              >
                {fonts.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>

              <div className="style-buttons">
                <button
                  type="button"
                  className={`style-btn ${fontStyle.bold ? 'active' : ''}`}
                  onClick={() => toggleStyle('bold')}
                  title="Bold"
                >
                  <strong>B</strong>
                </button>
                <button
                  type="button"
                  className={`style-btn ${fontStyle.italic ? 'active' : ''}`}
                  onClick={() => toggleStyle('italic')}
                  title="Italic"
                >
                  <em>I</em>
                </button>
                <button
                  type="button"
                  className={`style-btn ${fontStyle.underline ? 'active' : ''}`}
                  onClick={() => toggleStyle('underline')}
                  title="Underline"
                >
                  <u>U</u>
                </button>
              </div>
            </div>
          </div>

          <div className="preview">
            <label>Preview:</label>
            <div
              className={`preview-text ${color === 'rainbow' ? 'rainbow-text' : ''}`}
              style={{
                color: color !== 'rainbow' ? color : undefined,
                fontFamily: fontStyle.fontFamily,
                fontWeight: fontStyle.bold ? 'bold' : 'normal',
                fontStyle: fontStyle.italic ? 'italic' : 'normal',
                textDecoration: fontStyle.underline ? 'underline' : 'none'
              }}
            >
              {username || 'Your Username'}
            </div>
          </div>

          <div className="form-group">
            <div className="chat-type-selector">
              <button
                type="button"
                className="chat-type-btn"
                onClick={() => handleChatTypeSelect('public')}
                disabled={!username.trim()}
              >
                Public Chat
              </button>
              <button
                type="button"
                className="chat-type-btn"
                onClick={() => handleChatTypeSelect('private')}
                disabled={!username.trim()}
              >
                Private Chat
              </button>
            </div>
          </div>
        </form>

        {/* Room Modal */}
        {showRoomModal && (
          <div className="modal-overlay" onClick={() => setShowRoomModal(false)}>
            <div className="room-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Private Chat Room</h3>
                <button className="modal-close" onClick={() => setShowRoomModal(false)}>×</button>
              </div>

              <div className="modal-body">
                <div className="room-mode-selector">
                  <button
                    type="button"
                    className={`mode-btn ${mode === 'create' ? 'active' : ''}`}
                    onClick={() => setMode('create')}
                  >
                    Create Room
                  </button>
                  <button
                    type="button"
                    className={`mode-btn ${mode === 'join' ? 'active' : ''}`}
                    onClick={() => setMode('join')}
                  >
                    Join Room
                  </button>
                </div>

                {mode === 'join' && (
                  <div className="room-code-field">
                    <label>Room Code:</label>
                    <input
                      type="text"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      placeholder="Enter Code"
                      maxLength={6}
                      className="room-code-input"
                      autoFocus
                    />
                  </div>
                )}

                {mode === 'create' && (
                  <p className="room-info">Share your unique room code with others to allow them to join.</p>
                )}
              </div>

              <div className="modal-footer">
                <button className="modal-cancel-btn" onClick={() => setShowRoomModal(false)}>
                  Cancel
                </button>
                <button
                  className="modal-submit-btn"
                  onClick={handleRoomSubmit}
                  disabled={mode === 'join' && !roomCode.trim()}
                >
                  {mode === 'create' ? 'Create & Join' : 'Join Room'}
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;
