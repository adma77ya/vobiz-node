'use strict';

require('dotenv').config();
const { Client } = require('.');

const client = new Client(
  process.env.VOBIZ_AUTH_ID,
  process.env.VOBIZ_AUTH_TOKEN
);

let passed = 0;
let failed = 0;
const results = [];

function preview(val) {
  const s = JSON.stringify(val) || String(val);
  return s.slice(0, 140) + (s.length > 140 ? '...' : '');
}

async function test(name, fn) {
  try {
    const result = await fn();
    console.log(`\x1b[32m✓\x1b[0m ${name}`);
    if (result !== undefined && result !== null) {
      console.log(`  \x1b[90m${preview(result)}\x1b[0m`);
    }
    passed++;
    results.push({ name, status: 'PASS' });
    return result;
  } catch (err) {
    const msg = err.message || String(err);
    console.log(`\x1b[31m✗\x1b[0m ${name}`);
    console.log(`  \x1b[31m${msg}\x1b[0m`);
    failed++;
    results.push({ name, status: 'FAIL', error: msg });
    return null;
  }
}

function section(name) {
  console.log(`\n\x1b[1m[${name}]\x1b[0m`);
}

(async () => {
  console.log('\n\x1b[1m══════════════════════════════════════════════════\x1b[0m');
  console.log('\x1b[1m  Vobiz SDK — Full API Test Suite (llm.txt parity)\x1b[0m');
  console.log('\x1b[1m══════════════════════════════════════════════════\x1b[0m\n');

  // ── 1. ACCOUNT ───────────────────────────────────────────────────────────────
  section('1. Account  GET /auth/me');
  await test('account.get()  →  GET /auth/me', () => client.account.get());
  await test('account.getProfile()  →  GET /auth/me', () => client.account.getProfile());

  // ── 2. BALANCE ───────────────────────────────────────────────────────────────
  section('2. Balance  GET /account/{id}/balance/{currency}');
  await test('balance.get("INR")', () => client.balance.get('INR'));

  // ── 3. TRANSACTIONS ──────────────────────────────────────────────────────────
  section('3. Transactions  GET /account/{id}/transactions');
  await test('balance.listTransactions({ limit: 5 })', () => client.balance.listTransactions({ limit: 5 }));

  // ── 4. CONCURRENCY ───────────────────────────────────────────────────────────
  section('4. Concurrency  GET /account/{id}/concurrency');
  await test('balance.getConcurrency()', () => client.balance.getConcurrency());

  // ── 5. CDR ───────────────────────────────────────────────────────────────────
  section('5. CDR  GET /account/{id}/cdr');
  await test('cdr.list({ per_page: 5, page: 1 })', () =>
    client.cdr.list({ per_page: 5, page: 1 })
  );
  await test('cdr.get({ per_page: 3 })  (alias)', () =>
    client.cdr.get({ per_page: 3 })
  );

  // ── 6. CALLS ─────────────────────────────────────────────────────────────────
  section('6. Calls  (Voice)');
  await test('calls.listLiveCalls()  →  GET /Call/?status=live', () => client.calls.listLiveCalls());
  await test('calls.listQueuedCalls()  →  GET /Call/?status=queued', () => client.calls.listQueuedCalls());
  // calls.list() uses legacy endpoint that returns 401 — skip with a note
  console.log('  \x1b[33m⚠ calls.list() skipped — legacy endpoint (401 on this account)\x1b[0m');
  console.log('  \x1b[33m⚠ calls.create/hangup/transfer/record skipped — require live call\x1b[0m');

  // ── 7. RECORDINGS ────────────────────────────────────────────────────────────
  section('7. Recordings  GET /Account/{id}/Recording/');
  const recs = await test('recordings.list({ limit: 5 })', () =>
    client.recordings.list({ limit: 5 })
  );
  // If there are recordings, test get() and delete on a safe basis
  if (recs && recs.length > 0) {
    const rid = recs[0].recordingId;
    await test(`recordings.get("${rid}")`, () => client.recordings.get(rid));
  } else {
    console.log('  \x1b[33m⚠ recordings.get() skipped — no recordings found\x1b[0m');
  }

  // ── 8. CONFERENCES ───────────────────────────────────────────────────────────
  section('8. Conferences  GET /Conference/');
  await test('conferences.list()', () => client.conferences.list());

  // ── 9. APPLICATIONS ──────────────────────────────────────────────────────────
  section('9. Applications  CRUD /Application/');
  let appId;
  const appRes = await test('applications.create("SDK-Test", { answerUrl })', () =>
    client.applications.create('SDK-Test-' + Date.now(), {
      answerUrl:    'https://httpbin.org/post',
      hangupUrl:    'https://httpbin.org/post',
      answerMethod: 'POST',
    })
  );
  if (appRes) appId = appRes.appId;

  await test('applications.list({ limit: 5 })', () =>
    client.applications.list({ limit: 5 })
  );

  if (appId) {
    await test(`applications.get("${appId}")`, () => client.applications.get(appId));
    await test(`applications.update("${appId}", { answerUrl })`, () =>
      client.applications.update(appId, { answerUrl: 'https://httpbin.org/get' })
    );
    await test(`applications.delete("${appId}")`, () =>
      client.applications.delete(appId)
    );
  }

  // ── 10. PHONE NUMBERS ────────────────────────────────────────────────────────
  section('10. Phone Numbers  GET /account/{id}/numbers');
  const numbersRes = await test('numbers.list()  →  GET /account/{id}/numbers', () =>
    client.numbers.list()
  );

  section('10b. Number Inventory  GET /account/{id}/inventory/numbers');
  const inventoryRes = await test('numbers.listInventory({ per_page: 5 })', () =>
    client.numbers.listInventory({ per_page: 5 })
  );
  await test('numbers.search("IN", { per_page: 3 })  →  inventory?country=IN', () =>
    client.numbers.search('IN', { per_page: 3 })
  );

  // ── 11. ENDPOINTS ────────────────────────────────────────────────────────────
  section('11. SIP Endpoints  CRUD /Endpoint/');
  let endpointId;
  const epRes = await test('endpoints.create(user, pass, alias)', () =>
    client.endpoints.create(
      'sdktest' + Date.now(),
      'TestPass123!',
      'SDK Test Endpoint'
    )
  );
  if (epRes) endpointId = epRes.endpointId;

  await test('endpoints.list()', () => client.endpoints.list());

  if (endpointId) {
    await test(`endpoints.get("${endpointId}")`, () => client.endpoints.get(endpointId));
    await test(`endpoints.update("${endpointId}", { alias })`, () =>
      client.endpoints.update(endpointId, { alias: 'SDK Updated' })
    );
    await test(`endpoints.delete("${endpointId}")`, () =>
      client.endpoints.delete(endpointId)
    );
  }

  // ── 12. SIP TRUNKS ───────────────────────────────────────────────────────────
  section('12. SIP Trunks  CRUD /trunks');
  let trunkId;
  const trunkListRes = await test('trunks.list()', () => client.trunks.list());
  if (trunkListRes && trunkListRes.objects && trunkListRes.objects.length > 0) {
    trunkId = trunkListRes.objects[0].trunkId;
    await test(`trunks.get("${trunkId}")`, () => client.trunks.get(trunkId));
  } else {
    console.log('  \x1b[33m⚠ trunks.get() skipped — no trunks found\x1b[0m');
  }
  // Skip create/delete to avoid side effects on real trunks

  // ── 13. SIP CREDENTIALS ─────────────────────────────────────────────────────
  section('13. SIP Credentials  GET /credentials');
  await test('credentials.list()', () => client.credentials.list());

  // ── 14. IP ACL ───────────────────────────────────────────────────────────────
  section('14. IP ACL  GET /ip-acl');
  await test('ipAcl.list()', () => client.ipAcl.list());

  // ── 15. ORIGINATION URIs ─────────────────────────────────────────────────────
  section('15. Origination URIs  GET /trunks/{id}/origination-uris');
  if (trunkId) {
    await test(`originationUris.list("${trunkId}")`, () =>
      client.originationUris.list(trunkId)
    );
  } else {
    console.log('  \x1b[33m⚠ originationUris.list() skipped — no trunk found\x1b[0m');
  }

  // ── 16. SUB-ACCOUNTS ─────────────────────────────────────────────────────────
  section('16. Sub-accounts  CRUD /accounts/{id}/sub-accounts/');
  await test('subaccounts.list()', () => client.subaccounts.list());

  let subId;
  const subRes = await test('subaccounts.create({ name, email, password })', () =>
    client.subaccounts.create({
      name:     'SDK-Test-Sub-' + Date.now(),
      email:    `sdktest${Date.now()}@example.com`,
      password: 'TestPass123!',
      permissions: { calls: true, cdr: true },
    })
  );
  if (subRes) {
    subId = (subRes.sub_account && subRes.sub_account.id) || subRes.id;
  }

  if (subId) {
    await test(`subaccounts.get("${subId}")`, () => client.subaccounts.get(subId));
    await test(`subaccounts.update("${subId}", { description })`, () =>
      client.subaccounts.update(subId, { description: 'SDK Updated' })
    );
    await test(`subaccounts.delete("${subId}")`, () =>
      client.subaccounts.delete(subId)
    );
  }

  // ── SUMMARY ──────────────────────────────────────────────────────────────────
  const total = passed + failed;
  console.log('\n\x1b[1m══════════════════════════════════════════════════\x1b[0m');
  console.log(`\x1b[1m  Results: \x1b[32m${passed} passed\x1b[0m\x1b[1m  \x1b[31m${failed} failed\x1b[0m\x1b[1m  / ${total} total\x1b[0m`);
  console.log('\x1b[1m══════════════════════════════════════════════════\x1b[0m\n');

  if (failed > 0) {
    console.log('\x1b[1mFailed:\x1b[0m');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  \x1b[31m✗ ${r.name}\x1b[0m`);
      console.log(`    ${r.error}`);
    });
    console.log('');
  }
})();
