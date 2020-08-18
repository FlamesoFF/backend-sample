import { MaybeDocument } from 'nano';
import { RelationList } from './types';

/**
 * INTERFACES
 */

export interface IApolloDocument extends MaybeDocument {
    schema_id: string
    class: string
    relations?: RelationList
}

export interface IIndexSignature<T = any> {
    [key: string]: T
}