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
}

module.exports = {
  CdrInterface
};
