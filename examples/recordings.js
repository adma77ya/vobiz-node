require('dotenv').config();
var Vobiz = require('..');
var client = new Vobiz.Client();

client.recordings.list()
  .then(function(recordings) {
    console.log("\n============ list ===========\n", recordings)
  })
  .catch(function(response) {
    console.log("\n============ Error :: ===========\n", response);
  });
