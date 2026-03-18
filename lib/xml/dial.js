/**
 * Dial - XML2 Advanced Element
 * Enhanced call transfer with confirmations, music, callbacks
 */
module.exports = function generateDialXML(options = {}) {
  const {
    phoneNumber = '+14155551234',
    actionUrl = null,
    method = 'POST',
    hangupOnStar = false,
    timeLimit = 14400,
    timeout = null,
    callerId = null,
    callerName = null,
    confirmSound = null,
    confirmKey = null,
    dialMusic = 'real',
    callbackUrl = null,
    callbackMethod = 'POST',
    redirect = true,
    sendDigits = null,
    prompt = null,
    promptVoice = 'WOMAN',
    promptLanguage = 'en-US'
  } = options;

  const actionAttr = actionUrl ? ` action="${actionUrl}" method="${method}" redirect="${redirect}"` : '';
  const hangupAttr = hangupOnStar ? ` hangupOnStar="${hangupOnStar}"` : '';
  const timeLimitAttr = timeLimit ? ` timeLimit="${timeLimit}"` : '';
  const timeoutAttr = timeout ? ` timeout="${timeout}"` : '';
  const callerIdAttr = callerId ? ` callerId="${callerId}"` : '';
  const callerNameAttr = callerName ? ` callerName="${callerName}"` : '';
  const confirmSoundAttr = confirmSound ? ` confirmSound="${confirmSound}"` : '';
  const confirmKeyAttr = confirmKey ? ` confirmKey="${confirmKey}"` : '';
  const dialMusicAttr = dialMusic ? ` dialMusic="${dialMusic}"` : '';
  const callbackUrlAttr = callbackUrl ? ` callbackUrl="${callbackUrl}" callbackMethod="${callbackMethod}"` : '';
  const sendDigitsAttr = sendDigits ? ` sendDigits="${sendDigits}"` : '';

  const speakTag = prompt ? `\n  <Speak voice="${promptVoice}" language="${promptLanguage}">\n    ${prompt}\n  </Speak>` : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>${speakTag}
  <Dial${actionAttr}${hangupAttr}${timeLimitAttr}${timeoutAttr}${callerIdAttr}${callerNameAttr}${confirmSoundAttr}${confirmKeyAttr}${dialMusicAttr}${callbackUrlAttr}>
    <Number${sendDigitsAttr}>${phoneNumber}</Number>
  </Dial>
</Response>`;
};
