/**
 * Play - XML1 Basic Element
 * Play audio file during a call
 */
module.exports = function generatePlayXML(audioUrl, continueUrl = null) {
  const nextElement = continueUrl ? `<Redirect>${continueUrl}</Redirect>` : '';
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Play>${audioUrl}</Play>
  ${nextElement}
</Response>`;
};
