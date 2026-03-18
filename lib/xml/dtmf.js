/**
 * DTMF - XML1 Basic Element
 * Send DTMF tones during call
 */
module.exports = function generateDTMFXML(options = {}) {
  const {
    digits = '1234',
    async = true
  } = options;

  const asyncAttr = ` async="${async}"`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak voice="WOMAN" language="en-US">
    Sending tones: ${digits}
  </Speak>
  <DTMF${asyncAttr}>${digits}</DTMF>
</Response>`;
};
