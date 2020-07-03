import { TextUtils } from '@apollo4u/auxiliary';
import moment, { Moment } from 'moment';
import { ICourierModelParameters } from '../@types/api/models.types';
import { ICourier } from '../../@types/data/courier';
import { IBasicEntity, IRelation } from '../../@types/data/definitions';
import { MwAuth } from '../middlewares/auth';
import { NodeAmbiguous } from '../../@types/types';


export class CourierModel implements ICourier {
    readonly schema_id = 'courier_v3';
    readonly class = 'courier';

    readonly client_reference: string;
    readonly name: string;
    readonly number: string;
    readonly sent_on: string;
    readonly contents: string;

    readonly _id?: string;
    readonly relations?: IRelation<NodeAmbiguous>[] = [];
    readonly modified_by?: Required<IBasicEntity>;


    constructor({
        _id,
        client_reference,
        sent_on,
        threadId,
        relations,

        contents = '',
        name = 'DHL',
        number
    }: ICourierModelParameters) {
        const currentDate = moment();
        const {
            _id: userId,
            name: userName
        } = MwAuth.user;


        _id ? this._id = _id : 0;
        client_reference ? this.client_reference = client_reference : 0;
        sent_on ? this.sent_on = sent_on : 0;
        relations ? this.relations = relations : 0;
        contents ? this.contents = contents : 0;


        if (number)
            this.number = number;
        else
            this.number = CourierModel.generateNumber(TextUtils.nameToInitials(name), currentDate);

        this.sent_on = currentDate.format('YYYY-MM-DD');

        this.modified_by = {
            _id: userId,
            name: userName
        };


        // if (threadId) {
        //     const relation = new RelationModel('referenced_to', {
        //         _id: threadId,
        //         class: 'thread',
        //         name: 'thread'
        //     });
        //
        //     this.relations.push(relation);
        // }

        /*
         * loading all needed data to create a new Courier
         * const relationMap: [TRelationType, string][] = [
         *     ['ordered_by', clientId],
         *     ['has_contact', contactId],
         *     ['managed_by', userId],
         *     ['has_sender', senderId],
         *     ['has_receiver', receiverId]
         * ];
         */

        /*
         * for (const [type, id] of relationMap) {
         *     if (id) {
         *         const relation = await RelationModel.createFromDocument(type, id);
         */

        /*
         *         if (relation)
         *             this.relations.push(relation);
         *     }
         * }
         */

    }

    /*
     * static async create({
     *     _id,
     *     client_reference,
     *     sent_on,
     *     clientId,
     *     contactId,
     *     receiverId,
     *     senderId,
     *     threadId,
     */

    /*
     *     contents = '',
     *     name = 'DHL',
     *     number
     * }: Requests.Couriers.ICreateBody): Promise<ICourier> {
     *     const relations: TRelationList = [];
     *     const currentDate = moment();
     *     const { _id: userId } = Logs.user;
     */

    //     number = this.generateNumber(TextUtils.nameToInitials(name), currentDate);

    /*
     *     if (threadId) {
     *         const relation = new RelationModel('referenced_to', {
     *             _id: threadId,
     *             class: 'thread'
     *         });
     */

    /*
     *         if (relation)
     *             relations.push(relation);
     *     }
     */

    /*
     *     // loading all needed data to create a new Courier
     *     const relationMap: [TRelationType, string][] = [
     *         ['ordered_by', clientId],
     *         ['has_contact', contactId],
     *         ['managed_by', userId],
     *         ['has_sender', senderId],
     *         ['has_receiver', receiverId]
     *     ];
     */

    /*
     *     for (const [type, id] of relationMap) {
     *         if (id) {
     *             const relation = await RelationModel.createFromDocument(type, id);
     */

    /*
     *             if (relation)
     *                 relations.push(relation);
     *         }
     *     }
     */


    /*
     *     return {
     *         class: 'courier',
     *         schema_id: 'courier_v3',
     *         client_reference,
     *         contents,
     *         name,
     *         number,
     *         sent_on: currentDate.format('YYYY-MM-DD'),
     *         relations
     *     };
     * }
     */

    static generateNumber(initials: string, currentDate: Moment): string {
        const date = currentDate.format('DDMMYYYY');
        const number = `${initials.toUpperCase()}${date}`;

        return number;
    }
}