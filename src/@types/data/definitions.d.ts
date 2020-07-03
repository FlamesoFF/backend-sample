import { NodeAmbiguous, TRelationGeneric, TRelationMeta } from '../types';


/**
 * INTERFACES
 */

export interface IBasicEntity {
    _id?: string;
    name?: string;
}
export interface IBank {
    _id: string;
    name: string;
    class: string;
    country: ICountry;
}
export interface ICountry {
    id: string;
    name: string;
    code: string;
    state?: string;
}
export interface IClient extends IBasicEntity {
    name: string;
}

export interface IComment {
    user: ICommentUser;
    text: string;
    created_on: string;
    updated_on?: string;
}
export interface ICommentUser {
    _id: string;
    name: string;
    avatar?: string;
}

export interface IEmail {
    type?: string;
    value: string;
}
export interface IEnteredBy {
    _id: string;
    class?: string;
    name: string;
}

export interface IPhone {
    type?: string;
    value: string;
}

export interface IQuote {
    headers: IQuoteHeaders;
    items: IQuoteItem[];
}

export interface IQuoteHeaders {
    to: string;
    subject: string;
    message_id: string;
    from: string;
    date: string;
    thread_id?: string;
}

export interface IQuoteItem {
    manager_id: string;
    text: string;
}

// export type TRT = typeof RELATION_TYPES;


export interface IRelation<T extends NodeAmbiguous = NodeAmbiguous> {
    node: T
    type: TRelationGeneric

    [k: string]: any;
}

export interface INode {
    _id: string
    class: string
    name: string
    description?: string
}

export interface INodeAbstract {
    name: string;
}

export interface IRelationReversed<T = NodeAmbiguous> {
    node: T;
    type: TRelationMeta;

    [k: string]: any;
}

export interface IUser {
    _id?: string;
    name: string;
    initials: string;
}

