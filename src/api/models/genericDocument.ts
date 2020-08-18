import { MaybeDocument } from 'nano';
import { IApolloDocument } from '../../@types/shared';
import { RelationModel } from './shared/relation';
import { ApolloDocument, RelationList } from '../../@types/types';

interface GenericDocumentParams {


}

export class GenericDocument<T = ApolloDocument> implements IApolloDocument, MaybeDocument {
    readonly schema_id: string;
    readonly class: string;

    _id?: string;
    _rev?: string;
    relations?: RelationList = []

    new: () => T

    constructor(schema_id: string, className: string, _id?: string) {
        this.schema_id = schema_id;
        this.class = className;

        if (_id) this._id = _id;
    }

    static addRelation(doc: ApolloDocument, relation: RelationModel): ApolloDocument | void {
        doc.relations.forEach(item => {
            if (item.type === relation.type) {
                throw new Error('Relation with this type is already exists');
            }
        });

        doc.relations.push(relation);
    }
}