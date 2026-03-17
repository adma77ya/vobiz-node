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

// ─── Webhook XML ─────────────────────────────────────────────────────────────
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

    // Store in memory so we can correlate requestUuid → callUuid from webhook
    if (result.requestUuid) {
      callStore.set(result.requestUuid, {
        callUuid:  result.callUuid || null,
        from,
        to,
        status:    'queued',
        startedAt: Date.now(),
      });
    }

    res.json({
      ok:          true,
      requestUuid: result.requestUuid,
      callUuid:    result.callUuid,
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
    const result = await vobiz.calls.record(req.params.uuid, {
      fileFormat:  req.body.fileFormat  || 'mp3',
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

  res.set('Content-Type', 'text/xml');
  res.send(ANSWER_XML);
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

// Hangup webhook — Vobiz posts here when call ends
webhookApp.post('/hangup', (req, res) => {
  const body = req.body || {};
  const callUuid    = body.CallUUID    || body.call_uuid    || null;
  const requestUuid = body.RequestUUID || body.request_uuid || null;
  const status      = body.CallStatus  || body.call_status  || 'completed';
  console.log('[webhook] /hangup — callUuid:', callUuid, '| requestUuid:', requestUuid, '| status:', status);

  if (requestUuid) {
    const existing = callStore.get(requestUuid) || {};
    callStore.set(requestUuid, { ...existing, callUuid: callUuid || existing.callUuid, status });
  }
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
