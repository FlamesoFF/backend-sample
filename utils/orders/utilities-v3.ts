import { MangoResponse } from 'nano';
import { IOrder } from '../../src/@types/data/order';
import { CouchDbService } from '../../src/services/couchDb';
import { CONFIG } from '../../src/shared/config';


export abstract class OrderUtilities {
    private static get pattern(): Partial<IOrder> {
        return {
            companies: [],
            tags: [],
            quotes: [],
            comments: [],
            relations: [],
            statuses: {},
            order_date: '2000-01-01'
        };
    }

    private static error(error) {
        console.error(error);
        throw error;
    }

    static async transformOrders() {
        await CouchDbService.connect();

        const {main: {name: mainDbName}} = CONFIG.servers.couchdb.databases;

        CouchDbService.switchDb(mainDbName);

        const orders = await CouchDbService.adapter.find({
            selector: {
                class: {$eq: 'order'},
                schema_id: {$eq: 'order_v3'}
            },
            limit: 1000000
        }).catch(this.error) as MangoResponse<IOrder>;

        const {
            docs
        } = orders;
        const normalizedDocs: IOrder[] = [];

        for(const doc of docs) {
            normalizedDocs.push(
                Object.assign(this.pattern, doc)
            );
        }


        await CouchDbService.adapter.bulk({docs: normalizedDocs})
            .catch(this.error);
    }
}