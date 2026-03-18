require('dotenv').config();
const express = require('express');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const port = process.env.EXAMPLE_PORT || 5682;

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function xml(body) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n${body}\n</Response>`;
}

app.post('/answer', function answer(req, res) {
  const body = [
    '  <Speak voice="WOMAN" language="en-US">Please leave a message after the beep.</Speak>',
    '  <Record action="/voicemail-complete" method="POST" maxLength="120" playBeep="true" timeout="5" fileFormat="mp3" transcribe="true" transcriptionUrl="https://example.com/transcription-callback" />'
  ].join('\n');

  res.type('text/xml');
  res.send(xml(body));
});

app.post('/voicemail-complete', function voicemailComplete(req, res) {
  const recordingUrl = req.body && (req.body.RecordingUrl || req.body.recordingUrl || 'not-provided');

  console.log('[xml-voicemail] recording callback:', recordingUrl);

  const body = [
    '  <Speak voice="WOMAN" language="en-US">Thank you. Your voicemail has been recorded.</Speak>',
    '  <Hangup />'
  ].join('\n');

  res.type('text/xml');
  res.send(xml(body));
});

app.listen(port, function onListen() {
  console.log('[xml-voicemail] Listening on http://localhost:' + port);
  console.log('[xml-voicemail] Use /answer as your answerUrl');
});
