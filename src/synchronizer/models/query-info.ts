import { ApolloDocument, Relation } from '../../@types/types';
import { Objects } from '../scripts/utils/helper';
import { INode } from '../../@types/data/definitions';
import { isRelationDefined } from '../../shared/utils/typeGuards';
import { Neo4jController } from '../controllers/neo4j.controller';


export interface QueryRelation {
    query: string;
    params: RelationQueryParams[];
}

export interface QueryNode {
    query: string;
    params: NodeQueryParams[];
}

export interface RelationQueryParams {
    startNodeId: string
    properties: object
    endNodeId: string
}

export interface NodeQueryParams {
    properties: object
}


export interface QueryInfos {
    node: {
        [key: string]: QueryNode
    },
    relations: {
        [key: string]: QueryRelation
    }
}

export interface QueryInfoNode {
    [className: string]: QueryNode
}

interface QueryInfoRelation {
    [type: string]: QueryRelation;
}

export class QueryInfo implements QueryInfos {
    node: QueryInfoNode = {};
    relations: QueryInfoRelation = {};

    addNodeQuery(className: string, query: string) {
        this.node[className] = {
            query,
            params: []
        };
    }

    addRelationQuery(type: string, query: string) {
        this.relations[type] = {
            query,
            params: []
        };
    }

    addNodeParams(className: string, node: ApolloDocument | INode) {
        const getters = Neo4jController.getters[className];

        if (!getters) return;

        let pickedProps = Objects.extractProps(
            node,
            getters
        );

        if (!pickedProps._id) return;

        pickedProps = Objects.getFlat(pickedProps);

        this.node[className]?.params?.push({
            properties: pickedProps
        });
    }

    addRelationParams(relation: Relation, doc: ApolloDocument | INode): void {
        const { _id: docId } = doc;

        let properties, nodeId, nodeName, type;

        // TODO: add undefined relation support
        if (isRelationDefined(relation)) {
            ({
                type,
                node: {
                    _id: nodeId,
                    name: nodeName
                },
                ...properties
            } = relation);
        } else {
            return;
        }

        const flattenProperties = Objects.getFlat(properties);


        this.relations[type].params.push({
            startNodeId: docId,
            endNodeId: nodeId,
            properties: flattenProperties
        });
    }

}