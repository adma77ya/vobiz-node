'use strict';

const clientKey = Symbol('client');

class CdrInterface {
  constructor(client) {
    this[clientKey] = client;
  }

  get(params = {}) {
    const client = this[clientKey];
    return new Promise((resolve, reject) => {
      client('GET', 'cdr', params)
        .then((response) => resolve(response.body))
        .catch(reject);
    });
  }

  /** Alias for get() — list CDRs with optional filters.
   * Supported params: start_date, end_date, per_page, page, context
   */
  list(params = {}) {
    return this.get(params);
  }
}

module.exports = {
  CdrInterface
};
