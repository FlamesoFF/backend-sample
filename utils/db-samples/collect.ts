import util from 'util';
import fs from 'fs';
import path from 'path';
import App from '../../src/api/app';
import { Neo4jService } from '../../src/services/neo4j';
import { PostgreSqlService } from '../../src/services/postgreSql';

(async () => {
    await App.run();

    const cypherQuery = `
        MATCH result = ()-[]-()
        RETURN result
        LIMIT 10
    `;

    let result : any = await Neo4jService.adapter.run(cypherQuery);

    await util.promisify(fs.writeFile)(
        path.resolve(__dirname, './neo4j-samples.json'),
        JSON.stringify(result),
        {
            encoding: 'utf8'
        }
    );

    result = await PostgreSqlService.adapter.query(`
        SELECT *
        FROM entities
        LIMIT 10;
    `);


    await util.promisify(fs.writeFile)(
        path.resolve(__dirname, './pgsql-samples.json'),
        JSON.stringify(result),
        {
            encoding: 'utf8'
        }
    );

    process.exit(1);
})();