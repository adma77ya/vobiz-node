export class VobizRestError extends Error {
    constructor(message?: string);
}
export class ResourceNotFoundError extends VobizRestError {
    constructor(message?: string);
}
export class ServerError extends VobizRestError {
    constructor(message?: string);
}
export class InvalidRequestError extends VobizRestError {
    constructor(message?: string);
}
export class VobizXMLError extends VobizRestError {
    constructor(message?: string);
}
export class VobizXMLValidationError extends VobizRestError {
    constructor(message?: string);
}
export class AuthenticationError extends VobizRestError {
    constructor(message?: string);
}
