import { Response } from 'express';
import { ResponseFormatterData } from '../middlewares/types';
import { ResponseDirector } from '../middlewares/response';


export const sendFormatted = function ( response: Response, data?: ResponseFormatterData ) {
    const formattedData = ResponseDirector.buildSuccessfulResponse(data);  // formatting data for our API

    // proceeding to the original method
    response.send(formattedData);

    return response;
};

export const sendError = function ( response: Response, data?: ResponseFormatterData ) {
    const formattedData = ResponseDirector.buildErrorResponse(data);  // formatting data for our API

    // proceeding to the original method
    response.send(formattedData);

    return response;
};