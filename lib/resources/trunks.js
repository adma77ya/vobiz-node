'use strict';

const { VobizGenericResponse } = require('../base');

const clientKey = Symbol('client');
const idField = 'id';

class TrunkInterface {
  constructor(client) {
    this[clientKey] = client;
  }

  create(params = {}) {
    const client = this[clientKey];
    return new Promise((resolve, reject) => {
      client('POST', 'trunks', params)
        .then((response) => resolve(new VobizGenericResponse(response.body, idField)))
        .catch(reject);
    });
  }

  get(trunkId) {
    if (!trunkId) {
      return Promise.reject(new Error('id is required'));
    }
    const client = this[clientKey];
    return new Promise((resolve, reject) => {
      client('GET', 'trunks/' + trunkId)
        .then((response) => resolve(response.body))
        .catch(reject);
    });
  }

  list(params = {}) {
    const client = this[clientKey];
    return new Promise((resolve, reject) => {
      client('GET', 'trunks', params)
        .then((response) => resolve(response.body))
        .catch(reject);
    });
  }

  update(trunkId, params = {}) {
    if (!trunkId) {
      return Promise.reject(new Error('id is required'));
    }
    const client = this[clientKey];
    return new Promise((resolve, reject) => {
      client('PUT', 'trunks/' + trunkId, params)
        .then((response) => resolve(new VobizGenericResponse(response.body, idField)))
        .catch(reject);
    });
  }

  delete(trunkId) {
    if (!trunkId) {
      return Promise.reject(new Error('id is required'));
    }
    const client = this[clientKey];
    return new Promise((resolve, reject) => {
      client('DELETE', 'trunks/' + trunkId)
        .then((response) => resolve(response.body))
        .catch(reject);
    });
  }
}

module.exports = {
  TrunkInterface
};
