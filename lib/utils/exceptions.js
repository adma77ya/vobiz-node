var VobizRestError = require('./restException');
class ResourceNotFoundError extends VobizRestError { }
class ServerError extends VobizRestError { }
class InvalidRequestError extends VobizRestError { }
class VobizXMLError extends VobizRestError { }
class VobizXMLValidationError extends VobizRestError { }
class AuthenticationError extends VobizRestError { }
class NotAcceptableError extends VobizRestError { }
class GeoPermissionError extends VobizRestError { }

module.exports = {
  ResourceNotFoundError,
  ServerError,
  InvalidRequestError,
  VobizXMLError,
  VobizXMLValidationError,
  AuthenticationError,
  NotAcceptableError,
  GeoPermissionError
};
