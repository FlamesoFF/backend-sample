import spdy, { Server } from 'spdy';
import express, { json, urlencoded } from 'express';
import api from './routes/api';
import { CONFIG } from '../shared/config';
import { CouchDbService } from '../services/couchDb';
import { PostgreSqlService } from '../services/postgreSql';
import { Neo4jService } from '../services/neo4j';
import { MwAuth } from './middlewares/auth';
import { HOST, SERVER_OPTIONS } from './constants';
import { OrdersController } from './controllers/order';
import { appErrorLogger, appLogger } from './middlewares/logs';
import { apiErrorHandler } from './middlewares/errors';


export default class App {
    private static app = express();
    private static PORT = CONFIG.API.ports.private;
    private static server: Server;


    static async run() {
        await this.initializeServices();
        await this.initializeControllers();

        // Express app
        this.app
            .use(json())
            .use(urlencoded({ extended: false }))
            .use(MwAuth.authorizationGate)
            .use('/v3', api)
            .use(appLogger)
            .use(appErrorLogger)
            .use(apiErrorHandler);

        this.server = spdy
            .createServer(SERVER_OPTIONS, this.app)
            .listen(this.PORT, () => {
                console.log(`Private API endpoints are listening on ${HOST}:${this.PORT}`);
            });
    }

    private static async initializeServices() {
        console.log('API');

        // PostgreSQL
        await PostgreSqlService.connect();

        // CouchDB
        await CouchDbService.connect();

        // Neo4j
        await Neo4jService.connect();
        // await Neo4jService.checkConnection();
        await Neo4jService.startSession();

    }

    private static async initializeControllers() {
        await OrdersController.initialize();
    }

    static stop(): void {
        this.server.close();
    }
}