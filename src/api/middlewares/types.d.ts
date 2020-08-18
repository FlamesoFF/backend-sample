import { ApiError } from "../errors";
import { ValidationError } from "ajv";

export interface ApolloJwtToken {
    _id: string;
    name: string;
    email: string;
    roles: string[];

    id?: string;
    login?: string;
    initials?: string;
    accepted?: boolean;
    organization?: string;
    occupation?: string;
    country?: string;
    nationality?: string;
    phone?: string;
    sms_notifications_enabled?: boolean;
    avatar?: null;
    time?: number;
    ip?: string;
    type?: string[];
    iat?: number;
    exp?: number;
}

export interface GoogleJwtToken {
    iss: string;
    sub: string;
    hd: string;
    email: string;
    email_verified: boolean;
    aud: string;
    at_hash: string;
    name: string;
    picture: string;
    given_name: string;
    family_name: string;
    locale: string;
    iat: number;
    exp: number;
}

export interface IXeroToken {
    nbf:                number;
    exp:                number;
    iss:                string;
    aud:                string;
    iat:                number;
    at_hash:            string;
    sub:                string;
    auth_time:          number;
    xero_userid:        string;
    global_session_id:  string;
    preferred_username: string;
    email:              string;
    given_name:         string;
    family_name:        string;
}

export interface IXeroConnection {
    id:             string;
    authEventId:    string;
    tenantId:       string;
    tenantType:     string;
    tenantName:     string;
    createdDateUtc: string;
    updatedDateUtc: string;
}

export interface ResponseFormatterData {
    id?: string
    body?: any
    errors?: (ApiError | ValidationError | Error)[]
    warnings?: string[]
}

export interface ApiResponse {
    ok: boolean, /* operation result */
    id?: string,   // if something has been created or updated
    data?: any    // if server returns some data

    errors?: string[]   // if there's some errors
    warnings?: string[]   // if there's some warnings
}