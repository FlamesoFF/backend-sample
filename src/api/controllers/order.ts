import { DocumentFetchResponse, MangoQuery, SortOrder } from 'nano';
import { ICompany } from '../../@types/data/company';
import { IRelation } from '../../@types/data/definitions';
import { IOrder } from '../../@types/data/order';
import { IPerson } from '../../@types/data/person';
import { Requests, Responses } from '../@types/api/controllers.types';
import { ApiError, ERRORS } from '../errors';
import { OrderModel } from '../models/order';
import { CouchDbService } from '../../services/couchDb';
import { Neo4jService } from '../../services/neo4j';
import { Utils } from '../shared/utils';
import { MwAuth } from '../middlewares/auth';
import { DEFAULT_LIST_LIMIT, ORDER_DATE_PATTERN } from '../constants';
import { SCHEMA_PATHS, validator } from '../services/validator';
import { TextUtils } from '@apollo4u/auxiliary';
import { StatsController } from './stats';
import moment from 'moment';
import { PostgreSqlService } from '../../services/postgreSql';
import { ResponseFormatterData } from '../middlewares/response';
import { QueryResult } from 'pg';
import { CONFIG } from '../../shared/config';


type Client = ICompany | IPerson;

export interface PgSqlOrderResponse {
    rows: PgSqlOrderResponseItem[]
}

export interface PgSqlOrderResponseItem {
    order_id: string;
    manager_id: string;
    order_status: string;
    compliance_status: string;
    accounts_status: string;
    client_status: string;
    order_date: string;
    tags: string[];
    company_id: null;
    client_reference: null;
    stamp: string;
    client_id: string;
    contact_email: string;
    quotes: string[];
    companies: string[];

    [key: string]: any
}


export interface PgSqlOrderUpdateParameters {
    p_manager_id: string
    p_client_id?: string
    p_contact_email?: string
    p_order_date?: string
    p_order_data?: object
    p_thread_id?: string[]
}


export class OrdersController {

    static async initialize() {
        const { main: { name: mainDbName } } = CONFIG.servers.couchdb.databases;

        CouchDbService.switchDb(mainDbName);

        try {
            await CouchDbService.adapter.createIndex({
                index: {
                    fields: ['order_date']
                },
                name: 'order-date',
                ddoc: 'index'
            });
        } catch (error) {
            console.error(error.message);
        }

        try {
            await CouchDbService.adapter.createIndex({
                index: {
                    fields: ['number']
                },
                name: 'order-number',
                ddoc: 'index'
            });
        } catch (error) {
            console.error(error.message);
        }
    }


    /**@description Search orders */
    static async search(request: Requests.Orders.ISearch): Promise<Responses.Lists.Order> {
        const {
            query: {
                manager_id,
                date,
                order_by,
                order_direction = 'desc',
                limit = DEFAULT_LIST_LIMIT
            }
        } = request;

        const { roles: userRoles } = MwAuth.user;


        async function ordersListMap(doc: IOrder): Promise<Responses.Lists.OrderItem> {
            const {
                _id,
                class: className,
                number,
                order_date,
                companies: orderCompanies = [],
                statuses: {
                    account: status_account,
                    client: status_client,
                    compliance: status_compliance,
                    order: status_order
                } = {},
                relations = [],
                tags = []
            } = doc;

            let country_code: string;
            const description = tags.join(', ');
            const companies = orderCompanies.join(', ');
            const client_short_name: string = OrderModel.getClient(doc)?._id;

            const clientID = OrderModel.getClient(doc)?._id;

            if (clientID) {
                country_code = (<ICompany>await CouchDbService.adapter.get(_id))?.country?.code;
            }

            return {
                _id,
                class: className,
                country_code,
                status_compliance,
                status_account,
                status_order,
                status_client,
                client_short_name,
                companies,
                description,
                number,
                order_date
            };
        }


        let documents: IOrder[];


        if (manager_id && (userRoles.includes('manager') || userRoles.includes('developer'))) {
            const neoQuery =
                `MATCH (o:order)-[:managed_by]-({_id: "${manager_id.trim()}"})
                RETURN o`;

            const { records } = await Neo4jService.adapter.run(neoQuery);

            const keys: string[] =
                records.map(item => {
                    const {
                        properties: { _id = null } = {}
                    } = item.get('o');

                    return _id;
                });

            const response = await CouchDbService.adapter.fetch({ keys }) as DocumentFetchResponse<IOrder>;

            documents = Utils.Nano.normalizeResponse(response);
        }
        else {
            const query: MangoQuery = {
                selector: {
                    class: { $eq: 'order' }
                },
                limit: Number(limit)
            };

            if (date) {
                query.selector.order_date = {
                    $eq: date.trim()
                };
            }

            if (order_by) {
                if (!['order_date', 'number'].includes(order_by)) {
                    throw new ApiError(ERRORS.COUCH_DB.MISSING_INDEX_FOR_SPECIFIED_FIELDS);
                }

                if (!['asc', 'desc'].includes(order_direction)) {
                    throw new ApiError(ERRORS.COUCH_DB.INVALID_ORDER_DIRECTION);
                }

                query.sort = [<SortOrder>{ [order_by]: order_direction }];
            }

            const response = await CouchDbService.adapter.find(query);

            documents = response.docs as IOrder[];
        }


        const list: Responses.Lists.Order = [];

        for (const doc of documents) {
            try {
                list.push(await ordersListMap(doc));
            } catch (error) {
                console.warn(error);
            }
        }


        return list;
    }


    static async create(request: Requests.Orders.ICreate) {
        const { _id: user_id } = MwAuth.user;
        const {
            client_id,
            date,
            tags,
            manager_id = user_id,
            contact_email,
            thread_id,
            companies
        } = request.body;

        let { client_reference } = request.body;
        let manager: IPerson,
            client: Client;


        // Validate
        const valid = await validator.validate(SCHEMA_PATHS.client.orders.create, request.body);

        if (!valid) throw new ApiError(ERRORS.VALIDATOR.FAILED, validator.errors);


        try {
            manager = await CouchDbService.adapter.get(manager_id) as IPerson;
        } catch (error) {
            throw new ApiError({ description: `Manager with ID "${manager_id}" was not found.` });
        }

        try {
            client = await CouchDbService.adapter.get(client_id) as Client;
        } catch (error) {
            throw new ApiError({ description: `Client with ID "${client_id}" was not found.` });
        }


        const contactRelation: IRelation = OrderModel.getContact(contact_email, client);


        if (!client_reference && contactRelation) {
            client_reference = await OrderModel.getClientReference(contactRelation);
        }


        // Get name
        const number = await StatsController.incrementOrderNumber();

        // Create initials name
        const { name } = MwAuth.user;
        const initials = TextUtils.nameToInitials(name);


        const order = OrderModel.create({
            number,
            initials,
            client,
            manager,
            thread_id,
            client_reference,
            contactRelation,
            date,
            tags,
            companies
        });

        return await CouchDbService.adapter.insert(order).catch(error => {
            throw new ApiError(ERRORS.COUCH_DB.DOCUMENT_WITH_THE_SAME_ID_ALREADY_EXISTS);
        });
    }
}

interface FormBasicQueryParams {
    manager_id: string
    order_id?: string
    data?: {
        companies?: string[]
        quotes?: string[]
    };
    client_id?: string;
    contact_id?: string;
    date?: string;
    contact_email?: string;
    accounts_status?: string;
    client_status?: string;
    client_reference?: string
    compliance_status?: string;
    order_status?: string;
    company_ids?: string[];
    thread_ids?: string[];
    tags?: string[];
}

export class OrdersPgSQLController {

    static async search({
        query: {
            statuses = 'creating, WAITING, ready_for_clearing, ready_to_process, in process, send docs to client',
            thread_ids,
            order_by = 'order_date',
            order_direction = 'desc',
            manager_id,
            my_orders
        }
    }: Requests.Orders.ISearchWithPgSQL): Promise<PgSqlOrderResponseItem[]> {
        const { _id: userId } = MwAuth.user;

        let queryParams = '';
        let threadParameter,
            statusesParameter;

        if (manager_id || my_orders === 'true') queryParams += `p_manager_id:='${manager_id ?? userId}',`;
        if (thread_ids) threadParameter = `ARRAY[${thread_ids.split(',').map(item => `'${item}'`).join(',')}]::TEXT[]`;
        if (statuses) statusesParameter = `ARRAY[${statuses.split(',').map(item => `'${item}'`).join(',')}]::TEXT[]`;

        queryParams += `p_status:=${statusesParameter || null}`;
        queryParams += `,p_thread_id:=${threadParameter || null}`;

        let query = `SELECT * FROM find_orders(${queryParams})`;

        if (order_by) query += ` ORDER BY ${order_by}`;
        if (order_by && order_direction) query += ` ${order_direction}`;

        query += ' LIMIT 100';

        const { rows } = await PostgreSqlService.adapter.query(query) as PgSqlOrderResponse;

        return this.formatOrderList(rows) ?? [];
    }

    static async getById({ params: { id } }: Requests.Common.IGetSpecific) {
        const queryOrder =
            `SELECT *
            FROM (
                 SELECT *
                 FROM orders
                 WHERE order_id = '${id}'
            ) o
                LEFT OUTER JOIN
            (
                 SELECT *
                 FROM threads
                 WHERE order_id = '${id}'
             ) AS t
             ON o.order_id = t.order_id;`;

        const { rows } = await PostgreSqlService.adapter.query(queryOrder) as QueryResult<PgSqlOrderResponseItem>;

        if (rows.length === 0) throw new ApiError(ERRORS.PG.NOT_FOUND_BY_ID);

        const [order] = rows;
        const threads = rows.map(item => item.thread_id);

        order.order_date = moment(order.order_date).format(ORDER_DATE_PATTERN);

        delete order.thread_id;

        return {
            ...order,
            ...{ thread_ids: threads }
        };
    }

    static async create({
        body: {
            order_status = 'creating',
            accounts_status = 'new',
            client_status = 'new',
            compliance_status = 'new',
            date = moment().format(ORDER_DATE_PATTERN),
            client_id,
            contact_email,
            client_reference,
            company_ids = [],
            companies = [],
            quotes = [],
            tags = [],
            thread_ids = []
        }
    }: Requests.Orders.ICreateWithPgSQL): Promise<ResponseFormatterData> {
        const { _id: manager_id } = MwAuth.user;
        let contact_id: string;

        if (contact_email && !client_id) {
            ({
                client: { _id: client_id },
                contact: { _id: contact_id }
            } = await this.getClientIdByEmail(contact_email));
        }

        // Deduplicate
        quotes = this.deduplicateArray(quotes);
        tags = this.deduplicateArray(tags);
        thread_ids = this.deduplicateArray(thread_ids);
        companies = this.deduplicateArray(companies);

        quotes = this.cleanQuotes(quotes);

        const data = {
            quotes,
            companies
        };

        const queryParams = this.formBasicQuery({
            manager_id,
            data,
            client_id,
            contact_id,
            date,
            contact_email,
            accounts_status,
            client_status,
            client_reference,
            compliance_status,
            order_status,
            company_ids,
            thread_ids,
            tags
        });

        const query = `CALL add_order(${queryParams})`;

        try {
            const { rows: [{ p_order_id }] } = await PostgreSqlService.adapter.query(query);

            if (p_order_id) {
                return { id: p_order_id };
            }
            else {
                throw 'Unable to create order. PgSQL internal error.';
            }
        } catch (e) {
            throw 'Unable to create order. PgSQL internal error.';
        }
    }

    static async update({
        body: {
            date,
            contact_email,
            accounts_status,
            client_status,
            client_reference,
            client_id,
            compliance_status,
            order_status,
            company_ids = [],
            companies = [],
            thread_ids = [],
            quotes = [],
            tags = []
        },
        params: { id: order_id }
    }: Requests.Orders.IUpdateWithPgSQL): Promise<ResponseFormatterData> {
        const { _id: managerId } = MwAuth.user;
        let contact_id: string;

        if (contact_email && !client_id) {
            ({
                client: { _id: client_id },
                contact: { _id: contact_id }
            } = await this.getClientIdByEmail(contact_email));
        }


        // Deduplicate
        quotes = this.deduplicateArray(quotes);
        tags = this.deduplicateArray(tags);
        thread_ids = this.deduplicateArray(thread_ids);
        companies = this.deduplicateArray(companies);

        quotes = this.cleanQuotes(quotes);

        const data = {
            quotes,
            companies
        };

        const queryParams = this.formBasicQuery({
            manager_id: managerId,
            order_id,
            data,
            client_id,
            contact_id,
            date,
            contact_email,
            accounts_status,
            client_reference,
            client_status,
            compliance_status,
            order_status,
            company_ids,
            thread_ids,
            tags
        });

        const query = `CALL upd_order(${queryParams})`;

        try {
            const { rows: [{ p_order_id }] } = await PostgreSqlService.adapter.query(query);

            if (p_order_id) {
                return { id: p_order_id };
            }
            else {
                throw 'Unable to update order. PgSQL internal error.';
            }
        } catch (e) {
            throw 'Unable to create order. PgSQL internal error.';
        }

    }

    static async bindThreads({
        body: { thread_ids },
        params: { id: orderId }
    }: Requests.Orders.IBindThread): Promise<ResponseFormatterData> {
        if (!thread_ids) throw new ApiError(ERRORS.COMMON.MISSING_REQUIRED_PARAMETERS, ['thread_ids']);

        const threadParameter = thread_ids.map(item => `'${item}'`).join(',');
        const query = `CALL add_threads(p_order_id:='${orderId}', p_thread_id:=ARRAY[${threadParameter}]::TEXT[])`;

        try {
            await PostgreSqlService.adapter.query(query);

            return { id: orderId };
        } catch (e) {
            throw 'Unable to bind threads to order.';
        }
    }

    private static formatOrderList(rows: PgSqlOrderResponseItem[]) {
        return rows.map(row => {
            if (row.data) {
                for (const [key, value] of Object.entries(row.data)) {
                    row[key] = value;
                }
            }

            delete row.data;

            // Format date
            row.order_date = moment(row?.order_date ?? new Date()).format(ORDER_DATE_PATTERN);

            return row;
        });
    }

    private static async getClientIdByEmail(contact_email: string) {
        const response = await Neo4jService.runQuery(
            `MATCH ()-[contact:has_contact {email: "${contact_email}"}]->(client)
                WHERE (client:company OR client:person)
                RETURN contact, client`
        );

        return {
            contact: response?.records?.[0]?.get('contact') || {},
            client: response?.records?.[0]?.get('client') || {}
        };
    }


    private static formBasicQuery({
        manager_id,
        order_id,
        data,
        client_id,
        contact_id,
        date,
        contact_email,
        accounts_status,
        client_status,
        client_reference,
        compliance_status,
        order_status,
        company_ids,
        thread_ids,
        tags
    }: FormBasicQueryParams): string {
        let query = `p_manager_id:='${manager_id}'`;

        query += `,p_order_data:='${JSON.stringify(data)}'`;

        const order_date = moment(date)?.format(ORDER_DATE_PATTERN);

        // Primitive types
        if (order_id) query += `,p_order_id:='${order_id}'`;
        if (client_id) query += `,p_client_id:='${client_id}'`;
        if (contact_id) query += `,p_contact_id:='${contact_id}'`;
        if (contact_email) query += `,p_contact_email:='${contact_email}'`;
        if (order_date) query += `,p_order_date:='${order_date}'`;
        if (accounts_status) query += `,p_accounts_status:='${accounts_status}'`;
        if (client_status) query += `,p_client_status:='${client_status}'`;
        if (client_reference) query += `,p_client_reference:='${client_reference}'`;
        if (compliance_status) query += `,p_compliance_status:='${compliance_status}'`;
        if (order_status) query += `,p_order_status:='${order_status}'`;

        if (company_ids) {
            const subQuery = company_ids.map(item => `'${item}'`).join(',');

            query += `,p_company_id:=ARRAY[${subQuery}]::TEXT[]`;
        }
        if (thread_ids) {
            const subQuery = thread_ids.map(item => `'${item}'`).join(',');

            query += `,p_thread_id:=ARRAY[${subQuery}]::TEXT[]`;
        }
        if (tags) {
            const subQuery = tags.map(item => `'${item}'`).join(',');

            query += `,p_tags:=ARRAY[${subQuery}]::TEXT[]`;
        }

        return query;
    }

    private static deduplicateArray(quotes: string[]) {
        return [...new Set(quotes)].filter(item => item ?? false);
    }

    private static cleanQuotes(quotes: string[]) {
        return quotes.map(
            q => q.replace(/[\s']+/g, ' ').trim()
        );
    }
}
