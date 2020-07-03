import { NextFunction, Request, Response, Errback } from 'express';
import { Responses } from '../@types/api/controllers.types';
import { ValidationError } from 'ajv';
import { ApiError } from '../errors';
import { isApiError, isNodeError, isValidationError } from '../../shared/utils/typeGuards';
import { format } from 'logform';
import ms = format.ms;


export interface ResponseFormatterData {
    id?: string
    body?: any
}

export class ApiResponse {
    private errors?: string[] = []   // if there's some errors
    private warnings?: string[] = []   // if there's some warnings


    constructor(
        private ok: boolean, /* operation result */
        private id?: string,   // if something has been created or updated
        private data?: any    // if server returns some data
    ) {
    }


    static addError(response: ApiResponse, error: ApiError | ValidationError | Error) {
        if (isApiError(error)) {
            response.errors.push(error.message);
        }
        else if (isValidationError(error)) {
            for (const msg of error.errors) {
                response.errors.push(JSON.stringify(msg));
            }
        }
        else if (isNodeError(error)) {
            response.errors.push(error.message);
        }
    }

    static addWarning(response: ApiResponse, warning: string) {
        response.warnings.push(warning);
    }
}

//
// interface FormatParameters {
//     request: Request
//     response: Response
//     next: NextFunction
//     error?: AppError & Error
// }
//
// function format({
//     request,
//     response,
//     next,
//     error
// }: FormatParameters) {
//
// }


export function apiResponseHandler(
    request: Request,
    response: Response,
    next: NextFunction
) {
    const formattedResponse = new ApiResponse(false);

    response.send(formattedResponse);
    next();
}