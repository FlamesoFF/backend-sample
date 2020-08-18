export namespace Google {

    export interface GapiCredentials {
        web: Credentials;
    }

    export interface Credentials {
        client_id: string;
        project_id: string;
        auth_uri: string;
        token_uri: string;
        auth_provider_x509_cert_url: string;
        client_secret: string;
        redirect_uris: string[];
    }

    export interface TokenInfo {
        iss: string;
        sub: string;
        hd: string;
        email: string;
        email_verified: string;
        aud: string;
        at_hash: string;
        name: string;
        picture: string;
        given_name: string;
        family_name: string;
        locale: string;
        iat: string;
        exp: string;
        alg: string;
        kid: string;
        typ: string;
    }

    export interface TokenError {
        error: string;
        error_description: string;
    }

    export interface AuthenticateResponse {
        valid: boolean
    }

}
