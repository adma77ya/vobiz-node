var Vobiz = require('..');
var client = new Vobiz.Client();

var listParams = {
  countryIso2: "US",
  numberType: "local",
  endUserType: "individual"
};

client.complianceRequirements.get("some-fake-id")
  .then(function(complianceRequirement) {
    console.log("\n============ Fetch by ID ===========\n", complianceRequirement)
    return client.complianceRequirements.list(listParams);
  })
  .then(function(complianceRequirements) {
    console.log("\n============ list all ===========\n", complianceRequirements)
  })
  .catch(function(response) {
    console.log("\n============ Error :: ===========\n", response);
  });

  