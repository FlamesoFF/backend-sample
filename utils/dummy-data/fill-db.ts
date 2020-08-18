import jwt from 'jsonwebtoken';
import { CouchDbService } from '../../src/services/couchDb';
import { companyGenerator } from './company';
import { orderGenerator } from './order';
import { personGenerator } from './person';
import { MwAuth } from '../../src/api/middlewares/auth';
import { CONFIG } from '../../src/shared/config';


const {
    main: { name: mainDbName }
} = CONFIG.servers.couchdb.databases;



class DummyData {
    static async connect() {
        // CouchDB
        await CouchDbService.connect();

        CouchDbService.switchDb(mainDbName);
    }

    static async run() {
        MwAuth.token = jwt.sign({
            _id: 'tester',
            name: 'Tester',
            initials: 'TE',
            email: 'tester@apollo4u.net',
            roles: [
                'user',
                'manager',
                'director',
                'developer'
            ]
        }, MwAuth.secret);

        console.log('Generating data...');

        const orders = [...orderGenerator(100)];
        const companies = [...companyGenerator(100)];
        const persons = [...personGenerator(100)];

        console.log('Deleting old data from DB...');

        const docMap = (await CouchDbService.adapter.find({
            selector: {
                $or: [
                    {
                        schema_id: { $eq: 'order_v3' }
                    },
                    {
                        class: { $eq: 'order' }
                    },
                    {
                        schema_id: { $eq: 'company_v3' }
                    },
                    {
                        class: { $eq: 'company' }
                    },
                    {
                        schema_id: { $eq: 'person_v3' }
                    },
                    {
                        class: { $eq: 'person' }
                    }
                ]
            },
            limit: 10000
        })).docs.map(doc => ({
            _id: doc._id,
            _rev: doc._rev,
            _deleted: true
        }));

        await CouchDbService.adapter.bulk({ docs: docMap }, {});

        console.log('Saving generated data to DB...');

        await CouchDbService.adapter.bulk({ docs: orders });
        await CouchDbService.adapter.bulk({ docs: companies });
        await CouchDbService.adapter.bulk({ docs: persons });

        console.log('Done!');
    }
}


DummyData.connect().then(async () => {
    await DummyData.run();
});