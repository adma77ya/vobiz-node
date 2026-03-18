'use strict';

require('dotenv').config();

// ─── Process-level crash guards ───────────────────────────────────────────────
// Prevent a single bad API response from killing the server
process.on('uncaughtException', (err) => {
  console.error('[vobiz] uncaughtException:', err.message || err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[vobiz] unhandledRejection:', reason && (reason.message || reason));
});

const express    = require('express');
const http       = require('http');
const path       = require('path');
const { Client } = require('./lib/rest/client');

// ─── Config ──────────────────────────────────────────────────────────────────
const AUTH_ID      = process.env.VOBIZ_AUTH_ID;
const AUTH_TOKEN   = process.env.VOBIZ_AUTH_TOKEN;
const FROM_NUMBER  = process.env.FROM_NUMBER;
const TO_NUMBER    = process.env.TO_NUMBER;
const PORT         = parseInt(process.env.PORT || '3000', 10);
const WEBHOOK_PORT = parseInt(process.env.WEBHOOK_PORT || '5678', 10);

if (!AUTH_ID || !AUTH_TOKEN) {
  console.error('[vobiz] ERROR: VOBIZ_AUTH_ID and VOBIZ_AUTH_TOKEN must be set in .env');
  process.exit(1);
}

const vobiz = new Client(AUTH_ID, AUTH_TOKEN);

// ─── Webhook XML Templates ──────────────────────────────────────────────────
// Enhanced XML generators based on xml2.txt specifications

// Enhanced Dial element with advanced attributes (xml2.txt)
function generateDialXML(options = {}) {
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
    sendDigits = null
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

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial${actionAttr}${hangupAttr}${timeLimitAttr}${timeoutAttr}${callerIdAttr}${callerNameAttr}${confirmSoundAttr}${confirmKeyAttr}${dialMusicAttr}${callbackUrlAttr}>
    <Number${sendDigitsAttr}>${phoneNumber}</Number>
  </Dial>
</Response>`;
}

// Enhanced Gather element with advanced attributes (xml2.txt)
function generateGatherXML(options = {}) {
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
}

// Enhanced Record element with all xml2.txt attributes
function generateRecordXML(options = {}) {
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
}

// Enhanced Hangup element with schedule attribute (xml2.txt)
function generateHangupXML(options = {}) {
  const {
    reason = null,
    schedule = null,
    prompt = 'Thank you for calling. Goodbye!'
  } = options;

  const reasonAttr = reason ? ` reason="${reason}"` : '';
  const scheduleAttr = schedule ? ` schedule="${schedule}"` : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak voice="WOMAN" language="en-US">
    ${prompt}
  </Speak>
  <Hangup${reasonAttr}${scheduleAttr}/>
</Response>`;
}

// Enhanced DTMF element with async attribute (xml2.txt)
function generateDTMFXML(options = {}) {
  const {
    digits = '1234',
    async = true
  } = options;

  const asyncAttr = ` async="${async}"`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak voice="WOMAN" language="en-US">
    Sending tones: ${digits}
  </Speak>
  <DTMF${asyncAttr}>${digits}</DTMF>
</Response>`;
}

// Play audio file (Play element)
function generatePlayXML(audioUrl, continueUrl = null) {
  const nextElement = continueUrl ? `<Redirect>${continueUrl}</Redirect>` : '';
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Play>${audioUrl}</Play>
  ${nextElement}
</Response>`;
}

// Basic greeting with IVR menu (Speak + Gather)
function generateAnswerXML() {
  return generateGatherXML({
    actionUrl: `${tunnelUrl}/menu-choice`,
    method: 'POST',
    inputType: 'dtmf',
    executionTimeout: 10,
    finishOnKey: '#',
    numDigits: 1,
    prompt: 'Welcome to Vobiz telephony platform. Press 1 for a test message, 2 to record a voicemail, 3 to join conference, or 0 to hangup.'
  });
}

// Conference element with advanced attributes
function generateConferenceXML(options = {}) {
  const {
    conferenceName = 'default-conference',
    actionUrl = null,
    method = 'POST',
    prompt = 'Connecting you to the conference room.'
  } = options;

  const actionAttr = actionUrl ? ` action="${actionUrl}" method="${method}"` : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak voice="WOMAN" language="en-US">
    ${prompt}
  </Speak>
  <Conference${actionAttr}>${conferenceName}</Conference>
</Response>`;
}

// Redirect element (forward to another URL)
function generateRedirectXML(redirectUrl) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Redirect>${redirectUrl}</Redirect>
</Response>`;
}

// PreAnswer element (early media) - per xml2.txt
function generatePreAnswerXML(options = {}) {
  const {
    audioUrl = null,
    prompt = 'Please hold while we process your call.'
  } = options;

  const audioContent = audioUrl 
    ? `<Play>${audioUrl}</Play>`
    : `<Speak voice="WOMAN" language="en-US">${prompt}</Speak>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <PreAnswer/>
  ${audioContent}
</Response>`;
}

// Stream element (WebSocket audio streaming)
function generateStreamXML(options = {}) {
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
}

// Enhanced Speak element with full xml3.txt attributes
function generateSpeakXML(options = {}) {
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
}

// Enhanced Wait element with full xml3.txt attributes
function generateWaitXML(options = {}) {
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
}

// Combo: Speak + Wait (commonly used together)
function generateSpeakAndWaitXML(options = {}) {
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
}

// SSML Helper - Build SSML content for enhanced speech
function buildSSMLContent(options = {}) {
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
}

// Legacy simple answer
const ANSWER_XML = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak voice="WOMAN" language="en-US">
    Hello! You have received a call from the Vobiz platform. This call is being connected now.
  </Speak>
  <Wait length="1"/>
</Response>`;

// ─── In-memory call state store ───────────────────────────────────────────────
// Maps requestUuid → { callUuid, from, to, status, startedAt }
const callStore = new Map();

// ─── SSE clients ──────────────────────────────────────────────────────────────
// Set of active SSE response objects
const sseClients = new Set();

function sseBroadcast(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try { client.write(payload); } catch (_) { sseClients.delete(client); }
  }
}

// ─── Tunnel state ────────────────────────────────────────────────────────────
let tunnelUrl    = null;
let tunnelReady  = false;

// ─── Main API app (PORT 3000) ─────────────────────────────────────────────────
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Serve dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── GET /api/status ── server health + tunnel URL
app.get('/api/status', (req, res) => {
  res.json({
    ok: true,
    tunnelReady,
    tunnelUrl,
    fromNumber: FROM_NUMBER,
    toNumber:   TO_NUMBER,
  });
});

// ── GET /api/events ── Server-Sent Events stream for real-time push
app.get('/api/events', (req, res) => {
  res.set({
    'Content-Type':  'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection':    'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders();

  // Keep-alive ping every 20s
  const ping = setInterval(() => {
    try { res.write(': ping\n\n'); } catch (_) {}
  }, 20000);

  sseClients.add(res);

  req.on('close', () => {
    clearInterval(ping);
    sseClients.delete(res);
  });
});

// ── GET /api/call/by-request/:requestUuid ── resolve requestUuid → callUuid
app.get('/api/call/by-request/:requestUuid', (req, res) => {
  const entry = callStore.get(req.params.requestUuid);
  if (entry && entry.callUuid) {
    return res.json({ ok: true, callUuid: entry.callUuid, status: entry.status });
  }
  res.status(404).json({ ok: false, error: 'not found yet' });
});

// ── POST /api/call ── make an outbound call
app.post('/api/call', async (req, res) => {
  const from      = req.body.from      || FROM_NUMBER;
  const to        = req.body.to        || TO_NUMBER;
  const answerUrl = `${tunnelUrl}/answer`;
  const hangupUrl = `${tunnelUrl}/hangup`;

  if (!tunnelReady || !tunnelUrl) {
    return res.status(503).json({ error: 'Webhook tunnel not ready yet. Please wait a moment.' });
  }
  if (!from || !to) {
    return res.status(400).json({ error: 'from and to numbers are required' });
  }

  try {
    const result = await vobiz.calls.create(from, to, answerUrl, {
      hangupUrl,
      hangupMethod: 'POST',
    });

    // Store in memory so we can correlate requestUuid → callUuid from webhook.
    // Fallback: Vobiz/Plivo often returns the same value for callUuid and requestUuid;
    // when callUuid is missing from the initial response, use requestUuid so the UI
    // can display the UUID immediately instead of showing "–".
    const resolvedCallUuid = result.callUuid || result.requestUuid || null;
    if (result.requestUuid) {
      callStore.set(result.requestUuid, {
        callUuid:  resolvedCallUuid,
        from,
        to,
        status:    'queued',
        startedAt: Date.now(),
      });
    }

    res.json({
      ok:          true,
      requestUuid: result.requestUuid,
      callUuid:    resolvedCallUuid,
      message:     result.message,
      answerUrl,
    });
  } catch (err) {
    const status = (err.response && err.response.status) || 500;
    const msg    = (err.response && JSON.stringify(err.response.data)) || err.message || String(err);
    res.status(status).json({ error: msg });
  }
});

// ── GET /api/call/:uuid ── get CDR for a completed call
app.get('/api/call/:uuid', async (req, res) => {
  try {
    const detail = await vobiz.calls.get(req.params.uuid);
    res.json({ ok: true, call: detail });
  } catch (err) {
    const status = (err.response && err.response.status) || 500;
    const msg    = (err.response && JSON.stringify(err.response.data)) || err.message || String(err);
    res.status(status).json({ error: msg });
  }
});

// ── GET /api/call/:uuid/live ── get live call status, falls back to CDR
app.get('/api/call/:uuid/live', async (req, res) => {
  const uuid = req.params.uuid;
  // First try the live/active call endpoint
  try {
    const detail = await vobiz.calls.getLiveCall(uuid);
    return res.json({ ok: true, live: true, call: detail });
  } catch (_) {}

  // Fall back to CDR (call may have just ended)
  try {
    const detail = await vobiz.calls.get(uuid);
    return res.json({ ok: true, live: false, call: detail });
  } catch (err) {
    const status = (err.response && err.response.status) || 500;
    const msg    = (err.response && JSON.stringify(err.response.data)) || err.message || String(err);
    return res.status(status).json({ error: msg });
  }
});

// ── GET /api/calls ── list recent CDR via the dedicated CDR endpoint
app.get('/api/calls', async (req, res) => {
  try {
    const limit  = parseInt(req.query.limit  || '20', 10);
    const offset = parseInt(req.query.offset || '0',  10);
    const result = await vobiz.cdr.get({ limit, offset });
    // CDR returns { accountId, count, data: { 0: {...}, 1: {...} }, pagination, summary }
    let calls = [];
    if (result && result.data) {
      // data is an object with numeric keys — convert to array
      calls = Object.values(result.data);
    }
    res.json({ ok: true, calls, pagination: result.pagination || null, summary: result.summary || null });
  } catch (err) {
    const status = (err.response && err.response.status) || 500;
    const msg    = (err.response && JSON.stringify(err.response.data)) || err.message || String(err);
    res.status(status).json({ error: msg });
  }
});

// ── POST /api/call/:uuid/hangup ── hang up a live call
app.post('/api/call/:uuid/hangup', async (req, res) => {
  try {
    await vobiz.calls.hangup(req.params.uuid);
    res.json({ ok: true, message: 'Call hung up' });
  } catch (err) {
    const status = (err.response && err.response.status) || 500;
    const msg    = (err.response && JSON.stringify(err.response.data)) || err.message || String(err);
    res.status(status).json({ error: msg });
  }
});

// ── POST /api/call/:uuid/record/start ── start recording
app.post('/api/call/:uuid/record/start', async (req, res) => {
  try {
    const body = req.body || {};
    const result = await vobiz.calls.record(req.params.uuid, {
      fileFormat:  body.fileFormat || 'mp3',
      callbackUrl: `${tunnelUrl}/recording-callback`,
    });
    res.json({ ok: true, recording: result });
  } catch (err) {
    const status = (err.response && err.response.status) || 500;
    const msg    = (err.response && JSON.stringify(err.response.data)) || err.message || String(err);
    res.status(status).json({ error: msg });
  }
});

// ── POST /api/call/:uuid/record/stop ── stop recording
app.post('/api/call/:uuid/record/stop', async (req, res) => {
  try {
    await vobiz.calls.stopRecording(req.params.uuid);
    res.json({ ok: true, message: 'Recording stopped' });
  } catch (err) {
    const status = (err.response && err.response.status) || 500;
    const msg    = (err.response && JSON.stringify(err.response.data)) || err.message || String(err);
    res.status(status).json({ error: msg });
  }
});

// ─── Webhook server (WEBHOOK_PORT 5678) ──────────────────────────────────────
const webhookApp = express();
webhookApp.use(express.json());
webhookApp.use(express.urlencoded({ extended: true }));

// Answer webhook — Vobiz fetches this when the call is answered
webhookApp.all('/answer', (req, res) => {
  const body = req.body || {};
  const callUuid    = body.CallUUID    || body.call_uuid    || null;
  const requestUuid = body.RequestUUID || body.request_uuid || null;
  console.log('[webhook] /answer — callUuid:', callUuid, '| requestUuid:', requestUuid);

  // Update the in-memory store so the API server can resolve requestUuid → callUuid
  if (requestUuid) {
    const existing = callStore.get(requestUuid) || {};
    callStore.set(requestUuid, { ...existing, callUuid, status: 'in-progress' });
  }

  // Push to all connected browsers immediately
  sseBroadcast('call.answered', { callUuid, requestUuid, status: 'in-progress' });

  // Return XML with Gather for interactive menu (demonstrating multiple elements)
  res.set('Content-Type', 'text/xml');
  res.send(generateAnswerXML());
});

// Menu choice handler — processes DTMF input from Gather element
webhookApp.post('/menu-choice', (req, res) => {
  const digits = (req.body && req.body.Digits) || '';
  const callUuid = (req.body && req.body.CallUUID) || '';
  
  console.log('[webhook] /menu-choice — digits:', digits, '| callUuid:', callUuid);

  let xml;
  
  switch (digits) {
    case '1':
      // Play: Play an audio file
      xml = generatePlayXML(
        'https://raw.githubusercontent.com/twilio/media-bundles/main/test-media/audie-intro.wav',
        `${tunnelUrl}/answer`
      );
      break;
    case '2':
      // Record: Record voicemail with enhanced attributes
      xml = generateRecordXML({
        actionUrl: `${tunnelUrl}/voicemail-complete`,
        method: 'POST',
        fileFormat: 'mp3',
        timeout: 60,
        maxLength: 120,
        playBeep: true,
        finishOnKey: '#',
        recordSession: false
      });
      break;
    case '3':
      // Conference: Join conference room
      xml = generateConferenceXML({
        conferenceName: 'vobiz-demo-' + Date.now(),
        actionUrl: `${tunnelUrl}/conference-ended`,
        method: 'POST'
      });
      break;
    case '0':
      // Hangup: End call
      xml = generateHangupXML({
        reason: null,
        prompt: 'Thank you for using Vobiz. Goodbye!'
      });
      break;
    default:
      // No input or invalid - redirect back to menu
      xml = generateRedirectXML(`${tunnelUrl}/answer`);
  }

  res.set('Content-Type', 'text/xml');
  res.send(xml);
});

// Dial endpoint — demonstrates Dial element with transfer and enhanced attributes
webhookApp.post('/dial-transfer', (req, res) => {
  const targetNumber = req.body?.targetNumber || '+14155551234';
  const callerId = req.body?.callerId || null;
  const callerName = req.body?.callerName || null;
  const timeout = req.body?.timeout || 30;
  
  console.log('[webhook] /dial-transfer — target:', targetNumber, '| callerId:', callerId);

  // Dial element with full attribute support
  const xml = generateDialXML({
    phoneNumber: targetNumber,
    actionUrl: `${tunnelUrl}/dial-complete`,
    method: 'POST',
    hangupOnStar: false,
    timeLimit: 14400,
    timeout: timeout,
    callerId: callerId,
    callerName: callerName,
    dialMusic: 'real',
    callbackUrl: `${tunnelUrl}/dial-callback`,
    callbackMethod: 'POST',
    redirect: true
  });
  
  res.set('Content-Type', 'text/xml');
  res.send(xml);
});

// Dial completion callback
webhookApp.post('/dial-complete', (req, res) => {
  const dialCallStatus = (req.body && req.body.DialCallStatus) || 'unknown';
  const callUuid = (req.body && req.body.CallUUID) || '';
  
  console.log('[webhook] /dial-complete — status:', dialCallStatus, '| callUuid:', callUuid);

  let xml;
  if (dialCallStatus === 'completed') {
    xml = generateHangupXML();
  } else {
    xml = generateRedirectXML(`${tunnelUrl}/answer`);
  }

  res.set('Content-Type', 'text/xml');
  res.send(xml);
});

// Voicemail completion callback
webhookApp.post('/voicemail-complete', (req, res) => {
  const recordingUrl = (req.body && req.body.RecordingUrl) || null;
  const callUuid = (req.body && req.body.CallUUID) || '';
  
  console.log('[webhook] /voicemail-complete — recording:', recordingUrl, '| callUuid:', callUuid);

  // Thank user and hangup
  const xml = generateHangupXML();
  
  res.set('Content-Type', 'text/xml');
  res.send(xml);
});

// Conference ended callback
webhookApp.post('/conference-ended', (req, res) => {
  const conferenceStatus = (req.body && req.body.ConferenceStatus) || 'unknown';
  const callUuid = (req.body && req.body.CallUUID) || '';
  
  console.log('[webhook] /conference-ended — status:', conferenceStatus, '| callUuid:', callUuid);

  const xml = generateHangupXML();
  
  res.set('Content-Type', 'text/xml');
  res.send(xml);
});

// Stream status callback — handles WebSocket stream lifecycle events
webhookApp.post('/stream-status', (req, res) => {
  const event = (req.body && req.body.Event) || '';
  const streamId = (req.body && req.body.StreamID) || '';
  
  console.log('[webhook] /stream-status — event:', event, '| streamId:', streamId);

  // Just log the event and acknowledge
  res.status(200).send('OK');
});

// Dial callback handler — receives dial action events (per xml2.txt callbackUrl)
webhookApp.post('/dial-callback', (req, res) => {
  const dialAction = (req.body && req.body.DialAction) || 'unknown';
  const bLegStatus = (req.body && req.body.DialBLegStatus) || 'unknown';
  const aLegUUID = (req.body && req.body.DialALegUUID) || '';
  const bLegUUID = (req.body && req.body.DialBLegUUID) || '';
  
  console.log('[webhook] /dial-callback — action:', dialAction, '| bLegStatus:', bLegStatus, '| aLeg:', aLegUUID, '| bLeg:', bLegUUID);

  // Log the event and acknowledge (no XML response for callback)
  res.status(200).json({ ok: true, dialAction: dialAction });
});

// Gather response handler — receives speech or DTMF input
webhookApp.post('/gather-response', (req, res) => {
  const inputType = (req.body && req.body.InputType) || 'unknown';
  const digits = (req.body && req.body.Digits) || '';
  const speech = (req.body && req.body.Speech) || '';
  const confidence = (req.body && req.body.SpeechConfidenceScore) || '0';
  const callUuid = (req.body && req.body.CallUUID) || '';
  
  console.log('[webhook] /gather-response — inputType:', inputType, '| digits:', digits, '| speech:', speech, '| confidence:', confidence);

  // Route based on input
  let xml;
  if (inputType === 'dtmf') {
    // Handle DTMF digits - delegate to menu-choice
    xml = generateRedirectXML(`${tunnelUrl}/menu-choice?Digits=${digits}`);
  } else if (inputType === 'speech') {
    // Handle speech input - could integrate with NLP/chatbot
    console.log('[webhook] /gather-response — processing speech:', speech);
    xml = generateHangupXML({ prompt: 'Thank you. Your input has been recorded.' });
  } else {
    xml = generateRedirectXML(`${tunnelUrl}/answer`);
  }

  res.set('Content-Type', 'text/xml');
  res.send(xml);
});

// Test endpoint to trigger Dial with advanced attributes
webhookApp.get('/test/dial', (req, res) => {
  const targetNumber = req.query.number || '+14155551234';
  const timeout = parseInt(req.query.timeout || '30', 10);
  const hangupOnStar = req.query.hangupOnStar === 'true';
  
  const xml = generateDialXML({
    phoneNumber: targetNumber,
    actionUrl: `${tunnelUrl}/dial-complete`,
    method: 'POST',
    hangupOnStar: hangupOnStar,
    timeout: timeout,
    dialMusic: 'real',
    redirect: true
  });
  res.set('Content-Type', 'text/xml');
  res.send(xml);
});

// Test endpoint to trigger Play
webhookApp.get('/test/play', (req, res) => {
  const audioUrl = req.query.url || 'https://raw.githubusercontent.com/twilio/media-bundles/main/test-media/audie-intro.wav';
  const xml = generatePlayXML(audioUrl);
  res.set('Content-Type', 'text/xml');
  res.send(xml);
});

// Test endpoint to trigger Record with advanced attributes
webhookApp.get('/test/record', (req, res) => {
  const timeout = parseInt(req.query.timeout || '60', 10);
  const maxLength = parseInt(req.query.maxLength || '120', 10);
  const fileFormat = req.query.format || 'mp3';
  
  const xml = generateRecordXML({
    actionUrl: `${tunnelUrl}/voicemail-complete`,
    method: 'POST',
    fileFormat: fileFormat,
    timeout: timeout,
    maxLength: maxLength,
    playBeep: true,
    finishOnKey: '#'
  });
  res.set('Content-Type', 'text/xml');
  res.send(xml);
});

// Test endpoint to trigger Conference with advanced attributes
webhookApp.get('/test/conference', (req, res) => {
  const confName = req.query.name || ('test-conference-' + Date.now());
  const xml = generateConferenceXML({
    conferenceName: confName,
    actionUrl: `${tunnelUrl}/conference-ended`,
    method: 'POST'
  });
  res.set('Content-Type', 'text/xml');
  res.send(xml);
});

// Test endpoint to trigger Hangup with optional reason
webhookApp.get('/test/hangup', (req, res) => {
  const reason = req.query.reason || null;
  const schedule = parseInt(req.query.schedule || '0', 10) || null;
  
  const xml = generateHangupXML({
    reason: reason,
    schedule: schedule,
    prompt: 'Thank you for calling. Goodbye!'
  });
  res.set('Content-Type', 'text/xml');
  res.send(xml);
});

// Test endpoint to trigger DTMF element
webhookApp.get('/test/dtmf', (req, res) => {
  const digits = req.query.digits || '1234';
  const async = req.query.async !== 'false';
  
  const xml = generateDTMFXML({
    digits: digits,
    async: async
  });
  res.set('Content-Type', 'text/xml');
  res.send(xml);
});

// Test endpoint to trigger Gather element
webhookApp.get('/test/gather', (req, res) => {
  const inputType = req.query.inputType || 'dtmf';
  const numDigits = parseInt(req.query.numDigits || '1', 10);
  const timeout = parseInt(req.query.timeout || '15', 10);
  
  const xml = generateGatherXML({
    actionUrl: `${tunnelUrl}/gather-response`,
    method: 'POST',
    inputType: inputType,
    executionTimeout: timeout,
    numDigits: numDigits,
    finishOnKey: '#',
    language: 'en-US',
    prompt: 'Please enter your selection or speak your choice.'
  });
  res.set('Content-Type', 'text/xml');
  res.send(xml);
});

// Test endpoint to trigger PreAnswer element
webhookApp.get('/test/preanswer', (req, res) => {
  const audioUrl = req.query.url || null;
  
  const xml = generatePreAnswerXML({
    audioUrl: audioUrl,
    prompt: 'Thank you for calling. Your call will be answered shortly.'
  });
  res.set('Content-Type', 'text/xml');
  res.send(xml);
});

// Test endpoint to trigger Stream element
webhookApp.get('/test/stream', (req, res) => {
  const streamUrl = req.query.streamUrl || 'wss://stream.example.com/audio';
  const bidirectional = req.query.bidirectional !== 'false';
  
  const xml = generateStreamXML({
    streamUrl: streamUrl,
    bidirectional: bidirectional,
    streamTimeout: 600,
    statusCallbackUrl: `${tunnelUrl}/stream-status`
  });
  res.set('Content-Type', 'text/xml');
  res.send(xml);
});

// Test endpoint to trigger Speak element with advanced attributes (xml3)
webhookApp.get('/test/speak', (req, res) => {
  const text = req.query.text || 'Welcome to Vobiz';
  const voice = req.query.voice || 'WOMAN';
  const language = req.query.language || 'en-US';
  const loop = parseInt(req.query.loop || '1', 10);
  
  const xml = generateSpeakXML({
    text: text,
    voice: voice,
    language: language,
    loop: loop
  });
  res.set('Content-Type', 'text/xml');
  res.send(xml);
});

// Test endpoint to trigger Speak with SSML markup
webhookApp.get('/test/speak-ssml', (req, res) => {
  const rate = req.query.rate || 'medium';
  const voice = req.query.voice || 'Polly.Amy';
  const text = req.query.text || 'Hello and welcome';
  
  const ssmlContent = buildSSMLContent({
    text: text,
    rate: rate,
    breaks: 2,
    spellOut: false
  });
  
  const xml = generateSpeakXML({
    text: '',
    voice: voice,
    language: 'en-US',
    useSSML: true,
    ssmlContent: ssmlContent
  });
  res.set('Content-Type', 'text/xml');
  res.send(xml);
});

// Test endpoint to trigger Wait element with advanced attributes (xml3)
webhookApp.get('/test/wait', (req, res) => {
  const length = parseInt(req.query.length || '3', 10);
  const silence = req.query.silence === 'true';
  const minSilence = parseInt(req.query.minSilence || '2000', 10);
  const beep = req.query.beep === 'true';
  
  const xml = generateWaitXML({
    length: length,
    silence: silence,
    minSilence: minSilence,
    beep: beep
  });
  res.set('Content-Type', 'text/xml');
  res.send(xml);
});

// Test endpoint to trigger Wait with voicemail detection
webhookApp.get('/test/wait-voicemail', (req, res) => {
  const length = parseInt(req.query.length || '10', 10);
  
  const xml = generateWaitXML({
    length: length,
    silence: true,
    minSilence: 3000,
    beep: false
  });
  res.set('Content-Type', 'text/xml');
  res.send(xml);
});

// Test endpoint to trigger Speak + Wait combination
webhookApp.get('/test/speak-wait', (req, res) => {
  const text = req.query.text || 'Please wait while we process your request';
  const waitLength = parseInt(req.query.waitLength || '5', 10);
  const voice = req.query.voice || 'WOMAN';
  const language = req.query.language || 'en-US';
  
  const xml = generateSpeakAndWaitXML({
    text: text,
    voice: voice,
    language: language,
    waitLength: waitLength,
    silence: false
  });
  res.set('Content-Type', 'text/xml');
  res.send(xml);
});

// Test endpoint to trigger Redirect
webhookApp.get('/test/redirect', (req, res) => {
  const redirectUrl = req.query.url || `${tunnelUrl}/answer`;
  const xml = generateRedirectXML(redirectUrl);
  res.set('Content-Type', 'text/xml');
  res.send(xml);
});

// Hangup webhook — Vobiz posts here when call ends
webhookApp.post('/hangup', (req, res) => {
  const body        = req.body || {};
  const callUuid    = body.CallUUID      || body.call_uuid      || null;
  const requestUuid = body.RequestUUID   || body.request_uuid   || null;
  const status      = body.CallStatus    || body.call_status    || 'completed';
  const hangupCause = body.HangupCause   || body.hangup_cause   || null;
  const duration    = body.Duration      || body.duration       || null;
  const from        = body.From          || body.from           || null;
  const to          = body.To            || body.to             || null;
  console.log('[webhook] /hangup — callUuid:', callUuid, '| requestUuid:', requestUuid, '| status:', status, '| cause:', hangupCause);

  if (requestUuid) {
    const existing = callStore.get(requestUuid) || {};
    callStore.set(requestUuid, { ...existing, callUuid: callUuid || existing.callUuid, status, hangupCause, duration });
  }

  // Push call-ended event to all connected browsers immediately
  sseBroadcast('call.ended', { callUuid, requestUuid, status, hangupCause, duration, from, to });

  res.sendStatus(200);
});

// Recording callback
webhookApp.post('/recording-callback', (req, res) => {
  console.log('[webhook] /recording-callback:', JSON.stringify(req.body || {}));
  res.sendStatus(200);
});

// ─── Startup ──────────────────────────────────────────────────────────────────
async function start() {
  // 1. Start webhook server
  await new Promise((resolve, reject) => {
    http.createServer(webhookApp).listen(WEBHOOK_PORT, () => {
      console.log(`[vobiz] Webhook server listening on http://localhost:${WEBHOOK_PORT}`);
      resolve();
    }).on('error', reject);
  });

  // 2. Open localtunnel
  try {
    const localtunnel = require('localtunnel');
    console.log('[vobiz] Opening localtunnel...');
    const tunnel = await localtunnel({ port: WEBHOOK_PORT });
    tunnelUrl   = tunnel.url;
    tunnelReady = true;
    console.log(`[vobiz] Tunnel ready: ${tunnelUrl}`);

    tunnel.on('close', () => {
      tunnelReady = false;
      console.warn('[vobiz] Tunnel closed.');
    });
    tunnel.on('error', (err) => {
      console.error('[vobiz] Tunnel error:', err.message);
    });
  } catch (err) {
    console.error('[vobiz] Could not open localtunnel:', err.message);
    console.warn('[vobiz] Continuing without public tunnel. Outbound calls will fail until tunnel is up.');
  }

  // 3. Start main API + UI server
  app.listen(PORT, () => {
    console.log(`[vobiz] Dashboard ready at http://localhost:${PORT}`);
    console.log(`[vobiz] From: ${FROM_NUMBER}  |  To: ${TO_NUMBER}`);
  });
}

start().catch(err => {
  console.error('[vobiz] Fatal startup error:', err);
  process.exit(1);
});
