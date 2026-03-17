const { VobizResource, VobizResourceInterface } = require('../base');
const { extend, validate } = require('../utils/common');
const clientKey = Symbol();
const action = 'ComplianceDocumentType/';
const idField = 'documentTypeID';
class ComplianceDocumentTypeResponse {
    constructor(params) {
        params = params || {};
        this.apiId = params.apiId;
        this.documentTypeId = params.documentTypeId;
        this.documentName = params.documentName;
        this.description = params.description;
        this.information = params.information;
        this.proofRequired = params.proofRequired;
        this.createdAt = params.createdAt;
    }
}
class ListComplianceDocumentTypeResponse {
    constructor(params) {
        params = params || {};
        this.apiId = params.apiId;
        this.meta = params.meta;
        this.objects = params.objects;
    }
}
class ComplianceDocumentType extends VobizResource {
    constructor(client, data = {}) {
        super(action, ComplianceDocumentType, idField, client);
        if (idField in data) {
            this.id = data[idField];
        }
        this[clientKey] = client;
        extend(this, data);
    }
}

/**
 * Represents a Compliance Document Type interface
 * @constructor
 * @param {function} client - make api call
 * @param {object} [data] - data of call
 */
class ComplianceDocumentTypeInterface extends VobizResourceInterface {

    constructor(client, data = {}) {
        super(action, ComplianceDocumentType, idField, client);
        extend(this, data);
        this[clientKey] = client;
    }

    /**
     * get compliance document types by id
     * @method
     * @param {string} id - id of the compliane document type.
     * @promise {object} return {@link ComplianceDocumentType} object
     * @fail {Error} return Error
     */
    get(id) {
        let params = {}
        params.isVoiceRequest = 'false'
        let client = this[clientKey];

        return new Promise((resolve, reject) => {
            if (action !== '' && !id) {
                reject(new Error(this[idKey] + ' must be set'));
            }

            client('GET', action + (id ? id + '/' : ''))
                .then(response => {
                    resolve(new ComplianceDocumentTypeResponse(response.body, client));
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    /**
     * list compliance document types
     * @method
     * @param {object} params - params to list endusers
     * @param {string} [params.documentTypeID] - Document Type ID of the document id.
     * @param {string} [params.documentName] - Document name of the document if present.
     * @param {string} [params.description] - Description of the document type.
     * @param {string} [params.information] - Information about the document type.
     * @param {string} [params.proofRequired] - Proofs required for the document.
     */
    list(params = {}) {
        let client = this[clientKey];
        return new Promise((resolve, reject) => {
            client('GET', action, params)
                .then(response => {
                    resolve(new ListComplianceDocumentTypeResponse(response.body, client));
                })
                .catch(error => {
                    reject(error);
                });
        });
    }
}

module.exports = {
  ComplianceDocumentTypeResponse,
  ListComplianceDocumentTypeResponse,
  ComplianceDocumentType,
  ComplianceDocumentTypeInterface
};
