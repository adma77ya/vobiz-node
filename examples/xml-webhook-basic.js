require('dotenv').config();
const express = require('express');

// Import modular XML generators from Vobiz SDK
const xml = require('../lib/xml');
const { speak: generateSpeak } = xml.enhanced;
const { gather: generateGather, dial: generateDial, record: generateRecord } = xml.advanced;
const { hangup: generateHangup, redirect: generateRedirect } = xml.basic;

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const port = process.env.EXAMPLE_PORT || 5680;

// Answer webhook - initial menu
app.post('/answer', function answer(req, res) {
  const xmlResponse = generateGather({
    actionUrl: '/menu-choice',
    method: 'POST',
    inputType: 'dtmf',
    numDigits: 1,
    prompt: 'Welcome to Vobiz XML webhook example. Press 1 for sales, 2 for support, 3 for voicemail, or 0 to hang up.'
  });

  res.type('text/xml');
  res.send(xmlResponse);
});

// Menu choice handler - route digits to appropriate handlers
app.post('/menu-choice', function menuChoice(req, res) {
  const digits = (req.body && (req.body.Digits || req.body.digits)) || '';

  let xmlResponse;
  if (digits === '1') {
    // Transfer to sales
    xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak voice="WOMAN" language="en-US">Connecting you to sales.</Speak>
  <Dial action="/dial-complete" method="POST">+14155550101</Dial>
</Response>`;
  } else if (digits === '2') {
    // Transfer to support
    xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak voice="WOMAN" language="en-US">Connecting you to support.</Speak>
  <Dial action="/dial-complete" method="POST">+14155550102</Dial>
</Response>`;
  } else if (digits === '3') {
    // Voicemail
    xmlResponse = generateRecord({
      actionUrl: '/voicemail-complete',
      method: 'POST',
      maxLength: 60,
      playBeep: true,
      finishOnKey: '#',
      prompt: 'Please leave your voicemail after the beep. Press hash when done.'
    });
  } else {
    // Hangup for invalid input or 0
    xmlResponse = generateHangup({
      prompt: 'Goodbye. Thank you for using Vobiz.'
    });
  }

  res.type('text/xml');
  res.send(xmlResponse);
});

// Dial complete handler
app.post('/dial-complete', function dialComplete(req, res) {
  const dialStatus = req.body && (req.body.DialStatus || req.body.dialStatus || 'completed');

  const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak voice="WOMAN" language="en-US">The transfer has ended. Status: ${dialStatus}. Goodbye.</Speak>
  <Hangup/>
</Response>`;

  res.type('text/xml');
  res.send(xmlResponse);
});

// Voicemail complete handler
app.post('/voicemail-complete', function voicemailComplete(req, res) {
  const recordingUrl = req.body && (req.body.RecordingUrl || req.body.recordingUrl || 'not-provided');
  console.log('[xml-webhook-basic] voicemail recording:', recordingUrl);

  const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak voice="WOMAN" language="en-US">Thank you. Your voicemail has been recorded. Goodbye.</Speak>
  <Hangup/>
</Response>`;

  res.type('text/xml');
  res.send(xmlResponse);
});

app.listen(port, function onListen() {
  console.log('[xml-webhook-basic] Listening on http://localhost:' + port);
  console.log('[xml-webhook-basic] Using Vobiz modular XML generators from lib/xml');
  console.log('[xml-webhook-basic] POST /answer and /menu-choice are ready');
});
