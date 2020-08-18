import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../errors';
import statuses from 'statuses';
import { isApiError } from '../../shared/utils/typeGuards';
import { ResponseDirector } from './response';


type AppError = ApiError & Error;

export function apiErrorHandler(
    error: AppError,
    request: Request,
    response: Response,
    next: NextFunction
) {
    const formattedResponse = ResponseDirector.buildErrorResponse({errors: [error]});

    if (isApiError(error)) {
        response.status(getResponseCode(error));
    }

    response.send(formattedResponse);
}


function getResponseCode(error: ApiError) {
    let code: number;

    switch (error.code) {   // Convert API error code to HTTP code
        // Auth
        case 600:
        case 601:
        case 602:
        case 603:
        case 604:
            code = statuses('Unauthorized');    // 401
            break;
        default:
            code = statuses('Internal Server Error');   // 500
            break;
    }

    return code;
}