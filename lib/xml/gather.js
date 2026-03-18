/**
 * Gather - XML2 Advanced Element
 * Collect DTMF/speech input with advanced attributes
 */
module.exports = function generateGatherXML(options = {}) {
  const {
    actionUrl = null,
    method = 'POST',
    inputType = 'dtmf',
    executionTimeout = 15,
    digitEndTimeout = 'auto',
    speechEndTimeout = 'auto',
    finishOnKey = '#',
    numDigits = 1,
    speechModel = 'default',
    language = 'en-US',
    interimSpeechResultsCallback = null,
    log = true,
    redirect = true,
    profanityFilter = false,
    prompt = 'Please press a digit or speak your input.'
  } = options;

  const actionAttr = actionUrl ? ` action="${actionUrl}" method="${method}"` : '';
  const inputTypeAttr = inputType ? ` inputType="${inputType}"` : '';
  const executionTimeoutAttr = executionTimeout ? ` executionTimeout="${executionTimeout}"` : '';
  const digitEndTimeoutAttr = digitEndTimeout ? ` digitEndTimeout="${digitEndTimeout}"` : '';
  const speechEndTimeoutAttr = speechEndTimeout ? ` speechEndTimeout="${speechEndTimeout}"` : '';
  const finishOnKeyAttr = finishOnKey !== undefined ? ` finishOnKey="${finishOnKey}"` : '';
  const numDigitsAttr = numDigits ? ` numDigits="${numDigits}"` : '';
  const speechModelAttr = speechModel ? ` speechModel="${speechModel}"` : '';
  const languageAttr = language ? ` language="${language}"` : '';
  const logAttr = ` log="${log}"`;
  const redirectAttr = ` redirect="${redirect}"`;
  const profanityFilterAttr = ` profanityFilter="${profanityFilter}"`;
  const interimCallbackAttr = interimSpeechResultsCallback ? ` interimSpeechResultsCallback="${interimSpeechResultsCallback}"` : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather${actionAttr}${inputTypeAttr}${executionTimeoutAttr}${digitEndTimeoutAttr}${speechEndTimeoutAttr}${finishOnKeyAttr}${numDigitsAttr}${speechModelAttr}${languageAttr}${logAttr}${redirectAttr}${profanityFilterAttr}${interimCallbackAttr}>
    <Speak voice="WOMAN" language="en-US">
      ${prompt}
    </Speak>
  </Gather>
</Response>`;
};
