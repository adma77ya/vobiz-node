/**
 * Speak text on a live call using the Vobiz API.
 *
 * This sends a TTS (text-to-speech) message into an in-progress call.
 * Replace CALL_UUID with a real live call UUID.
 */
var Vobiz = require('..');
var client = new Vobiz.Client();

var callUuid = process.env.CALL_UUID || 'your-live-call-uuid';

// Speak text into a live call
client.calls.speakText(callUuid, 'Hello, this is a Vobiz text-to-speech message.', {
  voice:    'WOMAN',
  language: 'en-US'
})
  .then(function(result) {
    console.log("\n============ speaking text ===========\n", result);

    // Stop TTS after 5 seconds
    return new Promise(function(resolve) {
      setTimeout(resolve, 5000);
    });
  })
  .then(function() {
    return client.calls.stopSpeakingText(callUuid);
  })
  .then(function(result) {
    console.log("\n============ stopped speaking ===========\n", result);
  })
  .catch(function(err) {
    console.log("\n============ Error ===========\n", err.message);
  });
