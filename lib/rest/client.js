const { Axios } = require('./axios');
const { camelCaseRequestWrapper } = require('./utils');
const { version } = require('../../package.json');
const { Phlo, PhloInterface } = require('../resources/phlo');
const { CallInterface } = require('../resources/call');
const { TokenInterface } = require('../resources/token');
const { SubaccountInterface, AccountInterface: LegacyAccountInterface } = require('../resources/accounts');
const { ApplicationInterface } = require('../resources/applications');
const { ConferenceInterface } = require('../resources/conferences');
const { EndpointInterface } = require('../resources/endpoints');
const { MessageInterface } = require('../resources/messages');
const { LookupInterface } = require('../resources/lookup');
const { PowerpackInterface } = require('../resources/powerpacks');
const { BrandInterface } = require('../resources/brand');
const { CampaignInterface } = require('../resources/campaign');
const { ProfileInterface } = require('../resources/profile');
const { NumberInterface } = require('../resources/numbers');
const { PricingInterface } = require('../resources/pricings');
const { RecordingInterface } = require('../resources/recordings');
const { AccessToken } = require('../utils/jwt');
const { stringify } = require('./../utils/jsonStrinfigier');
const { CallFeedbackInterface } = require('../resources/callFeedback');
const { MediaInterface } = require('../resources/media');
const { EndUserInterface } = require('../resources/endUsers');
const { ComplianceDocumentTypeInterface } = require('../resources/complianceDocumentTypes');
const { ComplianceDocumentInterface} = require('../resources/complianceDocuments');
const { ComplianceRequirementInterface } = require('../resources/complianceRequirements');
const { ComplianceApplicationInterface } = require('../resources/complianceApplications');
const { MultiPartyCallInterface } = require('../resources/multiPartyCall');
const { LOAInterface } = require('../resources/loa');
const { HostedMessagingNumberInterface } = require('../resources/hostedMessagingNumber');
const { SessionInterface } = require('../resources/verify');
const { MaskingSessionInterface } = require('../resources/maskingSession');
const { TollfreeVerificationInterface } = require('../resources/tollfree_verification');
const {VerifyInterface} = require('../resources/verifyCallerId');
const { TrunkInterface } = require('../resources/trunks');
const { CredentialInterface } = require('../resources/credentials');
const { IpAclInterface } = require('../resources/ipAcl');
const { OriginationUriInterface } = require('../resources/originationUris');
const { AccountInterface } = require('../resources/account');
const { SubaccountsInterface } = require('../resources/subaccounts');
const { CdrInterface } = require('../resources/cdr');
exports.AccessToken = function(authId, authToken, username, validity, uid) {
  return new AccessToken(authId, authToken, username, validity, uid);
};

/**
 * Vobiz API client which can be used to access the Vobiz APIs.
 * To set a proxy or timeout, pass in options.proxy (url) or options.timeout (number in ms)
 * You can also pass in additional parameters accepted by the node requests module.
 */
class Client {
  constructor(authId, authToken, options) {
    if (!(this instanceof Client)) {
      return new Client(authId, authToken, options);
    }
    authId = authId || process.env.VOBIZ_AUTH_ID;
    authToken = authToken || process.env.VOBIZ_AUTH_TOKEN;

    if (authId == null) {
      throw new Error("Please provide authId");
    }
    if (authToken == null) {
      throw new Error("Please provide authToken");
    }

    const clientOptions = Object.assign(
      {},
      {
        authId: authId,
        authToken: authToken,
        version: "v1",
        url: "https://api.vobiz.ai/api/v1/account/" + authId,
        userAgent: `${"vobiz-node"}/${version || "Unknown Version"} (Node: ${
          process.version
        })`
      },
      options
    );
    const legacyClientOptions = Object.assign({}, clientOptions, {
      url: "https://api.vobiz.ai/api/v1/Account/" + authId
    });

    let modernClient = camelCaseRequestWrapper(Axios(clientOptions));
    let legacyClient = camelCaseRequestWrapper(Axios(legacyClientOptions));

    this.baseUrl = clientOptions.url;
    this.legacyBaseUrl = legacyClientOptions.url;
    modernClient.baseUrl = this.baseUrl;
    modernClient.legacyBaseUrl = this.legacyBaseUrl;
    legacyClient.baseUrl = this.baseUrl;
    legacyClient.legacyBaseUrl = this.legacyBaseUrl;

    this.calls = new CallInterface(legacyClient);
    this.token = new TokenInterface(modernClient);
    this.accounts = new LegacyAccountInterface(modernClient);
    this.subaccounts = this.subAccounts = new SubaccountsInterface(modernClient);
    this.applications = new ApplicationInterface(legacyClient);
    this.conferences = new ConferenceInterface(legacyClient);
    this.endpoints = new EndpointInterface(legacyClient);
    this.messages = new MessageInterface(legacyClient);
    this.lookup = new LookupInterface(modernClient);
    this.powerpacks = new PowerpackInterface(modernClient);
    this.brand = new BrandInterface(modernClient);
    this.campaign = new CampaignInterface(modernClient);
    this.profile = new ProfileInterface(modernClient);
    this.numbers = new NumberInterface(modernClient);
    this.pricings = new PricingInterface(modernClient);
    this.recordings = new RecordingInterface(legacyClient);
    this.callFeedback = new CallFeedbackInterface(legacyClient);
    this.media = new MediaInterface(modernClient);
    this.endUsers = new EndUserInterface(modernClient);
    this.complianceDocumentTypes = new ComplianceDocumentTypeInterface(modernClient);
    this.complianceDocuments = new ComplianceDocumentInterface(modernClient);
    this.complianceRequirements = new ComplianceRequirementInterface(modernClient);
    this.complianceApplications = new ComplianceApplicationInterface(modernClient);
    this.multiPartyCalls = new MultiPartyCallInterface(legacyClient);
    this.loa = new LOAInterface(modernClient);
    this.hostedMessagingNumber = new HostedMessagingNumberInterface(modernClient);
    this.verify_session = new SessionInterface(legacyClient);
    this.maskingSession = new MaskingSessionInterface(legacyClient);
    this.tollfreeVerification = new TollfreeVerificationInterface(modernClient);
    this.verify = new VerifyInterface(modernClient);
    // Vobiz SIP Trunking resources
    this.trunks = new TrunkInterface(modernClient);
    this.credentials = new CredentialInterface(modernClient);
    this.ipAcl = new IpAclInterface(modernClient);
    this.originationUris = new OriginationUriInterface(modernClient);
    this.account = new AccountInterface(modernClient);
    this.cdr = new CdrInterface(modernClient);
  }

  toJSON() {
    // return "hello..";
    return stringify.apply(arguments);
  }
}

/**
 * Vobiz API client which can be used to access the Vobiz APIs.
 * To set a proxy or timeout, pass in options.proxy (url) or options.timeout (number in ms)
 * You can also pass in additional parameters accepted by the node requests module.
 */
class PhloClient {
  constructor(authId, authToken, options) {
    if (!(this instanceof PhloClient)) {
      return new PhloClient(authId, authToken, options);
    }
    authId = authId || process.env.VOBIZ_AUTH_ID;
    authToken = authToken || process.env.VOBIZ_AUTH_TOKEN;

    if (authId == null) {
      throw new Error("Please provide authId");
    }
    if (authToken == null) {
      throw new Error("Please provide authToken");
    }

    options = Object.assign(
      {},
      {
        authId: authId,
        authToken: authToken,
        version: "v1",
        url: "https://phlorunner.vobiz.ai/v1",
        userAgent: `${"vobiz-node"}/${version || "Unknown Version"} (Node: ${
          process.version
        })`
      },
      options
    );

    let client = camelCaseRequestWrapper(Axios(options));

    this.phlo = function(phloId) {
      let dd = new Phlo(client, { phloId: phloId, authId: authId });
      return dd;
    };

    this.phlo.get = function(phloId) {
      return new Promise((resolve, reject) => {
        let dd = new PhloInterface(client);
        dd.get(phloId)
          .then(function(data) {
            data.authId = authId;
            resolve(data);
          })
          .catch(function(err) {
            reject(err);
          });
      });
    };
  }
}

module.exports = {
  Client,
  PhloClient
};
