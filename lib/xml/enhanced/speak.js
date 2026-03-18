/**
 * Speak - XML3 Enhanced Element
 * Text-to-speech with 16 languages, 2 voices, SSML, loop control
 */
module.exports = function generateSpeakXML(options = {}) {
  const {
    text = 'Hello',
    voice = 'WOMAN',
    language = 'en-US',
    loop = 1,
    useSSML = false,
    ssmlContent = null
  } = options;

  // Supported voices and languages per xml3.txt
  const supportedLanguages = [
    'da-DK', 'nl-NL', 'en-AU', 'en-GB', 'en-US', 'fr-FR', 'fr-CA',
    'de-DE', 'it-IT', 'pl-PL', 'pt-PT', 'pt-BR', 'ru-RU', 'es-ES',
    'es-US', 'sv-SE'
  ];

  const voiceAttr = ` voice="${voice}"`;
  const languageAttr = ` language="${language}"`;
  const loopAttr = loop && loop > 0 ? ` loop="${loop}"` : (loop === 0 ? ` loop="0"` : '');

  const content = useSSML && ssmlContent 
    ? ssmlContent 
    : text;

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak${voiceAttr}${languageAttr}${loopAttr}>
    ${content}
  </Speak>
</Response>`;
};
