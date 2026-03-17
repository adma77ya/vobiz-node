'use strict';

const { VobizGenericResponse } = require('../base');

const clientKey = Symbol('client');
const idField = 'id';

class CredentialInterface {
  constructor(client) {
    this[clientKey] = client;
  }

  create(params = {}) {
    const client = this[clientKey];
    return new Promise((resolve, reject) => {
      client('POST', 'credentials', params)
        .then((response) => resolve(new VobizGenericResponse(response.body, idField)))
        .catch(reject);
    });
  }

  list(params = {}) {
    const client = this[clientKey];
    return new Promise((resolve, reject) => {
      client('GET', 'trunks/credentials', params)
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
      client('PUT', 'credentials/' + id, params)
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
      client('DELETE', 'credentials/' + id)
        .then((response) => resolve(response.body))
        .catch(reject);
    });
  }
}

module.exports = {
  CredentialInterface
};
