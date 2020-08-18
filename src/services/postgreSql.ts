import { Client, Pool } from 'pg';
import { CONFIG } from '../shared/config';


const {
    host,
    port,
    username: user,
    password,
    databases: {
        main: { name: mainDbName }
    }
} = CONFIG.servers.pgsql;


export class PostgreSqlService {
    static adapter: Client;
    static poolAdapter: Pool;

    static async connect(dbName?: string): Promise<boolean> {
        PostgreSqlService.adapter = new Client({
            host,
            port,
            database: dbName || mainDbName,
            user,
            password
        });

        try {
            await PostgreSqlService.adapter.connect();
        } catch (error) {
            this.onError(error);
        }

        try {
            await PostgreSqlService.adapter
                .query('SELECT $1::text as message', ['Hello world!']);
        } catch (error) {
            this.onError(error);
        }

        console.log('Connected to a PostgreSQL server.');

        process.on('beforeExit', (code) => {
            this.adapter.end();
            console.log('Disconnected from Postgres server.');
        });

        return true;
    }


    private static onError(error) {
        console.error(`Unable to connect to a PostgreSQL server at: ${host}:${port};`, error);
        process.exit(1);
    }

    static async connectPool(): Promise<boolean> {
        PostgreSqlService.poolAdapter = new Pool({
            user,
            password,
            host,
            port,
            database: mainDbName
        });


        try {
            await PostgreSqlService.adapter.connect();

            process.on('beforeExit', (code) => {
                this.adapter.end();
                console.log('Disconnected from Postgres server.');
            });
        } catch (error) {
            this.onError(error);
        }

        try {
            await PostgreSqlService.adapter.query('SELECT NOW() as now');
            console.log('Connected to a PostgreSQL server.');
        } catch (error) {
            this.onError(error);
        }

        return true;
    }


    static async disconnect(): Promise<void> {
        return await PostgreSqlService.adapter.end();
    }

    static async disconnectPool(): Promise<void> {
        return await PostgreSqlService.poolAdapter.end();
    }

}