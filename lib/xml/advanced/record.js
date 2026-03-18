/**
 * Record - XML2 Advanced Element
 * Record with transcription, multiple formats, auto-transcription
 */
module.exports = function generateRecordXML(options = {}) {
  const {
    actionUrl = null,
    method = 'POST',
    fileFormat = 'mp3',
    redirect = false,
    timeout = 60,
    maxLength = 60,
    playBeep = true,
    finishOnKey = '#',
    recordSession = false,
    startOnDialAnswer = false,
    transcriptionType = 'auto',
    transcriptionUrl = null,
    transcriptionMethod = 'POST',
    callbackUrl = null,
    callbackMethod = 'POST',
    prompt = 'Please leave your message after the beep. Press hash when done.'
  } = options;

  const actionAttr = actionUrl ? ` action="${actionUrl}" method="${method}" redirect="${redirect}"` : '';
  const fileFormatAttr = fileFormat ? ` fileFormat="${fileFormat}"` : '';
  const timeoutAttr = timeout ? ` timeout="${timeout}"` : '';
  const maxLengthAttr = maxLength ? ` maxLength="${maxLength}"` : '';
  const playBeepAttr = ` playBeep="${playBeep}"`;
  const finishOnKeyAttr = finishOnKey ? ` finishOnKey="${finishOnKey}"` : '';
  const recordSessionAttr = ` recordSession="${recordSession}"`;
  const startOnDialAnswerAttr = ` startOnDialAnswer="${startOnDialAnswer}"`;
  const transcriptionTypeAttr = transcriptionType ? ` transcriptionType="${transcriptionType}"` : '';
  const transcriptionUrlAttr = transcriptionUrl ? ` transcriptionUrl="${transcriptionUrl}" transcriptionMethod="${transcriptionMethod}"` : '';
  const callbackUrlAttr = callbackUrl ? ` callbackUrl="${callbackUrl}" callbackMethod="${callbackMethod}"` : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak voice="WOMAN" language="en-US">
    ${prompt}
  </Speak>
  <Record${actionAttr}${fileFormatAttr}${timeoutAttr}${maxLengthAttr}${playBeepAttr}${finishOnKeyAttr}${recordSessionAttr}${startOnDialAnswerAttr}${transcriptionTypeAttr}${transcriptionUrlAttr}${callbackUrlAttr}/>
</Response>`;
};
