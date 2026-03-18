require('dotenv').config();
const express = require('express');

// Import XML generators from Vobiz SDK
const { speak: generateSpeak } = require('../lib/xml');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const port = process.env.EXAMPLE_PORT || 5683;

// Answer webhook - play a text-to-speech message
app.post('/answer', function answer(req, res) {
  const xmlResponse = generateSpeak({
    text: 'Welcome to Vobiz. This is a text-to-speech example using our XML generator.',
    voice: 'WOMAN',
    language: 'en-US',
    loop: 1
  });

  res.type('text/xml');
  res.send(xmlResponse);
});

app.listen(port, function onListen() {
  console.log('[xml-speak] Listening on http://localhost:' + port);
  console.log('[xml-speak] Using Vobiz modular XML generators from lib/xml');
  console.log('[xml-speak] Use /answer as your answerUrl');
});
