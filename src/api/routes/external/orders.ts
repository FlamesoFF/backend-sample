import { Router } from 'express';
import { Requests, Responses } from '../../@types/api/controllers.types';
import statuses from 'statuses';
import { CouchDbService } from '../../../services/couchDb';
import { OrdersPgSQLController } from '../../controllers/order';
import { ResponseFormatterData } from '../../middlewares/response';
import { CONFIG } from '../../../shared/config';


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

            response.status(statuses('OK')).send(result);
            next();
        } catch (error) {
            response.status(statuses(505)).send(<Responses.Basic>{
                ok: false
            });
            next(error);
        }
    })
    // Get by ID
    .get('/:id', async (request: Requests.Common.IGetSpecific, response, next) => {
        try {
            const result = await OrdersPgSQLController.getById(request);

            response.status(statuses('OK')).send(result);
            next();
        } catch (error) {
            response.status(statuses(505)).send(<Responses.Basic>{
                ok: false
            });
            next(error);
        }
    })
    // Create
    .post('/', async (request: Requests.Orders.ICreateWithPgSQL, response, next) => {
        try {
            const { id }: ResponseFormatterData = await OrdersPgSQLController.create(request);

            response.status(201).send(<Responses.Basic>{
                ok: true,
                id
            });
            next();
        } catch (error) {
            response.status(statuses(505)).send(<Responses.Basic>{
                ok: false
            });
            next(error);
        }
    })
    // Update
    .put('/:id', async (request: Requests.Orders.IUpdateWithPgSQL, response, next) => {
        try {
            const { id }: ResponseFormatterData = await OrdersPgSQLController.update(request);

            response.status(200).send(<Responses.Basic>{
                ok: true,
                id
            });
            next();
        } catch (error) {
            response.status(statuses(505)).send(<Responses.Basic>{
                ok: false
            });
            next(error);
        }
    })
    // Bind to threads
    .patch('/:id/threads', async (request: Requests.Orders.IBindThread, response, next) => {
        try {
            const { id }: ResponseFormatterData = await OrdersPgSQLController.bindThreads(request);

            response.status(200).send(<Responses.Basic>{
                ok: true,
                id
            });
            next();
        } catch (error) {
            response.status(statuses(505)).send(<Responses.Basic>{
                ok: false
            });
            next(error);
        }
    });