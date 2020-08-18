import { ValidationError } from 'ajv';
import { Request } from 'express';
import { ParamsDictionary, Query } from 'express-serve-static-core';
import { QueryResultRow } from 'pg';
import { Multipart } from 'request';
import { Stream } from 'stream';
import { ICompany } from '../../../@types/data/company';
import { ICourier } from '../../../@types/data/courier';
import { ICountry, INode } from '../../../@types/data/definitions';
import { IFileDocument } from '../../../@types/data/file';
import { IPerson } from '../../../@types/data/person';
import { NodeAmbiguous, Relation, TRelation, TRelationMeta } from '../../../@types/types';
import { TExcludeCommon } from './models.types';
import { Task, TaskPayload } from '../../modules/tasks/types';


export namespace Requests {
    // For request related to specific entity. Ex.: /entity/:id
    type ParamsId = {
        id: string
    } & ParamsDictionary;

    type QueryLimited = {
        limit?: number
    } & Query;


    export namespace Common {

        export interface IGetSpecific extends Request {
            params: ParamsId
        }

        export interface IUpdate<T> extends Request {
            params: ParamsId
            body: T
        }

        export interface IRemove extends Request {
            params: ParamsId
        }

        export interface ISearch extends Request {
            query: {
                name: string
                type?: string
            } & QueryLimited
        }
    }

    export namespace Companies {

        export interface ICreate extends Request {
            body: {
                name: string
                country: ICountry
                certificate: string
                incorporated_on: string

                _id?: string
            }
        }

        export interface IUpdate extends Request {
            body: ICompany,
            params: ParamsId
        }

    }

    export namespace Contacts {

        export interface ICreate extends Request {
            params: {
                email: string
            }
        }

        export interface IGetPgSQL extends Request {
            params: ParamsId
            query: {
                entity_id?: string
            }
        }

        export interface ICreatePgSQL extends Request {
            params: ParamsId
            body: {
                contact_id: string
                message_id: string
                data: string
            }
        }

        export interface IGetByEmail extends Request {
            params: {
                email: string
            }
        }

    }

    export namespace Couriers {

        export interface ICreateBody extends Omit<ICourier, TExcludeCommon> {
            senderId: string
            receiverId: string
            contactId: string
            clientId: string
            threadId: string
        }

        export interface ICreate extends Request {
            body: ICreateBody
        }

        export interface ISearch extends Request {
            query: {
                name: string
            }
        }

        export interface IUpdate extends Request {
            params: ParamsId
            body: Partial<ICourier>
        }

    }


    export namespace Entities {

        export interface IGet extends Request {
            params: ParamsId
            query: {
                type: TRelation
            }
        }

        export interface Search extends Common.ISearch {
            params: ParamsId
            query: {
                name: string
                type?: string
                class?: string
                manager?: string
            } & QueryLimited
        }

        export interface IGetShares extends Request {

        }

        export interface IGetForSpecific extends Request {

        }

    }

    export namespace Files {

        type TExcludeProperties =
            TExcludeCommon |
            'files';

        export interface IGetSpecific extends Common.IGetSpecific {
        }

        export interface ISearch extends Request {
            query: {
                name: string
            }
        }

        export interface IFileDetail {
            description: string
        }

        export interface IFileDetails {
            [key: string]: IFileDetail
        }

        export interface IUploadBody extends Omit<IFileDocument, TExcludeProperties> {
            filesDetails?: IFileDetails
        }

        export interface ICreate extends Request {
            params: ParamsId
            body: {
                data: IUploadBody
            }
            files: Express.Multer.File[]
        }

        export interface IAttach extends Request {
            params: ParamsId
            body: {
                data: IFileDetails
            }
            files: Express.Multer.File[]
        }

        export interface IUpdate extends Request {
            params: ParamsId
            body: Multipart
        }

        export interface IDownload extends Request {
            params: ParamsId & {
                fileName: string
            }
        }

    }

    export namespace Beta {

        export interface Authenticate extends Request {
            query: {
                token: string
            }
        }

        export interface GmailMessage extends Request {
            body: {
                oauthToken: string
                messageId: string
            }
        }

    }

    export namespace Invoices {
    }

    export namespace Lists {

        export interface ISearch extends Request {
            params: { type: string }
            query: {
                type: string
            }
        }
    }

    export namespace Orders {

        export interface ISearch extends Request {
            query: {
                manager_id?: string,
                date?: string,
                order_by?: string
                order_direction?: string
            } & QueryLimited
        }

        export interface ISearchWithPgSQL extends Request {
            query: {
                statuses?: string
                thread_ids?: string
                order_by?: string
                order_direction?: 'desc' | 'asc'
                manager_id?: string
                my_orders?: string
                limit?: string
            }
        }

        export interface ICreateBody {
            manager_id?: string
            client_id?: string
            _id?: string
            client_reference?: string
            thread_id?: string
            date?: string
            tags?: string
            contact_email?: string
            companies?: string[]    //
            quotes?: string[]
        }


        export interface IUpdateBody {
            manager_id?: string
            client_id?: string
            contact_email?: string
            date?: string
            data?: object
            thread_ids?: string[]
        }

        export interface IPgSqlBasicPayload {
            contact_email?: string
            order_status?: string
            compliance_status?: string
            accounts_status?: string
            client_status?: string
            client_reference?: string
            date?: string
            tags?: string[]
            company_id?: string
            companies?: string[]
            client_id?: string
            quotes?: string[]
            comments?: string[]
            thread_ids?: string[]
        }

        export interface IPgSQLCreate extends Request {
            body: IPgSqlBasicPayload
        }

        export interface IPgSQLUpdate extends Request {
            params: ParamsId
            body: IPgSqlBasicPayload
        }

        export interface IPgSQLBindThread extends Request {
            params: ParamsId
            body: {
                thread_ids: string[]
            }
        }

        export interface ICreate extends Request {
            body: ICreateBody
        }

        export interface IUpdate extends Request {
            body: IUpdateBody
        }
    }

    export namespace Persons {

        export interface ICreateBody
            extends Exclude<IPerson,
                TExcludeCommon
                | 'structured_name'> {
        }

        export interface ICreate extends Request {
            body: ICreateBody
        }

        export interface IUpdate extends Request {
            params: ParamsId
            body: Partial<IPerson>
        }

    }

    export namespace Relations {

        export interface Basic extends Request {
            params: ParamsId & {
                class: string
            }
        }

        export interface ICreate extends Request {
            params: ParamsId
            body: Relation<NodeAmbiguous>
        }

        export interface ISearchNode {
            class?: string,
            where?: object
        }

        export interface ISearchRelation {
            type?: string,
            where?: object
        }

        export interface ISearch extends Request {
            params: ParamsId
            /*
             * query: {
             *     type: TRelationType
             * }
             */
            body: {
                start?: ISearchNode
                relation?: ISearchRelation
                end?: ISearchNode
            }
        }

        export interface IGetAll extends Request {
            params: ParamsId & {
                class: string
            }
            query: QueryLimited
        }

        export interface IGet extends Request {
            params: ParamsId & {
                class: string
            }
            query: {
                type?: TRelation | TRelationMeta
                class?: string
            } & QueryLimited
        }

        export interface IList extends Request {
            query: {
                name?: string
                type?: string
                class?: string
                relation?: string
            }
        }

        export interface IRemove extends Request {
            params: ParamsId
            query: {
                type: TRelation,
                nodeId?: string
            }
        }
    }

    export namespace Tasks {

        type TGroups =
            'to_me'
            | 'from_me'
            | 'completed';


        export interface ISearch  {
            description: string
            group?: TGroups
            limit: number
        }

        /*
         * export interface IList extends IBasicRequest {
         *     query: TDefinedCollection<{
         *         group: TGroups
         *         limit: number
         *     }>
         * }
         */

        export interface IUpdate extends Request {
            params: ParamsId
            body: TaskPayload
        }

        // ISO 8601
        export interface IComplete extends Request {
            params: ParamsId
            body: {
                timestamp: string   // unix timestamp
            }
        }

        export interface ICreate {
            body: TaskPayload
        }

    }

    export namespace Users {
    }

}

export namespace Responses {


    // INTERFACES
    export interface Basic {
        ok?: boolean   // operation result
        id?: string   // if something has been created or updated
        data?: any    // if server returns some data
        errors?: (IApiError | ValidationError)[]   // if there's some errors
        warnings?: string[]   // if there's some warnings
    }

    interface IApiError {
        code: number
        description: string
    }

    export interface IDownloadResponse {
        fileName: string
        stream: Stream
    }

    export interface Created extends Basic {
    }

    export interface Updated extends Basic {
    }

    export interface Removed extends Basic {
    }

    export interface IEntityItem {
        _id: string
        class: string
        name: string
        description: string
    }

    export interface IGmailContact {
        name: string
        email: string
    }


    export interface IRelationItem {
        _id: string
        name: string
    }


    // NAMESPACES
    export namespace Lists {

        export interface DefaultItem {
            _id?: string
            class: string
        }

        export interface CompanyItem extends DefaultItem {
            name: string
            weight: number
        }

        export interface TaskItem extends DefaultItem {
            content: string
            created_on: string
            completed_on: string
            // estimated_time: number
            reminder_time: string
            related_to?: INode
            assigned_to?: INode
            assigned_by?: INode
            notes: string
            comments: number
            files: number
            quotes: number
        }

        /**
         * @description #/definitions/list_item_orders
         */
        export interface OrderItem extends DefaultItem {
            country_code: string
            status_compliance: string
            status_account: string
            status_client: string
            status_order: string
            number: string
            order_date: string
            client_short_name: string
            companies: string
            description: string
        }


        export type Generic = Default | Order | Task[];

        export type Default = DefaultItem[];
        export type Companies = (CompanyItem & {})[]
        export type Order = (OrderItem & {})[]
    }

    export namespace Common {

        export type FuzzySearch = Array<QueryResultRow & {
            id: string
            name: string,
            class: string
            description: string,
            similarity: number
            stddev: number
            percentile: number
        }>;

    }


    // TYPES
}