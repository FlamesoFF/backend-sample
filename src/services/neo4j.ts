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

    static async connect(initSession?: boolean): Promise<void> {
        try {
            const url = `${protocol}://${host}:${port}`;

            this.driver = neo4j.driver(
                url,
                neo4j.auth.basic(
                    username,
                    password
                )
            );

            if (initSession) this.newSession();
        } catch (error) {
            console.error('Unable to connect to a Neo4j server: ', error);
            process.exit(1);
        }
    }

    static async checkConnection() {
        try {
            await this.driver.verifyConnectivity();

            process.on('beforeExit', (code) => {
                this.adapter.close();
                console.log('Disconnected from Neo4j server.');
            });

            console.log('Connection to Neo4j DB successful!');
        } catch (error) {
            console.log(`Connectivity verification failed. ${error}`);
            process.exit(1);
        }
    }

    static newSession(neo4jSessionParameters?: Neo4jSessionParameters) {
        Neo4jService.adapter = this.driver.session(neo4jSessionParameters);
    }

    static async runQuery(query: string) {
        return this.adapter.run(query);
    }

    static async runTransaction(query: string, parameters?: object) {
        await this.adapter.writeTransaction(tx => tx.run(query, parameters));
    }

    static async runAsyncSession(queries: TransactionQuery[]) {
        const transaction = this.adapter.beginTransaction();

        for (const item of queries) {
            const { query, parameters } = item;

            transaction.run(query, parameters);
        }

        return transaction.commit();
    }
}

