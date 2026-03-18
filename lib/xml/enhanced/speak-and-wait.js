/**
 * Speak + Wait Combo - XML3 Enhanced Pattern
 * Common pattern: Speak message + Wait for input
 */
module.exports = function generateSpeakAndWaitXML(options = {}) {
  const {
    text = 'Processing',
    voice = 'WOMAN',
    language = 'en-US',
    waitLength = 3,
    silence = false,
    minSilence = 2000
  } = options;

  const voiceAttr = ` voice="${voice}"`;
  const languageAttr = ` language="${language}"`;
  const waitLengthAttr = ` length="${waitLength}"`;
  const silenceAttr = silence ? ` silence="${silence}"` : '';
  const minSilenceAttr = (silence && minSilence) ? ` minSilence="${minSilence}"` : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak${voiceAttr}${languageAttr}>
    ${text}
  </Speak>
  <Wait${waitLengthAttr}${silenceAttr}${minSilenceAttr}/>
</Response>`;
};
