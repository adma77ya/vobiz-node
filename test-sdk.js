/* eslint-disable no-console */

'use strict';

require('dotenv').config();
const Vobiz = require('./lib/rest/client');

const AUTH_ID = process.env.VOBIZ_AUTH_ID || process.env.AUTH_ID;
const AUTH_TOKEN = process.env.VOBIZ_AUTH_TOKEN || process.env.AUTH_TOKEN;

if (!AUTH_ID || !AUTH_TOKEN) {
  console.error('Missing required env vars: VOBIZ_AUTH_ID and VOBIZ_AUTH_TOKEN');
  process.exit(1);
}

// Existing SDK constructor signature: (authId, authToken, options)
const client = new Vobiz.Client(AUTH_ID, AUTH_TOKEN);

let total = 0;
let passed = 0;
let failed = 0;

let requestLogs = [];
const originalConsoleLog = console.log;

function isRequestLog(value) {
  return value && typeof value === 'object' && value.method && value.url && value.headers;
}

console.log = function (...args) {
  if (args.length === 1 && isRequestLog(args[0])) {
    requestLogs.push(args[0]);
  }
  originalConsoleLog.apply(console, args);
};

function popLastRequestLog() {
  if (!requestLogs.length) {
    return null;
  }
  return requestLogs[requestLogs.length - 1];
}

function statusFromError(err) {
  if (!err) {
    return null;
  }
  if (err.response && err.response.status) {
    return err.response.status;
  }
  if (typeof err.status === 'number') {
    return err.status;
  }

  const text = String(err.message || err.toString() || '');
  const m = text.match(/\b(400|401|404|422|500)\b/);
  return m ? Number(m[1]) : null;
}

function classifyError(err) {
  const status = statusFromError(err);
  if (status === 401) {
    return 'AUTH ERROR';
  }
  if (status === 404) {
    return 'ENDPOINT ERROR';
  }
  if (status === 400) {
    return 'BAD REQUEST';
  }

  const msg = String((err && (err.message || err.toString())) || 'Unknown error');
  if (/undefined|null|cannot read/i.test(msg)) {
    return 'MAPPING ERROR';
  }

  return msg;
}

function hasRequiredHeaders(headers) {
  if (!headers || typeof headers !== 'object') {
    return false;
  }
  const keys = Object.keys(headers).reduce((acc, k) => {
    acc[k.toLowerCase()] = headers[k];
    return acc;
  }, {});

  return Boolean(
    keys['x-auth-id'] &&
    keys['x-auth-token'] &&
    keys['content-type']
  );
}

function hasSnakeCaseObjectKeys(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return true;
  }

  return Object.keys(value).every((k) => {
    // allow already snake_case and non-letter keys
    return !/[A-Z]/.test(k);
  });
}

function validateRequestLog(log, expected) {
  const issues = [];
  if (!log) {
    return ['No request debug log captured'];
  }

  if (expected.method && String(log.method).toUpperCase() !== expected.method.toUpperCase()) {
    issues.push(`Method mismatch (expected ${expected.method}, got ${log.method})`);
  }

  if (expected.base === 'modern' && !/\/api\/v1\/account\//.test(log.url)) {
    issues.push(`Base URL mismatch (expected modern /account/, got ${log.url})`);
  }

  if (expected.base === 'legacy' && !/\/api\/v1\/Account\//.test(log.url)) {
    issues.push(`Base URL mismatch (expected legacy /Account/, got ${log.url})`);
  }

  if (expected.pathContains && !String(log.url).includes(expected.pathContains)) {
    issues.push(`Path mismatch (expected to include ${expected.pathContains}, got ${log.url})`);
  }

  if (!hasRequiredHeaders(log.headers)) {
    issues.push('Missing required auth/content headers');
  }

  if (expected.requireSnakeBody && !hasSnakeCaseObjectKeys(log.data)) {
    issues.push('Body is not snake_case');
  }

  if (expected.method && expected.method.toUpperCase() === 'GET') {
    if (log.data && typeof log.data === 'object' && Object.keys(log.data).length > 0) {
      issues.push('GET request should not send body data');
    }
  }

  return issues;
}

function extractId(obj, keys) {
  if (!obj || typeof obj !== 'object') {
    return null;
  }

  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
      return obj[key];
    }
  }

  return null;
}

async function test(name, fn, verify = null) {
  total += 1;
  console.log(`\n🧪 TEST: ${name}`);

  try {
    const result = await fn();

    if (verify) {
      const log = popLastRequestLog();
      const issues = validateRequestLog(log, verify);
      if (issues.length) {
        throw new Error(issues.join(' | '));
      }
    }

    console.log('✅ SUCCESS');
    passed += 1;
    return { ok: true, result };
  } catch (err) {
    failed += 1;
    console.log(`❌ FAILED: ${classifyError(err)}`);
    return { ok: false, error: err };
  }
}

(async function run() {
  const state = {
    trunkId: null,
    credentialId: null,
    ipAclId: null,
    originationUriId: null
  };

  // AUTH
  await test(
    'AUTH - account.getProfile()',
    () => client.account.getProfile(),
    { method: 'GET', pathContains: '/auth/me', base: null }
  );

  // TRUNKS
  const trunkCreate = await test(
    'TRUNKS - create',
    () => client.trunks.create({ name: 'SDK Trunk Test', cpsLimit: 10 }),
    { method: 'POST', pathContains: '/trunks', base: 'modern', requireSnakeBody: true }
  );

  if (trunkCreate.ok) {
    state.trunkId = extractId(trunkCreate.result, ['id', 'trunkId', 'trunk_id']);
  }

  if (state.trunkId) {
    await test(
      'TRUNKS - get',
      () => client.trunks.get(state.trunkId),
      { method: 'GET', pathContains: `/trunks/${state.trunkId}`, base: 'modern' }
    );
  } else {
    console.log('⚠️ SKIPPED: TRUNKS - get (missing trunk id)');
  }

  await test(
    'TRUNKS - list',
    () => client.trunks.list({ limit: 5, offset: 0 }),
    { method: 'GET', pathContains: '/trunks', base: 'modern' }
  );

  if (state.trunkId) {
    await test(
      'TRUNKS - update',
      () => client.trunks.update(state.trunkId, { cpsLimit: 20 }),
      { method: 'PUT', pathContains: `/trunks/${state.trunkId}`, base: 'modern', requireSnakeBody: true }
    );

    await test(
      'TRUNKS - delete',
      () => client.trunks.delete(state.trunkId),
      { method: 'DELETE', pathContains: `/trunks/${state.trunkId}`, base: 'modern' }
    );
  } else {
    console.log('⚠️ SKIPPED: TRUNKS - update/delete (missing trunk id)');
  }

  // CREDENTIALS
  const credentialCreate = await test(
    'CREDENTIALS - create',
    () => client.credentials.create({ username: `sdk_user_${Date.now()}`, password: 'Password123!' }),
    { method: 'POST', pathContains: '/credentials', base: 'modern', requireSnakeBody: true }
  );

  if (credentialCreate.ok) {
    state.credentialId = extractId(credentialCreate.result, ['id', 'credentialId', 'credential_id']);
  }

  await test(
    'CREDENTIALS - list',
    () => client.credentials.list({ limit: 5 }),
    { method: 'GET', pathContains: '/trunks/credentials', base: 'modern' }
  );

  if (state.credentialId) {
    await test(
      'CREDENTIALS - update',
      () => client.credentials.update(state.credentialId, { enabled: true }),
      { method: 'PUT', pathContains: `/credentials/${state.credentialId}`, base: 'modern', requireSnakeBody: true }
    );

    await test(
      'CREDENTIALS - delete',
      () => client.credentials.delete(state.credentialId),
      { method: 'DELETE', pathContains: `/credentials/${state.credentialId}`, base: 'modern' }
    );
  } else {
    console.log('⚠️ SKIPPED: CREDENTIALS - update/delete (missing credential id)');
  }

  // IP ACL
  const uniqueIp = `1.2.3.${(Date.now() % 200) + 20}`;
  const ipAclCreate = await test(
    'IP ACL - create',
    () => client.ipAcl.create({ ipAddress: uniqueIp, description: 'SDK test ACL' }),
    { method: 'POST', pathContains: '/ip-acl', base: 'modern', requireSnakeBody: true }
  );

  if (ipAclCreate.ok) {
    state.ipAclId = extractId(ipAclCreate.result, ['id', 'ipAclId', 'ip_acl_id']);
  }

  await test(
    'IP ACL - list',
    () => client.ipAcl.list({ limit: 5 }),
    { method: 'GET', pathContains: '/trunks/ip-acl', base: 'modern' }
  );

  if (state.ipAclId) {
    await test(
      'IP ACL - update',
      () => client.ipAcl.update(state.ipAclId, { description: 'Updated ACL' }),
      { method: 'PUT', pathContains: `/ip-acl/${state.ipAclId}`, base: 'modern', requireSnakeBody: true }
    );

    await test(
      'IP ACL - delete',
      () => client.ipAcl.delete(state.ipAclId),
      { method: 'DELETE', pathContains: `/ip-acl/${state.ipAclId}`, base: 'modern' }
    );
  } else {
    console.log('⚠️ SKIPPED: IP ACL - update/delete (missing ip acl id)');
  }

  // ORIGINATION URIS
  const uriCreate = await test(
    'ORIGINATION URIS - create',
    () => client.originationUris.create({ uri: 'sip:test@sip.example.com:5060', priority: 1, weight: 10 }),
    { method: 'POST', pathContains: '/origination-uris', base: 'modern', requireSnakeBody: true }
  );

  if (uriCreate.ok) {
    state.originationUriId = extractId(uriCreate.result, ['id', 'originationUriId', 'origination_uri_id']);
  }

  await test(
    'ORIGINATION URIS - list',
    () => client.originationUris.list({ limit: 5 }),
    { method: 'GET', pathContains: '/trunks/origination-uris', base: 'modern' }
  );

  if (state.originationUriId) {
    await test(
      'ORIGINATION URIS - update',
      () => client.originationUris.update(state.originationUriId, { weight: 20 }),
      { method: 'PUT', pathContains: `/origination-uris/${state.originationUriId}`, base: 'modern', requireSnakeBody: true }
    );

    await test(
      'ORIGINATION URIS - delete',
      () => client.originationUris.delete(state.originationUriId),
      { method: 'DELETE', pathContains: `/origination-uris/${state.originationUriId}`, base: 'modern' }
    );
  } else {
    console.log('⚠️ SKIPPED: ORIGINATION URIS - update/delete (missing uri id)');
  }

  // NUMBERS
  const dummyNumber = process.env.TEST_NUMBER || '+911171366926';
  const dummyTrunkId = state.trunkId || process.env.TEST_TRUNK_ID || 'dummy-trunk-id';
  const encodedNumber = encodeURIComponent(dummyNumber);

  await test(
    'NUMBERS - assign',
    () => client.numbers.assign(dummyNumber, dummyTrunkId),
    { method: 'POST', pathContains: `/numbers/${encodedNumber}/assign`, base: 'modern', requireSnakeBody: true }
  );

  await test(
    'NUMBERS - unassign',
    () => client.numbers.unassign(dummyNumber),
    { method: 'DELETE', pathContains: `/numbers/${encodedNumber}/assign`, base: 'modern' }
  );

  // ENDPOINTS (LEGACY BASE)
  await test(
    'ENDPOINTS - list (legacy)',
    () => client.endpoints.list({ limit: 5 }),
    { method: 'GET', pathContains: '/Endpoint/', base: 'legacy' }
  );

  // CDR
  await test(
    'CDR - get',
    () => client.cdr.get({ limit: 5, offset: 0 }),
    { method: 'GET', pathContains: '/cdr', base: 'modern' }
  );

  // OPTIONAL: applications
  if (client.applications && typeof client.applications.list === 'function') {
    await test(
      'OPTIONAL - applications.list',
      () => client.applications.list({ limit: 5 }),
      { method: 'GET', pathContains: '/Application/', base: 'legacy' }
    );
  }

  // OPTIONAL: recordings
  if (client.recordings && typeof client.recordings.list === 'function') {
    await test(
      'OPTIONAL - recordings.list',
      () => client.recordings.list({ limit: 5 }),
      { method: 'GET', pathContains: '/Recording/', base: 'legacy' }
    );
  }

  // OPTIONAL: subaccounts
  if (client.subaccounts && typeof client.subaccounts.list === 'function') {
    await test(
      'OPTIONAL - subaccounts.list',
      () => client.subaccounts.list({ limit: 5 }),
      { method: 'GET', pathContains: '/sub-accounts/', base: null }
    );
  }

  console.log('\n================ SUMMARY ================');
  console.log(`TOTAL TESTS: ${total}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log('========================================');

  process.exit(failed > 0 ? 1 : 0);
})();
