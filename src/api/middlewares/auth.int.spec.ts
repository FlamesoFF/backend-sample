import { expect } from 'chai';
import { MwAuth } from './auth';
import jwt from 'jsonwebtoken';
import moment from 'moment';


describe('Auth Middleware', () => {

    it('validateXeroToken', async () => {
        const xeroToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFDQUY4RTY2NzcyRDZEQzAyOEQ2NzI2RkQwMjYxNTgxNTcwRUZDMTkiLCJ0eXAiOiJKV1QiLCJ4NXQiOiJISy1PWm5jdGJjQW8xbkp2MENZVmdWY09fQmsifQ.eyJuYmYiOjE1OTYwMTY1NTAsImV4cCI6MTU5NjAxODM1MCwiaXNzIjoiaHR0cHM6Ly9pZGVudGl0eS54ZXJvLmNvbSIsImF1ZCI6Imh0dHBzOi8vaWRlbnRpdHkueGVyby5jb20vcmVzb3VyY2VzIiwiY2xpZW50X2lkIjoiODcwOEE1RkMxNzNDNEI1MThDMEM2RTQxRTk2MkQzQ0QiLCJzdWIiOiI5MDM3MTYwNjFiZWM1YjUzOGMxZTYxYTI4OTU2YzlkNSIsImF1dGhfdGltZSI6MTU5NjAxNjUzOCwieGVyb191c2VyaWQiOiI0NTJmY2Q3Mi01N2Y0LTQ4ZjctOTZkYS02MjA4ZTYyMWM1ODQiLCJnbG9iYWxfc2Vzc2lvbl9pZCI6IjEwODJmMzdiNzlhOTRhZmY4OGJkOGJkMTdkODFjNGFkIiwianRpIjoiMmRmZDI1YjFhNDgxZmM3NWMyYWQ3MTQ2OWEwNjQzMmYiLCJhdXRoZW50aWNhdGlvbl9ldmVudF9pZCI6ImFkOTViNzAyLWE5NWMtNDUyMi05YjU0LWU3NDI4Y2IxMTdmZCIsInNjb3BlIjpbImVtYWlsIiwicHJvZmlsZSIsIm9wZW5pZCIsImFjY291bnRpbmcuc2V0dGluZ3MiLCJhY2NvdW50aW5nLnRyYW5zYWN0aW9ucyIsImFjY291bnRpbmcuY29udGFjdHMiLCJvZmZsaW5lX2FjY2VzcyJdfQ.XXKqM1AOj8JV9VErob1CauNSlvW28jtiCfkq_9fyA7xnj7r9pksPRqwNSnb8-5mfwab3eeGsFExvIwU87puHcpHgOxSOkzvawq80nS56e-jtJgma807NEJl5zRhO84S5OZGpzfQbKoipAXXNTpiVW4-UKNmlbaMq2Io4bXtQuGmjelfo4ogql5p5Y3VoSmUdFJ4NEsAWQUwAlrl45uGjnO0X6EASYK1uUyagIrTixRuhRaG1Rnzf3D269yqxlbDs1IRf2H9xl-ZvxsgeTRex1meprpNoKt2l-Wb4wSmDv6XJPUsj68YaUIL_GDCg8HbrJ3FJjqVVK6zEIvELH7z7kA';

        let result;

        try {
            result = await MwAuth['validateXeroToken'](xeroToken);
        } catch ( e ) {
            result = e;
        }

        const { payload: { exp } } = jwt.decode(xeroToken, {
            json: true,
            complete: true
        });

        if ( moment(exp).isSameOrAfter(moment()) ) {
            expect(result.Status).to.be.equal(401);
        } else {
            expect(result.message).to.be.equal('Response code 401 (Unauthorized)');
        }
    });

});