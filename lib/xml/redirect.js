/**
 * Redirect - XML1 Basic Element
 * Forward to another URL
 */
module.exports = function generateRedirectXML(redirectUrl) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Redirect>${redirectUrl}</Redirect>
</Response>`;
};
