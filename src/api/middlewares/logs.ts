import { Request } from 'express';
import { apiLogger } from '../../service-logger';
import { MwAuth } from './auth';


export function appLogger(request: Request, response, next) {

    const {
        method,
        url,
        body,
        query,
        ip
    } = request;


    apiLogger.logRequest({
        ip,
        user: MwAuth.user?.email || 'no information',
        message: `${method} ${url}`,
        data: {
            body,
            query
        }
    });

    next();
}

export function appErrorLogger(error: Error, request: Request, response, next) {
    const { message, name } = error;

    const {
        method,
        url,
        body,
        query,
        ip
    } = request;


    apiLogger.logError({
        ip,
        user: MwAuth.user?.email || 'no information',
        message: `${method} ${url} 
         ERROR: ${message} | NAME: ${name}`,
        data: {
            body,
            query
        }
    });

    next(error);
}