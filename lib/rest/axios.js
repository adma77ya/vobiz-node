'use strict';

const Exceptions = require('../utils/exceptions');
const _          = require('lodash');
const axios      = require('axios');
const http       = require('http');
const https      = require('https');

// ── Connection pool ────────────────────────────────────────────────────────────
const agentOpts = {
  keepAlive:         true,
  keepAliveMsecs:    1000,
  maxSockets:        100,
  maxFreeSockets:    20,
  timeout:           60000,
  freeSocketTimeout: 30000,
};
const httpAgent  = new http.Agent(agentOpts);
const httpsAgent = new https.Agent(agentOpts);

axios.defaults.httpAgent  = httpAgent;
axios.defaults.httpsAgent = httpsAgent;

// ── Error class map ────────────────────────────────────────────────────────────
const STATUS_TO_EXCEPTION = {
  400: Exceptions.InvalidRequestError,
  401: Exceptions.AuthenticationError,
  402: Exceptions.InvalidRequestError,   // payment required / insufficient balance
  403: Exceptions.AuthenticationError,
  404: Exceptions.ResourceNotFoundError,
  405: Exceptions.InvalidRequestError,
  406: Exceptions.InvalidRequestError,
  409: Exceptions.InvalidRequestError,
  422: Exceptions.InvalidRequestError,
  429: Exceptions.InvalidRequestError,   // rate limited
  500: Exceptions.ServerError,
  502: Exceptions.ServerError,
  503: Exceptions.ServerError,
  504: Exceptions.ServerError,
};

function classifyError(status) {
  return STATUS_TO_EXCEPTION[status] || Error;
}

function buildError(ExClass, axiosError) {
  // VobizRestError constructor expects the raw axios error (with .response nested inside).
  // If there's no .response (network timeout, DNS fail, etc.) fall back to a plain Error.
  try {
    if (axiosError.response) {
      return new ExClass(axiosError);   // VobizRestError unwraps axiosError.response internally
    }
  } catch (_) {}
  // Fallback: plain Error so callers still get something catchable
  const err = new Error(axiosError.message || String(axiosError));
  err.status   = axiosError.response && axiosError.response.status;
  err.response = axiosError.response;
  return err;
}

// ── Exponential backoff for 429 / 5xx ─────────────────────────────────────────
async function withRetry(fn, maxRetries = 3) {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      const status = err.response && err.response.status;
      const retryable = status === 429 || (status >= 500 && status < 600);
      if (!retryable || attempt >= maxRetries) throw err;

      // Honour Retry-After header when present (in seconds)
      const retryAfter = err.response && err.response.headers && err.response.headers['retry-after'];
      const delay = retryAfter
        ? Math.min(parseInt(retryAfter, 10) * 1000, 30000)
        : Math.min(200 * Math.pow(2, attempt), 8000);

      attempt++;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// ── Voice API base URL (legacy casing) ────────────────────────────────────────
const VOICE_BASE = 'https://api.vobiz.ai/api/v1/Account/';

// ── Default timeouts ──────────────────────────────────────────────────────────
const TIMEOUT_VOICE   = 10000;   // 10 s — voice actions must be fast
const TIMEOUT_DEFAULT = 30000;   // 30 s — other API calls

function Axios(config) {
  const baseHeaders = {
    'X-Auth-ID':    config.authId,
    'X-Auth-Token': config.authToken,
    'User-Agent':   config.userAgent,
    'Content-Type': 'application/json',
  };

  return (method, action, params) => {
    let isVoiceReq = false;
    let requestUrl = config.url + '/' + action;

    // ── Mutate params to extract control flags ─────────────────────────────────
    params = params ? Object.assign({}, params) : {};

    if (params.hasOwnProperty('isVoiceRequest')) {
      isVoiceReq  = true;
      requestUrl  = VOICE_BASE + config.authId + '/' + action;
      delete params.isVoiceRequest;
    } else if (params.hasOwnProperty('override_url')) {
      requestUrl = params.override_url;
      delete params.override_url;
    }

    // ── Build axios options ────────────────────────────────────────────────────
    const options = {
      method,
      url:     requestUrl,
      headers: baseHeaders,
      timeout: config.timeout || (isVoiceReq ? TIMEOUT_VOICE : TIMEOUT_DEFAULT),
    };

    if (config.proxy) {
      const HttpsProxyAgent = require('https-proxy-agent');
      options.httpsAgent = new HttpsProxyAgent(config.proxy, agentOpts);
    }

    // Empty plain objects should not be sent as body
    const isEmpty = _.isPlainObject(params) && _.isEmpty(params);

    if (method === 'GET') {
      if (!isEmpty) options.params = params;
    } else {
      if (!isEmpty) options.data = params;
    }

    // ── Execute with retry ────────────────────────────────────────────────────
    return withRetry(() => {
      return new Promise((resolve, reject) => {
        axios(options)
          .then(response => {
            if (!_.inRange(response.status, 200, 300)) {
              const ExClass = classifyError(response.status);
              const body = response.data;
              reject(new ExClass(typeof body === 'object' ? JSON.stringify(body) : body));
              return;
            }
            const body = response.data;
            if (typeof body === 'object' && body !== null && !Array.isArray(body)) {
              body.statusCode = response.status;
            }
            resolve({ response, body });
          })
          .catch(error => {
            if (!error.response) {
              // Network error, DNS, timeout, etc.
              return reject(error);
            }
            const status   = error.response.status;
            const ExClass  = classifyError(status);
            reject(buildError(ExClass, error));
          });
      });
    });
  };
}

module.exports = { Axios };
