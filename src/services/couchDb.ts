import nano, { DatabaseSessionResponse, DocumentScope, ServerScope } from 'nano';
import { CONFIG } from '../shared/config';
import { ApolloDocument } from '../@types/types';
import { apiLogger } from '../service-logger';
import got from 'got';


const {
    protocol,
    host,
    port,
    username,
    password
} = CONFIG.servers.couchdb;


export class CouchDbService {
    private static url: string = `${protocol}://${username}:${password}@${host}:${port}`;
    private static session: DatabaseSessionResponse
    static adapter: DocumentScope<any>
    static serverScope: ServerScope = nano(CouchDbService.url)

    static async connect(dbName?: string): Promise<boolean> {
        let message: string;

        try {
            const { body } = await got.get(this.url, {
                responseType: 'json',
            });

            if (body['couchdb'] === 'Welcome') message = `Connected to a CouchDB server ${this.url} successfully.`;

            apiLogger.logInfo({ message });
            console.log(message);

            this.session = await this.serverScope.session();

            return true;
        } catch (e) {
            message = `Unable to connect to a CouchDB server at: ${this.url}`;
            apiLogger.logError({ message });
            console.error(message);
            process.exit(1);

            return false;
        }

        // if (typeof authenticated === 'string') {
        //
        //     message = `Connected to a CouchDB server ${this.url} successfully.`;
        //     apiLogger.logInfo({ message });
        //     console.log(message);
        // }
        // else {
        //     message = `Unable to connect to a CouchDB server at: ${this.url}`;
        //     apiLogger.logError({ message });
        //     console.error(message);
        //     process.exit(1);
        // }

        if (dbName) this.switchDb(dbName);
    }


    static switchDb(dbName: string) {
        this.adapter = this.serverScope.use(dbName);
    }
}
