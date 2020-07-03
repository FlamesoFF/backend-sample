import path from 'path';
import Ajv from 'ajv';
import faker from 'faker';
import jsf from 'json-schema-faker';
import { testUser } from '../../shared';
import { MwAuth } from '../../../src/api/middlewares/auth';


process.env.TS_NODE_PROJECT = path.resolve(__dirname, './tsconfig.json');


jsf.extend('faker', () => faker);

export let ajv: Ajv.Ajv;


export function getAddress(): string {
    return 'https://localhost:3033';
}


console.log('Using URL: ' + getAddress());


before(() => {
    MwAuth.user = testUser;

    const schemas = [
        require(path.resolve(__dirname, '../../../src/schemas/v3/defs.json')),
        require(path.resolve(__dirname, '../../../src/schemas/v3/client/defs.json')),
        require(path.resolve(__dirname, '../../../src/schemas/v3/server/defs.json')),
        require(path.resolve(__dirname, '../../../src/schemas/v3/server/base.json')),
        require(path.resolve(__dirname, '../../../src/schemas/v3/client/company.json')),
        require(path.resolve(__dirname, '../../../src/schemas/v3/client/order.json')),
        require(path.resolve(__dirname, '../../../src/schemas/v3/server/person.json')),
        require(path.resolve(__dirname, '../../../src/schemas/v3/server/order.json')),
        require(path.resolve(__dirname, '../../../src/schemas/v3/server/company.json')),
        require(path.resolve(__dirname, '../../../src/schemas/v3/server/entity.json'))
    ];

    ajv = new Ajv({
        validateSchema: true,
        schemaId: 'auto',
        extendRefs: 'fail',
        missingRefs: 'fail',
        inlineRefs: true,
        allErrors: true,
        schemas
    });
});