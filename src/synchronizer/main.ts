import nano, { DatabaseChangesResultItem } from 'nano';
import { CouchDbService } from '../services/couchDb';
import { syncLogger } from '../service-logger';
import { ChangeController } from './controllers/change.controller';
import { ApolloDocument } from '../@types/types';
import { args } from './scripts/utils/helper';
import { CouchDbController } from './controllers/couchdb.controller';
import { Neo4jController } from './controllers/neo4j.controller';
import { PostgreSqlService } from '../services/postgreSql';
import { EntitiesController } from './controllers/entities.controller';
import { Neo4jService } from '../services/neo4j';
import { ICompany } from '../@types/data/company';
import { IPerson } from '../@types/data/person';
import { CONFIG } from '../shared/config';


class Synchronizer {
    private feeds: {
        apollo: nano.FollowEmitter
        tasks: nano.FollowEmitter
    } = {
        apollo: undefined,
        tasks: undefined
    };


    static async run() {
        const synchronizer = new this();

        try {
            const { name: taskDbName } = CONFIG.servers.couchdb.databases?.tasks || {};

            await synchronizer.initialize();

            synchronizer.feeds.apollo.follow();
            if (taskDbName) synchronizer.feeds.tasks.follow();
        } catch (error) {
            syncLogger.logError({ message: error.message, data: error });
        }
    }

    private async initialize() {
        syncLogger.logInfo({ message: 'Initializing ...' });

        await this.initializeFeeds();


        syncLogger.logInfo({ message: 'Connecting to the servers...' });

        await CouchDbService.connect();
        await PostgreSqlService.connect();
        await Neo4jService.connect();
        await Neo4jService.checkConnection();

        // Re-sync
        if (args().init) {
            syncLogger.logInfo({ message: 'Fetching CouchDB documents to index ...' });

            const docs = await CouchDbController.fetchAllDocuments([
                'person',
                'company',
                'order',
                'task'
            ]);

            await Synchronizer.reSync(docs);
        }

        this.setListeners();

        syncLogger.logInfo({ message: 'Initialization finished.' });
    }

    private static async reSync(docs: ApolloDocument[]) {

        await Neo4jController.purge();
        await EntitiesController.purge();

        await Neo4jController.populate(docs);


        syncLogger.logInfo({ message: 'Populating Postgres...' });

        for (const doc of docs) {

            switch (doc.class) {
                case 'person':
                    // await Neo4jController.sync(neo4jOptions);
                    await EntitiesController.insert(<ICompany | IPerson>doc);
                    break;
                case 'company':
                    // await Neo4jController.sync(neo4jOptions);
                    await EntitiesController.insert(<ICompany | IPerson>doc);
                    break;
                case 'order':
                    // await Neo4jController.sync(neo4jOptions);
                    break;
                case 'task':
                    // await Neo4jController.sync(neo4jOptions);
                    break;
            }

        }

        syncLogger.logInfo({ message: 'Processing completed!' });
    }

    private async initializeFeeds() {
        const { name: mainDbName } = CONFIG.servers.couchdb.databases.main;
        const { name: tasksDbName } = CONFIG.servers.couchdb.databases?.tasks || {};

        await CouchDbService.connect();
        CouchDbService.switchDb(mainDbName);

        this.feeds.apollo = CouchDbService.adapter.follow({
            since: 'now',
            // since: 1200850,
            include_docs: true
        });

        if (CONFIG.servers.couchdb.databases.tasks) {
            CouchDbService.switchDb(tasksDbName);
            this.feeds.tasks = CouchDbService.adapter.follow({
                since: 'now',
                // since: 1200850,
                include_docs: true
            });
        }
    }


    private setListeners() {
        const { name: mainDbName } = CONFIG.servers.couchdb.databases.main;
        const tasksDbName = CONFIG.servers.couchdb.databases?.tasks?.name;

        this.feeds.apollo.on('change', async (change: DatabaseChangesResultItem) => {
            syncLogger.logInfo({ message: 'Change: apollo', data: change });

            await ChangeController.sync(mainDbName, change);
        });

        if (tasksDbName) {
            this.feeds.tasks.on('change', async (change: DatabaseChangesResultItem) => {
                syncLogger.logInfo({ message: 'Change: tasks', data: change });

                await ChangeController.sync(tasksDbName, change);
            });
        }
    }
}

Synchronizer.run().catch(error => {
    syncLogger.logError({ data: error });
});
