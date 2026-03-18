require('dotenv').config();
const express = require('express');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const port = process.env.EXAMPLE_PORT || 5681;
const transferNumber = process.env.TRANSFER_TO || '+14155550123';

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
    '  <Speak voice="WOMAN" language="en-US">Please wait while we connect your call.</Speak>',
    '  <Dial action="/dial-complete" method="POST" timeout="30" callerId="+14155550000" dialMusic="real">' + escapeXml(transferNumber) + '</Dial>'
  ].join('\n');

  res.type('text/xml');
  res.send(xml(body));
});

app.post('/dial-complete', function dialComplete(req, res) {
  const dialStatus = req.body && (req.body.DialStatus || req.body.dialStatus || 'unknown');
  const body = [
    '  <Speak voice="WOMAN" language="en-US">Transfer result: ' + escapeXml(dialStatus) + '.</Speak>',
    '  <Hangup />'
  ].join('\n');

  res.type('text/xml');
  res.send(xml(body));
});

app.listen(port, function onListen() {
  console.log('[xml-transfer] Listening on http://localhost:' + port);
  console.log('[xml-transfer] Use /answer as your answerUrl');
});
