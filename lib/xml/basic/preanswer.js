/**
 * PreAnswer - XML1 Basic Element
 * Early media support before call is answered
 */
module.exports = function generatePreAnswerXML(options = {}) {
  const {
    audioUrl = null,
    prompt = 'Please hold while we process your call.'
  } = options;

  const audioContent = audioUrl 
    ? `<Play>${audioUrl}</Play>`
    : `<Speak voice="WOMAN" language="en-US">${prompt}</Speak>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <PreAnswer/>
  ${audioContent}
</Response>`;
};
