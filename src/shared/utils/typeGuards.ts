import { IPerson } from '../../@types/data/person';
import { ICompany } from '../../@types/data/company';
import { FinancialDocument } from '../../@types/data/document';
import { ApolloDocument, Relation, RelationAbstract, RelationDefined } from '../../@types/types';
import {
    DatabaseChangesResultItem,
    DocumentFetchResponse,
    DocumentLookupFailure,
    DocumentResponseRow,
    MangoResponse
} from 'nano';
import { Utils } from '../../api/shared/utils';
import { ApiError } from '../../api/errors';
import { ValidationError } from 'ajv';
import NanoResponsesWithDocs = Utils.Nano.NanoResponsesWithDocs;
import { Task } from "../../api/modules/tasks/types";


export function isDocumentWithName( doc: ApolloDocument ): doc is ApolloDocument & { name: string } {
    return Boolean(
        (<Task>doc).class !== 'task' &&
        (<FinancialDocument>doc).class !== 'document'
    );
}

export function isTask( doc: ApolloDocument ): doc is Task {
    return Boolean((<Task>doc).description);
}

export function isFinancialDocument( doc: ApolloDocument ): doc is Task {
    return Boolean((<FinancialDocument>doc).class === 'document');
}

export function isPerson( doc: ApolloDocument ): doc is IPerson {
    return (<IPerson>doc).class === 'person' &&
        Boolean((<IPerson>doc).date_of_birth);
}

export function isCompany( doc: ApolloDocument ): doc is ICompany {
    return Boolean((<ICompany>doc).class === 'company');
}

export function isRelation( item: Relation ): item is RelationAbstract {
    return Boolean(
        (<RelationDefined>item).node?._id === undefined &&
        (<RelationAbstract>item).node.name
    );
}

export function isRelationDefined( relation: Relation ): relation is RelationDefined {
    const {
        type,
        node: {
            _id,
            name,
            // class: _class
        }
    } = relation as RelationDefined;

    return Boolean(type && name && _id);
}

export function isRelationAbstract( relation: Relation ): relation is RelationAbstract {
    const {
        type,
        node: {
            _id,
            name,
            class: _class
        }
    } = relation as RelationDefined;

    return Boolean(type && name && (!_id || !_class));
}


export function isChange<T extends DatabaseChangesResultItem, D extends ApolloDocument>( item: T | D ): item is T {
    return !!(<T>item).changes && !!(<T>item).seq && !!(<T>item).id;
}


export function isDeleted<D extends ApolloDocument>( row: DocumentResponseRow<D> | DocumentLookupFailure ): row is DocumentLookupFailure {
    return !!(<DocumentLookupFailure>row).error;
}

export function isRow<D extends ApolloDocument>( row: DocumentResponseRow<D> | DocumentLookupFailure ): row is DocumentResponseRow<D> {
    return (<DocumentResponseRow<D>>row).id && !!(<DocumentResponseRow<D>>row).doc;
}

export function isResponseFetch<D extends ApolloDocument>( response: NanoResponsesWithDocs<D> ): response is DocumentFetchResponse<D> {
    const {
        rows,
        total_rows
    } = <DocumentFetchResponse<D>>response;

    if ( rows && total_rows ) {
        return true;
    }
}

export function isResponseMango<DocType extends ApolloDocument>( response: NanoResponsesWithDocs<DocType> ): response is MangoResponse<DocType> {
    const {
        bookmark,
        docs
    } = <MangoResponse<DocType>>response;

    if ( bookmark && docs && docs.length >= 0 ) {
        return true;
    }
}

export function isApiError( error: ApiError | ValidationError | Error ): error is ApiError {
    if ( (<ApiError>error).code && error.message ) return true;
}

export function isValidationError( error: ApiError | ValidationError | Error ): error is ValidationError {
    if ( (<ValidationError>error).errors && (<ValidationError>error).validation && error.message ) return true;
}

export function isNodeError( error: ApiError | ValidationError | Error ): error is Error {
    if ( (<Error>error).name && (<Error>error).stack && error.message ) return true;
}