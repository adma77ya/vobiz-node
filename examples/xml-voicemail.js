require('dotenv').config();
const express = require('express');

// Import XML generators from Vobiz SDK
const { speak: generateSpeak, record: generateRecord, hangup: generateHangup } = require('../lib/xml');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const port = process.env.EXAMPLE_PORT || 5682;

// Answer webhook - initiate voicemail recording
app.post('/answer', function answer(req, res) {
  const xmlResponse = generateRecord({
    actionUrl: '/voicemail-complete',
    method: 'POST',
    maxLength: 120,
    playBeep: true,
    timeout: 5,
    fileFormat: 'mp3',
    transcriptionType: 'auto',
    transcriptionUrl: 'https://example.com/transcription-callback',
    finishOnKey: '#',
    prompt: 'Please leave a message after the beep. Press hash when done.'
  });

  res.type('text/xml');
  res.send(xmlResponse);
});

// Voicemail complete handler - process recorded message
app.post('/voicemail-complete', function voicemailComplete(req, res) {
  const recordingUrl = req.body && (req.body.RecordingUrl || req.body.recordingUrl || 'not-provided');
  const transcriptionText = req.body && (req.body.TranscriptionText || req.body.transcriptionText || null);

  console.log('[xml-voicemail] recording callback:', recordingUrl);
  if (transcriptionText) {
    console.log('[xml-voicemail] transcription:', transcriptionText);
  }

  const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak voice="WOMAN" language="en-US">Thank you. Your voicemail has been recorded and will be processed.</Speak>
  <Hangup/>
</Response>`;

  res.type('text/xml');
  res.send(xmlResponse);
});

app.listen(port, function onListen() {
  console.log('[xml-voicemail] Listening on http://localhost:' + port);
  console.log('[xml-voicemail] Using Vobiz modular XML generators from lib/xml');
  console.log('[xml-voicemail] Use /answer as your answerUrl');
});
