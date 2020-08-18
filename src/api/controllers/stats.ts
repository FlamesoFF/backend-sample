import { CouchDbService } from '../../services/couchDb';
import { DocumentGetResponse, MaybeDocument } from 'nano';


export interface StatsDocument extends MaybeDocument {
    orders: {
        number: number
    }
}


export class StatsController {

    static async incrementOrderNumber() {
        const doc = await this.loadStats();

        doc.orders.number++;

        await this.saveStats(doc);

        return doc.orders.number;
    }

    static async decrementOrderNumber() {
        const doc = await this.loadStats();

        doc.orders.number--;

        await this.saveStats(doc);

        return doc.orders.number;
    }


    private static async loadStats(): Promise<StatsDocument & DocumentGetResponse> {
        return await CouchDbService.adapter.get('stats') as any;
    }

    private static async saveStats(doc: DocumentGetResponse & StatsDocument) {
        return await CouchDbService.adapter.insert(<any>doc, { rev: doc._rev });
    }

}