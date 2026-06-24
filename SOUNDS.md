# Yahoo! Messenger Sound Effects

All original Yahoo! Messenger sound effects (.wav files) are included in the `/public/sounds/` directory.

## Currently Implemented Sounds

| Sound File | When It Plays | Description |
|------------|---------------|-------------|
| **buzz.mp3** | Someone sends a buzz | The original Yahoo! Messenger buzz/nudge sound effect |
| **knock.wav** | User joins the chat | Plays when someone enters the chat room |
| **door.wav** | User leaves the chat | Plays when someone exits/disconnects from the chat |
| **chimeup.wav** | Message received | Plays when you receive a message from another user |

## Available But Not Yet Implemented

| Sound File | Potential Use | Description |
|------------|---------------|-------------|
| **doorbell.wav** | Private message alert | Could be used for direct messages or special notifications |
| **type.wav** | Typing indicator | Could play while user is typing (with typing indicators) |
| **backsp.wav** | Delete/Backspace | Could play on certain delete actions |
| **return.wav** | Message sent | Could play when you successfully send a message |
| **pow.wav** | Alternative alert | Could be used for other notification types |

## Sound Behavior

- **Auto-play**: Sounds play automatically based on chat events
- **No overlap**: Each sound resets to the beginning if triggered while already playing
- **Browser compatibility**: All sounds are in .wav format for maximum compatibility
- **Authentic experience**: These are the original sound files from Yahoo! Messenger circa 2006

## Future Enhancement Ideas

1. **Typing indicators**: Show when users are typing and play the `type.wav` sound
2. **Message sent confirmation**: Play `return.wav` when you send a message
3. **Sound preferences**: Allow users to enable/disable specific sounds
4. **Volume control**: Add a volume slider for sound effects
5. **Custom sounds**: Allow users to upload their own sound files

## Notes

- The buzz sound uses `buzz.mp3`, the authentic Yahoo! Messenger buzz/nudge sound
- All other sounds are in .wav format for consistency
- All sounds are preloaded for instant playback
- Sounds only play for events triggered by other users (you don't hear sounds for your own actions, except buzz)
