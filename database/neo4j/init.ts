import { CONFIG } from '../../src/shared/config';

const {
    protocol,
    host,
    port,
    username,
    password
} = CONFIG.servers.neo4j;

(async () => {


    // Create clusters
    const url = `${protocol}://${username}:${password}@${host}:${port}`;

    // try {
    //     await got.post(`${url}/_cluster_setup`, {
    //         headers: {
    //             'Content-Type': 'application/json'
    //         },
    //         json: {
    //             'action': 'enable_cluster',
    //             'bind_address': '0.0.0.0',
    //             username,
    //             password,
    //             'node_count': '3'
    //         },
    //         responseType: 'json'
    //     });
    //
    //     console.log('Success!');
    //     process.exit(0);
    // } catch (error) {
    //     console.error(error);
    //     process.exit(1);
    // }

})();