require('dotenv').config();
var Vobiz = require('..');
var client = new Vobiz.Client();

var endpointId;

// Create a SIP endpoint (username must be alphanumeric only)
client.endpoints.create('sdktest' + Date.now(), 'SecurePass123!', 'Test Endpoint')
  .then(function(endpoint) {
    console.log("\n============ created ===========\n", endpoint);
    endpointId = endpoint.endpointId;
    return client.endpoints.update(endpointId, {
      alias: 'Updated Alias',
      password: 'NewPass456!'
    });
  })
  .then(function(endpoint) {
    console.log("\n============ updated ===========\n", endpoint);
    return client.endpoints.get(endpointId);
  })
  .then(function(endpoint) {
    console.log("\n============ get ===========\n", endpoint);
    return client.endpoints.delete(endpointId);
  })
  .then(function(result) {
    console.log("\n============ deleted ===========\n", result);
    return client.endpoints.list();
  })
  .then(function(endpoints) {
    console.log("\n============ list all ===========\n", endpoints);
  })
  .catch(function(err) {
    console.log("\n============ Error ===========\n", err.message);
  });
