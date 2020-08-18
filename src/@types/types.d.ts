import { IPerson } from './data/person';
import { ICompany } from './data/company';
import { INode, INodeAbstract, IRelation, IRelationReversed } from './data/definitions';
import { IOrder } from './data/order';
import { ICourier } from './data/courier';
import { IFileDocument } from './data/file';
import { FinancialDocument } from './data/document';
import { TaskPayload } from '../api/modules/tasks/model';
import { Task } from "../api/modules/tasks/types";

export type Entity = IPerson | ICompany;
// All possible relation types
export type TRelation =
    'has_director'
    | 'has_member'
    | 'has_manager'
    | 'has_partner'
    | 'has_client'
    | 'has_agent'
    | 'has_inspection'
    | 'has_contact'
    | 'is_client'
    | 'is_agent'
    | 'related_to'
    | 'linked_to'
    | 'ordered_by'
    | 'managed_by'
    | 'has_receiver'
    | 'has_sender'
    | 'has_document'
    | 'contains'
    | 'issued_by'
    | 'issued_to';

export type TRelationMeta =
    'is_director'
    | 'is_member'
    | 'is_partner'
    | 'is_inspection'
    | 'is_contact'
    | 'is_client'
    | 'is_agent'
    | 'related_to'
    | 'linked_to'
    | 'ordered'
    | 'responsible_for'
    | 'is_receiver'
    | 'is_sender'
    | 'included_in'
    | 'contains'
    | 'issued'
    | 'has';

export type TRelationGeneric = TRelation | TRelationMeta;
/**
 * TYPES
 */

export type NodeAmbiguous = INode | INodeAbstract;
export type Relation<T extends NodeAmbiguous = NodeAmbiguous> = T extends INode ? IRelation<INode> : IRelation<INodeAbstract>;
export type RelationDefined = IRelation<INode>;
export type RelationAbstract = IRelation<INodeAbstract>;
export type RelationDefinedMeta = IRelationReversed<INode>;
export type RelationList<T extends NodeAmbiguous = NodeAmbiguous> = Relation<T>[];


/**
 * TYPES
 */

export type ApolloDocument =
    ICompany
    | IPerson
    | IOrder
    | ICourier
    | IFileDocument
    | FinancialDocument
    | Task;

export type IndexedSignature<T extends any = any> = {
    [key: string]: T
};