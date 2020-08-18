import { Router } from 'express';
import statuses from 'statuses';
import { Requests } from '../../@types/api/controllers.types';
import { RelationsController } from '../../controllers/relations';
import { CouchDbService } from '../../../services/couchDb';
import { CONFIG } from '../../../shared/config';


const router = Router({ mergeParams: true });


router.use((request: Requests.Relations.Basic, response, next) => {
    const { class: cn } = request.params;

    const { name: mainDbName } = CONFIG.servers.couchdb.databases.main;
    const tasksDbName = CONFIG.servers.couchdb.databases?.tasks?.name;

    if (cn !== 'tasks') {
        CouchDbService.switchDb(mainDbName);
    }
    else if (tasksDbName) {
        CouchDbService.switchDb(tasksDbName);
    }  // TODO: Move to the same DB?

    next();
});


// Search relations for specific entry by type
router.get('/', async (request: Requests.Relations.IGet, response, next) => {
    try {
        const result = await RelationsController.get(request);

        return response.status(statuses('OK')).send(result);
    } catch (error) {
        next(error);
    }
});

router.post('/', async (request: Requests.Relations.ICreate, response, next) => {
    try {
        const result = await RelationsController.create(request);

        return response.status(statuses('Created')).send(result);
    } catch (error) {
        next(error);
    }
});

router.delete('/', async (request: Requests.Relations.IRemove, response, next) => {
    try {
        const result = await RelationsController.remove(request);

        return response.status(statuses('No Content')).send();
    } catch (error) {
        next(error);
    }
});

export default router;