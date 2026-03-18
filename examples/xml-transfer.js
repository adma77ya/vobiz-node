require('dotenv').config();
const express = require('express');

// Import modular XML generators from Vobiz SDK
const xml = require('../lib/xml');
const { speak: generateSpeak } = xml.enhanced;
const { dial: generateDial } = xml.advanced;
const { hangup: generateHangup } = xml.basic;

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const port = process.env.EXAMPLE_PORT || 5681;
const transferNumber = process.env.TRANSFER_TO || '+14155550123';

// Answer webhook - initiate transfer
app.post('/answer', function answer(req, res) {
  const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak voice="WOMAN" language="en-US">Please wait while we connect your call.</Speak>
  <Dial action="/dial-complete" method="POST" timeout="30" callerId="+14155550000" dialMusic="real">${transferNumber}</Dial>
</Response>`;

  res.type('text/xml');
  res.send(xmlResponse);
});

// Dial complete handler - report transfer result
app.post('/dial-complete', function dialComplete(req, res) {
  const dialStatus = req.body && (req.body.DialStatus || req.body.dialStatus || 'unknown');

  const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak voice="WOMAN" language="en-US">Transfer result: ${dialStatus}.</Speak>
  <Hangup/>
</Response>`;

  res.type('text/xml');
  res.send(xmlResponse);
});

app.listen(port, function onListen() {
  console.log('[xml-transfer] Listening on http://localhost:' + port);
  console.log('[xml-transfer] Using Vobiz modular XML generators from lib/xml');
  console.log('[xml-transfer] Use /answer as your answerUrl');
  console.log('[xml-transfer] Transferring calls to:', transferNumber);
});
