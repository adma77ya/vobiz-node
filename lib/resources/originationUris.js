'use strict';

const { VobizGenericResponse } = require('../base');

const clientKey = Symbol('client');
const idField = 'id';

class OriginationUriInterface {
  constructor(client) {
    this[clientKey] = client;
  }

  create(params = {}) {
    const client = this[clientKey];
    return new Promise((resolve, reject) => {
      client('POST', 'origination-uris', params)
        .then((response) => resolve(new VobizGenericResponse(response.body, idField)))
        .catch(reject);
    });
  }

  list(params = {}) {
    const client = this[clientKey];
    return new Promise((resolve, reject) => {
      client('GET', 'trunks/origination-uris', params)
        .then((response) => resolve(response.body))
        .catch(reject);
    });
  }

  get(id) {
    if (!id) {
      return Promise.reject(new Error('id is required'));
    }
    const client = this[clientKey];
    return new Promise((resolve, reject) => {
      client('GET', 'origination-uris/' + id)
        .then((response) => resolve(response.body))
        .catch(reject);
    });
  }

  update(id, params = {}) {
    if (!id) {
      return Promise.reject(new Error('id is required'));
    }
    const client = this[clientKey];
    return new Promise((resolve, reject) => {
      client('PUT', 'origination-uris/' + id, params)
        .then((response) => resolve(new VobizGenericResponse(response.body, idField)))
        .catch(reject);
    });
  }

  delete(id) {
    if (!id) {
      return Promise.reject(new Error('id is required'));
    }
    const client = this[clientKey];
    return new Promise((resolve, reject) => {
      client('DELETE', 'origination-uris/' + id)
        .then((response) => resolve(response.body))
        .catch(reject);
    });
  }
}

module.exports = {
  OriginationUriInterface
};
