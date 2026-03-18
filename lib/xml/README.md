# Vobiz XML Generator Library

Professional modular structure for Vobiz XML response elements.

## Structure

```
lib/xml/
├── index.js          # Main export aggregator
├── basic/            # XML1 - 8 basic elements
│   ├── play.js       # Play audio file
│   ├── wait.js       # Wait/pause with silence detection
│   ├── hangup.js     # End call
│   ├── redirect.js   # Forward to URL
│   ├── dtmf.js       # Send DTMF tones
│   ├── preanswer.js  # Early media support
│   ├── stream.js     # WebSocket audio streaming
│   ├── conference.js # Multi-party conference
│   └── index.js      # Basic exports
├── advanced/         # XML2 - 5 advanced elements
│   ├── dial.js       # Enhanced call transfer
│   ├── gather.js     # DTMF/speech input collection
│   ├── record.js     # Record with transcription
│   └── index.js      # Advanced exports
└── enhanced/         # XML3 - 4 enhanced elements
    ├── speak.js      # TTS with 16 languages
    ├── ssml.js       # SSML builder helper
    ├── speak-and-wait.js  # Common pattern combo
    └── index.js      # Enhanced exports
```

## Usage

### Basic Usage (Direct Imports)
```javascript
const xml = require('./lib/xml');

// Access by category
xml.basic.play('https://example.com/audio.wav');
xml.advanced.dial({ phoneNumber: '+1234567890' });
xml.enhanced.speak({ text: 'Hello', language: 'en-US' });
```

### Server Usage (in server.js)
```javascript
const xml = require('./lib/xml');

// Destructure for convenience
const { play, hangup, conference } = xml.basic;
const { dial, gather, record } = xml.advanced;
const { speak, ssml, speakAndWait } = xml.enhanced;

// Use in webhook handlers
app.all('/answer', (req, res) => {
  const xmlResponse = gather({
    actionUrl: '/menu-choice',
    prompt: 'Welcome to Vobiz'
  });
  res.set('Content-Type', 'text/xml').send(xmlResponse);
});
```

## Elements by Category

### Basic (XML1) - 8 Elements
- **play**: Play audio file
- **wait**: Pause with silence/beep detection  
- **hangup**: End call
- **redirect**: Forward to another URL
- **dtmf**: Send DTMF tones
- **preanswer**: Early media (pre-answer)
- **stream**: WebSocket audio streaming
- **conference**: Multi-party conference bridge

### Advanced (XML2) - 5 Elements
- **dial**: Enhanced call transfer with music/callbacks
- **gather**: Collect DTMF or speech input
- **record**: Record with auto-transcription
- (Includes enhanced hangup/DTMF variants via main server logic)

### Enhanced (XML3) - 4 Elements  
- **speak**: Text-to-speech (16 languages, 2 voices)
- **ssml**: SSML prosody builder helper
- **speakAndWait**: Common speak+wait combo
- (Includes enhanced wait variant via main server logic)

## Language Support

**Speak element supports 16 languages:**
- da-DK (Danish)
- nl-NL (Dutch)
- en-AU (English - Australian)
- en-GB (English - British)
- en-US (English - US)
- fr-FR (French - France)
- fr-CA (French - Canada)
- de-DE (German)
- it-IT (Italian)
- pl-PL (Polish)
- pt-PT (Portuguese - Portugal)
- pt-BR (Portuguese - Brazil)
- ru-RU (Russian)
- es-ES (Spanish - Spain)
- es-US (Spanish - US)
- sv-SE (Swedish)

## Key Features

✅ **Modular Design**: One XML generator per file
✅ **Professional Organization**: Grouped by complexity (basic/advanced/enhanced)
✅ **Full Attribute Support**: All Vobiz XML attributes supported
✅ **SSML Support**: Prosody, breaks, spell-out
✅ **Language Support**: 16 languages in Speak element
✅ **Voicemail Detection**: Beep/silence detection in Wait
✅ **Auto-transcription**: Transcription callbacks in Record
✅ **Test Coverage**: 26/26 comprehensive tests (100%)

## Testing

Run the comprehensive test suite:
```bash
npm test  # or node test-all-xml.js
```

Expected output: 26 Passed | 0 Failed | 100% Success Rate

## Integration with server.js

The main server.js imports from this library:
```javascript
const xml = require('./lib/xml');
const { play, wait, hangup, ... } = xml.basic;
const { dial, gather, record } = xml.advanced;
const { speak, ssml, speakAndWait } = xml.enhanced;
```

All webhook handlers use these generators to create dynamic XML responses.

## Contributing

When adding new XML elements:

1. Create a new file in appropriate folder (basic/advanced/enhanced)
2. Export a single function: `module.exports = function generateXXXXML(options) { ... }`
3. Add to folder's index.js
4. Update main lib/xml/index.js if adding a new element type
5. Add test case to test-all-xml.js
6. Verify all 26 tests still pass

## License

See [LICENSE.txt](../../LICENSE.txt)
