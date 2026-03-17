const { VobizResource, VobizResourceInterface } = require('../base');
const { extend, validate } = require('../utils/common');
const clientKey = Symbol();
const action = 'Phlo/';
const idField = 'phloUuid';

/**
 * Represents a Multiparty Call Member
 * @constructor
 * @param {function} client - make api call
 * @param {object} [data] - data of phlo
 */
class UpdateMemberResponse {
    constructor(params) {
        params = params || {};
        this.apiId = params.apiId;
        this.error = params.error;
    }
}
class PhloMultiPartyCallMember extends VobizResource {

    constructor(client, data = {}) {
        let action = 'phlo/' + data.phloId + '/multi_party_call/' + data.nodeId + '/members/';
        super(action, PhloMultiPartyCallMember, idField, client);
        extend(this, data);
        this.action = action;
        this.client = client;
    }

    resumeCall() {
        return this.update('resume_call');
    }

    voicemailDrop() {
        return this.update('voicemail_drop');
    }

    hangup() {
        return this.update('hangup');
    }

    hold() {
        return this.update('hold');
    }

    unhold() {
        return this.update('unhold');
    }

    update(action) {

        let params = {
            action: action
        };

        // Build Url
        // https://phlorunner.vobiz.com/v1/phlo/{PHLO_ID}/multi_party_call/{NODE_ID}/members/{MemberAddress}
        let task = this.action + this.memberAddress;

        let client = this[clientKey];
        return new Promise((resolve, reject) => {
            client('POST', task, params)
                .then(response => {
                    resolve(new UpdateMemberResponse(response.body, idField));
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

}
class PhloMultiPartyCallMemberInterface extends VobizResourceInterface {


    constructor(client, data = {}) {
        let action = 'phlo/' + data.phloId + '/multi_party_call/' + data.nodeId + '/members/';
        super(action, PhloMultiPartyCallMember, idField, client);
        extend(this, data);
        this.action = action;
        this.client = client;
    }

    get(phloId, nodeId, memberAddress) {

        //Validate  memberAddress first
        let errors = validate([{
            field: 'memberAddress',
            value: memberAddress,
            validators: ['isRequired']
        }]);
        if (errors) {
            return errors;
        }

        return new PhloMultiPartyCallMember(this.client, {
            phloId: phloId,
            nodeId: nodeId,
            memberAddress: memberAddress
        });

    }
}

module.exports = {
  UpdateMemberResponse,
  PhloMultiPartyCallMember,
  PhloMultiPartyCallMemberInterface
};
