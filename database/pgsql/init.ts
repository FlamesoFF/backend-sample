import fs from 'fs';
import path from 'path';
import { PostgreSqlService } from '../../src/services/postgreSql';


const order =
    fs.readFileSync(
        path.resolve(__dirname, './order.txt'),
        'utf8'
    )
        .split('\n')
        .map(item => item.replace(/\s/g, ''));

(async () => {
    await PostgreSqlService.connect();

    PostgreSqlService.adapter
        .on('error', err => {
            console.error(err.message);
            process.exit(1);
        })
        .on('notice', notice => {
            console.warn(notice.message);
        })
        .on('notification', note => {
            console.error(note);
        });

    for (const file of order) {
        if (file) {
            try {
                const query = fs.readFileSync(path.resolve(__dirname, file), 'utf8');

                await PostgreSqlService.adapter.query(query);
            } catch (e) {
                console.error(e);
                process.exit(1);
            }
        }
    }

    console.log('Initialization completed.');
    process.exit(0);
})();
