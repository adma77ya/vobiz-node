require('dotenv').config();
var Vobiz = require('..');
var client = new Vobiz.Client();

// Get account details
client.account.get()
  .then(function(account) {
    console.log("\n============ Account Detail ===========\n", account);
  })
  .catch(function(err) {
    console.log("\n============ Error ===========\n", err.message);
  });
