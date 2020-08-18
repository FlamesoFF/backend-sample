import { PostgreSqlService } from '../../services/postgreSql';
import { syncLogger } from '../../service-logger';


export abstract class PostgreSqlController {

    protected static async purge(tableName: string) {
        const query = `TRUNCATE ${tableName}`;

        try {
            await PostgreSqlService.adapter.query(query).catch(error => {
                throw error;
            });
        } catch (error) {
            syncLogger.logError({
                message: 'Cannot purge Postgres!',
                data: error
            });
        }
    }

}