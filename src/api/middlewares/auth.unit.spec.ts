import { MwAuth } from './auth';
import { expect } from 'chai';


describe('Auth middleware', () => {

    it('parse Apollo token', () => {
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InRlc3RlciIsIl9pZCI6InRlc3RlciIsIm5hbWUiOiJUZXN0ZXIiLCJsb2dpbiI6InRlc3RlciIsImluaXRpYWxzIjoiIiwiYWNjZXB0ZWQiOnRydWUsImVtYWlsIjoiIiwicm9sZXMiOlsiZGV2ZWxvcGVyIl0sIm9yZ2FuaXphdGlvbiI6IiIsIm9jY3VwYXRpb24iOiJWQkEgZGV2ZWxvcGVyIiwiY291bnRyeSI6IiIsIm5hdGlvbmFsaXR5IjoiUnVzc2lhbiIsInBob25lIjoiIiwic21zX25vdGlmaWNhdGlvbnNfZW5hYmxlZCI6ZmFsc2UsImF2YXRhciI6bnVsbCwidGltZSI6MTU5NjY5ODg2MSwiaXAiOiI6OmZmZmY6MTI3LjAuMC4xIiwidHlwZSI6WyJ1c2VyIiwiZGV2ZWxvcGVyIl0sImlhdCI6MTU5NjY5ODg2MSwiZXhwIjoxNTk2NzQyMDYxfQ.YaBj2y2QFG6m6_feHYTTmYrDpZR-_igYusMzaD1NktI';

        const sample = {
            'id': 'tester',
            '_id': 'tester',
            'name': 'Tester',
            'login': 'tester',
            'initials': '',
            'accepted': true,
            'email': '',
            'roles': [
                'developer'
            ],
            'organization': '',
            'occupation': 'VBA developer',
            'country': '',
            'nationality': 'Russian',
            'phone': '',
            'sms_notifications_enabled': false,
            'avatar': null,
            'time': 1596698861,
            'ip': '::ffff:127.0.0.1',
            'type': [
                'user',
                'developer'
            ],
            'iat': 1596698861,
            'exp': 1596742061
        };
        
        const result = MwAuth['parseToken'](token);

        expect(result).to.be.deep.equal(sample);
    });

    it('parse Google token', () => {
        const token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjQ5MjcxMGE3ZmNkYjE1Mzk2MGNlMDFmNzYwNTIwYTMyYzg0NTVkZmYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJzdWIiOiIxMDEzOTQ5MDcyMjk5OTYyNTE3MjUiLCJoZCI6ImFwb2xsbzR1Lm5ldCIsImVtYWlsIjoiZmQuYWJiYXNiYXlsaUBhcG9sbG80dS5uZXQiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXVkIjoiNjEwMzczMzM3OTQ1LTdjcWNxZHI0MzBrcDVjOWZvcGUzNnBrZWkxc2ZjdDVhLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXRfaGFzaCI6Imx4UlV1aHE1VUhqeXlod0VCSk9tbXciLCJuYW1lIjoiRmFyaWQgQWJiYXNiYXlsaSIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS0vQU9oMTRHaFRaY2JralFlX3psNHRmVDVSM1lNbDZtOWZMYzFUR3hfWTJaWG9oQT1zOTYtYyIsImdpdmVuX25hbWUiOiJGYXJpZCIsImZhbWlseV9uYW1lIjoiQWJiYXNiYXlsaSIsImxvY2FsZSI6ImVuLUdCIiwiaWF0IjoxNTkxOTc4MzcwLCJleHAiOjE1OTE5ODE5NzB9.efoWOqhz91DKW2gQOlxaSQP4PNrW6IrCO3nbM2JTPwpZ-9JqzG7riejn-HE8m8ObCUrQ0uijCOyd-3nOo64c4atnoRnaMhPcYi-mGtIUrwc4N4UuN56aDi95L-fFrGwFz2E-YgTszH_L2GXVWJfqilqiv3dHxvKtbNxH7FFt5GSJfQW1001WGUO3d0FS8Ygf7P0j7iiNlsgCsETUnY2xq4Qghoqr4j0WwIT8pgXIMIBbgZwnYLfHQ7s7eYJikt_YyfDQm7B61kS5oaTU4gArYIli2558GnGx29Xt0oYgZrF0KnT01JAnO1rjteJhD3vsVdHMHuHaiCHPiq_-cDeJBg';

        const sample = {
            'iss': 'https://accounts.google.com',
            'sub': '101394907229996251725',
            'hd': 'apollo4u.net',
            'email': 'fd.abbasbayli@apollo4u.net',
            'email_verified': true,
            'aud': '610373337945-7cqcqdr430kp5c9fope36pkei1sfct5a.apps.googleusercontent.com',
            'at_hash': 'lxRUuhq5UHjyyhwEBJOmmw',
            'name': 'Farid Abbasbayli',
            'picture': 'https://lh3.googleusercontent.com/a-/AOh14GhTZcbkjQe_zl4tfT5R3YMl6m9fLc1TGx_Y2ZXohA=s96-c',
            'given_name': 'Farid',
            'family_name': 'Abbasbayli',
            'locale': 'en-GB',
            'iat': 1591978370,
            'exp': 1591981970
        };

        const result = MwAuth['parseToken'](token);

        expect(result).to.be.deep.equal(sample);
    });

    it('parse Xero token', () => {
        const token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFDQUY4RTY2NzcyRDZEQzAyOEQ2NzI2RkQwMjYxNTgxNTcwRUZDMTkiLCJ0eXAiOiJKV1QiLCJ4NXQiOiJISy1PWm5jdGJjQW8xbkp2MENZVmdWY09fQmsifQ.eyJuYmYiOjE1OTY3MjMwNDgsImV4cCI6MTU5NjcyNDg0OCwiaXNzIjoiaHR0cHM6Ly9pZGVudGl0eS54ZXJvLmNvbSIsImF1ZCI6Imh0dHBzOi8vaWRlbnRpdHkueGVyby5jb20vcmVzb3VyY2VzIiwiY2xpZW50X2lkIjoiODcwOEE1RkMxNzNDNEI1MThDMEM2RTQxRTk2MkQzQ0QiLCJzdWIiOiI5MDM3MTYwNjFiZWM1YjUzOGMxZTYxYTI4OTU2YzlkNSIsImF1dGhfdGltZSI6MTU5NjU0MjAyNywieGVyb191c2VyaWQiOiI0NTJmY2Q3Mi01N2Y0LTQ4ZjctOTZkYS02MjA4ZTYyMWM1ODQiLCJnbG9iYWxfc2Vzc2lvbl9pZCI6ImRiY2YwZGY5YTBkOTQ5NTJhZjA3OTlhNTIzM2NkMjQ1IiwianRpIjoiOWJhYjUzYTM0NjFlNWI5ZjkzMTFiYjM2ZThhZjhlYmYiLCJhdXRoZW50aWNhdGlvbl9ldmVudF9pZCI6Ijg5ZWY1MTg5LTM5ZmMtNGRkNS04M2U2LWVkMTFlZGE2ZjE1MSIsInNjb3BlIjpbImVtYWlsIiwicHJvZmlsZSIsIm9wZW5pZCIsImFjY291bnRpbmcucmVwb3J0cy5yZWFkIiwiYWNjb3VudGluZy5hdHRhY2htZW50cy5yZWFkIiwicHJvamVjdHMiLCJhY2NvdW50aW5nLnNldHRpbmdzIiwiYWNjb3VudGluZy5zZXR0aW5ncy5yZWFkIiwiYWNjb3VudGluZy5hdHRhY2htZW50cyIsImFjY291bnRpbmcudHJhbnNhY3Rpb25zIiwiYWNjb3VudGluZy5qb3VybmFscy5yZWFkIiwiYWNjb3VudGluZy50cmFuc2FjdGlvbnMucmVhZCIsImFzc2V0cyIsImFjY291bnRpbmcuY29udGFjdHMiLCJhY2NvdW50aW5nLmNvbnRhY3RzLnJlYWQiLCJvZmZsaW5lX2FjY2VzcyJdfQ.KLSA3kf7CQOzycWXfiGwV4ghRxFXDVq6FcmI6mszVeq19jj-C44mXJbjEKxfwX5RHo62VO-32riIBuGTxoH9IChZf05QbFLsYin0tKtlynR3Z93keU2AFAJkWecqbm7HMQpBcXNVazTUkr8TJNyVRy8TmOv_dXnog5bBpOX9FTaCUr6FuyaFJKcqj45zPfI9JTd1VNCkPe6gx0EoY1AuO4aktzYoNDMPxEBRnMXR6TqSnsw_P2IsgNHcMjU4QuVYpwVva5FE4-fgQksCiDVz_WbpNBHfP73j7-nt2j04ufH9LWWHp8tjSYsU00M46b-qjS_qTwjMuOvZ7h0iunhNWA';

        const sample = {
            'nbf': 1596723048,
            'exp': 1596724848,
            'iss': 'https://identity.xero.com',
            'aud': 'https://identity.xero.com/resources',
            'client_id': '8708A5FC173C4B518C0C6E41E962D3CD',
            'sub': '903716061bec5b538c1e61a28956c9d5',
            'auth_time': 1596542027,
            'xero_userid': '452fcd72-57f4-48f7-96da-6208e621c584',
            'global_session_id': 'dbcf0df9a0d94952af0799a5233cd245',
            'jti': '9bab53a3461e5b9f9311bb36e8af8ebf',
            'authentication_event_id': '89ef5189-39fc-4dd5-83e6-ed11eda6f151',
            'scope': [
                'email',
                'profile',
                'openid',
                'accounting.reports.read',
                'accounting.attachments.read',
                'projects',
                'accounting.settings',
                'accounting.settings.read',
                'accounting.attachments',
                'accounting.transactions',
                'accounting.journals.read',
                'accounting.transactions.read',
                'assets',
                'accounting.contacts',
                'accounting.contacts.read',
                'offline_access'
            ]
        };

        const result = MwAuth['parseToken'](token);

        expect(result).to.be.deep.equal(sample);
    });

});
