/**
 * Stream - XML1 Basic Element
 * WebSocket audio streaming
 */
module.exports = function generateStreamXML(options = {}) {
  const {
    streamUrl = 'wss://stream.example.com/audio',
    bidirectional = true,
    streamTimeout = 600,
    statusCallbackUrl = null
  } = options;

  const bidirectionalAttr = ` bidirectional="${bidirectional}"`;
  const streamTimeoutAttr = ` streamTimeout="${streamTimeout}"`;
  const statusCallbackAttr = statusCallbackUrl ? ` statusCallbackUrl="${statusCallbackUrl}"` : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Stream${bidirectionalAttr}${streamTimeoutAttr}${statusCallbackAttr}>
    ${streamUrl}
  </Stream>
</Response>`;
};
