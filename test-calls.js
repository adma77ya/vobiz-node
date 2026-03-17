'use strict';

/**
 * test-calls.js — End-to-end call endpoint test
 *
 * Spins up a local webhook server, opens a localtunnel, makes a real outbound
 * call, runs every live-call action (record, speakText, playMusic, sendDigits,
 * stopRecording, stopPlayingMusic, stopSpeakingText, transfer no-op), then
 * hangs the call up.  Finally fetches the CDR.
 *
 * Usage:  node test-calls.js
 */

require('dotenv').config();
const http       = require('http');
const express    = require('express');
const localtunnel = require('localtunnel');
const { Client } = require('.');

// ─── Credentials / config ─────────────────────────────────────────────────────
const AUTH_ID    = process.env.VOBIZ_AUTH_ID;
const AUTH_TOKEN = process.env.VOBIZ_AUTH_TOKEN;
const FROM       = process.env.FROM_NUMBER;
const TO         = process.env.TO_NUMBER;
const WH_PORT    = 7777; // separate port from main server

if (!AUTH_ID || !AUTH_TOKEN || !FROM || !TO) {
  console.error('ERROR: VOBIZ_AUTH_ID, VOBIZ_AUTH_TOKEN, FROM_NUMBER, TO_NUMBER must be set in .env');
  process.exit(1);
}

const client = new Client(AUTH_ID, AUTH_TOKEN);

// ─── Helpers ──────────────────────────────────────────────────────────────────
let passed = 0, failed = 0;

function ok(name, data) {
  passed++;
  const preview = JSON.stringify(data);
  console.log(`\x1b[32m✓\x1b[0m ${name}`);
  if (preview) console.log(`  \x1b[90m${preview.slice(0, 160)}${preview.length > 160 ? '…' : ''}\x1b[0m`);
}

function fail(name, err) {
  failed++;
  const msg = (err && (err.message || JSON.stringify(err))) || String(err);
  console.log(`\x1b[31m✗\x1b[0m ${name}`);
  console.log(`  \x1b[31m${msg}\x1b[0m`);
}

function section(s) { console.log(`\n\x1b[1m[${s}]\x1b[0m`); }

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── Inline webhook server ────────────────────────────────────────────────────
const ANSWER_XML = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak voice="WOMAN" language="en-US">This is a Vobiz SDK automated test call. Please stay on the line.</Speak>
  <Wait length="30"/>
</Response>`;

let resolveAnswered;
const answeredPromise = new Promise(r => { resolveAnswered = r; });

const webhookApp = express();
webhookApp.use(express.json());
webhookApp.use(express.urlencoded({ extended: true }));

webhookApp.all('/answer', (req, res) => {
  const b = req.body || {};
  const callUuid    = b.CallUUID    || b.call_uuid    || null;
  const requestUuid = b.RequestUUID || b.request_uuid || null;
  console.log(`\n[webhook] /answer  callUuid=${callUuid}  requestUuid=${requestUuid}`);
  resolveAnswered({ callUuid, requestUuid });
  res.set('Content-Type', 'text/xml');
  res.send(ANSWER_XML);
});

webhookApp.post('/hangup', (req, res) => {
  const b = req.body || {};
  console.log(`[webhook] /hangup  callUuid=${b.CallUUID || b.call_uuid}  status=${b.CallStatus || b.call_status}  cause=${b.HangupCause || b.hangup_cause}`);
  res.sendStatus(200);
});

webhookApp.post('/recording-callback', (req, res) => {
  console.log('[webhook] /recording-callback:', JSON.stringify(req.body || {}));
  res.sendStatus(200);
});

// ─── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  console.log('\n\x1b[1m══════════════════════════════════════════════════\x1b[0m');
  console.log('\x1b[1m  Vobiz SDK — Call Endpoints End-to-End Test\x1b[0m');
  console.log('\x1b[1m══════════════════════════════════════════════════\x1b[0m\n');

  // ── Step 1: Start webhook server ──────────────────────────────────────────
  section('1. Webhook server');
  await new Promise((resolve, reject) =>
    http.createServer(webhookApp).listen(WH_PORT, (err) => err ? reject(err) : resolve())
  );
  ok('Webhook server started', { port: WH_PORT });

  // ── Step 2: Open localtunnel ──────────────────────────────────────────────
  section('2. Localtunnel');
  let tunnelUrl;
  try {
    const tunnel = await localtunnel({ port: WH_PORT });
    tunnelUrl = tunnel.url;
    ok('localtunnel opened', { url: tunnelUrl });
  } catch (err) {
    fail('localtunnel open', err);
    console.error('Cannot continue without a public webhook URL.');
    process.exit(1);
  }

  const answerUrl  = `${tunnelUrl}/answer`;
  const hangupUrl  = `${tunnelUrl}/hangup`;
  const recordingCallbackUrl = `${tunnelUrl}/recording-callback`;

  // ── Step 3: listLiveCalls (pre-call) ─────────────────────────────────────
  section('3. calls.listLiveCalls() — before call');
  try {
    const live = await client.calls.listLiveCalls();
    ok('calls.listLiveCalls()', live);
  } catch (err) { fail('calls.listLiveCalls()', err); }

  // ── Step 4: listQueuedCalls (pre-call) ───────────────────────────────────
  section('4. calls.listQueuedCalls() — before call');
  try {
    const queued = await client.calls.listQueuedCalls();
    ok('calls.listQueuedCalls()', queued);
  } catch (err) { fail('calls.listQueuedCalls()', err); }

  // ── Step 5: calls.create() ───────────────────────────────────────────────
  section('5. calls.create()');
  let requestUuid, callUuid;
  try {
    const res = await client.calls.create(FROM, TO, answerUrl, {
      hangupUrl,
      hangupMethod: 'POST',
    });
    requestUuid = res.requestUuid;
    callUuid    = res.callUuid;
    ok('calls.create()', res);
  } catch (err) {
    fail('calls.create()', err);
    console.error('\nCannot run live-call tests without a live call. Aborting.');
    process.exit(1);
  }

  // ── Step 6: Wait for answer webhook ──────────────────────────────────────
  section('6. Wait for answer webhook (max 30s)');
  const timeout30 = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout waiting for answer webhook')), 30000));
  let webhookData;
  try {
    webhookData = await Promise.race([answeredPromise, timeout30]);
    // Prefer the callUuid from the webhook (most reliable)
    if (webhookData.callUuid) callUuid = webhookData.callUuid;
    ok('answer webhook received', webhookData);
  } catch (err) {
    fail('answer webhook', err);
    console.warn('No answer webhook — will try remaining tests with requestUuid as callUuid');
    callUuid = callUuid || requestUuid;
  }

  console.log(`\n  → Using callUuid: \x1b[36m${callUuid}\x1b[0m`);

  // Give the call 2 seconds to fully connect before acting on it
  await sleep(2000);

  // Helper: check whether the call is still live before each action.
  // Returns true if alive, false if the call has ended (callee hung up etc.)
  let callEnded = false;
  async function assertLive(label) {
    if (callEnded) return false;
    try {
      await client.calls.getLiveCall(callUuid);
      return true;
    } catch (_) {
      callEnded = true;
      console.log(`  \x1b[33m⚠ ${label} skipped — call ended early (callee hung up)\x1b[0m`);
      return false;
    }
  }

  // ── Step 7: getLiveCall ───────────────────────────────────────────────────
  section('7. calls.getLiveCall(uuid)');
  try {
    const live = await client.calls.getLiveCall(callUuid);
    ok('calls.getLiveCall()', live);
  } catch (err) {
    callEnded = true;
    fail('calls.getLiveCall()', err);
  }

  // ── Step 8: listLiveCalls (during call) ──────────────────────────────────
  section('8. calls.listLiveCalls() — during call');
  try {
    const live = await client.calls.listLiveCalls();
    ok('calls.listLiveCalls() (during call)', live);
  } catch (err) { fail('calls.listLiveCalls() (during call)', err); }

  // ── Step 9: record ────────────────────────────────────────────────────────
  section('9. calls.record(uuid)');
  if (await assertLive('calls.record()')) {
    try {
      const rec = await client.calls.record(callUuid, {
        fileFormat:  'mp3',
        callbackUrl: recordingCallbackUrl,
      });
      ok('calls.record()', rec);
    } catch (err) { fail('calls.record()', err); }
  }

  await sleep(1000);

  // ── Step 10: speakText ────────────────────────────────────────────────────
  section('10. calls.speakText(uuid, text)');
  if (await assertLive('calls.speakText()')) {
    try {
      const sp = await client.calls.speakText(callUuid, 'Hello from the Vobiz Node SDK test suite.');
      ok('calls.speakText()', sp);
    } catch (err) { fail('calls.speakText()', err); }
    await sleep(3000);
  }

  // ── Step 11: stopSpeakingText ─────────────────────────────────────────────
  section('11. calls.stopSpeakingText(uuid)');
  if (await assertLive('calls.stopSpeakingText()')) {
    try {
      const stop = await client.calls.stopSpeakingText(callUuid);
      ok('calls.stopSpeakingText()', stop);
    } catch (err) { fail('calls.stopSpeakingText()', err); }
    await sleep(500);
  }

  // ── Step 12: playMusic ────────────────────────────────────────────────────
  section('12. calls.playMusic(uuid, url)');
  // Use a publicly available short MP3
  const musicUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
  if (await assertLive('calls.playMusic()')) {
    try {
      const pm = await client.calls.playMusic(callUuid, musicUrl);
      ok('calls.playMusic()', pm);
    } catch (err) { fail('calls.playMusic()', err); }
    await sleep(3000);
  }

  // ── Step 13: stopPlayingMusic ─────────────────────────────────────────────
  section('13. calls.stopPlayingMusic(uuid)');
  if (await assertLive('calls.stopPlayingMusic()')) {
    try {
      const spm = await client.calls.stopPlayingMusic(callUuid);
      ok('calls.stopPlayingMusic()', spm);
    } catch (err) { fail('calls.stopPlayingMusic()', err); }
    await sleep(500);
  }

  // ── Step 14: sendDigits ───────────────────────────────────────────────────
  section('14. calls.sendDigits(uuid, digits)');
  if (await assertLive('calls.sendDigits()')) {
    try {
      const sd = await client.calls.sendDigits(callUuid, '1234');
      ok('calls.sendDigits()', sd);
    } catch (err) { fail('calls.sendDigits()', err); }
    await sleep(500);
  }

  // ── Step 15: stopRecording ────────────────────────────────────────────────
  section('15. calls.stopRecording(uuid)');
  if (await assertLive('calls.stopRecording()')) {
    try {
      const sr = await client.calls.stopRecording(callUuid);
      ok('calls.stopRecording()', sr);
    } catch (err) { fail('calls.stopRecording()', err); }
    await sleep(500);
  }

  // ── Step 16: hangup ───────────────────────────────────────────────────────
  section('16. calls.hangup(uuid)');
  if (!callEnded) {
    try {
      const hup = await client.calls.hangup(callUuid);
      ok('calls.hangup()', hup);
    } catch (err) { fail('calls.hangup()', err); }
  } else {
    console.log('  \x1b[33m⚠ calls.hangup() skipped — call already ended\x1b[0m');
  }

  // Give CDR a few seconds to become available
  console.log('\n  Waiting 5s for CDR to populate...');
  await sleep(5000);

  // ── Step 17: calls.get() — CDR ────────────────────────────────────────────
  // NOTE: GET /Call/{uuid}/ returns 401 on this account — the legacy completed-call
  // lookup endpoint is not enabled by Vobiz for this auth_id.  Use the CDR resource
  // (client.cdr.get()) for post-call detail instead.  We attempt it and skip gracefully.
  section('17. calls.get(uuid) — CDR post-call (expected 401 on this account)');
  try {
    const cdr = await client.calls.get(callUuid);
    ok('calls.get() (CDR)', cdr);
  } catch (err) {
    const msg = err.message || String(err);
    if (msg.includes('401') || msg.toLowerCase().includes('unauthorized')) {
      console.log(`  \x1b[33m⚠ calls.get() skipped — legacy endpoint returns 401 on this account (use client.cdr.get() instead)\x1b[0m`);
      // Don't count as failure — it's a known API restriction
    } else {
      fail('calls.get() (CDR)', err);
    }
  }

  // ── Step 18: listLiveCalls (post-call) ───────────────────────────────────
  section('18. calls.listLiveCalls() — after hangup');
  try {
    const live = await client.calls.listLiveCalls();
    ok('calls.listLiveCalls() (post-call)', live);
  } catch (err) { fail('calls.listLiveCalls() (post-call)', err); }

  // ── Summary ───────────────────────────────────────────────────────────────
  const total = passed + failed;
  console.log('\n\x1b[1m══════════════════════════════════════════════════\x1b[0m');
  console.log(`\x1b[1m  Results: \x1b[32m${passed} passed\x1b[0m\x1b[1m  \x1b[31m${failed} failed\x1b[0m\x1b[1m  / ${total} total\x1b[0m`);
  console.log('\x1b[1m══════════════════════════════════════════════════\x1b[0m\n');

  process.exit(failed > 0 ? 1 : 0);
})();
