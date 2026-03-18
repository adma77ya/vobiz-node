/**
 * Hangup - XML1 Basic Element
 * End the call
 */
module.exports = function generateHangupXML(options = {}) {
  const {
    reason = null,
    schedule = null,
    prompt = 'Thank you for calling. Goodbye!'
  } = options;

  const reasonAttr = reason ? ` reason="${reason}"` : '';
  const scheduleAttr = schedule ? ` schedule="${schedule}"` : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak voice="WOMAN" language="en-US">
    ${prompt}
  </Speak>
  <Hangup${reasonAttr}${scheduleAttr}/>
</Response>`;
};
