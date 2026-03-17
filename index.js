'use strict';

const client = require('./lib/rest/client');
const { AccessToken } = require('./lib/utils/jwt');

module.exports = Object.assign({}, client, { AccessToken });
