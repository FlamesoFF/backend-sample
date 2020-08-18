import spdy, { Server } from 'spdy';
import express, { json } from 'express';
import { appErrorLogger, appLogger } from './middlewares/logs';
import { CouchDbService } from '../services/couchDb';
import { PostgreSqlService } from '../services/postgreSql';
import { Neo4jService } from '../services/neo4j';
import external from './routes/public/external';
import { MwAuth } from './middlewares/auth';
import { HOST, SERVER_OPTIONS } from './constants';
import { apiErrorHandler } from './middlewares/errors';
import { CONFIG } from '../shared/config';


export default class AppExternal{
    private static app = express();
    private static PORT = CONFIG.API.ports.public;
    private static server: Server;


    static async run() {
        await this.initializeServices();

        // Express app
        this.app
            .use(json())
            .use(MwAuth.authorizationGate)
            .use('/v3', external)
            .use(appLogger)
            .use(appErrorLogger)
            .use(apiErrorHandler);

        this.server = spdy
            .createServer(SERVER_OPTIONS, this.app)
            .listen(this.PORT, () => {
                console.log(`Public API endpoints are listening on ${HOST}:${this.PORT}`);
            });
    }

    private static async initializeServices() {
        console.log('API public');
        // CouchDB
        await CouchDbService.connect();

        // PostgreSQL
        await PostgreSqlService.connect();

        // Neo4j
        await Neo4jService.connect();
        // await Neo4jService.checkConnection();
        await Neo4jService.startSession();

    }

    static stop(): void {
        this.server.close();
    }
}