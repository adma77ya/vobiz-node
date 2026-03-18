require('dotenv').config();
const express = require('express');

// Import XML generators from Vobiz SDK
const { speak: generateSpeak, dial: generateDial, hangup: generateHangup } = require('../lib/xml');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const port = process.env.EXAMPLE_PORT || 5681;
const transferNumber = process.env.TRANSFER_TO || '+14155550123';

// Answer webhook - initiate transfer
app.post('/answer', function answer(req, res) {
  const xmlResponse = generateDial({
    prompt: 'Please wait while we connect your call.',
    phoneNumber: transferNumber,
    actionUrl: '/dial-complete',
    method: 'POST',
    timeout: 30,
    callerId: '+14155550000',
    dialMusic: 'real'
  });

  res.type('text/xml');
  res.send(xmlResponse);
});

// Dial complete handler - report transfer result
app.post('/dial-complete', function dialComplete(req, res) {
  const dialStatus = req.body && (req.body.DialStatus || req.body.dialStatus || 'unknown');

  const xmlResponse = generateHangup({
    prompt: `Transfer result: ${dialStatus}.`
  });

  res.type('text/xml');
  res.send(xmlResponse);
});

app.listen(port, function onListen() {
  console.log('[xml-transfer] Listening on http://localhost:' + port);
  console.log('[xml-transfer] Using Vobiz modular XML generators from lib/xml');
  console.log('[xml-transfer] Use /answer as your answerUrl');
  console.log('[xml-transfer] Transferring calls to:', transferNumber);
});
