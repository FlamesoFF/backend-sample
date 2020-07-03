import express from 'express';
import statuses from 'statuses';
import { commonController } from '../controllers/common';
import { companiesController } from '../controllers/company';
import { Requests } from '../@types/api/controllers.types';
import { CouchDbService } from '../../services/couchDb';
import { CONFIG } from '../../shared/config';


const router = express.Router({ mergeParams: true });

router.use((request, response, next) => {
    const { name: mainDbName } = CONFIG.servers.couchdb.databases.main;

    CouchDbService.switchDb(mainDbName);
    next();
});

// List or search
router.get('/', async (request: Requests.Common.ISearch, response, next) => {
    try {
        const result = await companiesController.search(request);

        return response.status(200).send(result);
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async (request: Requests.Common.IGetSpecific, response, next) => {
    try {
        const result = await commonController.fetch(request, 'company');


        return response.status(200).send(result);
    } catch (error) {
        next(error);
    }
});

router.post('/', async (request: Requests.Companies.ICreate, response, next) => {
    try {
        const result = await companiesController.create(request);


        return response.status(201).send(result);
    } catch (error) {
        next(error);
    }
});

router.put('/:id', async (request: Requests.Companies.IUpdate, response, next) => {
    try {
        const result = await companiesController.update(request);

        if (result.ok)
            return response.status(204).send();
        else
            next({ statusCode: 409 });
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', async (request: Requests.Common.IRemove, response, next) => {
    try {
        await commonController.remove(request, 'company');

        return response.status(statuses('No Content')).send();
    } catch (error) {
        next(error);
    }
});

/*
 * router.post('/:id/shares', async (request, response, next) => {
 *  const body = request.body;
 *
 *  try {
 *      const data = await Company.createShareTransactions(request.params.id, body);
 *
 *      return response.status(201).send(data);
 *  } catch (error) {
 *      next(error);
 *  }
 * })
 */

export default router;