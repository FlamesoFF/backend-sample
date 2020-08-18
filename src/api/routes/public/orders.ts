import { Router } from 'express';
import { Requests } from '../../@types/api/controllers.types';
import statuses from 'statuses';
import { CouchDbService } from '../../../services/couchDb';
import { OrdersPgSQLController } from '../../controllers/order';
import { CONFIG } from '../../../shared/config';
import { sendFormatted } from '../../shared/responseFormatter';
import { ResponseFormatterData } from "../../middlewares/types";


export default Router({ mergeParams: true })

    .use((request, response, next) => {
        const { name: mainDbName } = CONFIG.servers.couchdb.databases.main;

        CouchDbService.switchDb(mainDbName);
        next();
    })

    // Search
    .get('/', async (request: Requests.Orders.ISearchWithPgSQL, response, next) => {
        try {
            const result = await OrdersPgSQLController.search(request);

            response.status(statuses('OK'));
            sendFormatted(response, { body: result });
            next();
        } catch (error) {
            response.status(statuses(500));
            next(error);
        }
    })
    // Get by ID
    .get('/:id', async (request: Requests.Common.IGetSpecific, response, next) => {
        try {
            const result = await OrdersPgSQLController.getById(request);

            response.status(statuses('OK'));
            sendFormatted(response, { body: result });
            next();
        } catch (error) {
            response.status(statuses(500));
            next(error);
        }
    })
    // Create
    .post('/', async (request: Requests.Orders.IPgSQLCreate, response, next) => {
        try {
            const data: ResponseFormatterData = await OrdersPgSQLController.create(request);

            response.status(201);
            sendFormatted(response, data);
            next();
        } catch (error) {
            response.status(statuses(500));
            next(error);
        }
    })
    // Update
    .put('/:id', async (request: Requests.Orders.IPgSQLUpdate, response, next) => {
        try {
            const { id }: ResponseFormatterData = await OrdersPgSQLController.update(request);

            response.status(200);
            sendFormatted(response, { id });
            next();
        } catch (error) {
            response.status(statuses(500));
            next(error);
        }
    })
    // Bind to threads
    .patch('/:id/threads', async (request: Requests.Orders.IPgSQLBindThread, response, next) => {
        try {
            const { id }: ResponseFormatterData = await OrdersPgSQLController.bindThreads(request);

            response.status(200);
            sendFormatted(response, { id });
            next();
        } catch (error) {
            response.status(statuses(500));
            next(error);
        }
    });