import express from 'express';
import { Requests } from '../@types/api/controllers.types';
import { contactsController } from '../controllers/contact';
import { CouchDbService } from '../../services/couchDb';
import { CONFIG } from '../../shared/config';


const router = express.Router({ mergeParams: true });

router.use((request, response, next) => {
    const {
        main: { name: mainDbName }
    } = CONFIG.servers.couchdb.databases;

    CouchDbService.switchDb(mainDbName);
    next();
});


router.get('/:email', async (request: Requests.Contacts.IGetByEmail, response, next) => {
    try {
        const result = await contactsController.fetch(request);

        return response.status(200).send(result);
    } catch (error) {
        next(error);
    }
});

export default router;