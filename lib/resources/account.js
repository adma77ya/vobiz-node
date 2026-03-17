'use strict';

const clientKey = Symbol('client');
const rootUrlKey = Symbol('rootUrl');

class AccountInterface {
  constructor(client) {
    this[clientKey] = client;
    this[rootUrlKey] = (client.baseUrl || '').replace(/\/account\/[^/]+$/, '');
  }

  getProfile() {
    const client = this[clientKey];
    const rootUrl = this[rootUrlKey];
    return new Promise((resolve, reject) => {
      client('GET', 'auth/me', { override_url: rootUrl + '/auth/me' })
        .then((response) => resolve(response.body))
        .catch(reject);
    });
  }

  getTransactions(params = {}) {
    const client = this[clientKey];
    return new Promise((resolve, reject) => {
      client('GET', 'transactions', params)
        .then((response) => resolve(response.body))
        .catch(reject);
    });
  }

  getBalance(currency) {
    if (!currency) {
      return Promise.reject(new Error('id is required'));
    }
    const client = this[clientKey];
    return new Promise((resolve, reject) => {
      client('GET', 'balance/' + currency)
        .then((response) => resolve(response.body))
        .catch(reject);
    });
  }

  getConcurrency() {
    const client = this[clientKey];
    return new Promise((resolve, reject) => {
      client('GET', 'concurrency')
        .then((response) => resolve(response.body))
        .catch(reject);
    });
  }
}

module.exports = {
  AccountInterface
};
