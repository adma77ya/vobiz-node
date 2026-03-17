var Vobiz = require('..');
var client = new Vobiz.Client();

var appId;

// Create an application
client.applications.create('MyApp-' + Date.now(), {
  answerUrl:    'https://example.com/answer',
  hangupUrl:    'https://example.com/hangup',
  answerMethod: 'POST'
})
  .then(function(app) {
    console.log("\n============ created ===========\n", app);
    appId = app.appId;
    return client.applications.update(appId, {
      answerUrl: 'https://example.com/new-answer'
    });
  })
  .then(function(app) {
    console.log("\n============ updated ===========\n", app);
    return client.applications.get(appId);
  })
  .then(function(app) {
    console.log("\n============ get ===========\n", app);
    return client.applications.delete(appId);
  })
  .then(function(result) {
    console.log("\n============ deleted ===========\n", result);
    return client.applications.list({ limit: 10, offset: 0 });
  })
  .then(function(apps) {
    console.log("\n============ list all ===========\n", apps);
  })
  .catch(function(err) {
    console.log("\n============ Error ===========\n", err.message);
  });
