import express from 'express';
import { Requests } from '../../@types/api/controllers.types';
import statuses from 'statuses';
import { commonController } from '../../controllers/common';
import { filesController } from '../../controllers/files';
import { CouchDbService } from '../../../services/couchDb';
import { MwData } from '../../middlewares/data';
import { CONFIG } from '../../../shared/config';


const router = express.Router({ mergeParams: true });

router.use(MwData.multipartParser);
router.use(MwData.parseFileData);

router.use((request, response, next) => {
    const { name } = CONFIG.servers.couchdb.databases?.files;

    CouchDbService.switchDb(name);
    next();
});


// Upload File document with attachments as multipart data
router.post('/', async (request: Requests.Files.ICreate, response, next) => {
    try {
        // next({ status: 501 });
        const result = await filesController.upload(request);

        return response.status(200).send(result);
    } catch (error) {
        next(error);
    }
});

// Upload physical file and attach it to existing File v3 document
router.post('/:id/attach', async (request: Requests.Files.IAttach, response, next) => {
    try {
        // next({ status: 501 });
        const result = await filesController.attach(request);

        return response.status(200).send(result);
    } catch (error) {
        next(error);
    }
});

// List or search
router.get('/', async (request: Requests.Common.ISearch, response, next) => {
    try {
        const result = await filesController.search(request);

        /*
         * response.status(statuses('OK')).send('Hello files!');
         * next({ status: 501 });
         * const result = await Files.list();
         */

        return response.status(200).send(result);
    } catch (error) {
        next(error);
    }
});

// Get by ID
router.get('/:id', async (request: Requests.Common.IGetSpecific, response, next) => {
    try {
        const result = await commonController.fetch(request, 'file');


        return response.status(statuses('OK')).send(result);
    } catch (error) {
        next(error);
    }
});

// Download physical file
router.get('/:id/download/:fileName', async (request: Requests.Files.IDownload, response, next) => {
    try {
        // next({ status: 501 });
        const { fileName, stream } = filesController.download(request);

        stream.pipe(response);

        return response
            .status(statuses('OK'))
            .set('Content-Disposition', `attachment; filename=${fileName}`);
    } catch (error) {
        next(error);
    }
});

// Update a File document
router.put('/:id', async (request: Requests.Files.ISearch, response, next) => {
    try {
        next({ statusCode: 501 });
        // const result = await Files.list();

        // return response.status(200).send(result);
    } catch (error) {
        next(error);
    }
});


router.delete('/:id', async (request: Requests.Common.IRemove, response, next) => {
    try {
        await commonController.remove(request, 'file');

        return response.status(statuses('No Content')).send();
    } catch (error) {
        next(error);
    }
});

export default router;