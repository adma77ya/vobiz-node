require('dotenv').config();
var Vobiz = require('..');
var client = new Vobiz.Client();

// Search available numbers in inventory for a country
client.numbers.search('IN', { per_page: 3 })
  .then(function(result) {
    console.log("\n============ search (inventory IN) ===========\n", result);
    // List numbers owned by this account
    return client.numbers.list();
  })
  .then(function(result) {
    console.log("\n============ list (owned numbers) ===========\n", result);
    // List raw inventory
    return client.numbers.listInventory({ per_page: 3 });
  })
  .then(function(result) {
    console.log("\n============ listInventory ===========\n", result);
  })
  .catch(function(response) {
    console.log("\n============ Error :: ===========\n", response);
  });
