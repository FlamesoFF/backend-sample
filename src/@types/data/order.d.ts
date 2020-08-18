import { IComment, IQuote } from './definitions';
import { IApolloDocument } from '../shared';


export interface IOrder extends IApolloDocument {
    number: string;
    created_on: string;
    statuses: IOrderStatuses;

    type?: string[];
    order_date?: string
    companies?: string[]
    client_reference?: string;
    tags?: string[];
    quotes?: IQuote[];
    comments?: IComment[];
}

export interface IOrderStatuses {
    account?: string
    compliance?: string
    client?: string
    order?: string
}
