import { StatsDocument } from "../controllers/stats";
import { CONFIG } from '../../shared/config';
import got, { Got } from 'got';
import nconf from 'nconf';
import path from 'path';
import App from '../app';
import AppExternal from '../app.external';
import { MwAuth } from '../middlewares/auth';
import { CouchDbService } from '../../services/couchDb';
import { Neo4jService } from '../../services/neo4j';
import { PostgreSqlService } from '../../services/postgreSql';
import { companyGenerator } from '../../../utils/dummy-data/company';
import { orderGenerator } from '../../../utils/dummy-data/order';
import { personGenerator } from '../../../utils/dummy-data/person';
import { defaultPostfix, httpsAgent } from '../../../tests/shared';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';


export const {token: API_TOKEN} = nconf.argv().load();
export let gotInstance: Got;

process.env.TS_NODE_PROJECT = path.resolve(__dirname, './tsconfig.json');

before(async() => {
    /**
     * TOKEN
     */

    let token: string;
    const userId = 'tester';

    if(!API_TOKEN) {
        try {
            const response = await got.post<{token: string}>(`http://localhost:3006/v2/users/${userId}/sign-in`, {
                json: {
                    password: 'qwerTy123'
                },
                responseType: 'json',
                headers: {'Content-Type': 'application/json'}
            });

            ({token = ''} = response.body);
        } catch(e) {
            console.error('Unable to obtain token.', e);
            process.exit(1);
        }
    } else {
        console.error('Authorization successful.');
        token = API_TOKEN;
    }

    MwAuth.token = token;

    /**
     * HTTP lib instance
     */
    gotInstance = got.extend({
        agent: {
            https: httpsAgent
        },
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    /**
     * Services
     */
    await App.run();
    await AppExternal.run();

    CouchDbService.switchDb(CONFIG.servers.couchdb.databases.main.name);

    // Create default company
    const company = companyGenerator(1).next().value;

    company._id = `company-${defaultPostfix}`;

    try {
        await CouchDbService.adapter.insert(company);
    } catch(e) {
        console.error(e.message);
    }

    // Create default person
    const person = personGenerator(1).next().value;

    person._id = `person-${defaultPostfix}`;

    try {
        await CouchDbService.adapter.insert(person);
    } catch(e) {
        console.error(e.message);
    }

    // Create default order
    const order = orderGenerator(1).next().value;

    order._id = `order-${defaultPostfix}`;

    try {
        await CouchDbService.adapter.insert(order);
    } catch(e) {
        console.error(e.message);
    }

    // Create stats file
    const stats: StatsDocument = {
        _id: 'stats',
        orders: {
            number: 0
        }
    };

    try {
        await CouchDbService.adapter.insert(<any>stats);
    } catch(e) {
        console.error(e.message);
    }

});


after(async() => {
    const defaultDocs = [
        'company',
        'person',
        'order'
    ];

    // CouchDB
    for (const name of defaultDocs) {
        try {
            const doc = await CouchDbService.adapter.get(`${name}-${defaultPostfix}`);

            await CouchDbService.adapter.destroy(doc._id, doc._rev);
        } catch (e) {
        }
    }

    // PostgreSQL
    await PostgreSqlService.adapter.query(
        `DELETE FROM entities
        WHERE guid = 'company-${defaultPostfix}'`
    );
    await PostgreSqlService.adapter.query(
        `DELETE FROM entities
        WHERE guid = 'person-${defaultPostfix}'`
    );
    await PostgreSqlService.adapter.query(
        `DELETE FROM orders
        WHERE order_id = 'order-${defaultPostfix}'`
    );


    // Neo4j
    await Neo4jService.runAtomicParallelTransaction(
        `MATCH
        (c {_id : 'company-${defaultPostfix}'}),
        (p {_id : 'person-${defaultPostfix}'}),
        (o {_id : 'order-${defaultPostfix}'})
        DELETE c, p, o`
    );

    // Close connections
    await PostgreSqlService.disconnect();
    await Neo4jService.disconnect();

    // Stop services
    await App.stop();
    await AppExternal.stop();
});



describe('my test suite', function () {
    it('should have run my global setup', function () {
        // make assertion
    });
});