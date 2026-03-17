'use strict';

const { Axios }                   = require('./axios');
const { camelCaseRequestWrapper } = require('./utils');
const { version }                 = require('../../package.json');
const { AccessToken }             = require('../utils/jwt');
const { stringify }               = require('./../utils/jsonStrinfigier');

// ── Voice & Calls ──────────────────────────────────────────────────────────────
const { CallInterface }           = require('../resources/call');
const { RecordingInterface }      = require('../resources/recordings');
const { ConferenceInterface }     = require('../resources/conferences');
const { CdrInterface }            = require('../resources/cdr');

// ── Numbers & Routing ─────────────────────────────────────────────────────────
const { NumberInterface }         = require('../resources/numbers');
const { EndpointInterface }       = require('../resources/endpoints');
const { ApplicationInterface }    = require('../resources/applications');

// ── SIP Trunking ──────────────────────────────────────────────────────────────
const { TrunkInterface }          = require('../resources/trunks');
const { CredentialInterface }     = require('../resources/credentials');
const { IpAclInterface }          = require('../resources/ipAcl');
const { OriginationUriInterface } = require('../resources/originationUris');

// ── Account & Sub-accounts ────────────────────────────────────────────────────
const { AccountInterface }        = require('../resources/account');
const { SubaccountsInterface }    = require('../resources/subaccounts');
const { BalanceInterface }        = require('../resources/balance');

exports.AccessToken = function(authId, authToken, username, validity, uid) {
  return new AccessToken(authId, authToken, username, validity, uid);
};

/**
 * Vobiz API client.
 *
 * @param {string} authId    - Your Vobiz Auth ID (or set VOBIZ_AUTH_ID env var)
 * @param {string} authToken - Your Vobiz Auth Token (or set VOBIZ_AUTH_TOKEN env var)
 * @param {object} [options] - Optional: proxy, timeout, etc.
 */
class Client {
  constructor(authId, authToken, options) {
    if (!(this instanceof Client)) {
      return new Client(authId, authToken, options);
    }

    authId    = authId    || process.env.VOBIZ_AUTH_ID;
    authToken = authToken || process.env.VOBIZ_AUTH_TOKEN;

    if (!authId)    throw new Error('Vobiz: authId is required (or set VOBIZ_AUTH_ID)');
    if (!authToken) throw new Error('Vobiz: authToken is required (or set VOBIZ_AUTH_TOKEN)');

    const baseOptions = Object.assign({}, {
      authId,
      authToken,
      version:   'v1',
      url:       `https://api.vobiz.ai/api/v1/account/${authId}`,
      userAgent: `vobiz-node/${version || 'unknown'} (Node: ${process.version})`,
    }, options);

    // Legacy URL uses capital Account/ (for voice/legacy endpoints)
    const legacyOptions = Object.assign({}, baseOptions, {
      url: `https://api.vobiz.ai/api/v1/Account/${authId}`,
    });

    const modernClient = camelCaseRequestWrapper(Axios(baseOptions));
    const legacyClient = camelCaseRequestWrapper(Axios(legacyOptions));

    // Make base URLs accessible on clients (used by some resources)
    modernClient.baseUrl       = baseOptions.url;
    modernClient.legacyBaseUrl = legacyOptions.url;
    legacyClient.baseUrl       = baseOptions.url;
    legacyClient.legacyBaseUrl = legacyOptions.url;

    this.baseUrl       = baseOptions.url;
    this.legacyBaseUrl = legacyOptions.url;

    // ── Voice & Calls ──────────────────────────────────────────────────────────
    this.calls        = new CallInterface(legacyClient);
    this.recordings   = new RecordingInterface(legacyClient);
    this.conferences  = new ConferenceInterface(legacyClient);
    this.cdr          = new CdrInterface(modernClient);

    // ── Numbers & Routing ──────────────────────────────────────────────────────
    this.numbers      = new NumberInterface(modernClient);
    this.endpoints    = new EndpointInterface(legacyClient);
    this.applications = new ApplicationInterface(legacyClient);

    // ── SIP Trunking ───────────────────────────────────────────────────────────
    this.trunks           = new TrunkInterface(modernClient);
    this.credentials      = new CredentialInterface(modernClient);
    this.ipAcl            = new IpAclInterface(modernClient);
    this.originationUris  = new OriginationUriInterface(modernClient);

    // ── Account & Sub-accounts ─────────────────────────────────────────────────
    this.account     = new AccountInterface(modernClient);
    this.subaccounts = new SubaccountsInterface(modernClient);
    this.balance     = new BalanceInterface(modernClient);
  }

  toJSON() {
    return stringify.apply(arguments);
  }
}

module.exports = { Client };
