import { NextFunction, Request, Response } from 'express';
import { apiLogger } from '../../service-logger';
import { ApiError } from '../errors';
import statuses from 'statuses';
import { ApiResponse } from './response';


export function apiErrorHandler(
    error: ApiError & Error,
    request: Request,
    response: Response,
    next: NextFunction
) {
    const { code } = error;
    const formattedResponse = new ApiResponse(false);

    ApiResponse.addError(formattedResponse, error);

    switch (code) {
        case 404:
            response.status(statuses('Not Found'));
            break;
        case 401:
            response.status(statuses('Not Found'));
            break;

        default:
            response.status(statuses(500));
            break;
    }

    // apiLogger.logError({ message: formattedResponse, data: stack });
    response.send(formattedResponse);
}