import got from 'got';
import { CONFIG } from '../../src/shared/config';

const {
    protocol,
    host,
    port,
    username,
    password,
    databases
} = CONFIG.servers.couchdb;

(async () => {
    // Create basic DBs
    const url = `${protocol}://${username}:${password}@${host}:${port}`;

    console.log('Creating basic databases...');

    try {
        await got.put(`${url}/_users`, {
            headers: {
                'Content-Type': 'application/json'
            },
            responseType: 'json'
        });

        console.log('_users DB was successfully created!');
    } catch (error) {
        console.warn(error.message);
    }

    try {
        await got.put(`${url}/_replicator`, {
            headers: {
                'Content-Type': 'application/json'
            },
            responseType: 'json'
        });

        console.log('_replicator DB was successfully created!');
    } catch (error) {
        console.warn(error.message);
    }

    try {
        await got.put(`${url}/_global_changes`, {
            headers: {
                'Content-Type': 'application/json'
            },
            responseType: 'json'
        });

        console.log('_global_changes DB was successfully created!');
    } catch (error) {
        console.warn(error.message);
    }


    // Create databases
    console.log('Creating user databases...');

    for (const db of Object.values(databases)) {
        const { name, similarity } = db;

        try {
            await got.put(`${url}/${name}`, {
                responseType: 'json'
            });

            console.log(`DB ${name} successfully created.`);
            process.exit(0);
        } catch (error) {
            console.log(`DB ${name} is already exists!`);
        }
    }

    process.exit(0);
})();