/**
 * SSML Builder - XML3 Enhanced Helper
 * Build SSML content with prosody, breaks, spell-out
 */
module.exports = function buildSSMLContent(options = {}) {
  const {
    text = 'Hello',
    rate = 'medium',
    breaks = 1,
    spellOut = false,
    voice = 'Polly.Amy'
  } = options;

  let breakTags = '';
  for (let i = 0; i < breaks; i++) {
    breakTags += '<break/>';
  }

  const content = spellOut 
    ? `<say-as interpret-as="spell-out">${text}</say-as>`
    : text;

  return `<prosody rate="${rate}">
    ${content}
    ${breakTags}
  </prosody>`;
};
