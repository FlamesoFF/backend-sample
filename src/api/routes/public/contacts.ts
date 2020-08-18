import { Router } from 'express';
import { CouchDbService } from '../../../services/couchDb';
import { Requests } from '../../@types/api/controllers.types';
import statuses from 'statuses';
import { ContactsPgSQLController } from '../../controllers/contact';
import { CONFIG } from '../../../shared/config';
import { sendFormatted } from '../../shared/responseFormatter';


export default Router({ mergeParams: true })
    .use((request, response, next) => {
        const {name} = CONFIG.servers.couchdb.databases.main;
        
        CouchDbService.switchDb(name);
        next();
    })

    // Search
    .get('/:id/entities', async (request: Requests.Contacts.IGetPgSQL, response, next) => {
        try {
            const result = await ContactsPgSQLController.get(request);

            response.status(statuses('OK'));
            sendFormatted(response, { body: result });
            next();
        } catch (error) {
            response.status(statuses(500));
            next(error);
        }
    });