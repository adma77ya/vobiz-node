const { VobizResource, VobizResourceInterface } = require('../base');
const { extend, validate } = require('../utils/common');
const clientKey = Symbol();
const action = 'Pricing/';
const idField = 'countryIso';

/**
* Represents a Pricing
* @constructor
* @param {function} client - make api call
* @param {object} [data] - data of call
*/
class PricingResponse {
  constructor(params) {
      params = params || {};
      this.apiId = params.apiId;
      this.country = params.country;
      this.countryCode = params.countryCode;
      this.countryIso = params.countryIso;
      this.message = params.message;
      this.mms = params.mms;
      this.phoneNumbers = params.phoneNumbers;
      this.voice = params.voice;

  }
}
class Pricing extends VobizResource {
  constructor(client, data = {}) {
      super(action, Pricing, idField, client);
      extend(this, data);
      this[clientKey] = client
  }


  /**
   * Get pricings by country
   * @method
   * @promise {object} return {@link VobizGenericResponse} object
   * @fail {Error} return Error
   */
  get() {
      let params = {
          country_iso: this.id
      };
      let client = this[clientKey];

      return new Promise((resolve, reject) => {
          client('GET', action, params)
              .then(response => {
                  resolve(new PricingResponse(response.body, idField));
              })
              .catch(error => {
                  reject(error);
              });
      });

  }
}
/**
* Represents a Pricing Interface
* @constructor
* @param {function} client - make api call
* @param {object} [data] - data of call
*/
class PricingInterface extends VobizResourceInterface {
  constructor(client, data = {}) {
      super(action, Pricing, idField, client);
      extend(this, data);

      this[clientKey] = client;
  }

  /**
   * Get pricings by country
   * @method
   * @param {string} countryISO - country iso to get pricings
   * @promise {object} return {@link VobizGenericResponse} object
   * @fail {Error} return Error
   */
  get(countryISO) {
      let errors = validate([{
          field: 'country_iso',
          value: countryISO,
          validators: ['isRequired']
      }]);

      if (errors) {
          return errors;
      }
      return new Pricing(this[clientKey], {
          id: countryISO
      }).get();
  }
}

module.exports = {
  PricingResponse,
  Pricing,
  PricingInterface
};
