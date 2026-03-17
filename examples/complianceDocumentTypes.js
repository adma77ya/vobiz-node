var Vobiz = require('..');
var client = new Vobiz.Client();

var listParams = {
  documentName: "Test",
  proofRequired: "passport"
};

client.complianceDocumentTypes.get("some-fake-id")
  .then(function(complianceDocumentType) {
    console.log("\n============ Fetch by ID ===========\n", complianceDocumentType)
    return client.complianceDocumentTypes.list(listParams);
  })
  .then(function(complianceDocumentTypes) {
    console.log("\n============ list all ===========\n", complianceDocumentTypes)
  })
  .catch(function(response) {
    console.log("\n============ Error :: ===========\n", response);
  });

  