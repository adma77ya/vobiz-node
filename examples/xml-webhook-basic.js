require('dotenv').config();
const express = require('express');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const port = process.env.EXAMPLE_PORT || 5680;

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function xmlResponse(body) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n${body}\n</Response>`;
}

function speak(text, opts = {}) {
  const voice = opts.voice || 'WOMAN';
  const language = opts.language || 'en-US';
  return `  <Speak voice="${xmlEscape(voice)}" language="${xmlEscape(language)}">${xmlEscape(text)}</Speak>`;
}

function gather(opts = {}) {
  const action = opts.action || '/menu-choice';
  const method = opts.method || 'POST';
  const inputType = opts.inputType || 'dtmf';
  const numDigits = Number.isFinite(opts.numDigits) ? opts.numDigits : 1;

  return [
    `  <Gather action="${xmlEscape(action)}" method="${xmlEscape(method)}" inputType="${xmlEscape(inputType)}" numDigits="${numDigits}">`,
    speak('Press 1 for sales, 2 for support, 3 for voicemail, or 0 to hang up.'),
    '  </Gather>'
  ].join('\n');
}

function redirect(url, method = 'POST') {
  return `  <Redirect method="${xmlEscape(method)}">${xmlEscape(url)}</Redirect>`;
}

app.post('/answer', function answer(req, res) {
  const xml = xmlResponse([
    speak('Welcome to Vobiz XML webhook example.'),
    gather({ action: '/menu-choice', method: 'POST', inputType: 'dtmf', numDigits: 1 }),
    redirect('/answer', 'POST')
  ].join('\n'));

  res.type('text/xml');
  res.send(xml);
});

app.post('/menu-choice', function menuChoice(req, res) {
  const digits = (req.body && (req.body.Digits || req.body.digits)) || '';

  let body;
  if (digits === '1') {
    body = [
      speak('Connecting you to sales.'),
      '  <Dial action="/dial-complete" method="POST">+14155550101</Dial>'
    ].join('\n');
  } else if (digits === '2') {
    body = [
      speak('Connecting you to support.'),
      '  <Dial action="/dial-complete" method="POST">+14155550102</Dial>'
    ].join('\n');
  } else if (digits === '3') {
    body = [
      speak('Please leave your voicemail after the beep.'),
      '  <Record action="/voicemail-complete" method="POST" maxLength="60" playBeep="true" />'
    ].join('\n');
  } else {
    body = [
      speak('Goodbye.'),
      '  <Hangup />'
    ].join('\n');
  }

  res.type('text/xml');
  res.send(xmlResponse(body));
});

app.post('/dial-complete', function dialComplete(req, res) {
  res.type('text/xml');
  res.send(xmlResponse(speak('The transfer has ended. Goodbye.') + '\n  <Hangup />'));
});

app.post('/voicemail-complete', function voicemailComplete(req, res) {
  res.type('text/xml');
  res.send(xmlResponse(speak('Thanks. Your voicemail is saved. Goodbye.') + '\n  <Hangup />'));
});

app.listen(port, function onListen() {
  console.log('[xml-webhook-basic] Listening on http://localhost:' + port);
  console.log('[xml-webhook-basic] POST /answer and /menu-choice are ready');
});
