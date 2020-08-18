import { Router } from 'express';
import { Requests } from '../../@types/api/controllers.types';
import statuses from 'statuses';
import { commonController } from '../../controllers/common';
import { OrdersController } from '../../controllers/order';
import { CouchDbService } from '../../../services/couchDb';
import { CONFIG } from '../../../shared/config';


const router = Router({ mergeParams: true });

router.use((request, response, next) => {
    const { name: mainDbName } = CONFIG.servers.couchdb.databases.main;

    CouchDbService.switchDb(mainDbName);
    next();
});

// Search
router.get('/', async (request: Requests.Orders.ISearch, response, next) => {
    try {
        const result = await OrdersController.search(request);

        response.status(statuses('OK')).send(result);
        next();
    } catch (error) {
        response.status(500).send(error);
        next(error);
    }
});

// Get by ID
router.get('/:id', async (request: Requests.Common.IGetSpecific, response, next) => {
    try {
        const result = await commonController.fetch(request, 'order');

        response.status(statuses('OK')).send(result);
        next();
    } catch (error) {
        response.status(404).send(error);
        next(error);
    }
});

// Create new Order
router.post('/', async (request: Requests.Orders.ICreate, response, next) => {
    try {
        const result = await OrdersController.create(request);

        response.status(201).send(result);
        next();
    }
    catch (error) {
        response.status(500).send(error);
        next(error);
    }
});


router.delete('/:id', async (request: Requests.Common.IRemove, response, next) => {
    try {
        const result = await commonController.remove(request, 'order');

        response.status(statuses('No Content')).send(result);
        next();
    } catch (error) {
        response.status(500).send(error);
        next(error);
    }
});

export default router;