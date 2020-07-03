import nano, { DocumentScope, ServerScope } from 'nano';
import { CONFIG } from '../shared/config';
import { ApolloDocument } from '../@types/types';
import { apiLogger } from '../service-logger';


const {
    protocol,
    host,
    port,
    username,
    password
} = CONFIG.servers.couchdb;


export class CouchDbService {
    private static url: string = `${protocol}://${username}:${password}@${host}:${port}`;

    static adapter: DocumentScope<ApolloDocument & object>;
    static serverScope: ServerScope = nano(CouchDbService.url);

    static async connect(dbName?: string): Promise<boolean> {
        const {
            info,
            info: {
                authenticated,
                authenticated_db
            }
        } = await this.serverScope.session();

        if (typeof authenticated === 'string') {
            apiLogger.logInfo({ message: 'Connected to a CouchDB server successfully.' });
        }
        else {
            apiLogger.logError({ message: 'Unable to connect to a CouchDB server: ' });
            process.exit(1);
        }

        if (dbName) this.switchDb(dbName);

        return info;
    }

    static switchDb(dbName: string) {
        this.adapter = this.serverScope.use(dbName);
    }
}
