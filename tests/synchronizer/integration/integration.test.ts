import Ajv from 'ajv';
import fs from 'fs';
import path from 'path';
import https from 'https';
import got, { Got } from 'got';


export let ajv: Ajv.Ajv;

const certFile = fs.readFileSync(path.resolve(__dirname, '../../../ssl/server.key'));

const httpsAgent = new https.Agent({
    ca: certFile,
    rejectUnauthorized: false
});

export let gotInstance: Got;


before(async () => {

    let token: string;

    try {
        const response = await got.post('http://localhost:3007/v2/users/tester/sign-in', {
            json: {
                password: 'qwerTy123'
            },
            headers: {
                'Content-Type': 'application/json'
            }
        }).json<{ token: string }>();

        ({ token = '' } = response);
    } catch (e) {
        console.error('Unable to obtain token.');
        process.exit(1);
    }

    gotInstance = got.extend({
        agent: {
            https: httpsAgent
        },
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

});