import { PostgreSqlService } from '../../services/postgreSql';
import { syncLogger } from '../../service-logger';
import { PostgreSqlController } from './postgresql.controller';
import { isCompany, isPerson } from '../../shared/utils/typeGuards';
import { ICompany } from '../../@types/data/company';
import { IPerson } from '../../@types/data/person';
import { DatabaseChangesResultItem } from 'nano';
import { CouchDbService } from '../../services/couchDb';

type Entity = ICompany | IPerson;

export class EntitiesController extends PostgreSqlController {
    private static table = 'entities';


    private static async isExist(id: string) {
        const query =
            `select guid 
            from ${this.table} 
            where guid=$1`;

        try {
            const result = await PostgreSqlService.adapter.query(query, [id]);

            return !!result?.rows?.length;
        } catch (error) {
            syncLogger.logError({ message: error.message, data: error });
        }
    }

    static async syncChange(change: DatabaseChangesResultItem) {
        let { deleted, id } = change;

        if (deleted) {
            await this.delete(id);
        } else {
            const exists = await this.isExist(id);

            const doc = await CouchDbService.adapter.get(id).catch(error => {
                syncLogger.logError({ message: `Can not find document ${id}`, data: error });
            });

            if (exists) {
                await this.update(<Entity>doc);
            } else {
                await this.insert(<Entity>doc);
            }

        }
    }

    static async insert(doc: Entity) {
        const query =
            `insert into ${this.table} (name, description, data, guid) 
            values($1, $2, $3, $4)`;

        try {
            const { _id, name } = doc;

            await PostgreSqlService.adapter.query(
                query,
                [
                    name,   // name
                    this.getDescription(doc),    // description
                    this.getData(doc),  // data
                    _id // guid
                ]
            );

            syncLogger.logInfo({ message: `Created entity: ${_id}` });
        } catch (error) {
            syncLogger.logError({ message: error.message, data: error });
        }
    }

    static async update(doc: Entity) {
        const query =
            `update ${this.table} 
            set name=$1, description=$2, data=$3, guid=$4 
            where guid=$4`;
        const { _id, name } = doc;

        await PostgreSqlService.adapter.query(query, [
            name,   // name
            this.getDescription(<Entity>doc),   // description
            this.getData(<Entity>doc),  // data
            _id    // guid
        ]).catch(error => {

            syncLogger.logError({ message: error.message, data: error });
        });

        syncLogger.logInfo({ message: `Updated entity: ${_id}` });

    }

    static async delete(id: string) {
        const query =
            `delete 
            from ${this.table} 
            where guid=$1`;

        try {
            await PostgreSqlService.adapter.query(query, [id]);

            syncLogger.logInfo({ message: `Deleted entity: ${id}` });
        } catch (error) {
            syncLogger.logError({ message: error.message, data: error });
        }
    }

    static async purge() {
        await super.purge(this.table);
    }


    private static getDescription(doc: Entity) {
        if (isPerson(doc)) {
            const { date_of_birth } = doc;

            return date_of_birth;
        } else if (isCompany(doc)) {
            const {
                country: { code },
                certificate
            } = doc;

            return `${code} ${certificate}`;
        }
    }

    private static getData(doc: Entity): string {
        const { type, class: cn } = doc;

        return JSON.stringify({ type, class: cn });
    }

}