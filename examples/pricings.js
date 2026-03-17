var Vobiz = require('..');
var client = new Vobiz.Client();

client.pricings.get('US')
  .then(function(price) {
    console.log("\n============ get ===========\n", price)
  })
  .catch(function(response) {
    console.log("\n============ Error :: ===========\n", response);
  });
