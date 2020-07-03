import crypto from 'crypto';
import { DocumentInsertResponse, MangoQuery } from 'nano';
import { CouchDbService } from '../../services/couchDb';
import { Requests, Responses } from '../@types/api/controllers.types';
import { ApiError, ERRORS } from '../errors';
import { FileDetail, FileModel } from '../models/file';
import { DEFAULT_LIST_LIMIT, HASH_DIGEST_FORMAT, HASH_MD5_FORMAT, HASH_SHA_FORMAT } from '../constants';
import { Utils } from '../shared/utils';
import { commonController } from './common';
import { IFileDocument } from '../../@types/data/file';


export interface DownloadResponse {
    fileName: string
    stream: ReturnType<typeof CouchDbService.adapter.attachment.getAsStream>
}

export const filesController = new class Controller {

    /*
     * async create(request: Express.Request) {
     *     throw new Error('Method not implemented.');
     * }
     * async update(request: Express.Request) {
     *     throw new Error('Method not implemented.');
     * }
     * async delete(request: Express.Request) {
     *     throw new Error('Method not implemented.');
     * }
     */

    async upload(request: Requests.Files.ICreate) {
        const { files, body: { data } } = request;
        let fileDocResponse: DocumentInsertResponse;
        let fileDocument: IFileDocument;
        // let parsed: Requests.Files.IUploadBody;


        /*
         * if (data && typeof data === 'string') {
         *     try {
         *         parsed = JSON.parse(data) as Requests.Files.IUploadBody;
         *     }
         *     catch (error) {
         *         throw new ApiError(ERRORS.COMMON.INVALID_JSON_STRUCTURE);
         *     }
         * }
         * else {
         *     throw new ApiError(ERRORS.COMMON.INVALID_REQUEST_PAYLOAD_TYPE);
         * }
         */


        const {
            _id,
            name,
            description,
            tags,
            type,
            alias,
            filesDetails = {}
        } = data;


        // Create new File document model
        try {
            fileDocument = new FileModel({
                _id,
                name,
                description,
                tags,
                type,
                alias
            });
        }
        catch (error) {
            throw new ApiError(ERRORS.COMMON.MISSING_REQUIRED_PARAMETERS);
        }

        // Insert document into DB
        try {
            for (const item of files) {

                let description = '';
                const {
                    originalname,
                    filename = originalname,
                    mimetype,
                    buffer
                } = item;
                const sha = crypto.createHash(HASH_SHA_FORMAT).update(buffer).digest(HASH_DIGEST_FORMAT);
                const digest = crypto.createHash(HASH_MD5_FORMAT).update(buffer).digest(HASH_DIGEST_FORMAT);

                if (filesDetails[filename])
                    description = filesDetails[filename].description;


                FileModel.addFileDetails(
                    fileDocument,
                    new FileDetail({
                        sha,
                        digest,
                        type: mimetype,
                        description
                    })
                );

            }

            fileDocResponse = await CouchDbService.adapter.insert(fileDocument);

            for (const item of files) {
                const {
                    originalname,
                    filename = originalname,
                    mimetype,
                    buffer
                } = item;

                fileDocResponse = await CouchDbService.adapter.attachment.insert(
                    _id,
                    filename,
                    buffer,
                    mimetype,
                    { rev: fileDocResponse.rev }
                );  // rev - is a must

                fileDocument._rev = fileDocResponse.rev;
            }
        }
        catch (error) {
            if (fileDocResponse) {
                const { id, rev } = fileDocResponse;

                if (id && rev)
                    await CouchDbService.adapter.destroy(fileDocResponse.id, fileDocResponse.rev);
            }

            throw new ApiError(ERRORS.COUCH_DB.UNABLE_TO_INSERT_NEW_DOCUMENT);
        }

        return fileDocResponse;
    }

    async attach(request: Requests.Files.IAttach) {
        const {
            params: { id },
            body: { data },
            files
        } = request;

        const document = await CouchDbService.adapter.get(id) as IFileDocument;
        // let parsed = JSON.parse(data) as Requests.Files.IFileDetails;


        for (const file of files) {
            const {
                originalname,
                filename = originalname,
                mimetype,
                buffer
            } = file;
            let description = '';

            if (data[filename]) {
                description = data[filename].description;

                const sha = crypto.createHash(HASH_SHA_FORMAT).update(buffer).digest(HASH_DIGEST_FORMAT);
                const digest = crypto.createHash(HASH_MD5_FORMAT).update(buffer).digest(HASH_DIGEST_FORMAT);

                FileModel.addFileDetails(
                    document,
                    new FileDetail({
                        sha,
                        digest,
                        type: mimetype,
                        description
                    })
                );
            }


            let { rev } = await CouchDbService.adapter.insert(document);


            for (const item of files) {
                const {
                    originalname,
                    filename = originalname,
                    mimetype,
                    buffer
                } = item;

                const result = await CouchDbService.adapter.attachment.insert(
                    id,
                    filename,
                    buffer,
                    mimetype,
                    { rev }
                );  // rev - is a must

                rev = result.rev;
            }
        }
    }

    download(request: Requests.Files.IDownload): DownloadResponse {
        const { id, fileName } = request.params;

        if (!id || !fileName)
            throw new ApiError(ERRORS.COMMON.MISSING_REQUIRED_PARAMETERS);

        const stream = CouchDbService.adapter.attachment.getAsStream(id, fileName);

        if (stream)
            return { fileName, stream };

        else
            throw new ApiError(ERRORS.COUCH_DB.UNABLE_TO_FIND_ATTACHMENT);

    }


    /**@description Search for company by its name */
    async search(request: Requests.Common.ISearch): Promise<Responses.Lists.Default> {
        const { name, limit = DEFAULT_LIST_LIMIT } = request.query;
        let docs: IFileDocument[];

        if (name) {

            const mangoQuery: MangoQuery = {
                selector: {
                    class: {
                        $eq: 'file'
                    },
                    name: {
                        $regex: Utils.stringToMangoQueryRegex(name, ['i'])
                    }
                },
                fields: [
                    '_id',
                    'class',
                    'name',
                    'alias',
                    'description'
                ],
                limit: Number(limit)
            };

            const { docs } = await CouchDbService.adapter.find(mangoQuery);

            return Utils.Nano.resultsToFilesList(<IFileDocument[]>docs);
        }
        else
            return await commonController.search(request, 'file', ['name']);


    }

    /**@description List first 1-100 entities */
    // async list(request: Requests.Common.ISearch): Promise<Responses.Lists.Default[]> {

    /*
     *     return Utils.Nano.resultsToFilesList(response);
     * }
     */
};