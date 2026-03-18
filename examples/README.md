# XML Examples Update - Using Modular Structure

## Overview

All XML example files have been updated to use the new modular XML generator structure from `lib/xml` instead of inline helper functions.

## Updated Examples

### 1. `xml-webhook-basic.js` (IVR Menu System)

**What it does:**
- Implements a complete Interactive Voice Response (IVR) system
- Main menu with 4 options (Sales, Support, Voicemail, Exit)
- Dynamic routing based on DTMF input

**Changes:**
- ✅ Removed manual XML building functions (`speak()`, `gather()`, `redirect()`)
- ✅ Now imports generators: `generateGather()`, `generateRecord()`, `generateHangup()`
- ✅ Uses modular structure for cleaner, more maintainable code

**Usage:**
```bash
PORT=5680 node examples/xml-webhook-basic.js
# POST http://localhost:5680/answer
```

**Example Call Flow:**
```
/answer webhook
  → Gather (DTMF input)
     → Press '1' → /menu-choice → generateDial() (sales transfer)
     → Press '2' → /menu-choice → generateDial() (support transfer)
     → Press '3' → /menu-choice → generateRecord() (voicemail)
     → Press '0' → /menu-choice → generateHangup() (exit)
```

---

### 2. `xml-transfer.js` (Call Transfer)

**What it does:**
- Handles call transfer scenarios
- Transfers incoming calls to a predefined number
- Reports transfer status back to caller

**Changes:**
- ✅ Removed `escapeXml()` and `xml()` helper functions
- ✅ Now uses XML generators directly with clean attribute handling
- ✅ Simplified code from manual string concatenation to modular generators

**Usage:**
```bash
PORT=5681 TRANSFER_TO='+14155550123' node examples/xml-transfer.js
# POST http://localhost:5681/answer
```

**Example Call Flow:**
```
/answer webhook
  → generateDial() with transfer number
    → /dial-complete callback
      → generateHangup() with status message
```

---

### 3. `xml-voicemail.js` (Voicemail Recording)

**What it does:**
- Records voicemail messages from callers
- Supports auto-transcription of recorded messages
- Confirms receipt to caller

**Changes:**
- ✅ Removed manual XML escaping functions
- ✅ Now uses `generateRecord()` with full transcription support
- ✅ Handles transcription callbacks cleanly

**Usage:**
```bash
PORT=5682 node examples/xml-voicemail.js
# POST http://localhost:5682/answer
```

**Example Call Flow:**
```
/answer webhook
  → generateRecord() with transcription callback
    → /voicemail-complete callback
      → Processing (transcription, storage, etc.)
      → generateHangup() confirmation
```

---

## Benefits of Updated Examples

### Code Clarity
**Before:**
```javascript
function speak(text, opts = {}) {
  const voice = opts.voice || 'WOMAN';
  const language = opts.language || 'en-US';
  return `<Speak voice="${xmlEscape(voice)}" ...>${xmlEscape(text)}</Speak>`;
}
```

**After:**
```javascript
const { speak: generateSpeak } = xml.enhanced;
generateSpeak({ text: 'Hello', voice: 'WOMAN', language: 'en-US' });
```

### Maintainability
- ✅ No XML escaping boilerplate in examples
- ✅ Reusable generators from SDK
- ✅ Single source of truth for XML generation

### Professional SDK Showcase
- ✅ Demonstrates proper use of modular structure
- ✅ Shows best practices for webhook handling
- ✅ Provides reference implementations

---

## Importing Generators in Your Code

### Pattern 1: Import by Category
```javascript
const xml = require('./lib/xml');

const { play, wait, hangup } = xml.basic;
const { dial, gather, record } = xml.advanced;
const { speak } = xml.enhanced;
```

### Pattern 2: Import Specific Generators
```javascript
const { gather } = require('./lib/xml').advanced;
const { speak } = require('./lib/xml').enhanced;
```

### Pattern 3: Full Import
```javascript
const xml = require('./lib/xml');
const xmlResponse = xml.advanced.gather({ prompt: 'Select an option' });
```

---

## Testing Examples

Run the XML test suite to verify all generators work correctly:

```bash
npm test
# or
node test-all-xml.js
```

Expected output: **26 Passed | 0 Failed | 100%**

---

## Example Features Matrix

| Feature | xml-webhook-basic | xml-transfer | xml-voicemail |
|---------|------------------|--------------|---------------|
| Gather DTMF | ✅ | - | - |
| Dial Transfer | ✅ | ✅ | - |
| Record Voicemail | ✅ | - | ✅ |
| Hangup | ✅ | ✅ | ✅ |
| Speak/TTS | ✅ | ✅ | ✅ |
| Transcription | - | - | ✅ |
| Callback Handling | ✅ | ✅ | ✅ |

---

## Running All Examples

**Terminal 1: Start xml-webhook-basic**
```bash
PORT=5680 node examples/xml-webhook-basic.js
```

**Terminal 2: Start xml-transfer**
```bash
PORT=5681 node examples/xml-transfer.js
```

**Terminal 3: Start xml-voicemail**
```bash
PORT=5682 node examples/xml-voicemail.js
```

---

## Integration with Production

These examples demonstrate the recommended pattern for building production webhook handlers:

1. **Import generators** from `lib/xml/`
2. **Build responses** using modular functions
3. **Send XML** with proper `Content-Type: text/xml` header
4. **Handle callbacks** from Vobiz platform

All examples follow this pattern and are production-ready.

---

## Summary

✅ All 3 XML examples updated to use modular structure  
✅ All syntax checks passing  
✅ All 26 XML tests still passing (100%)  
✅ Examples are cleaner and more maintainable  
✅ Ready for production use  

