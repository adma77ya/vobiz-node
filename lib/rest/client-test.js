const { Request } = require('./request-test');
const { CallInterface } = require('../resources/call');
const { TokenInterface } = require('../resources/token');
const { version } = require('../../package.json');
const { Phlo, PhloInterface } = require('../resources/phlo');
const { AccountInterface, SubaccountInterface } = require('../resources/accounts');
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
const { camelCaseRequestWrapper } = require('./utils');
const { MediaInterface } = require('../resources/media');
const {MultiPartyCallInterface} = require('../resources/multiPartyCall');
const { EndUserInterface } = require('../resources/endUsers');
const { ComplianceDocumentTypeInterface } = require('../resources/complianceDocumentTypes');
const { ComplianceDocumentInterface} = require('../resources/complianceDocuments');
const { ComplianceRequirementInterface } = require('../resources/complianceRequirements');
const { ComplianceApplicationInterface } = require('../resources/complianceApplications');
const { LOAInterface } = require('../resources/loa');
const { HostedMessagingNumberInterface } = require('../resources/hostedMessagingNumber');
const {SessionInterface} = require('../resources/verify');
const { MaskingSessionInterface } = require('../resources/maskingSession');
const { TollfreeVerificationInterface } = require('../resources/tollfree_verification');
const {VerifyInterface} = require('../resources/verifyCallerId');
class Client {
  constructor(authId, authToken, proxy) {
    if (!(this instanceof Client)) {
      return new Client(authId, authToken, proxy);
    }
    authId = authId || process.env.VOBIZ_AUTH_ID;
    authToken = authToken || process.env.VOBIZ_AUTH_TOKEN;

    if (typeof authId === 'undefined') {
      throw 'Please provide authId';
    }
    if (typeof authToken === 'undefined') {
      throw 'Please provide authToken';
    }

    let options = {
      authId: authId,
      authToken: authToken,
      version: 'v1',
      url: 'https://api.vobiz.ai/api/v1/Account/' + authId,
      userAgent: 'NodeVobiz'
    };
    if (typeof proxy !== 'undefined') {
      options.proxy = proxy;
    }

    let client = camelCaseRequestWrapper(Request(options));

    this.calls = new CallInterface(client);
    this.token = new TokenInterface(client);
    this.accounts = new AccountInterface(client);
    this.subAccounts = new SubaccountInterface(client);
    this.applications = new ApplicationInterface(client);
    this.conferences = new ConferenceInterface(client);
    this.endpoints = new EndpointInterface(client);
    this.messages = new MessageInterface(client);
    this.brand = new BrandInterface(client);
    this.campaign = new CampaignInterface(client);
    this.profile = new ProfileInterface(client);
    this.lookup = new LookupInterface(client);
    this.powerpacks = new PowerpackInterface(client);
    this.numbers = new NumberInterface(client);
    this.pricings = new PricingInterface(client);
    this.recordings = new RecordingInterface(client);
    this.media = new MediaInterface(client);
    this.endUsers = new EndUserInterface(client);
    this.complianceDocumentTypes = new ComplianceDocumentTypeInterface(client);
    this.complianceDocuments = new ComplianceDocumentInterface(client);
    this.complianceRequirements = new ComplianceRequirementInterface(client);
    this.complianceApplications = new ComplianceApplicationInterface(client);
    this.multiPartyCalls = new MultiPartyCallInterface(client);
    this.loa = new LOAInterface(client);
    this.hostedMessagingNumber = new HostedMessagingNumberInterface(client);
    this.verify_session = new SessionInterface(client);
    this.maskingSession = new MaskingSessionInterface(client);
    this.tollfreeVerification = new TollfreeVerificationInterface(client)
    this.verify = new VerifyInterface(client);
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
      throw (new Error('Please provide authId'));
    }
    if (authToken == null) {
      throw (new Error('Please provide authToken'));
    }

    options = Object.assign({}, {
      authId: authId,
      authToken: authToken,
      version: 'v1',
      url: 'https://phlorunner.vobiz.ai/v1',
      userAgent: `${'vobiz-node'}/${version || 'Unknown Version'} (Node: ${process.version})`,
    }, options);

    let client = camelCaseRequestWrapper(Request(options));


    this.phlo = function (phloId) {
      let dd = new Phlo(client, {
        phloId: phloId,
        authId: authId
      });
      return dd;
    };

    this.phlo.get = function (phloId) {
      return new Promise((resolve, reject) => {
        let dd = new PhloInterface(client);
        dd.get(phloId).then(function (data) {
          data.authId = authId;
          resolve(data);
        }).catch(function (err) {
          reject(err);
        });
      });
    }

  }
}

module.exports = {
  Client,
  PhloClient
};
