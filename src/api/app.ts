import spdy from 'spdy';
import { json, urlencoded } from 'body-parser';
import express from 'express';
import { MwLogs } from './middlewares/logs';
import api from './routes/api';
import { CONFIG } from '../shared/config';
import { CouchDbService } from '../services/couchDb';
import { PostgreSqlService } from '../services/postgreSql';
import { Neo4jService } from '../services/neo4j';
import { MwAuth } from './middlewares/auth';
import { HOST, SERVER_OPTIONS } from './constants';
import { OrdersController } from './controllers/order';


export default class App {
    private static app = express();
    private static PORT = CONFIG.API.port;


    static async run() {
        await this.initializeServices();
        await this.initializeControllers();

        // Express app
        this.app
            .use(json())
            .use(urlencoded({ extended: false }))
            .use(MwAuth.authorizationGate)
            .use('/v3', api)
            .use(MwLogs.appLogger);

        spdy
            .createServer(SERVER_OPTIONS, this.app)
            .listen(this.PORT, () => {
                console.log(`API server listening on ${HOST}:${this.PORT}`);
            });
    }

    private static async initializeServices() {
        // CouchDB
        await CouchDbService.connect();

        // Neo4j
        await Neo4jService.connect();
        await Neo4jService.checkConnection();
        await Neo4jService.newSession();

        // PostgreSQL
        await PostgreSqlService.connect();
    }

    private static async initializeControllers() {
        await OrdersController.initialize();
    }
}