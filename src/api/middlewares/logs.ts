import { NextFunction, Request, Response } from 'express';
import { apiLogger } from '../../service-logger';
import { MwAuth } from './auth';


interface LogParams {
    error?: Error;
    request: Request;
    response: Response;
    next: NextFunction;
}


function getEmployee(error: Error, name: Response): void;    //Overload 3
function getEmployee(name: Request): void;                  //Overload 2
function getEmployee (paramOne: Error | Request, paramTwo: Response ): void {

}


function appLogger(error: Error, request: Request, response: Response, next: NextFunction): void
function appLogger(request: Request, response: Response, next: NextFunction): void

function appLogger(error: Error | undefined, request: Request, response: Response, next: NextFunction): void {

}


// function appLogger(
//     request: Request,
//     response: Response,
//     next: NextFunction
// ): void {
//     log({ request, response, next });
// }

function log({ error, request, response, next }: LogParams) {
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
}

export { appLogger };