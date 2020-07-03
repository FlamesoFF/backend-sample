import { NextFunction, Request, Response } from 'express';
import { CONFIG } from '../../shared/config';
import jwt from 'jsonwebtoken';
import { IUser } from '../../@types/data/definitions';
import statuses from 'statuses';
import { ApiError, ERRORS } from '../errors';
import { OAuth2Client } from 'google-auth-library';
import { Google } from '../@types/api/beta.types';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { CouchDbService } from '../../services/couchDb';
import { IPerson } from '../../@types/data/person';
import { ApolloJwtToken, GoogleJwtToken } from '../@types/auth/definitions';
import { TextUtils } from '@apollo4u/auxiliary';


enum AuthFormats {
    Bearer = 'Bearer',
    Google = 'Google'
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
    static user: AuthUserData;
    private static secret = CONFIG.auth.secret;


    static get authorizationGate() {
        return async (
            request: Request,
            response: Response,
            next: NextFunction
        ) => {
            const { authorization } = request.headers;

            if (!authorization) this.send(new ApiError(ERRORS.AUTH.MISSING_AUTH_HEADER), response, next);

            const [, type, token] = authorization.match(/(Bearer|Google) (.+)/i);

            if (!(type in AuthFormats)) this.send(new ApiError(ERRORS.AUTH.UNKNOWN_AUTHORIZATION_TYPE), response, next);

            let result = false;


            if (type === AuthFormats.Google) {
                result = await this.checkGoogleToken(token);

                const {
                    _id,
                    name,
                    email: { value: email } = {},
                    initials = TextUtils.nameToInitials(name)
                } = await this.checkGoogleUserRegistered(token);

                MwAuth.user = {
                    _id,
                    name,
                    initials,
                    email: email ?? `${_id}@apollo4u.net`,
                    roles: ['manager']  // TODO: get roles from PGSQL table "managers"
                };
            }
            else if (type === AuthFormats.Bearer) {
                try {
                    result = await this.checkApolloAuth(token);
                } catch (error) {
                    throw new ApiError(ERRORS.AUTH.INVALID_TOKEN, error.message);
                }

                const {
                    _id,
                    name,
                    initials,
                    email,
                    roles
                } = this.parseToken(token) as ApolloJwtToken;

                MwAuth.user = {
                    _id,
                    name,
                    initials,
                    email: email || `${_id}@apollo4u.net`,
                    roles
                };
            }

            if (!result) this.send(new ApiError(ERRORS.AUTH.INVALID_TOKEN), response, next);


            response.set('Access-Control-Expose-Headers', 'Content-Disposition');

            next();
        };
    }


    private static send(error: ApiError, response: Response, next: NextFunction) {
        response.status(statuses('Unauthorized')).send(error);
        throw error;
    }

    private static async checkGoogleToken(token: string): Promise<boolean> {
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
        } catch (error) {
            throw new ApiError(ERRORS.AUTH.INVALID_TOKEN, error.message);
        }

        const { hd: domain } = ticket.getPayload();

        if (!(domain in DomainsWhiteList)) throw new ApiError(ERRORS.AUTH.DOMAIN_UNRECOGNIZED);

        return true;
    }

    private static checkApolloAuth(token: string): boolean {
        return !!this.verifyToken(token);
    }

    private static verifyToken(token: string): IUser {
        return <IUser>jwt.verify(token, this.secret);
    }

    private static parseToken(token: string): ApolloJwtToken | GoogleJwtToken {
        // @ts-ignore
        const { payload } = jwt.decode(token, {
            json: true,
            complete: true
        });

        return payload;
    }

    private static async checkGoogleUserRegistered(token: string): Promise<IPerson> {
        const { email } = this.parseToken(token) as GoogleJwtToken;
        const id = email.match(/(.+)@/i)?.[1];
        const {name} = CONFIG.servers.couchdb.databases.main;

        try {
            CouchDbService.switchDb(name);

            return await CouchDbService.adapter.get(id) as IPerson;
        } catch (e) {
            throw new ApiError(ERRORS.AUTH.USER_IS_NOT_REGISTERED);
        }
    }
}