/**
 * XML Generators - Main Index
 * Professional SDK structure for Vobiz XML elements
 * 
 * Usage:
 *   const xml = require('./lib/xml');
 *   
 *   // Basic elements
 *   xml.basic.play(url);
 *   xml.basic.hangup();
 *   
 *   // Advanced elements
 *   xml.advanced.dial({ phoneNumber: '+1234567890' });
 *   xml.advanced.gather({ inputType: 'dtmf' });
 *   
 *   // Enhanced elements
 *   xml.enhanced.speak({ text: 'Hello', language: 'en-US' });
 */

module.exports = {
  basic: require('./basic'),
  advanced: require('./advanced'),
  enhanced: require('./enhanced')
};
