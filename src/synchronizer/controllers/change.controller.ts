import { DatabaseChangesResultItem } from 'nano';
import { syncLogger } from '../../service-logger';
import { Neo4jController } from './neo4j.controller';
import { EntitiesController } from './entities.controller';
import { NanoDB } from '../scripts/utils/helper';
import { ApolloDocument } from '../../@types/types';


export class ChangeController {

    /**
     * @description This method processing database changes.
     */
    static async sync(dbName: string, change: DatabaseChangesResultItem) {
        const { deleted, id } = change;

        // const document = await NanoDB.get({ dbName, id });
        // const previousRevision = <ApolloDocument>await NanoDB.getPreviousRevision(dbName, change.id);

        async function applyChange() {
            let document: ApolloDocument;
            let className: string;

            // return script.apply(parameters);

            if (!deleted) {
                document = await NanoDB.get({ dbName, id });

                if (document) {
                    ({ class: className } = document);
                }
            } else {
                const documentPrevRev = await NanoDB.getPreviousRevision(dbName, id);

                if (documentPrevRev) {
                    ({ class: className } = documentPrevRev);
                }
            }


            switch (className) {
                case 'person':
                    await EntitiesController.syncChange(change);
                    break;
                case 'company':
                    await EntitiesController.syncChange(change);
                    break;
                case 'order':
                    break;
                case 'task':
                    break;
            }

            await Neo4jController.syncChange({
                change,
                type: 'on-change',
                dbName,
                document
            });
        }

        // for (const setting of Object.values(models)) {
        //     const { script } = setting;

        try {
            await applyChange();
        } catch (error) {
            syncLogger.logError({ data: error });
        }
        // }
    }

    // private static checkSettingConditions(setting: Setting, document: ApolloDocument): boolean {
    //     return setting.condition(document) && !!setting?.script?.apply;
    // }
}