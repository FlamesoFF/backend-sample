import { Router } from 'express';
import statuses from 'statuses';
import { entitiesController } from '../controllers/entities';
import { Requests } from '../@types/api/controllers.types';
import { CouchDbService } from '../../services/couchDb';
import { CONFIG } from '../../shared/config';


const router = Router({ mergeParams: true });

router.use((request, response, next) => {
    const {
        main: { name: mainDbName }
    } = CONFIG.servers.couchdb.databases;

    CouchDbService.switchDb(mainDbName);
    next();
});

// Get by ID
router.get('/:id', async (request: Requests.Common.IGetSpecific, response, next) => {
    try {
        const result = await entitiesController.get(request);

        response.status(statuses('OK')).send(result);
    } catch (error) {
        next(error);
    }
});

// List or search
router.get('/', async (request: Requests.Entities.Search, response, next) => {
    try {
        const result = await entitiesController.search(request);


        return response.status(statuses('OK')).send(result);
    } catch (error) {
        next(error);
    }
});

/*
 * router.get('/:id/shares', async (request: Requests.Entities.GetShares, response, next) => {
 *     try {
 *          let result = await entitiesController.getShares(request)
 *         return response.status(200).send();
 *     } catch (error) {
 *         next(error);
 *     }
 * });
 */


export default router;