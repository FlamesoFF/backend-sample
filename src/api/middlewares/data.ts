import multer from 'multer';
import { Requests } from '../@types/api/controllers.types';
import { NextFunction, Response } from 'express';
import { ApiError, ERRORS } from '../errors';


export abstract class MwData {
    static multipartParser = multer({
        storage: multer.memoryStorage(),
        limits: {
            // 50MB,
            fileSize: Math.pow(1024, 2) * 5
        }
    }).array('files');

    static parseFileData(
        request: Requests.Files.ICreate | Requests.Files.IAttach,
        response: Response,
        next: NextFunction
    ) {
        const { data } = request.body;
        let parsed: Requests.Files.IUploadBody;


        if (data && typeof data === 'string')
            try {
                parsed = JSON.parse(data) as Requests.Files.IUploadBody;
            } catch (error) {
                throw new ApiError(ERRORS.COMMON.INVALID_JSON_STRUCTURE);
            }
        else
            throw new ApiError(ERRORS.COMMON.INVALID_REQUEST_PAYLOAD_TYPE);


        request.body.data = parsed;

        next();
    }
}