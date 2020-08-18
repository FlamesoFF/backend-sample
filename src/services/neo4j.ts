import { CONFIG } from '../shared/config';
import neo4j, { Session } from 'neo4j-driver';
import { Driver, SessionMode } from 'neo4j-driver/types/driver';


const {
    protocol,
    host,
    port,
    username,
    password
} = CONFIG.servers.neo4j;


export interface TransactionQuery {
    query: string;
    parameters?: object;
}

interface Neo4jSessionParameters {
    defaultAccessMode?: SessionMode
    bookmarks?: string | string[]
    fetchSize?: number
    database?: string
}

export class Neo4jService {
    static adapter: Session;
    private static driver: Driver;
    private static readonly transactions: Promise<any>[] = [];
    private static url = `${protocol}://${host}:${port}`;

    static async connect(initSession?: boolean): Promise<void> {
        try {
            this.driver = neo4j.driver(
                this.url,
                neo4j.auth.basic(
                    username,
                    password
                )
            );

            await this.checkConnection();

            if (initSession) this.startSession();
        } catch (error) {
            delete this.driver;

            console.error(`Unable to connect to a Neo4j server at: ${this.url}`, error);
            process.exit(1);
        }
    }

    static async disconnect(initSession?: boolean): Promise<void> {
        try {
            await Neo4jService.adapter.close();
        } catch (e) {
            console.error(e);
        }
    }

    private static async checkConnection() {
        try {
            await this.driver.verifyConnectivity();

            process.on('beforeExit', (code) => {
                this.adapter.close();
                console.log('Disconnected from Neo4j server.');
            });

            console.log('Connection to Neo4j DB successful!');
        } catch (error) {
            console.log(`Connectivity verification failed. Unable to connect to ${this.url}`, error);
            process.exit(1);
        }
    }

    static startSession(neo4jSessionParameters?: Neo4jSessionParameters) {
        Neo4jService.adapter = this.driver.session(neo4jSessionParameters);
    }

    static async runQuery(query: string) {
        return this.adapter.run(query);
    }

    static async runAtomicParallelTransaction(query: string, parameters?: object) {
        const session = this.driver.session();
        const transaction = await session.beginTransaction();

        await transaction.run(query, parameters);

        await transaction.commit();

        await session.close();
    }

    static async bulkQueries(queries: TransactionQuery[]) {
        // const transaction = this.adapter.beginTransaction();

        for (const item of queries) {
            const { query, parameters } = item;

            await this.runAtomicParallelTransaction(query, parameters);
        }

        // return;
    }
}

