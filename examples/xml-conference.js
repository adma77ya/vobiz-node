require('dotenv').config();
const express = require('express');

// Import XML generators from Vobiz SDK
const { conference: generateConference, hangup: generateHangup } = require('../lib/xml');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const port = process.env.EXAMPLE_PORT || 5684;
const conferenceRoom = process.env.CONFERENCE_ROOM || 'weekly-sync';

// Answer webhook - connect to conference
app.post('/answer', function answer(req, res) {
  const xmlResponse = generateConference({
    prompt: 'Connecting you to the conference room now.',
    conferenceName: conferenceRoom,
    actionUrl: '/conference-leave',
    method: 'POST'
  });

  res.type('text/xml');
  res.send(xmlResponse);
});

// Conference leave handler
app.post('/conference-leave', function conferenceLeave(req, res) {
  const xmlResponse = generateHangup({
    prompt: 'You have left the conference. Goodbye.'
  });

  res.type('text/xml');
  res.send(xmlResponse);
});

app.listen(port, function onListen() {
  console.log('[xml-conference] Listening on http://localhost:' + port);
  console.log('[xml-conference] Using Vobiz modular XML generators from lib/xml');
  console.log('[xml-conference] Use /answer as your answerUrl');
  console.log('[xml-conference] Conference room:', conferenceRoom);
});
