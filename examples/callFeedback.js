var Vobiz = require('..');
var client = new Vobiz.Client();

client.callFeedback.create('call_uuid', 4, ["ISSUE"], "User Feedback").then(function(call_feedback) {
  console.log("\n============ send feedback ===========\n", call_feedback)
})
.catch(function(response) {
  console.log("\n============ Error :: ===========\n", response);
});