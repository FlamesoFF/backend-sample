import moment from 'moment';
import { ICompany } from '../../@types/data/company';
import { IComment, INode, IQuote, IRelation } from '../../@types/data/definitions';
import { IOrder, IOrderStatuses } from '../../@types/data/order';
import { IPerson } from '../../@types/data/person';
import { ApiError, ERRORS } from '../errors';
import { CouchDbService } from '../../services/couchDb';
import { IOrderModelParameters } from '../@types/api/models.types';
import { MangoQuery } from 'nano';
import { IApolloDocument } from '../../@types/shared';
import { GenericDocument } from './genericDocument';
import { NodeAmbiguous } from '../../@types/types';
import { RelationModel } from './shared/relation';
import numeral from 'numeral';


type Client =
    ICompany |
    IPerson;

export interface PgSqlOrderCreateParameters {
    p_manager_id: string
    p_client_id?: string
    p_contact_email?: string
    p_order_date?: string
    p_order_data?: object
    p_order_id?: string
    p_order_status?: string
    p_compliance_status?: string
    p_accounts_status?: string
    p_client_status?: string
    p_tags?: string[]
    p_company_id?: string
    p_client_reference?: string
    p_thread_id?: string[]
}


export class OrderModel extends GenericDocument implements IOrder {
    // TODO: implement generation
    readonly number: string;
    readonly created_on: string = OrderModel.getCreatedDate();
    readonly statuses: IOrderStatuses = {
        account: 'new',
        compliance: 'new',
        client: 'new',
        order: 'creating'
    };

    readonly _id?: string;
    readonly order_date?: string;
    readonly companies?: string[];
    readonly tags?: string[] = [];
    readonly name?: string;
    readonly client_reference?: string;
    readonly quotes?: IQuote[] = [];
    readonly type?: string[] = [];
    readonly comments?: IComment[] = [];
    readonly relations?: IRelation<NodeAmbiguous>[] = [];


    private constructor({
        manager,
        client,
        // OPTIONAL
        client_reference,
        contactRelation,
        thread_id,
        date,
        tags,
        type,
        companies,
        statuses,
        initials,
        number
    }: IOrderModelParameters) {
        super('order_v3', 'order');

        // Optional
        if (client_reference) this.client_reference = client_reference;
        if (tags) this.tags = tags.split(',');
        if (type) this.type = type;
        if (companies) this.companies = companies;
        if (statuses) this.statuses = statuses;
        if (date) {
            this.order_date = moment(date).format('YYYY-MM-DD');
        }
        else {
            this.order_date = OrderModel.getCreatedDate();
        }

        if (number && initials) {
            const formattedNumber = numeral(number).format('000000');

            this._id = this.number = `ORD-${formattedNumber}${initials}`;
        }
        else {
            throw new ApiError(ERRORS.ORDERS.UNABLE_TO_FORM_ORDER_NUMBER);
        }

        /**
         * RELATIONS
         */
        this.relations.push(
            new RelationModel({
                type: 'managed_by',
                node: {
                    _id: manager._id,
                    class: manager.class,
                    name: manager.name
                }
            })
        );

        this.relations.push(new RelationModel({ type: 'related_to', node: client }));

        if (contactRelation) {
            contactRelation.type = 'ordered_by';
            this.relations.push(contactRelation);
        }

        if (thread_id) {
            this.relations.push(
                new RelationModel({
                    type: 'linked_to',
                    node: {
                        _id: thread_id,
                        class: 'thread',
                        name: 'thread'
                    }
                })
            );
        }
    }


    static create(params: IOrderModelParameters): OrderModel {
        return new this(params);
    }


    static getManager(order: IOrder): INode {
        let manager: INode;

        if (order.relations && order.relations.length) {
            order.relations.forEach(relation => {
                if (relation.type === 'managed_by') manager = <INode>relation.node;
            });
        }


        return manager;
    }

    static getClient(order: IOrder): INode {
        let client: INode;

        if (order.relations && order.relations.length) {
            for (const relation of order.relations) {
                if (relation.type === 'related_to') {
                    return <INode>relation.node;
                }
            }
        }


    }

    static getContact(contact_email: string, client: Client): IRelation {
        let contactRelation: IRelation;

        if (contact_email && client.relations) {
            contactRelation = client.relations.find(
                relation =>
                    relation.type === 'has_contact' &&
                    relation.email === contact_email
            );

            if (contactRelation) {
                contactRelation.type = 'ordered_by';

                return contactRelation;
            }
        }
    }

    private static getCreatedDate(): string {
        return moment().format('YYYY-MM-DD');
    }

    static async getClientReference(contactRelation: IRelation): Promise<string> {
        const { initials } = contactRelation;
        let client_reference: string = '';

        async function processClientReferences() {
            client_reference = `${initials}-${moment().format('YYYYMMDD')}`;

            const query: MangoQuery = {
                selector: {
                    $and: [
                        {
                            class: { $eq: 'order' }
                        },
                        {
                            client_reference: { '$regex': `^${client_reference}.*` }
                        }
                    ]
                },
                fields: [
                    'client_reference'
                ]
            };

            const { docs } = await CouchDbService.adapter.find(query);
            const clientReferences = (<IApolloDocument[]>docs).map((item: IOrder) => item.client_reference).sort();

            if (clientReferences.length) {
                const ALPHABETS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
                const lastClientReference = clientReferences[clientReferences.length - 1];
                const clientReferenceIntial = lastClientReference.charAt(lastClientReference.length - 1);
                const index = ALPHABETS.indexOf(clientReferenceIntial);

                const suffix =
                    lastClientReference.length === 11 ?
                        'B' :
                        ALPHABETS[index + 1];

                return `${client_reference}${suffix}`;

            }
        }

        if (initials) {
            return await processClientReferences();
        }
    }
}