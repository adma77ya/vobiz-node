let Vobiz = require('..');
let client = new Vobiz.Client('', '');

client.lookup.get(
    ""
).then(function(response) {
    console.log(response);
}).catch(function(error) {
    console.log(error);
});
