export function validateV3Signature(method: string, uri: string, nonce: string, auth_token: string, v3_signature: string, params?: {}): Boolean;
export function validateSignature(uri: string, nonce: string, signature: string, auth_token: string): Boolean;

/**
 * Vobiz API client.
 * @param authId    Your Vobiz Auth ID (or set VOBIZ_AUTH_ID env var)
 * @param authToken Your Vobiz Auth Token (or set VOBIZ_AUTH_TOKEN env var)
 * @param options   Optional: proxy, timeout, etc.
 */
export class Client {
    constructor(authId?: string, authToken?: string, options?: any);

    // Voice & Calls
    calls:        CallInterface;
    recordings:   RecordingInterface;
    conferences:  ConferenceInterface;
    cdr:          CdrInterface;

    // Numbers & Routing
    numbers:      NumberInterface;
    endpoints:    EndpointInterface;
    applications: ApplicationInterface;

    // SIP Trunking
    trunks:          TrunkInterface;
    credentials:     CredentialInterface;
    ipAcl:           IpAclInterface;
    originationUris: OriginationUriInterface;

    // Account & Sub-accounts
    account:     AccountInterface;
    subaccounts: SubaccountsInterface;
    balance:     BalanceInterface;

    toJSON(...args: any[]): any;
}

import { CallInterface }           from "../resources/call.js";
import { RecordingInterface }      from "../resources/recordings.js";
import { ConferenceInterface }     from "../resources/conferences.js";
import { CdrInterface }            from "../resources/cdr.js";
import { NumberInterface }         from "../resources/numbers.js";
import { EndpointInterface }       from "../resources/endpoints.js";
import { ApplicationInterface }    from "../resources/applications.js";
import { TrunkInterface }          from "../resources/trunks.js";
import { CredentialInterface }     from "../resources/credentials.js";
import { IpAclInterface }          from "../resources/ipAcl.js";
import { OriginationUriInterface } from "../resources/originationUris.js";
import { AccountInterface }        from "../resources/account.js";
import { SubaccountsInterface }    from "../resources/subaccounts.js";
import { BalanceInterface }        from "../resources/balance.js";
