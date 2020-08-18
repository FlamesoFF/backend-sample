import { ApolloDocument } from '../../@types/types';
import { CouchDbService } from '../../services/couchDb';
import { Utils } from '../../api/shared/utils';
import { syncLogger } from '../../service-logger';
import { CONFIG } from '../../shared/config';


export abstract class CouchDbController {

    static async fetchAllDocuments(classes: string[]): Promise<ApolloDocument[]> {
        const mainDbName = CONFIG.servers.couchdb.databases.main.name;
        const tasksDbName = CONFIG.servers.couchdb.databases?.tasks?.name;

        CouchDbService.switchDb(mainDbName);

        const limit = 1000000000;

        const docs = Utils.Nano.normalizeResponse(
            // TODO: optimize
            await CouchDbService.adapter.find({
                selector: {
                    class: {
                        $exists: true,
                        $in: classes
                    },
                    schema_id: { $exists: true }
                },
                limit
            }).catch(error => {
                syncLogger.logError({ message: error.message, data: error });
                throw error;
            })
        );

        let tasks = [];

        if (tasksDbName) {
            CouchDbService.switchDb(tasksDbName);

            tasks = Utils.Nano.normalizeResponse(
                await CouchDbService.adapter.find({
                    selector: {
                        class: {
                            $exists: true,
                            $in: classes
                        },
                        schema_id: { $exists: true },
                    },
                    limit
                }).catch(error => {
                    syncLogger.logError({ message: error.message, data: error });
                    throw error;
                })
            );

        }


        // Obtaining documents.
        return [
            ...docs,
            ...tasks
        ];
    }
}