import express from 'express';
import statuses from 'statuses';
import { commonController } from '../controllers/common';
import { personsController } from '../controllers/person';
import { Requests } from '../@types/api/controllers.types';
import { CouchDbService } from '../../services/couchDb';
import { CONFIG } from '../../shared/config';


const router = express.Router({ mergeParams: true });

router.use((request, response, next) => {
    const { main: { name: dbName } } = CONFIG.servers.couchdb.databases;

    CouchDbService.switchDb(dbName);
    next();
});

// List or search
router.get('/', async (request: Requests.Common.ISearch, response, next) => {
    try {
        const result = await personsController.search(request);

        return response.status(statuses('OK')).send(result);
    } catch (error) {
        next(error);
    }
});

// Get specific person
router.get('/:id', async (request: Requests.Common.IGetSpecific, response, next) => {
    try {
        const result = await commonController.fetch(request, 'person');

        return response.status(statuses('OK')).send(result);
    } catch (error) {
        next(error);
    }
});

// Create person
router.post('/', async (request: Requests.Persons.ICreate, response, next) => {

    // next({ status: 501 });

    try {
        const result = await personsController.create(request);
        return response.status(201).send(result);
    } catch (error) {
        next(error);
    }
});

// Update person
router.put('/:id', async (request: Requests.Persons.IUpdate, response, next) => {
    next({ statusCode: 501 });

    // try {
    //     const result = await personsController.update(request);

    //     if (result.ok)
    //         return response.status(statuses('No Content')).send();
    //     else
    //         next({ status: statuses('Conflict') });
    // } catch (error) {
    //     next(error);
    // }
});

// Delete person
router.delete('/:id', async (request: Requests.Common.IRemove, response, next) => {
    try {
        const result = await commonController.remove(request, 'person');

        return response.status(200).send(result);
    } catch (error) {
        next(error);
    }
});

export default router;