/**
 * Wait - XML1 Basic Element
 * Pause execution for specified seconds
 */
module.exports = function generateWaitXML(options = {}) {
  const {
    length = 1,
    silence = false,
    minSilence = 2000,
    beep = false,
    prompt = null
  } = options;

  const lengthAttr = ` length="${length}"`;
  const silenceAttr = silence ? ` silence="${silence}"` : '';
  const minSilenceAttr = (silence && minSilence) ? ` minSilence="${minSilence}"` : '';
  const beepAttr = beep ? ` beep="${beep}"` : '';

  const prePrompt = prompt ? `<Speak voice="WOMAN" language="en-US">${prompt}</Speak>` : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  ${prePrompt}
  <Wait${lengthAttr}${silenceAttr}${minSilenceAttr}${beepAttr}/>
</Response>`;
};
