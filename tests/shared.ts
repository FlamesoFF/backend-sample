import Ajv from 'ajv';
import fs from 'fs';
import * as https from 'https';
import path from 'path';
import { Neo4jService } from '../src/services/neo4j';
import { CONFIG } from '../src/shared/config';

export const testUser = {
    'id': 'tester',
    '_id': 'tester',
    'name': 'Tester',
    'login': 'tester',
    'initials': 'TE',
    'accepted': true,
    'email': '',
    'roles': [
        'user',
        'manager',
        'director',
        'developer'
    ],
    'organization': '',
    'occupation': '',
    'country': '',
    'nationality': '',
    'phone': '',
    'sms_notifications_enabled': false,
    'avatar': null,
    'time': 1586333102,
    'ip': '::ffff:127.0.0.1',
    'type': [
        'user',
        'manager',
        'director',
        'developer'
    ]
};

export namespace neo4j {
    export async function getSampleNodes() {
        const cypherQuery = `
                MATCH result = ()-[]-()
                RETURN result
                LIMIT 10
            `;

        return Neo4jService.adapter.run(cypherQuery);
    }
}


export function getApiAddress(port: number): string {
    if (!CONFIG?.environment) {
        return `https://localhost:${port}`;
    }
    else if (CONFIG?.environment === 'docker') {
        return `https://host.docker.internal:${port}`;
    }
}

export const SCHEMAS = [
    '../src/schemas/v3/client/defs.json',
    '../src/schemas/v3/client/order.json',
    '../src/schemas/v3/client/external.order.json',
    '../src/schemas/v3/client/company.json',
    '../src/schemas/v3/client/entity.json',
    '../src/schemas/v3/defs.json',
    '../src/schemas/v3/server/defs.json',
    '../src/schemas/v3/server/base.json',
    '../src/schemas/v3/server/person.json',
    '../src/schemas/v3/server/order.json',
    '../src/schemas/v3/server/external.order.json',
    '../src/schemas/v3/server/company.json',
    '../src/schemas/v3/server/entity.json',
    '../src/schemas/v3/server/task.json'
];

export const ajv = new Ajv({
    validateSchema: true,
    schemaId: 'auto',
    extendRefs: 'fail',
    missingRefs: 'fail',
    inlineRefs: true,
    allErrors: true,
    schemas: SCHEMAS.map(item => require(path.resolve(__dirname, item)))
});

const certFile = fs.readFileSync(path.resolve(__dirname, '../ssl/server.key'));

export const httpsAgent = new https.Agent({
    ca: certFile,
    rejectUnauthorized: false
});

export const defaultPostfix = 'integration-test';