/**
 * XML Generators - Vobiz SDK
 * All generators in flat structure for simple access
 * 
 * Usage:
 *   const xml = require('./lib/xml');
 *   
 *   // Access generators directly
 *   xml.play(url);
 *   xml.hangup();
 *   xml.dial({ phoneNumber: '+1234567890' });
 *   xml.gather({ inputType: 'dtmf' });
 *   xml.speak({ text: 'Hello', language: 'en-US' });
 */

module.exports = {
  // Basic elements (8)
  play: require('./play'),
  wait: require('./wait'),
  hangup: require('./hangup'),
  redirect: require('./redirect'),
  dtmf: require('./dtmf'),
  preanswer: require('./preanswer'),
  stream: require('./stream'),
  conference: require('./conference'),
  
  // Advanced elements (3)
  dial: require('./dial'),
  gather: require('./gather'),
  record: require('./record'),
  
  // Enhanced elements (3)
  speak: require('./speak'),
  ssml: require('./ssml'),
  speakAndWait: require('./speak-and-wait')
};
