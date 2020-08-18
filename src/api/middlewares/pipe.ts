import { NextFunction, Request, Response } from 'express';


export interface PipeCallbackArguments {
    error?: Error
    request: Request
    response: Response
}

export interface WrapperResult {
    next: () => void
}


export function pipe(callback: (args: PipeCallbackArguments) => void)  {
    function wrapper(one: Request, two: Response, three: NextFunction): WrapperResult
    function wrapper(
        one: Error | Request,
        two: Request | Response,
        three: Response | NextFunction,
        four?: NextFunction
    ) : WrapperResult {
        const isError = (arg: Error): arg is Error => arg.message && arg.stack && arg.name ? true : false;
        const isRequest = (arg: Request): arg is Request => arg.method && arg.body && arg.url ? true : false;
        const isResponse = (arg: Response): arg is Response => arg.send && arg.statusCode && arg.send ? true : false;

        let error: Error = isError(<Error>one) ? <Error>one : undefined;
        let request: Request = isRequest(<Request>one) ? <Request>one : <Request>two;
        let response: Response = isResponse(<Response>two) ? <Response>two : <Response>three;
        let next: NextFunction = four;

        callback({ error, request, response });

        return {
            next: function () {
                error ? next(error) : next();
            }
        };
    }

    return wrapper;
}