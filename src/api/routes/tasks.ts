import { Router } from 'express';
import { tasksController } from '../controllers/tasks';
import { CouchDbService } from '../../services/couchDb';
import statuses from 'statuses';
import { commonController } from '../controllers/common';
import { Requests } from '../@types/api/controllers.types';
import { CONFIG } from '../../shared/config';


const router = Router({ mergeParams: true });

router.use((request, response, next) => {
    const { main: { name: mainDbName } } = CONFIG.servers.couchdb.databases;

    // switching to todos-v1 DB
    CouchDbService.switchDb(mainDbName);
    next();
});

router.route('/')
    // create new task
    .post(async (request, response) => {
        throw new Error('Not Implemented');

        /*
         *  try {
         *   let result = await Todos.create(request);
         *
         *   response.status(200).send(new API.Response(result));
         *  } catch (error) {
         *   response.status(400).send(error);
         *  }
         */
    })

    .get(async (request: Requests.Tasks.ISearch, response) => {
        try {
            const { content, group } = request.query;
            let result;

            if (content && !group)
                result = await tasksController.search(request);
            else if (!content && group)
                result = await tasksController.list(request);

            response.status(200).send(result);
        } catch (error) {
            response.status(400).send(error);
        }
    });

/**
 * Available parameters:
 * content : string
 */
/*
 * router.get(`/search`, async (request: FuzzyRequest.ISearch, response) => {
 *  try {
 *      let result = await Fuzzy.search(
 *          request,
 *          [
 *              "content"
 *          ],
 *          SQL.TABLES.todos
 *      );
 *
 *
 *      response.status(200).send(new API.Response(result));
 *  } catch (error) {
 *      response.status(400).send(new Error(error));
 *  }
 * });
 */

/*
 * router.post(`/:id/report`, async (request: NTasks.Request.IReport, response) => {
 *  try {
 *      let result = await Todos.generateReport(request);
 *      response.send(result);
 *  } catch (error) {
 *      response.send(error.response);
 *  }
 * });
 */

router.route('/:id')

    .get(async (request: Requests.Common.IGetSpecific, response) => {
        // throw new Error('Not implemented');

        try {
            const result = await commonController.fetch(request, 'task');

            response.status(statuses('OK')).send(result);
        } catch (error) {
            response.status(statuses('Not found')).send(error.response);
        }
    })

    .put(async (request: Requests.Tasks.IUpdate, response) => {
        try {
            const result = await tasksController.update(request);

            response.status(statuses('OK')).send(result);
        } catch (error) {
            response.status(statuses('Not found')).send(error.response);
        }
    });


router.post('/:id/complete', async (request: Requests.Tasks.IComplete, response) => {
    try {
        const result = await tasksController.complete(request);

        response.status(statuses('OK')).send(result);
    } catch (error) {
        response.send(error);
    }

});

/*
 * breaks
 * router.use("/breaks", breaks);
 * list
 * router.use("/list", list);
 * specific task
 * router.use(`/:${API.params.todos.taskId}`, task);
 */


export default router;