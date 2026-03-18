/**
 * Conference - XML1 Basic Element
 * Multi-party conference bridge
 */
module.exports = function generateConferenceXML(options = {}) {
  const {
    conferenceName = 'default-conference',
    actionUrl = null,
    method = 'POST',
    prompt = 'Connecting you to the conference room.'
  } = options;

  const actionAttr = actionUrl ? ` action="${actionUrl}" method="${method}"` : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak voice="WOMAN" language="en-US">
    ${prompt}
  </Speak>
  <Conference${actionAttr}>${conferenceName}</Conference>
</Response>`;
};
