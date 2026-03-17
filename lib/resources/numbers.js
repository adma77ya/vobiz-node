const { VobizGenericResponse, VobizResource, VobizResourceInterface } = require('../base');
const { extend, validate } = require('../utils/common');
const clientKey = Symbol();
const action = 'Number/';
const idField = 'number';
class BuyNumberResponse {
    constructor(params, statusCode) {
        params = params || {};
        this.apiId = params.apiId;
        this.numbers = params.numbers;
        this.status = params.status;
        this.message = params.message;
        if (params.fallbackNumber !== undefined) {
            this.fallbackNumber = params.fallbackNumber;
        }
        this.statusCode = statusCode;
    }
}
class SearchNumberResponse {
    constructor(params) {
        params = params || {};
        this.number = params.number;
        this.prefix = params.prefix;
        this.city = params.city;
        this.country = params.country;
        this.region = params.region;
        this.rate_center = params.rate_center;
        this.lata = params.lata;
        this.type = params.type;
        this.sub_type = params.sub_type;
        this.setup_rate = params.setup_rate;
        this.monthly_rental_rate = params.monthly_rental_rate;
        this.sms_enabled = params.sms_enabled;
        this.sms_rate = params.sms_rate;
        this.voice_enabled = params.voice_enabled;
        this.voice_rate = params.voice_rate;
        this.restriction = params.restriction;
        this.restriction_text = params.restriction_text;
        this.resource_uri = params.resource_uri;
    }
}
class UpdateNumberResponse {
    constructor(params) {
        params = params || {};
        this.apiId = params.apiId;
        this.message = params.message;
    }
}

/**
 * Represents a PhoneNumber
 * @constructor
 * @param {function} client - make api call
 * @param {object} [data] - data of call
 */
class PhoneNumber extends VobizResource {
    constructor(client, data = {}) {
        super('PhoneNumber/', PhoneNumber, idField, client);

        if (idField in data) {
            this.id = data[idField];
        }

        extend(this, data);
        this[clientKey] = client;
    }

    /**
     * Buy Phone Number
     * @method
     * @param {string} appId - app id
     * @param {string} cnamLookup - cnam lookup
     * @param {boolean} haEnable - enable HA Number
     * @promise {@link VobizGenericResponse} return VobizGenericResponse Object if success
     * @fail {Error} return Error
     */
    buy(number, appId, cnamLookup, haEnable) {
        return new PhoneNumberInterface(this[clientKey], {
            id: this.id
        }).buy(number, appId, cnamLookup, haEnable);
    }
}

/**
 * Represents a PhoneNumbers Interface
 * @constructor
 * @param {function} client - make api call
 * @param {object} [data] - data of call
 * @param {string} [data.test] - test data
 */
class PhoneNumberInterface extends VobizResourceInterface {
    constructor(client, data = {}) {
        super('PhoneNumber/', PhoneNumber, idField, client);

        extend(this, data);
        this[clientKey] = client;
    }

    /**
     * Buy Phone Number
     * @method
     * @param {string} appId - app id
     * @param {string} cnamLookup - cnam lookup
     * @param {boolean} haEnable - enable HA Number
     * @promise {@link VobizGenericResponse} return VobizGenericResponse Object if success
     * @fail {Error} return Error
     */
    buy(number, appId, cnamLookup, haEnable) {
        let params = {};
        if (appId) {
            params.app_id = appId;
        }
        if (cnamLookup) {
            params.cnam_lookup = cnamLookup;
        }
        if (haEnable !== undefined) {
            params.ha_enable = haEnable;
        }
        let client = this[clientKey];

        return new Promise((resolve, reject) => {
            client('POST', 'PhoneNumber/' + number + '/', params)
                .then(response => {
                    resolve(new BuyNumberResponse(response.body, response.response.status, idField));
                })
                .catch(error => {
                    reject(error);
                });
        });
    }
}

/**
 * Represents a Number
 * @constructor
 * @param {function} client - make api call
 * @param {object} [data] - data of call
 */
class NumberResource extends VobizResource {
    constructor(client, data = {}) {
        super(action, NumberResource, idField, client);

        if (idField in data) {
            this.id = data[idField];
        }
        extend(this, data);
        this[clientKey] = client;
    }

    /**
     * Unrent Number
     * @method
     * @promise {boolean} return true if success
     * @fail {Error} return Error
     */
    unrent(number) {
        let client = this[clientKey];
        let action = 'Number/';
        return new Promise((resolve, reject) => {
            client('DELETE', action + number + '/')
                .then(() => {
                    resolve(true);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    /**
     * Update Number
     * @method
     * @param {object} params
     * @param {string} [params.appId] - app id
     * @param {string} [params.subAccount] - auth_id of subaccount
     * @param {string} [params.alias] - textual name of number
     * @param {string} [params.cnamLookup] - cnam lookup of number
     * @promise {@link NumberResource} return NumberResource Object if success
     * @fail {Error} return Error
     */
    update(number, params) {
        let client = this[clientKey];
        let action = 'Number/';
        let that = this;

        // Handle subAccount parameter specifically for numbers update API
        let apiParams = Object.assign({}, params);
        if (apiParams.subAccount) {
            apiParams.subaccount = apiParams.subAccount;
            delete apiParams.subAccount;
        }

        return new Promise((resolve, reject) => {
            client('POST', action + number + '/', apiParams)
                .then(response => {
                    extend(that, response.body);
                    if (params.hasOwnProperty('isVoiceRequest')) {
                        delete params.isVoiceRequest;
                    }
                    extend(that, params);
                    resolve(new UpdateNumberResponse(that));
                })
                .catch(error => {
                    reject(error);
                });
        });

    }

}

/**
 * Represents a Numbers
 * @constructor
 * @param {function} client - make api call
 * @param {object} [data] - data of call
 */
class NumberInterface extends VobizResourceInterface {

    constructor(client) {
        super(action, NumberResource, idField, client);
        this[clientKey] = client;
    }

    /**
     * List all phone numbers owned by this account.
     * GET /api/v1/account/{id}/numbers
     * @param {object} [params] - page, per_page, include_subaccounts
     */
    list(params = {}) {
        const client = this[clientKey];
        const base = (client.baseUrl || '').replace(/\/+$/, '');
        return new Promise((resolve, reject) => {
            client('GET', 'numbers', Object.assign({}, params, { override_url: base + '/numbers' }))
                .then(r => resolve(r.body))
                .catch(reject);
        });
    }

    /**
     * List available numbers in inventory (not assigned to any account).
     * GET /api/v1/account/{id}/inventory/numbers
     * @param {object} [params] - country, region, page, per_page
     */
    listInventory(params = {}) {
        const client = this[clientKey];
        const base = (client.baseUrl || '').replace(/\/+$/, '');
        return new Promise((resolve, reject) => {
            client('GET', 'inventory/numbers', Object.assign({}, params, { override_url: base + '/inventory/numbers' }))
                .then(r => resolve(r.body))
                .catch(reject);
        });
    }

    /**
     * Purchase a number from inventory.
     * POST /api/v1/account/{id}/numbers/purchase-from-inventory
     * @param {string} e164 - E.164 number (e.g. +919876543210)
     * @param {string} [currency='INR']
     */
    purchaseFromInventory(e164, currency = 'INR') {
        if (!e164) return Promise.reject(new Error('e164 is required'));
        const client = this[clientKey];
        const base = (client.baseUrl || '').replace(/\/+$/, '');
        return new Promise((resolve, reject) => {
            client('POST', 'numbers/purchase-from-inventory', {
                override_url: base + '/numbers/purchase-from-inventory',
                e164,
                currency,
            })
                .then(r => resolve(r.body))
                .catch(reject);
        });
    }

    /**
     * Link a number to an application.
     * POST /api/v1/account/{id}/numbers/{number}/application
     */
    linkApplication(number, applicationId) {
        if (!number) return Promise.reject(new Error('number is required'));
        if (!applicationId) return Promise.reject(new Error('applicationId is required'));
        const client = this[clientKey];
        const base = (client.baseUrl || '').replace(/\/+$/, '');
        const enc = encodeURIComponent(number);
        return new Promise((resolve, reject) => {
            client('POST', `numbers/${enc}/application`, {
                override_url: `${base}/numbers/${enc}/application`,
                application_id: applicationId,
            })
                .then(r => resolve(r.body))
                .catch(reject);
        });
    }

    /**
     * Unlink a number from its application.
     * DELETE /api/v1/account/{id}/numbers/{number}/application
     */
    unlinkApplication(number) {
        if (!number) return Promise.reject(new Error('number is required'));
        const client = this[clientKey];
        const base = (client.baseUrl || '').replace(/\/+$/, '');
        const enc = encodeURIComponent(number);
        return new Promise((resolve, reject) => {
            client('DELETE', `numbers/${enc}/application`, {
                override_url: `${base}/numbers/${enc}/application`,
            })
                .then(r => resolve(r.body))
                .catch(reject);
        });
    }

    /**
     * Buy Phone Number
     * @method
     * @param {string} number - number to buy
     * @param {string} appId - app id
     * @param {string} cnamLookup - cnam lookup
     * @param {boolean} haEnable - enable HA Number
     * @promise {@link VobizGenericResponse} return VobizGenericResponse Object if success
     * @fail {Error} return Error
     */
    buy(number, appId, cnamLookup, haEnable) {
        let errors = validate([{
            field: 'number',
            value: number,
            validators: ['isRequired']
        }]);

        if (errors) {
            return errors;
        }
        return new PhoneNumber(this[clientKey], {
            id: number
        }).buy(number, appId, cnamLookup, haEnable);
    }

    get(number) {
        let errors = validate([{
            field: 'number',
            value: number,
            validators: ['isRequired']
        }]);

        if (errors) {
            return errors;
        }

        let client = this[clientKey];
        return new Promise((resolve, reject) => {
            client('GET', action + number + '/')
                .then(response => {
                    resolve(response.body);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    list(params = {}) {
        let client = this[clientKey];
        return new Promise((resolve, reject) => {
            client('GET', action, params)
                .then(response => {
                    resolve(response.body);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    /**
     * Add own number from carrier
     * @method
     * @param {string} numbers - A comma separated list of numbers that need to be added for the carrier.
     * @param {string} carrier - The carrier_id of the IncomingCarrier that the number is associated with.
     * @param {string} region - region that is associated with the Number
     * @param {string} optionaParams - optional params
     * @promise {@link VobizGenericResponse} return VobizGenericResponse Object if success
     * @fail {Error} return Error
     */
    addOwnNumber(numbers, carrier, region, optionalParams) {
        let errors = validate([{
            field: 'numbers',
            value: numbers,
            validators: ['isRequired']
        },
        {
            field: 'carrier',
            value: carrier,
            validators: ['isRequired']
        },
        {
            field: 'region',
            value: region,
            validators: ['isRequired']
        }
        ]);

        if (errors) {
            return errors;
        }
        let params = optionalParams || {};

        params.numbers = numbers;
        params.carrier = carrier;
        params.region = region;

        let client = this[clientKey];
        return new Promise((resolve, reject) => {
            client('POST', action, params)
                .then(response => {
                    resolve(new VobizGenericResponse(response.body, idField));
                })
                .catch(error => {
                    reject(error);
                });
        })
    }

    /**
     * Search available numbers in inventory by country.
     * GET /api/v1/account/{id}/inventory/numbers?country=XX
     * @param {string} countryISO - 2-letter country code (e.g. 'IN', 'US')
     * @param {object} [optionalParams] - region, page, per_page, etc.
     */
    search(countryISO, optionalParams) {
        let errors = validate([{
            field: 'country_iso',
            value: countryISO,
            validators: ['isRequired']
        }]);

        if (errors) {
            return errors;
        }

        const params = Object.assign({}, optionalParams || {}, { country: countryISO });
        return this.listInventory(params);
    }

    /**
     * Update Number
     * @method
     * @param {string} number - number to update
     * @param {object} params
     * @param {string} [params.appId] - app id
     * @param {string} [params.subAccount] - auth_id of subaccount
     * @param {string} [params.alias] - textual name of number
     * @param {string} [params.cnamLookup] - cnam lookup of number
     * @promise {@link NumberResource} return NumberResource Object if success
     * @fail {Error} return Error
     */
    update(number, params) {
        let errors = validate([{
            field: 'number',
            value: number,
            validators: ['isRequired']
        }]);

        if (errors) {
            return errors;
        }
        return new NumberResource(this[clientKey], {
            id: number
        }).update(number, params);
    }

    /**
     * Release (unrent) a number back to inventory.
     * DELETE /api/v1/account/{id}/numbers/{e164}
     * @param {string} number - E.164 number
     */
    unrent(number) {
        let errors = validate([{
            field: 'number',
            value: number,
            validators: ['isRequired']
        }]);

        if (errors) {
            return errors;
        }
        const client = this[clientKey];
        const base = (client.baseUrl || '').replace(/\/+$/, '');
        const enc = encodeURIComponent(number);
        return new Promise((resolve, reject) => {
            client('DELETE', `numbers/${enc}`, { override_url: `${base}/numbers/${enc}` })
                .then(() => resolve(true))
                .catch(reject);
        });
    }

    /**
     * Assign a number to a trunk group
     * POST /account/{authId}/numbers/{number}/assign/
     * @param {string} number - The phone number to assign
     * @param {string} trunkId - The trunk group ID
     */
    assign(number, trunkId) {
        if (!number) {
            return Promise.reject(new Error('id is required'));
        }
        if (!trunkId) {
            return Promise.reject(new Error('id is required'));
        }
        let client = this[clientKey];
        return new Promise((resolve, reject) => {
            client('POST', 'numbers/' + encodeURIComponent(number) + '/assign', { trunk_group_id: trunkId })
                .then(response => {
                    resolve(new VobizGenericResponse(response.body, idField));
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    /**
     * Unassign a number from its trunk group
     * DELETE /account/{authId}/numbers/{number}/assign/
     * @param {string} number - The phone number to unassign
     */
    unassign(number) {
        if (!number) {
            return Promise.reject(new Error('id is required'));
        }
        let client = this[clientKey];
        return new Promise((resolve, reject) => {
            client('DELETE', 'numbers/' + encodeURIComponent(number) + '/assign')
                .then(() => {
                    resolve(true);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }
}

module.exports = {
  BuyNumberResponse,
  SearchNumberResponse,
  UpdateNumberResponse,
  PhoneNumber,
  PhoneNumberInterface,
  NumberResource,
  NumberInterface
};
