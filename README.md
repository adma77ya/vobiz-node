# vobiz-node

Official Node.js SDK for the [Vobiz](https://vobiz.ai) Voice & Telephony API.

> Make calls, manage SIP trunks, handle CDR, record calls, manage sub-accounts, and more — all from Node.js.

---

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Authentication](#authentication)
- [Quick Start](#quick-start)
- [SDK Console (Browser Dashboard)](#sdk-console-browser-dashboard)
- [API Reference](#api-reference)
  - [Calls](#calls)
  - [CDR — Call Detail Records](#cdr--call-detail-records)
  - [Recordings](#recordings)
  - [Conferences](#conferences)
  - [Phone Numbers](#phone-numbers)
  - [Applications](#applications)
  - [SIP Trunks](#sip-trunks)
  - [SIP Credentials](#sip-credentials)
  - [IP ACL](#ip-acl)
  - [Origination URIs](#origination-uris)
  - [Endpoints](#endpoints)
  - [Account](#account)
  - [Sub-accounts](#sub-accounts)
  - [Balance, Transactions & Concurrency](#balance-transactions--concurrency)
- [VobizXML](#vobizxml)
- [Webhook Signature Verification](#webhook-signature-verification)
- [Error Handling](#error-handling)
- [Configuration Options](#configuration-options)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [License](#license)

---

## Requirements

- Node.js **v14** or higher
- A Vobiz account — [sign up here](https://console.vobiz.ai/app/register)
- Your `Auth ID` and `Auth Token` from the Vobiz console

---

## Installation

```bash
npm install vobiz-node
```

Or clone and use locally:

```bash
git clone https://github.com/adma77ya/vobiz-node.git
cd vobiz-node
npm install
```

---

## Authentication

All API calls require your **Auth ID** and **Auth Token**, available in the [Vobiz Console](https://console.vobiz.ai).

```js
const { Client } = require('vobiz-node');

const client = new Client('YOUR_AUTH_ID', 'YOUR_AUTH_TOKEN');
```

Or set environment variables and call with no arguments:

```bash
export VOBIZ_AUTH_ID=YOUR_AUTH_ID
export VOBIZ_AUTH_TOKEN=YOUR_AUTH_TOKEN
```

```js
const { Client } = require('vobiz-node');
const client = new Client(); // reads from env automatically
```

---

## Quick Start

```js
const { Client } = require('vobiz-node');

const client = new Client(
  process.env.VOBIZ_AUTH_ID,
  process.env.VOBIZ_AUTH_TOKEN
);

// Make an outbound call
client.calls.create(
  '+911171366914',                      // from
  '+919148227303',                      // to
  'https://yourserver.com/answer',      // answer URL (must return VobizXML)
  { hangupUrl: 'https://yourserver.com/hangup' }
).then(res => {
  console.log('Call queued:', res.requestUuid);
}).catch(console.error);
```

---

## SDK Console (Browser Dashboard)

The repo includes a full browser-based dashboard for making and monitoring calls in real time.

### Setup

Create a `.env` file in the project root:

```env
VOBIZ_AUTH_ID=YOUR_AUTH_ID
VOBIZ_AUTH_TOKEN=YOUR_AUTH_TOKEN
FROM_NUMBER=+911171366914
TO_NUMBER=+919148227303
PORT=3000
WEBHOOK_PORT=5678
```

### Run

```bash
npm run serve
```

Then open **http://localhost:3000** in your browser.

The server automatically:
- Starts the API server on port `3000`
- Starts a webhook receiver on port `5678`
- Opens a [localtunnel](https://localtunnel.me) so Vobiz can reach your webhooks

### Dashboard Features

| Feature | Description |
|---|---|
| **Make a Call** | Initiate outbound calls with pre-filled numbers from `.env` |
| **Live Status** | Real-time call state via SSE push (no polling lag) |
| **Hang Up** | Terminate the active call from the browser |
| **Record** | Start / stop call recording |
| **Event Log** | Live webhook event feed (answer, hangup, cause, duration) |
| **CDR History** | Paginated call history with MOS score, cost, duration |

---

## API Reference

### Calls

```js
// Make an outbound call
client.calls.create(from, to, answerUrl, options)

// Hang up a live call
client.calls.hangup(callUuid)

// Transfer a call
client.calls.transfer(callUuid, { legs: 'aleg', alegUrl: 'https://...' })

// Get a live/active call
client.calls.getLiveCall(callUuid)

// List all live calls
client.calls.listLiveCalls()

// Get a queued call
client.calls.getQueuedCall(callUuid)

// List all queued calls
client.calls.listQueuedCalls()

// Get call detail (completed)
client.calls.get(callUuid)

// List completed calls
client.calls.list({ limit: 20, offset: 0 })

// Cancel a queued call
client.calls.cancel(requestUuid)

// Record a live call
client.calls.record(callUuid, {
  timeLimit: 60,
  fileFormat: 'mp3',
  transcriptionType: 'auto'
})

// Stop recording
client.calls.stopRecording(callUuid)

// Play audio
client.calls.playMusic(callUuid, ['https://example.com/audio.mp3'])

// Stop audio
client.calls.stopPlayingMusic(callUuid)

// Text-to-speech
client.calls.speakText(callUuid, 'Hello, this is Vobiz.', {
  voice: 'WOMAN', language: 'en-US'
})

// Stop TTS
client.calls.stopSpeakingText(callUuid)

// Send DTMF digits
client.calls.sendDigits(callUuid, '1234')

// Start audio stream
client.calls.stream(callUuid, 'wss://your-stream-endpoint.com', {
  audioTrack: 'inbound'
})

// Stop stream by ID
client.calls.stopStream(callUuid, streamId)

// Stop all streams
client.calls.stopAllStream(callUuid)
```

**`create()` options:**

| Option | Type | Description |
|---|---|---|
| `hangupUrl` | string | URL Vobiz POSTs to when the call ends |
| `hangupMethod` | string | `POST` (default) or `GET` |
| `callerName` | string | Caller ID name |
| `timeLimit` | number | Max call duration in seconds |
| `machineDetection` | string | `enable` to detect answering machines |
| `recordCallOnConnect` | boolean | Auto-record on answer |

---

### CDR — Call Detail Records

```js
// List CDRs with optional filters
client.cdr.get({
  limit:         20,
  offset:        0,
  startTime:     '2026-01-01T00:00:00Z',
  endTime:       '2026-12-31T23:59:59Z',
  callDirection: 'outbound'    // 'inbound' | 'outbound'
})
```

**CDR response fields:**

| Field | Description |
|---|---|
| `uuid` | Call UUID |
| `callerIdNumber` | Originating number |
| `destinationNumber` | Destination number |
| `callDirection` | `inbound` or `outbound` |
| `hangupCause` | e.g. `NORMAL_CLEARING`, `USER_BUSY` |
| `duration` | Total call duration in seconds |
| `billsec` | Billed seconds |
| `startTime` | Call start timestamp (ISO 8601) |
| `answerTime` | Call answer timestamp |
| `endTime` | Call end timestamp |
| `cost` | Call cost |
| `totalCost` | Total cost including streaming |
| `currency` | Currency code |
| `mos` | Mean Opinion Score (voice quality, 1–5) |
| `jitter` | Jitter in ms |
| `packetLoss` | Packet loss % |
| `codec` | Audio codec used |
| `region` | AWS region |

---

### Recordings

```js
// Get a single recording
client.recordings.get(recordingId)

// List recordings
client.recordings.list({
  limit: 20, offset: 0,
  callUuid: 'optional-filter'
})

// Delete a recording
client.recordings.delete(recordingId)

// Bulk delete recordings
client.recordings.bulkDelete({ callUuid: '...' })

// Export recordings (async, sent via email)
client.recordings.export({
  startTime: '2026-01-01', endTime: '2026-12-31'
})
```

---

### Conferences

```js
// Get conference details
client.conferences.get(conferenceName)

// List all active conferences
client.conferences.list()

// Hang up entire conference
client.conferences.get(conferenceName).then(c => c.hangup())

// Kick a member
client.conferences.get(conferenceName).then(c => c.kickMember(memberId))

// Mute / unmute a member
client.conferences.get(conferenceName).then(c => c.muteMember(memberId))
client.conferences.get(conferenceName).then(c => c.unmuteMember(memberId))

// Deaf / undeaf a member
client.conferences.get(conferenceName).then(c => c.deafMember(memberId))
client.conferences.get(conferenceName).then(c => c.undeafMember(memberId))

// Play audio to a specific member
client.conferences.get(conferenceName).then(c =>
  c.playAudioToMember(memberId, 'https://example.com/audio.mp3')
)

// Speak text to a specific member
client.conferences.get(conferenceName).then(c =>
  c.speakTextToMember(memberId, 'Welcome to the conference.')
)

// Record a conference
client.conferences.get(conferenceName).then(c =>
  c.record({ fileFormat: 'mp3', transcriptionType: 'auto' })
)

// Stop conference recording
client.conferences.get(conferenceName).then(c => c.stopRecording())
```

---

### Phone Numbers

```js
// Search available numbers
client.numbers.search('IN', { type: 'local', pattern: '9148' })

// Buy a number
client.numbers.buy('+919148XXXXXX', appId)

// List your numbers
client.numbers.list()

// Unrent / release a number
client.numbers.unrent('+919148XXXXXX')

// Update a number (assign application)
client.numbers.update('+919148XXXXXX', { appId: 'your-app-id' })

// Assign number to a SIP trunk
client.numbers.assign('+919148XXXXXX', trunkId)

// Add your own number (BYOC)
client.numbers.addOwnNumber(['+919148XXXXXX'], 'carrier-name', 'IN')
```

---

### Applications

```js
// Create an application
client.applications.create('My IVR', {
  answerUrl:    'https://example.com/answer',
  hangupUrl:    'https://example.com/hangup',
  answerMethod: 'POST'
})

// Get an application
client.applications.get(appId)

// List all applications
client.applications.list({ limit: 20, offset: 0 })

// Update an application
client.applications.update(appId, { answerUrl: 'https://example.com/new-answer' })

// Delete an application
client.applications.delete(appId)
```

---

### SIP Trunks

```js
// Create a trunk
client.trunks.create({
  name:          'My Outbound Trunk',
  username:      'mytrunk',
  password:      'SecurePass123!',
  maxCps:        10,
  maxConcurrent: 50
})

// Get a trunk
client.trunks.get(trunkId)

// List all trunks
client.trunks.list()

// Update a trunk
client.trunks.update(trunkId, { maxCps: 20 })

// Delete a trunk
client.trunks.delete(trunkId)
```

---

### SIP Credentials

```js
// Create credentials
client.credentials.create({ username: 'user1', password: 'Pass123!' })

// Get credentials
client.credentials.get(credentialId)

// List all credentials
client.credentials.list()

// Update credentials
client.credentials.update(credentialId, { password: 'NewPass456!' })

// Delete credentials
client.credentials.delete(credentialId)
```

---

### IP ACL

```js
// Create an IP ACL rule
client.ipAcl.create({ name: 'Office', cidr: '203.0.113.0/24' })

// List IP ACL rules
client.ipAcl.list()

// Delete a rule
client.ipAcl.delete(aclId)
```

---

### Origination URIs

```js
// Create an origination URI
client.originationUris.create({
  trunkId:  'your-trunk-id',
  uri:      'sip:sip.carrier.com',
  priority: 1,
  weight:   100
})

// List origination URIs
client.originationUris.list(trunkId)

// Update
client.originationUris.update(trunkId, uriId, { priority: 2 })

// Delete
client.originationUris.delete(trunkId, uriId)
```

---

### Endpoints

```js
// Create a SIP endpoint (username, password, alias, appId)
client.endpoints.create('alice', 'Pass123!', 'Alice Desk Phone', 'optional-app-id')

// Get an endpoint
client.endpoints.get(endpointId)

// List all endpoints
client.endpoints.list()

// Update an endpoint
client.endpoints.update(endpointId, { alias: 'Alice Mobile' })

// Delete an endpoint
client.endpoints.delete(endpointId)
```

---

### Account

```js
// Get account details (profile, balance, limits)
client.account.get()
```

**Response includes:** `authId`, `name`, `email`, `accountType`, `cpsLimit`, `concurrentCallsLimit`, `pricingTier`, `isActive`, `createdAt`, etc.

---

### Sub-accounts

```js
// Create a sub-account
client.subaccounts.create({
  name:        'Support Team',
  email:       'support@example.com',
  password:    'Secure123!',
  permissions: { calls: true, cdr: true },
  rateLimit:   500
})

// Get a sub-account
client.subaccounts.get(subAccountId)

// List all sub-accounts
client.subaccounts.list({ page: 1, size: 25 })

// Update a sub-account
client.subaccounts.update(subAccountId, { rateLimit: 1000 })

// Delete a sub-account
client.subaccounts.delete(subAccountId)
```

---

### Balance, Transactions & Concurrency

```js
// Get account balance (default currency: INR)
client.balance.get('INR')

// Get balance for a specific currency
client.balance.get('USD')

// List transactions
client.balance.listTransactions({ limit: 50, offset: 0 })

// Get current concurrent call usage
client.balance.getConcurrency()
```

**Balance response fields:**

| Field | Description |
|---|---|
| `balance` | Current account balance |
| `availableBalance` | Balance + promotional credits |
| `currency` | Currency code |
| `lowBalanceThreshold` | Alert threshold |
| `status` | `active` |

**Concurrency response fields:**

| Field | Description |
|---|---|
| `concurrentCalls` | Currently active calls |
| `maxConcurrent` | Your account limit |
| `utilizationPct` | % of limit in use |

---

## VobizXML

Return VobizXML from your `answerUrl` to control call flow.

Return VobizXML directly from your `answerUrl` as a raw string:

```js
app.post('/answer', (req, res) => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Speak voice="WOMAN" language="en-US">Hello, welcome to Vobiz.</Speak>
</Response>`;
  res.type('text/xml').send(xml);
});
```

**Supported VobizXML verbs:**

| Verb | Description |
|---|---|
| `<Speak>` | Text-to-speech (voice, language attributes) |
| `<Play>` | Play an audio file |
| `<Record>` | Record the call |
| `<Dial>` | Dial another number or SIP endpoint |
| `<Gather>` | Collect DTMF input |
| `<DTMF>` | Send DTMF digits |
| `<Hangup>` | Hang up the call |
| `<Redirect>` | Redirect to another URL |
| `<Wait>` | Silence / hold |
| `<Conference>` | Join a conference |
| `<Stream>` | Stream audio to a WebSocket |
| `<PreAnswer>` | Actions before the call is answered |
| `<MultiPartyCall>` | Multi-party call bridging |

---

## Webhook Signature Verification

Verify that incoming webhooks are genuinely from Vobiz:

```js
const { validateSignature } = require('vobiz-node');

app.post('/answer', (req, res) => {
  const isValid = validateSignature(
    req.url,
    req.headers['x-vobiz-signature'],
    req.body,
    process.env.VOBIZ_AUTH_TOKEN
  );

  if (!isValid) {
    return res.status(401).send('Unauthorized');
  }

  res.type('text/xml').send('<Response><Speak>Hello!</Speak></Response>');
});
```

---

## Error Handling

All SDK methods return Promises. Errors are typed for easy handling:

```js
client.calls.create(from, to, answerUrl)
  .then(res => console.log('Request UUID:', res.requestUuid))
  .catch(err => {
    console.error('Status:', err.status);      // HTTP status code
    console.error('Message:', err.message);    // Human-readable message
    console.error('Response:', err.response);  // Full axios response
  });
```

**Error types:**

| Class | HTTP Status | When |
|---|---|---|
| `AuthenticationError` | 401, 403 | Invalid or missing credentials |
| `InvalidRequestError` | 400, 405, 409, 422, 429 | Bad request or rate limited |
| `ResourceNotFoundError` | 404 | Resource does not exist |
| `ServerError` | 500, 502, 503, 504 | Vobiz server error |

**Automatic retry:** The SDK automatically retries `429` (rate limited) and `5xx` errors with exponential backoff (up to 3 attempts), honouring the `Retry-After` header.

---

## Configuration Options

```js
const client = new Client('AUTH_ID', 'AUTH_TOKEN', {
  timeout: 15000,               // Request timeout in ms (default: 30000)
  proxy:   'http://proxy:8080'  // HTTP/HTTPS proxy URL (optional)
});
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VOBIZ_AUTH_ID` | Yes | Your Vobiz Auth ID |
| `VOBIZ_AUTH_TOKEN` | Yes | Your Vobiz Auth Token |
| `FROM_NUMBER` | Console only | Default outbound caller ID |
| `TO_NUMBER` | Console only | Default destination number |
| `PORT` | Console only | API server port (default: `3000`) |
| `WEBHOOK_PORT` | Console only | Webhook receiver port (default: `5678`) |

---

## Project Structure

```
vobiz-node/
├── index.js                    # SDK entry point
├── server.js                   # SDK Console server (npm run serve)
├── package.json
├── .env                        # Local credentials (do not commit)
│
├── lib/
│   ├── rest/
│   │   ├── client.js           # Main Client class
│   │   ├── axios.js            # HTTP layer (retry, timeout, error handling)
│   │   └── utils.js            # camelCase response transformer
│   ├── resources/
│   │   ├── call.js             # Calls API
│   │   ├── cdr.js              # Call Detail Records
│   │   ├── recordings.js       # Recordings
│   │   ├── conferences.js      # Conferences
│   │   ├── numbers.js          # Phone Numbers
│   │   ├── applications.js     # Voice Applications
│   │   ├── trunks.js           # SIP Trunks
│   │   ├── credentials.js      # SIP Credentials
│   │   ├── ipAcl.js            # IP ACL rules
│   │   ├── originationUris.js  # Origination URIs
│   │   ├── endpoints.js        # SIP Endpoints
│   │   ├── account.js          # Account profile
│   │   ├── subaccounts.js      # Sub-accounts
│   │   └── balance.js          # Balance, Transactions, Concurrency
│   └── utils/
│       ├── exceptions.js       # Typed error classes
│       └── v3Security.js       # Webhook signature verification
│
├── types/                      # TypeScript declarations
│   ├── rest/client.d.ts
│   └── resources/*.d.ts
│
└── public/
    ├── index.html              # SDK Console browser dashboard
    └── index.svg               # Vobiz logo
```

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

**Support:** [support@vobiz.ai](mailto:support@vobiz.ai)  
**Docs:** [https://docs.vobiz.ai](https://docs.vobiz.ai)  
**Console:** [https://console.vobiz.ai](https://console.vobiz.ai)
