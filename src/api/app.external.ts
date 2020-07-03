import spdy from 'spdy';
import { json } from 'body-parser';
import express from 'express';
import { appLogger, MwLogs } from './middlewares/logs';
import { CouchDbService } from '../services/couchDb';
import { PostgreSqlService } from '../services/postgreSql';
import { Neo4jService } from '../services/neo4j';
import external from './routes/external/external';
import { MwAuth } from './middlewares/auth';
import { HOST, SERVER_OPTIONS } from './constants';
import { apiErrorHandler } from './middlewares/errors';
import { apiResponseHandler } from './middlewares/response';


export default class AppExternal {
    private static app = express();
    private static PORT = 3034;

    static async run() {
        // CouchDB
        await CouchDbService.connect();

        // Neo4j
        await Neo4jService.connect();
        await Neo4jService.checkConnection();

        // PostgreSQL
        await PostgreSqlService.connect();


        // Express app
        this.app
            .use(json())
            .use(MwAuth.authorizationGate)
            .use('/v3', external)
            .use(appLogger)
            .use(apiErrorHandler)
            .use(apiResponseHandler);

        spdy
            .createServer(SERVER_OPTIONS, this.app)
            .listen(this.PORT, () => {
                console.log(`API Beta endpoints listening on ${HOST}:${this.PORT}`);
            });
    }
}