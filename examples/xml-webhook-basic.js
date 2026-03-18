require('dotenv').config();
const express = require('express');

// Import XML generators from Vobiz SDK
const { speak: generateSpeak, gather: generateGather, dial: generateDial, record: generateRecord, hangup: generateHangup, redirect: generateRedirect } = require('../lib/xml');

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
    xmlResponse = generateDial({
      prompt: 'Connecting you to sales.',
      phoneNumber: '+14155550101',
      actionUrl: '/dial-complete',
      method: 'POST'
    });
  } else if (digits === '2') {
    // Transfer to support
    xmlResponse = generateDial({
      prompt: 'Connecting you to support.',
      phoneNumber: '+14155550102',
      actionUrl: '/dial-complete',
      method: 'POST'
    });
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

  const xmlResponse = generateHangup({
    prompt: `The transfer has ended. Status: ${dialStatus}. Goodbye.`
  });

  res.type('text/xml');
  res.send(xmlResponse);
});

// Voicemail complete handler
app.post('/voicemail-complete', function voicemailComplete(req, res) {
  const recordingUrl = req.body && (req.body.RecordingUrl || req.body.recordingUrl || 'not-provided');
  console.log('[xml-webhook-basic] voicemail recording:', recordingUrl);

  const xmlResponse = generateHangup({
    prompt: 'Thank you. Your voicemail has been recorded. Goodbye.'
  });

  res.type('text/xml');
  res.send(xmlResponse);
});

app.listen(port, function onListen() {
  console.log('[xml-webhook-basic] Listening on http://localhost:' + port);
  console.log('[xml-webhook-basic] Using Vobiz modular XML generators from lib/xml');
  console.log('[xml-webhook-basic] POST /answer and /menu-choice are ready');
});
