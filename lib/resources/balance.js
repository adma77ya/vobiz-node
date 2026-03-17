'use strict';

const clientKey = Symbol('client');

/**
 * Balance, Transactions & Concurrency
 * Endpoints: /api/v1/account/{id}/balance/{currency}
 *            /api/v1/account/{id}/transactions
 *            /api/v1/account/{id}/concurrency
 */
class BalanceInterface {
  constructor(client) {
    this[clientKey] = client;
  }

  /**
   * Get balance for a specific currency (default: INR).
   * @param {string} [currency='INR']
   */
  get(currency = 'INR') {
    const client = this[clientKey];
    return new Promise((resolve, reject) => {
      client('GET', `balance/${currency}`, {})
        .then(r => resolve(r.body))
        .catch(reject);
    });
  }

  /**
   * List transactions with optional pagination.
   * @param {object} [params]
   * @param {number} [params.limit=50]
   * @param {number} [params.offset=0]
   */
  listTransactions(params = {}) {
    const client = this[clientKey];
    return new Promise((resolve, reject) => {
      client('GET', 'transactions', params)
        .then(r => resolve(r.body))
        .catch(reject);
    });
  }

  /**
   * Get current concurrency (active simultaneous calls).
   */
  getConcurrency() {
    const client = this[clientKey];
    return new Promise((resolve, reject) => {
      client('GET', 'concurrency', {})
        .then(r => resolve(r.body))
        .catch(reject);
    });
  }
}

module.exports = { BalanceInterface };
