import nconf from 'nconf';
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
        main: nano.FollowEmitter
        tasks: nano.FollowEmitter
    } = {
        main: undefined,
        tasks: undefined
    };


    static async run(): Promise<void> {
        const synchronizer = new this();

        const { init } = nconf.argv().load();

        if (!init) console.warn(
            `Synchronizer is running without initialization. To run with initialization use "--init" flag.`
        );

        try {
            const { name: taskDbName } = CONFIG.servers.couchdb.databases?.tasks || {};

            await synchronizer.initializeConnections();

            // Re-sync
            if (args().init) {
                await this.reSync();
            }
        } catch (error) {
            syncLogger.logError({ message: error.message, data: error });
        }
    }

    private async initializeConnections() {
        syncLogger.logInfo({ message: 'Connecting to the servers...' });
        console.log('Synchronizer');

        await CouchDbService.connect();
        await PostgreSqlService.connect();
        await Neo4jService.connect();

        syncLogger.logInfo({ message: 'Initializing feeds...' });
        await this.initializeFeeds();

        this.setListeners();

        syncLogger.logInfo({ message: 'Initialization finished.' });
    }

    private static async reSync() {
        syncLogger.logInfo({ message: 'Re-syncing databases...' });

        const docs: ApolloDocument[] = await CouchDbController.fetchAllDocuments([
            'person',
            'company',
            'order',
            'task'
        ]);

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

        CouchDbService.switchDb(mainDbName);

        this.feeds.main = CouchDbService.adapter.follow({
            since: 'now',
            include_docs: true
        });

        if (CONFIG.servers.couchdb.databases.tasks) {
            CouchDbService.switchDb(tasksDbName);

            this.feeds.tasks = CouchDbService.adapter.follow({
                since: 'now',
                include_docs: true
            });
        }
    }


    private setListeners() {
        const { name: mainDbName } = CONFIG.servers.couchdb.databases.main;
        const tasksDbName = CONFIG.servers.couchdb.databases?.tasks?.name;

        this.feeds.main.on('change', async (change: DatabaseChangesResultItem) => {
            syncLogger.logInfo({ message: `Change: ${mainDbName}`, data: change });
            console.log(`Change: ${mainDbName}`);

            await ChangeController.sync(mainDbName, change);
        });

        this.feeds.main.follow();

        if (tasksDbName) {
            this.feeds.tasks.on('change', async (change: DatabaseChangesResultItem) => {
                syncLogger.logInfo({ message: `Change: ${tasksDbName}`, data: change });
                console.log(`Change: ${tasksDbName}`);

                await ChangeController.sync(tasksDbName, change);
            });

            this.feeds.tasks.follow();
        }
    }
}

// Convert to module.
process
    .on('uncaughtException', error => {
        syncLogger.logError({ data: error });
    })
    .on('beforeExit', error => {
        console.log('Synchronizer was stopped.');
    });

export default Synchronizer.run();
