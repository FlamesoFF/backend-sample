import { IRelation } from '../../../@types/data/definitions';
import { CouchDbService } from '../../../services/couchDb';
import { isAbstract, isNode, NodeAbstractModel, NodeModel } from './node';
import { isDocumentWithName, isTask } from '../../../shared/utils/typeGuards';
import { ApolloDocument, IndexedSignature, NodeAmbiguous, TRelation, TRelationGeneric } from '../../../@types/types';


interface AbstractRelationModelParameters {
    type: TRelationGeneric;
    node: NodeAmbiguous;
    properties?: IndexedSignature;
}

export class RelationModel implements IRelation {
    readonly type: TRelationGeneric;
    readonly node: NodeAmbiguous;

    constructor({ type, node, properties }: AbstractRelationModelParameters) {
        if (!type) throw new Error('Relation type is required');
        this.type = type;

        if (isNode(node)) {
            this.node = new NodeModel(node);
        } else if (isAbstract(node)) {
            this.node = new NodeAbstractModel(node);
        } else {
            throw new Error('Invalid relation node structure');
        }

        if (properties) {
            Object.entries(properties).forEach(([key, value]) => {
                this[key] = value;
            });
        }
    }

    static async createFromDocument<T extends ApolloDocument>(
        type: TRelation,
        docId: string
    ): Promise<RelationModel> {
        // Load document from DB
        let document: ApolloDocument;
        let name: string = '';

        try {
            document = await CouchDbService.adapter.get(docId);
        } catch (error) {
            return undefined;
        }

        // Destructure needed CouchDb document parameters
        const {
            _id,
            class: className
        } = document;

        if (isTask(document)) {
            name = document.content;
        } else if (isDocumentWithName(document)) {
            name = document.name;
        }

        const nodeAmbiguous: NodeAmbiguous = {
            _id,
            class: className,
            name
        };

        if (_id && className && name) {
            return new RelationModel({ type: type, node: nodeAmbiguous });
        } else {
            throw new Error(`Document with ID "${docId}" does not contain required properties to create relation.`);
        }
    }
}