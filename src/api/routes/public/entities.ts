import { Router } from 'express';
import { CouchDbService } from '../../../services/couchDb';
import { Requests } from '../../@types/api/controllers.types';
import { ContactsPgSQLController } from '../../controllers/contact';
import statuses from 'statuses';
import { CONFIG } from '../../../shared/config';
import { sendFormatted } from '../../shared/responseFormatter';


export default Router({ mergeParams: true })

    .use((request, response, next) => {
        const {name} = CONFIG.servers.couchdb.databases.main;

        CouchDbService.switchDb(name);
        next();
    })

    // Create
    .post('/:id/contacts', async (request: Requests.Contacts.ICreatePgSQL, response, next) => {
        try {
            const result = await ContactsPgSQLController.create(request);

            response.status(statuses('OK'));
            sendFormatted(response, { body: result });

            next();
        } catch (error) {
            response.status(statuses(500));
            next(error);
        }
    });
