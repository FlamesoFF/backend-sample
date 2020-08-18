import jwt from 'jsonwebtoken';
import statuses from 'statuses';
import fs from 'fs';
import path from 'path';
import got from 'got';
import { NextFunction, Request, Response } from 'express';
import { CONFIG } from '../../shared/config';
import { IUser } from '../../@types/data/definitions';
import { ApiError, ERRORS } from '../errors';
import { OAuth2Client } from 'google-auth-library';
import { Google } from '../@types/api/beta.types';
import { promisify } from 'util';
import { CouchDbService } from '../../services/couchDb';
import { IPerson } from '../../@types/data/person';
import { TextUtils } from '@apollo4u/auxiliary';
import { ApolloJwtToken, GoogleJwtToken, IXeroConnection, IXeroToken } from './types';


enum AuthFormats {
    Bearer = 'Bearer',
    Google = 'Google',
    Xero = 'Xero'
}

enum DomainsWhiteList {
    'apollo4u.net'
}

interface AuthUserData {
    _id: string
    name: string
    initials: string
    email: string
    roles: string[];
}

export abstract class MwAuth {
    private static userData: AuthUserData;
    static secret = CONFIG.auth.secret;


    static get user() {
        return this.userData;
    }

    static set token( token: string ) {
        this.userData = jwt.decode(token) as AuthUserData;
    }


    static get authorizationGate() {
        return async (
            request: Request,
            response: Response,
            next: NextFunction
        ) => {
            let result = false;
            const { authorization } = request.headers;

            // Check authorization header
            if ( !authorization ) return next(new ApiError(ERRORS.AUTH.MISSING_AUTH_HEADER));

            const [, type, token] = authorization.match(/(Bearer|Google) (.+)/i);

            // Check auth formats
            if ( !(type in AuthFormats) ) return next(new ApiError(ERRORS.AUTH.UNKNOWN_AUTHORIZATION_TYPE));


            try {
                switch ( type ) {
                    case AuthFormats.Bearer:
                        result = await this.processApolloToken(token);
                        break;

                    case AuthFormats.Google:
                        result = await this.processGoogleToken(token);
                        break;

                    case AuthFormats.Xero:
                        result = await this.processXeroToken(token);
                        break;

                    default:
                        return next(new ApiError(ERRORS.AUTH.INVALID_TOKEN));
                }
            } catch ( error ) {
                response.status(statuses('Unauthorized'));
                next(new ApiError(ERRORS.AUTH.INVALID_TOKEN, error.message));
            }

            response.set('Access-Control-Expose-Headers', 'Content-Disposition');
            next();
        };
    }


    private static async processApolloToken( token: string ): Promise<boolean> {
        let result = !!this.validateApolloToken(token);

        const {
            _id,
            name,
            initials,
            email,
            roles
        } = this.parseToken<ApolloJwtToken>(token);

        MwAuth.token = jwt.sign({
            _id,
            name,
            initials,
            email: email || `${ _id }@apollo4u.net`,
            roles
        }, MwAuth.secret);

        return result;
    }

    private static async processGoogleToken( token ) {
        const result: boolean = await this.validateGoogleToken(token);

        if ( !result ) return false;

        const {
            _id,
            name,
            email,
            initials = TextUtils.nameToInitials(name)
        } = await this.checkGoogleUserRegistered(token);

        MwAuth.token = jwt.sign({
            _id,
            name,
            initials,
            email: email ?? `${ _id }@apollo4u.net`,
            roles: ['manager']  // TODO: get roles from PGSQL table "managers"
        }, MwAuth.secret);

        return result;
    }

    private static async processXeroToken( token: string ): Promise<boolean> {
        const result = await this.validateXeroToken(token);

        if ( !result ) return false;

        const {
            given_name,
            family_name,
            email
        } = await this.parseToken<IXeroToken>(token);

        const initials = TextUtils.nameToInitials(`${ given_name } ${ family_name }`);
        const id = email.match(/^(.)@/i)?.[1];

        MwAuth.token = jwt.sign({
            _id: id,
            name: given_name,
            initials,
            email,
            roles: ['manager']
        }, MwAuth.secret);

        return result;
    }

    // private static send(error: ApiError, response: Response, next: NextFunction) {
    //     response.status(statuses('Unauthorized')).send(error);
    //     throw error;
    // }

    private static async validateGoogleToken( token: string ): Promise<boolean> {
        /*  Verification START  */
        let ticket;
        const { web: { client_id, client_secret } }: Google.GapiCredentials = JSON.parse(
            await promisify(fs.readFile)(
                path.resolve(__dirname, '../../../gapi.credentials.json'),
                'utf8'
            )
        );

        try {
            // @ts-ignore
            ticket = await new OAuth2Client().verifyIdToken({
                idToken: token,
                // audience: client_id
            });
        } catch ( error ) {
            throw new ApiError(ERRORS.AUTH.INVALID_TOKEN, error.message);
        }

        const { hd: domain } = ticket.getPayload();

        if ( !(domain in DomainsWhiteList) ) throw new ApiError(ERRORS.AUTH.DOMAIN_UNRECOGNIZED);

        return true;
    }

    private static validateApolloToken( token: string ): IUser {
        return <IUser>jwt.verify(token, this.secret);
    }

    private static parseToken<R extends ApolloJwtToken | GoogleJwtToken | IXeroToken>( token: string ): R {
        const { payload } = jwt.decode(token, {
            json: true,
            complete: true
        });

        return <R>payload;
    }

    private static async checkGoogleUserRegistered( token: string ): Promise<IPerson> {
        const { email } = this.parseToken<GoogleJwtToken>(token);
        const id = email.match(/(.+)@/i)?.[1];
        const { name } = CONFIG.servers.couchdb.databases.main;

        try {
            CouchDbService.switchDb(name);

            return await CouchDbService.adapter.get(id) as IPerson;
        } catch ( e ) {
            throw new ApiError(ERRORS.AUTH.USER_IS_NOT_REGISTERED);
        }
    }

    private static async validateXeroToken( token: string ): Promise<boolean> {
        const { body: [{ tenantId }] = [] } = await got.get<IXeroConnection[]>('https://api.xero.com/connections', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${ token }`
            },
            responseType: 'json'
        });

        return !!tenantId;
    }
}