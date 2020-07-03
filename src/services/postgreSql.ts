import { Client, Pool } from 'pg';
import { CONFIG } from '../shared/config';
import { Sequelize } from 'sequelize';


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
    static builder: Sequelize = new Sequelize({ dialect: 'postgres' });

    static async connect(dbName?: string): Promise<boolean> {
        PostgreSqlService.adapter = new Client({
            host,
            port,
            database: dbName || mainDbName,
            user,
            password
        });

        const onError = error => {
            throw new Error('Unable to connect to a PostgreSQL server: ' + error);
            process.exit(1);
        };

        await PostgreSqlService.adapter.connect()
            .catch(onError);


        await PostgreSqlService.adapter
            .query('SELECT $1::text as message', ['Hello world!'])
            .catch(onError);

        console.log('Connected to a PostgreSQL server.');

        process.on('beforeExit', (code) => {
            this.adapter.end();
            console.log('Disconnected from Postgres server.');
        });

        return true;
    }


    static async connectPool(): Promise<boolean> {
        PostgreSqlService.poolAdapter = new Pool({
            user,
            password,
            host,
            port,
            database: mainDbName
        });

        const onError = error => {
            throw new Error('Unable to connect to a PostgreSQL server: ' + error);
        };

        try {
            await PostgreSqlService.adapter.connect();

            process.on('beforeExit', (code) => {
                this.adapter.end();
                console.log('Disconnected from Postgres server.');
            });
        } catch (error) {
            onError(error);
        }

        try {
            await PostgreSqlService.adapter.query('SELECT NOW() as now');
            console.log('Connected to a PostgreSQL server.');
        } catch (error) {
            onError(error);
        }

        return true;
    }


    static async disconnectPool(): Promise<void> {
        return await PostgreSqlService.poolAdapter.end();
    }

}