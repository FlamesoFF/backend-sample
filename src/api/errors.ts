import { IndexedSignature } from '../@types/types';

export interface IApiError {
    code?: number
    description: string
}

export class ApiError {
    code: number
    message: string

    constructor(error: IApiError, details?: IndexedSignature) {
        const { code, description } = error;
        const formattedDetails = JSON.stringify(details, null, 4);

        this.code = code;
        this.message = `${code ? `E${code}` : ''}: ${description}. Details: ${formattedDetails ?? ''}`;
    }
}


export namespace ERRORS {

    export const COMMON = {
        MISSING_REQUIRED_PARAMETERS: {
            code: 1,
            description: 'Missing required parameters.'
        },

        INVALID_JSON_STRUCTURE: {
            code: 2,
            description: 'Invalid JSON structure.'
        },

        INVALID_REQUEST_PAYLOAD_TYPE: {
            code: 3,
            description: 'Invalid request payload type.'
        },

        INVALID_ENTITY_TYPE: {
            code: 4,
            description: 'Invalid entity type.'
        }
    };

    export const COUCH_DB = {
        UNABLE_TO_INSERT_NEW_DOCUMENT: {
            code: 100,
            description: 'Unable to insert new document.'
        },

        UNABLE_TO_FIND_ATTACHMENT: {
            code: 101,
            description: 'Unable to find attachment.'
        },

        UNABLE_TO_FIND_DOCUMENT: {
            code: 102,
            description: 'Unable to find document with this ID.'
        },

        INVALID_RELATION_TYPE_FOR_SPECIFIED_CLASS: {
            code: 103,
            description: `Invalid relation type for specified class. 
            For the list of supported relations go here: https://apollo4u.atlassian.net/wiki/spaces/AP/pages/1376265/Relations`
        },

        DOCUMENT_WITH_THE_SAME_ID_ALREADY_EXISTS: {
            code: 104,
            description: 'Document with the same ID already exists.'
        },

        MISSING_INDEX_FOR_SPECIFIED_FIELDS: {
            code: 105,
            description: 'Missing index for specified fields.'
        },

        INVALID_ORDER_DIRECTION: {
            code: 106,
            description: 'Invalid order direction. VALID: asc | desc'
        },
    };

    export const PG = {
        UNABLE_TO_INSERT_RECORD: {
            code: 200,
            description: 'Unable to insert new record.'
        },

        NOT_FOUND_BY_ID: {
            code: 201,
            description: 'Unable to find record with given ID.'
        },
    };

    export const NEO4J = {
        UNABLE_TO_: {
            code: 300,
            description: 'Unable to'
        },
    };

    export const TASKS = {
        TASK_IS_ALREADY_COMPLETED: {
            code: 400,
            description: 'Task is already completed'
        },
    };

    export const SYNCHRONIZER = {
        DOCUMENT_CORRUPTED: {
            code: 500,
            description: 'Document is corrupted'
        },
    };

    export const AUTH = {
        UNKNOWN_AUTHORIZATION_TYPE: {
            code: 600,
            description: 'Unknown authorization type'
        },

        INVALID_TOKEN: {
            code: 601,
            description: 'Token invalid'
        },

        DOMAIN_UNRECOGNIZED: {
            code: 602,
            description: 'User domain unrecognized'
        },

        MISSING_AUTH_HEADER: {
            code: 603,
            description: 'Missing Authorization header'
        },

        USER_IS_NOT_REGISTERED: {
            code: 604,
            description: 'This user is not registered in Apollo'
        }
    };

    export const VALIDATOR = {
        FAILED: {
            code: 700,
            description: 'Payload validation failed'
        }
    };

    export const ORDERS = {
        UNABLE_TO_FORM_ORDER_NUMBER: {
            code: 700,
            description: 'Payload validation failed'
        }
    };
}