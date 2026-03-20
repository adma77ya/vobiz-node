# vobiz-node Beginner Guide

This guide helps you get started quickly with the Vobiz Node.js SDK.

## 1) What you can do with this SDK

- Make and control calls
- Send and fetch messages
- Manage SIP trunks, credentials, IP ACL, origination URIs
- Work with numbers, recordings, conferences
- Retrieve CDR data
- Build Vobiz XML responses

Main package docs and full API reference: [README.md](README.md)

## 2) Prerequisites

- Node.js v14+
- Vobiz `Auth ID` and `Auth Token`

## 3) Install

```bash
npm install vobiz-node
```

## 4) Initialize client

```js
const { Client } = require('vobiz-node');

const client = new Client('YOUR_AUTH_ID', 'YOUR_AUTH_TOKEN');
```

Or use environment variables:

```bash
export VOBIZ_AUTH_ID=YOUR_AUTH_ID
export VOBIZ_AUTH_TOKEN=YOUR_AUTH_TOKEN
```

```js
const { Client } = require('vobiz-node');
const client = new Client();
```

## 5) First useful operations

### Make a call

```js
const call = await client.calls.create(
  '+14155551234',
  '+14155555678',
  'https://example.com/answer'
);
```

### Send an SMS

```js
const msg = await client.messages.create({
  src: '+14155551234',
  dst: '+14155555678',
  text: 'Hello from vobiz-node'
});
```

### Read CDRs

```js
const cdr = await client.cdr.get({ limit: 10, offset: 0 });
```

## 6) Error handling pattern

```js
try {
  const data = await client.lookup.get('+14155550100', { type: 'carrier' });
} catch (err) {
  // log + handle
}
```

## 7) Run tests in this repo

```bash
npm test
```

This project includes integration-style SDK checks in [test-sdk.js](test-sdk.js).

## 8) Where to learn next

- Full API and examples: [README.md](README.md)
- Usage examples folder: [examples](examples)
- Browser SDK console UI: see README section "SDK Console"

## 9) Common beginner mistakes

- Not setting auth env vars before running scripts
- Using numbers in the wrong format
- Forgetting webhooks/answer URL must be publicly reachable in live call flows
- Not wrapping async calls in `try/catch`
