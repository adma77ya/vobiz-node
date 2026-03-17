var Vobiz = require('..');
var client = new Vobiz.Client();

var subAccountId;

// Create a sub-account
client.subaccounts.create({
  name:     'Test Sub-account ' + Date.now(),
  email:    'subtest@example.com',
  password: 'SecurePass123!'
})
  .then(function(response) {
    console.log("\n============ created ===========\n", response);
    subAccountId = response.id || response.auth_id;
    return client.subaccounts.get(subAccountId);
  })
  .then(function(response) {
    console.log("\n============ get ===========\n", response);
    return client.subaccounts.update(subAccountId, { name: 'Updated Sub-account' });
  })
  .then(function(response) {
    console.log("\n============ updated ===========\n", response);
    return client.subaccounts.delete(subAccountId);
  })
  .then(function(response) {
    console.log("\n============ deleted ===========\n", response);
    return client.subaccounts.list();
  })
  .then(function(response) {
    console.log("\n============ list all ===========\n", response);
  })
  .catch(function(err) {
    console.log("\n============ Error ===========\n", err.message);
  });
