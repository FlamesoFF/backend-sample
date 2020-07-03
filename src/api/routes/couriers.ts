import { Router } from 'express';
import statuses from 'statuses';
import { commonController } from '../controllers/common';
import { couriersController } from '../controllers/couriers';
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


// List or search
router.get('/', async (request: Requests.Common.ISearch, response, next) => {
    try {
        const { name } = request.query;
        let result;

        if (name)
            result = await couriersController.search(request);
        else
            result = await couriersController.list(request);

        response.status(statuses('OK')).send(result);
    } catch (error) {
        next(error);
    }
});

// load single
router.get('/:id', async (request: Requests.Common.IGetSpecific, response, next) => {
    try {
        const result = await commonController.fetch(request, 'courier');
        response.status(statuses('OK')).send(result);
    } catch (error) {
        next(error);
    }
});

// create new
router.post('/', async (request: Requests.Couriers.ICreate, response, next) => {
    try {
        const result = await couriersController.create(request);

        return response.status(statuses('Created')).send(result);
    }
    catch (error) {
        next(error);
    }
});

// update existing one
router.put('/:id', async (request: Requests.Couriers.IUpdate, response, next) => {
    next({ statusCode: 501 });
});

// delete existing one
router.delete('/:id', async (request: Requests.Common.IRemove, response, next) => {
    try {
        const result = await commonController.remove(request, 'courier');
        response.status(statuses('No Content')).send();
    }
    catch (error) {
        next(error);
    }
});

export default router;