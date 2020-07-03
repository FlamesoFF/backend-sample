import { Neo4jService } from '../src/services/neo4j';

export const testUser = {
    'id': 'tester',
    '_id': 'tester',
    'name': 'Tester',
    'login': 'tester',
    'initials': '',
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
    ],
    'iat': 1586333102,
    'exp': 1586376302
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