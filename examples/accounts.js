var Vobiz = require('..');
var client = new Vobiz.Client();

var name;
//================== Accounts =============
client.accounts.get()
  .then(function(account) {
    console.log("\n============ Account Detail ===========\n", account)
    name = account.name;
    return account.update({
      name: 'newName'
    })
  })
  .then(function(account) {
    console.log("\n============ updated ===========\n", account)
    return account.update({
      name
    })
  })
  .then(function(account) {
    console.log("\n============ original ===========\n", account)
  })
  .catch(function(response) {
    console.log("\n============ Error :: ===========\n", response, response.message);
  });
