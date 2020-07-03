import path from 'path';
import ajv, { Ajv } from 'ajv';


export namespace SCHEMA_PATHS {
    export namespace client {
        const base = 'client';

        export namespace orders {
            export const create = `${base}_order_v3#/definitions/create`;
        }
    }
}


const validator = new class {
    private ajv: Ajv;


    constructor() {
        const schemas = [
            require(path.resolve(__dirname, '../../schemas/v3/defs.json')),
            require(path.resolve(__dirname, '../../schemas/v3/client/defs.json')),
            require(path.resolve(__dirname, '../../schemas/v3/client/company.json')),
            require(path.resolve(__dirname, '../../schemas/v3/client/order.json'))
        ];

        this.ajv = new ajv({
            validateSchema: true,
            schemaId: 'auto',
            extendRefs: 'fail',
            missingRefs: 'fail',
            inlineRefs: true,
            allErrors: true,
            schemas
        });
    }

    get errors() {
        return this.ajv.errors;
    }

    async validate(schemaPath: string, data: object) {
        return await this.ajv.validate(schemaPath, data);
    }
};

export { validator };