import AppExternal from '../../../src/api/app.external';
import * as https from 'https';
import { orderGenerator } from '../../../utils/dummy-data/order';
import { CONFIG } from '../../../src/shared/config';
import path from 'path';
import Ajv from 'ajv';
import { testUser } from '../../shared';
import { CouchDbService } from '../../../src/services/couchDb';
import App from '../../../src/api/app';
import got, { Got } from 'got';
import { companyGenerator } from '../../../utils/dummy-data/company';
import { personGenerator } from '../../../utils/dummy-data/person';
import { MwAuth } from '../../../src/api/middlewares/auth';
import { PostgreSqlService } from '../../../src/services/postgreSql';
import { Neo4jService } from '../../../src/services/neo4j';
import fs from 'fs';

process.argv.push('--config');
process.argv.push('config-local.json');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';


export let ajv: Ajv.Ajv;

const certFile = fs.readFileSync(path.resolve(__dirname, '../../../ssl/server.key'));

const httpsAgent = new https.Agent({
    ca: certFile,
    rejectUnauthorized: false
});

export let gotInstance: Got;


export function getAddress(): string {
    return 'https://localhost:3033';
}

process.env.TS_NODE_PROJECT = path.resolve(__dirname, './tsconfig.json');


console.log('Using URL: ' + getAddress());


export const defaultPostfix = 'integration-test';

before(async () => {
    MwAuth.user = testUser;

    /**
     * SCHEMAS
     */
    const schemasBasic = [
        require(path.resolve(__dirname, '../../../src/schemas/v3/defs.json')),
        require(path.resolve(__dirname, '../../../src/schemas/v3/client/defs.json')),
        require(path.resolve(__dirname, '../../../src/schemas/v3/server/defs.json')),
        require(path.resolve(__dirname, '../../../src/schemas/v3/server/base.json'))
    ];

    const schemas = [
        require(path.resolve(__dirname, '../../../src/schemas/v3/client/order.json')),
        require(path.resolve(__dirname, '../../../src/schemas/v3/client/external.order.json')),
        require(path.resolve(__dirname, '../../../src/schemas/v3/client/company.json')),
        require(path.resolve(__dirname, '../../../src/schemas/v3/client/entity.json')),

        require(path.resolve(__dirname, '../../../src/schemas/v3/server/person.json')),
        require(path.resolve(__dirname, '../../../src/schemas/v3/server/order.json')),
        require(path.resolve(__dirname, '../../../src/schemas/v3/server/external.order.json')),
        require(path.resolve(__dirname, '../../../src/schemas/v3/server/company.json')),
        require(path.resolve(__dirname, '../../../src/schemas/v3/server/entity.json'))
    ];

    ajv = new Ajv({
        validateSchema: true,
        schemaId: 'auto',
        extendRefs: 'fail',
        missingRefs: 'fail',
        inlineRefs: true,
        allErrors: true,
        schemas: [
            ...schemasBasic,
            ...schemas
        ]
    });

    /**
     * DATABASES
     */

    const { name: cdbName } = CONFIG.servers.couchdb.databases.main;
    const { name: pgName } = CONFIG.servers.pgsql.databases.main;

    // await CouchDbService.connect(cdbName);
    // await PostgreSqlService.connect(pgName);
    // await Neo4jService.connect();
    // await Neo4jService.checkConnection();

    /**
     * APP
     */

    await App.run();
    await AppExternal.run();

    let token: string;
    let userId = 'tester';

    try {
        const response = await got.post(`http://localhost:3007/v2/users/${userId}/sign-in`, {
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


    // Create default company
    const company = companyGenerator(1).next().value;

    company._id = `company-${defaultPostfix}`;
    try {
        await CouchDbService.adapter.insert(company);
    } catch (e) {
        console.error(e.message);
    }

    // Create default person
    const person = personGenerator(1).next().value;

    person._id = `person-${defaultPostfix}`;
    try {
        await CouchDbService.adapter.insert(person);
    } catch (e) {
        console.error(e.message);
    }

    // Create default order
    const order = orderGenerator(1).next().value;

    order._id = `order-${defaultPostfix}`;
    try {
        await CouchDbService.adapter.insert(order);
    } catch (e) {
        console.error(e.message);
    }

});


after(async () => {
    const defaultDocs = [
        'company',
        'person',
        'order'
    ];

    // CouchDB
    for (const name of defaultDocs) {
        const doc = await CouchDbService.adapter.get(`${name}-${defaultPostfix}`);

        await CouchDbService.adapter.destroy(doc._id, doc._rev);
    }

    // PostgreSQL
    await PostgreSqlService.adapter.query(
        `DELETE FROM entities
        WHERE guid = 'company-${defaultPostfix}';`
    );
    await PostgreSqlService.adapter.query(
        `DELETE FROM entities
        WHERE guid = 'person-${defaultPostfix}';`
    );
    await PostgreSqlService.adapter.query(
        `DELETE FROM orders
        WHERE order_id = 'order-${defaultPostfix}';`
    );


    // Neo4j
    await Neo4jService.adapter.run(
        `MATCH 
        (c {_id : 'company-${defaultPostfix}'}), 
        (p {_id : 'person-${defaultPostfix}'})
        (o {_id : 'order-${defaultPostfix}'})
        DELETE c, p, o`
    );


    // Close connections
    await PostgreSqlService.adapter.end();
    await Neo4jService.adapter.close();
});






// describe('Beta', () => {
//
//     it('Validate OAuth token', async () => {
//         const token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjZmY2Y0MTMyMjQ3NjUxNTZiNDg3NjhhNDJmYWMwNjQ5NmEzMGZmNWEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJzdWIiOiIxMDEzOTQ5MDcyMjk5OTYyNTE3MjUiLCJoZCI6ImFwb2xsbzR1Lm5ldCIsImVtYWlsIjoiZmQuYWJiYXNiYXlsaUBhcG9sbG80dS5uZXQiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXVkIjoiNjEwMzczMzM3OTQ1LTdjcWNxZHI0MzBrcDVjOWZvcGUzNnBrZWkxc2ZjdDVhLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXRfaGFzaCI6InJzWTdpd0hWblFtRVd1RXhtdlFuZ3ciLCJuYW1lIjoiRmFyaWQgQWJiYXNiYXlsaSIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS0vQU9oMTRHaFRaY2JralFlX3psNHRmVDVSM1lNbDZtOWZMYzFUR3hfWTJaWG9oQT1zOTYtYyIsImdpdmVuX25hbWUiOiJGYXJpZCIsImZhbWlseV9uYW1lIjoiQWJiYXNiYXlsaSIsImxvY2FsZSI6ImVuLUdCIiwiaWF0IjoxNTg2OTY1MzU5LCJleHAiOjE1ODY5Njg5NTl9.Ku7pvqQAh6hScBS650Dbv20n-H-V_u-1AaTgEUorWhNbjPDjzMMD47aYl2G90BaGn8Lh4YSl1eY_KHIJ7kZpL6ZUL5NbFFJ-96ocQMLS2Ykn4K7A1RpkFO4uQQ8GxFluYEnxwrFQ148GQY5zrpsAY91UnK2E3bjP028xvBSG3UCA6qxSu27n6nlZ7EhGm_enBBdyYbIfPf6DOOeB_k9V-pVT-oAHXvU7aFS9-GeluVGARQpu4rXXHClNkWr7JLipoRxvMTNJ7iqdsbhA5_I1azKAdAU_bYoG7Ie0roLcUqVSQQwuRNr3vllsBCnlBP-PRiqcoM-4d6b4a6ck8UQuzg';
//         const { data, status } = await gotInstance.get(`${getAddress()}/v3/gapi/identity/check`).json();
//
//         expect(data).to.have.property('valid');
//
//
//     });
//
// });