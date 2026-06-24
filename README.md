# Yahoo! Messenger Clone

A nostalgic recreation of the classic Yahoo! Messenger chat interface from the early 2000s, built with React and Socket.io.

## Features

- **Classic Yahoo! Messenger UI** - Authentic purple gradient theme and layout
- **Real-time messaging** - Instant communication using WebSockets (Socket.io)
- **Custom username colors** - Choose from 8 classic colors for your username
- **Font styling** - Bold, italic, and underline text formatting
- **Multiple font families** - Arial, Comic Sans MS, Courier New, Times New Roman, Verdana
- **93 Animated Emoticons** - All original Yahoo! Messenger emoticons with text shortcuts and picker
- **Authentic Sound Effects** - Original Y!M sounds for messages, joins, leaves, and buzzes
- **Buzz/Nudge feature** - Send audio-visual alerts with the classic "pow" sound
- **Online user list** - See who's currently in the chat room
- **System notifications** - Get notified when users join or leave

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Install dependencies:
```bash
npm install
```

### Running the Application

You need to run both the server and the client:

1. **Start the backend server** (in one terminal):
```bash
npm run server
```

The server will start on `http://localhost:3001`

2. **Start the Vite dev server** (in another terminal):
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Usage

1. Open `http://localhost:5173` in your browser
2. Enter your Yahoo! ID (username)
3. Choose a username color from the color palette
4. Select font family and styling (bold, italic, underline)
5. Click "Sign In"
6. Start chatting!

#### Features to Try:

- **Send messages**: Type in the message box and click Send or press Enter (hear the authentic "chime" sound!)
- **Use emoticons**: Type `:)`, `:D`, `;)`, `<3`, etc. and they'll convert to animated GIFs
- **Send a buzz**: Click the "⚡ Buzz" button to send the classic "pow" buzz sound
- **Emoticon picker**: Click the smile emoticon button to browse all 93 emoticons
- **Multiple users**: Open multiple browser tabs/windows to hear the "knock" sound when users join and "door" sound when they leave
- **Listen for sounds**: Message received (chime), user joined (knock), user left (door), buzz (pow)

## Project Structure

```
ym-chat/
├── server/
│   └── index.js              # Express + Socket.io server
├── src/
│   ├── components/
│   │   ├── LoginScreen.jsx   # Login/sign-in screen
│   │   ├── LoginScreen.css
│   │   ├── ChatWindow.jsx    # Main chat interface
│   │   └── ChatWindow.css
│   ├── utils/
│   │   └── emoticons.js      # All 93 Yahoo! emoticons
│   ├── App.jsx               # Main app component
│   ├── App.css
│   └── main.jsx
├── public/
│   ├── emoticons/            # 93 animated GIF files
│   └── sounds/               # Original Y!M sound effects (.wav)
└── package.json
```

## Available Emoticons

🎉 **All 93 Original Yahoo! Messenger Emoticons!** 🎉

The app includes the complete collection of animated GIF emoticons from the classic Yahoo! Messenger:

### Quick Examples (Text Shortcuts):
- `:)` or `:-)` → Smile 😊
- `:D` or `:-D` → Big Grin
- `;)` → Wink
- `<3` → Heart ❤️
- `:'(` → Crying
- `XD` → LOL
- `B)` → Sunglasses (Cool)
- `>:(` → Angry

### Full List:
See **[ALL_EMOTICONS.md](ALL_EMOTICONS.md)** for the complete list of all 93 emoticons!

All emoticons are original animated GIFs from Yahoo! Messenger. Use text shortcuts in your messages or click the emoticon picker to browse and select from the full collection.

## Sound Effects

🔊 **Original Yahoo! Messenger Sounds!** 🔊

The app includes authentic sound effects from Yahoo! Messenger:
- **Chime** (chimeup.wav) - Plays when you receive a message
- **Knock** (knock.wav) - Plays when someone joins the chat
- **Door** (door.wav) - Plays when someone leaves the chat
- **Buzz** (buzz.mp3) - The iconic buzz/nudge sound effect

See **[SOUNDS.md](SOUNDS.md)** for the complete list of sounds and future enhancement ideas!

## Technologies Used

- **Frontend**: React 19, Vite
- **Backend**: Node.js, Express
- **Real-time**: Socket.io
- **Styling**: CSS3 with custom animations

## Future Enhancements

- Private messaging between users
- Chat history persistence
- User avatars/profile pictures
- File sharing
- Voice messages
- Custom emoticon uploads
- Chat rooms/channels
- User authentication with passwords

## License

This is a personal project for educational and nostalgic purposes.

---

Enjoy the nostalgia! 📧✨
