require('dotenv').config();
var Vobiz = require('..');

var authId    = process.env.VOBIZ_AUTH_ID    || '{authId}';
var authToken = process.env.VOBIZ_AUTH_TOKEN || '{authToken}';

// token generation using from epoch and length in seconds
var acctkn = new Vobiz.AccessToken(authId, authToken, '{endpointUsername}', {validFrom: (new Date()).getTime()/1000, lifetime: 300}, '{uid}');

// voice (incoming, outgoing) grants
acctkn.addVoiceGrants(false, true);
console.log(acctkn.toJwt());

// token generation using from epoch and to epoch
acctkn = new Vobiz.AccessToken('{authId}', '{authToken}', '{endpointUsername}', {validFrom: (new Date()).getTime()/1000, validTill: (new Date()).getTime()/1000 + 300}, '{uid}');

// voice (incoming, outgoing) grants
acctkn.addVoiceGrants(true, false);
console.log(acctkn.toJwt());

// token with validity of 24 hours starting now
acctkn = new Vobiz.AccessToken('{authId}', '{authToken}', '{endpointUsername}', {}, '{uid}');

// voice (incoming, outgoing) grants
acctkn.addVoiceGrants(true, true);
console.log(acctkn.toJwt());
