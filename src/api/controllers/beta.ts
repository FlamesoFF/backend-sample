import got from 'got';
import fs from 'fs';
import path from 'path';
import jsonwebtoken from 'jsonwebtoken';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { Google } from '../@types/api/beta.types';
import { Requests } from '../@types/api/controllers.types';
import { ApiError, ERRORS } from '../errors';
import { Response } from 'express';

const { web: { client_id, client_secret } }: Google.GapiCredentials = JSON.parse(
    fs.readFileSync(
        path.resolve(__dirname, '../../../gapi.credentials.json'),
        'utf8'
    )
);


export class GoogleController {
    private oauthTokeninfoUrl = 'https://oauth2.googleapis.com/tokeninfo';
    private domains = ['apollo4u.net'];
    private scopes = [
        'https://mail.google.com/',
        'https://www.googleapis.com/auth/gmail.readonly',
    ];
    static client;

    static async initializeGapiClient() {
        try {
            const oAuth2Client = google.gmail({
                version: 'v1',
                auth: client_id
            });

            this.client = await google.gmail('v1');

            this.client.load('https://content.googleapis.com/discovery/v1/apis/gmail/v1/rest');

            console.log('GAPI client loaded for API');
        } catch (error) {
            console.error('Error loading GAPI client for API', error);
        }
    }

    async authenticate(request: Requests.Beta.Authenticate): Promise<Google.AuthenticateResponse> {
        const { token } = request.query;
        let valid = false;

        try {
            const client = new OAuth2Client(client_id);
            // @ts-ignore
            const validCheck = client.verifyIdToken({
                idToken: token,
                // audience: client_id
            });

            const {
                body: { hd: domain }
            } = await got.get<Google.TokenInfo>(this.oauthTokeninfoUrl, {
                searchParams: {
                    id_token: token
                }
            });

            if (this.domains.includes(domain)) valid = true;
        } catch (error) {
            const { response } = error;

            if ((<Google.TokenError>response?.data)?.error === 'invalid_token')
                return { valid };
            else
                throw new Error(error);
        }

        return { valid };
    }

    async getGmailMessageById(request: Requests.Beta.GmailMessage, response: Response): Promise<object> {
        const { oauthToken = '', messageId = '' } = request.body;
        const { email: userId = null } = <Google.TokenInfo>jsonwebtoken.decode(oauthToken) || {};

        if (!userId) throw new ApiError(ERRORS.COMMON.MISSING_REQUIRED_PARAMETERS);

        return await google.client.gmail.users.messages.get({
            id: messageId,
            userId,
            format: 'full',

        }).catch(error => {
            throw new Error(error);
        });
    }
};

const graphQlController = new class GraphQlController {

};

const googleController = new GoogleController();

export { googleController };

