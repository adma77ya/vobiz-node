'use strict';

const { VobizGenericResponse } = require('../base');

const clientKey = Symbol('client');
const idField = 'id';
const action = 'sub-accounts/';

function buildSubaccountsUrl(client, id) {
  const accountsBase = String(client.baseUrl || '').replace('/api/v1/account/', '/api/v1/accounts/');
  return id ? `${accountsBase}/sub-accounts/${id}` : `${accountsBase}/sub-accounts/`;
}

class SubaccountsInterface {
  constructor(client) {
    this[clientKey] = client;
  }

  create(params = {}) {
    const client = this[clientKey];
    const payload = Object.assign({}, params, { override_url: buildSubaccountsUrl(client) });
    return new Promise((resolve, reject) => {
      client('POST', action, payload)
        .then((response) => resolve(new VobizGenericResponse(response.body, idField)))
        .catch(reject);
    });
  }

  get(id) {
    if (!id) {
      return Promise.reject(new Error('id is required'));
    }
    const client = this[clientKey];
    return new Promise((resolve, reject) => {
      client('GET', action + id, { override_url: buildSubaccountsUrl(client, id) })
        .then((response) => resolve(response.body))
        .catch(reject);
    });
  }

  list(params = {}) {
    const client = this[clientKey];
    const payload = Object.assign({}, params, { override_url: buildSubaccountsUrl(client) });
    return new Promise((resolve, reject) => {
      client('GET', action, payload)
        .then((response) => resolve(response.body))
        .catch(reject);
    });
  }

  update(id, params = {}) {
    if (!id) {
      return Promise.reject(new Error('id is required'));
    }
    const client = this[clientKey];
    const payload = Object.assign({}, params, { override_url: buildSubaccountsUrl(client, id) });
    return new Promise((resolve, reject) => {
      client('PUT', action + id, payload)
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
      client('DELETE', action + id, { override_url: buildSubaccountsUrl(client, id) })
        .then((response) => resolve(response.body))
        .catch(reject);
    });
  }
}

module.exports = {
  SubaccountsInterface
};
