require('dotenv').config();
var Vobiz = require('..');
var client = new Vobiz.Client();

// Make an outbound call — replace with real numbers and a URL that returns VobizXML
client.calls.create(
  process.env.FROM_NUMBER || '+911171366914',   // from
  process.env.TO_NUMBER   || '+919148227303',   // to
  'https://yourserver.com/answer'               // answerUrl — must return VobizXML
)
  .then(function(call) {
    console.log("\n============ call created ===========\n", call);
    console.log("requestUuid:", call.requestUuid);

    // Hang up using the request UUID (same as CallUUID in Vobiz)
    return client.calls.hangup(call.requestUuid);
  })
  .then(function(result) {
    console.log("\n============ hung up ===========\n", result);
  })
  .catch(function(err) {
    console.log("\n============ Error ===========\n", err.message);
  });
