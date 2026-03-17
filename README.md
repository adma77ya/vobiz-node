# Vobiz Node.js SDK

Official Node.js SDK for Vobiz APIs.  
This SDK enables seamless integration of communication features such as voice calls, messaging, SIP endpoints, and subaccount management into your Node.js applications.

---

## Installation

Install the SDK using npm:

```bash
npm install vobiz-node
```

If upgrading from an older version, uninstall the previous package first.

---

## Getting Started

### Authentication

To make API requests, initialize a `Client` with your credentials.

We recommend storing credentials as environment variables:

```bash
export VOBIZ_AUTH_ID=<your_auth_id>
export VOBIZ_AUTH_TOKEN=<your_auth_token>
```

Initialize the client:

```js
const vobiz = require("vobiz-node");
const client = new vobiz.Client();
```

Or pass credentials manually:

```js
const vobiz = require("vobiz-node");

const client = new vobiz.Client("<auth_id>", "<auth_token>");
```

All API requests use:

- `X-Auth-ID`
- `X-Auth-Token`

---

## Core Concepts

The SDK follows a consistent interface across all resources:

```js
client.resource.create(params);
client.resource.get(id);
client.resource.update(id, params);
client.resource.delete(id);
client.resource.list({ limit, offset });
```

**Pagination:**

- Default limit: `20`
- Use `offset` for pagination

---

## Examples

### List SIP Endpoints

```js
const vobiz = require("vobiz-node");
const client = new vobiz.Client("<auth_id>", "<auth_token>");

client.endpoints
  .list({ limit: 10, offset: 0 })
  .then((response) => console.log(response))
  .catch((error) => console.error(error));
```

---

### Create a Subaccount

```js
client.subaccounts
  .create({
    name: "Support Team",
    description: "Handles customer support",
    permissions: {
      calls: true,
      cdr: true,
    },
  })
  .then((response) => console.log(response))
  .catch((error) => console.error(error));
```

---

### Retrieve a Subaccount

```js
client.subaccounts
  .get("SA_xxxxxxxx")
  .then((response) => console.log(response))
  .catch((error) => console.error(error));
```

---

### Update a Subaccount

```js
client.subaccounts
  .update("SA_xxxxxxxx", {
    name: "Updated Name",
    is_active: true,
  })
  .then((response) => console.log(response))
  .catch((error) => console.error(error));
```

---

### Delete a Subaccount

```js
client.subaccounts
  .delete("SA_xxxxxxxx")
  .then((response) => console.log(response))
  .catch((error) => console.error(error));
```

---

### Make a Call

```js
client.calls
  .create({
    from: "+1234567890",
    to: "+1987654321",
    answer_url: "https://example.com/answer",
  })
  .then((response) => console.log(response))
  .catch((error) => console.error(error));
```

---

### Send a Message

```js
client.messages
  .create({
    src: "+1234567890",
    dst: "+1987654321",
    text: "Hello from Vobiz!",
  })
  .then((response) => console.log(response))
  .catch((error) => console.error(error));
```

---

### Lookup a Number

```js
client.lookup
  .get("+1234567890")
  .then((response) => console.log(response))
  .catch((error) => console.error(error));
```

---

## Error Handling

All SDK methods return Promises:

```js
client.endpoints
  .list()
  .then((response) => {
    console.log(response);
  })
  .catch((error) => {
    console.error(error);
  });
```

---

## Features

- Voice call APIs
- Messaging APIs (SMS / WhatsApp)
- SIP Endpoint management
- Subaccount management
- Call control
- Consistent REST interface

---

## Notes

- Pagination is handled using `limit` and `offset`
- Default limit is `20`
- All requests are authenticated via headers

---

## License

MIT License
