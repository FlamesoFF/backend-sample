import { ValidationError } from 'ajv';
import { ApiError } from '../errors';
import { isApiError, isNodeError, isValidationError } from '../../shared/utils/typeGuards';
import { ApiResponse, ResponseFormatterData } from './types';


export abstract class ResponseDirector {
    static buildSuccessfulResponse( data: ResponseFormatterData ): ApiResponse {
        const builder = new ResponseBuilder(true);

        builder.setId(data.id);
        builder.setBody(data.body);

        return builder.getResult();
    }

    static buildErrorResponse( data: ResponseFormatterData ): ApiResponse {
        const builder = new ResponseBuilder(false);

        for ( const error of data.errors ) {
            builder.addError(error);
        }

        if ( data.warnings ) {
            for ( const warning of data.warnings ) {
                builder.addWarning(warning);
            }
        }

        return builder.getResult();
    }
}


class ResponseBuilder {
    private apiResponse: ApiResponse = {
        ok: true
    };

    constructor( status: boolean = true ) {
        if ( !status ) this.apiResponse.errors = [];
    }

    addError( error: ApiError | ValidationError | Error ) {
        if ( isApiError(error) ) {
            this.apiResponse.errors.push(error.message);
        } else if ( isValidationError(error) ) {
            for ( const msg of error.errors ) {
                this.apiResponse.errors.push(JSON.stringify(msg));
            }
        } else if ( isNodeError(error) ) {
            this.apiResponse.errors.push(error.message);
        }
    }

    addWarning( warning: string ) {
        this.apiResponse.warnings.push(warning);
    }

    setId( id: string ) {
        this.apiResponse.id = id;
    }

    setBody( data: any ) {
        this.apiResponse.data = data;
    }


    getResult(): ApiResponse {
        return this.apiResponse;
    }
}