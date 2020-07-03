import { Requests } from '../@types/api/controllers.types';
import { INode, IRelation } from '../../@types/data/definitions';
import { IApolloDocument } from '../../@types/shared';
import { ApiError, ERRORS } from '../errors';
import { RelationModel } from '../models/shared/relation';
import { CouchDbService } from '../../services/couchDb';
import { Neo4jService } from '../../services/neo4j';
import { DEFAULT_NEO4J_QUERY_LIMIT, RELATION_MAP, RELATION_MAP_REVERSED, RELATION_TYPE_MAP } from '../constants';
import { isRelationDefined } from '../../shared/utils/typeGuards';
import { Relationship } from 'neo4j-driver';
import { Relation, TRelation, TRelationGeneric, TRelationMeta } from '../../@types/types';


export class RelationsController {
    static async create(request: Requests.Relations.ICreate) {
        const {
            body: {
                node,
                type: relationType,
                ...properties
            },
            params: { id }
        } = request;

        // TODO: make separated common method to get entities from CouchDB with types
        let document: IApolloDocument;

        try {
            document = await CouchDbService.adapter.get(id);
        } catch (error) {
            throw new Error(`Document with ID ${id} does not exist.`);
        }

        const newRelation = new RelationModel({
            type: relationType,
            node: node,
            properties: properties
        });

        let relationIndex: number;

        // Check realation type compatibility
        if (!RELATION_TYPE_MAP?.get(document.class)?.has(<TRelation>relationType)) {
            throw new ApiError(ERRORS.COUCH_DB.INVALID_RELATION_TYPE_FOR_SPECIFIED_CLASS);
        }

        if (!document.relations) {
            document.relations = [newRelation];
        }
        else {
            relationIndex = document.relations.findIndex(
                (relation: IRelation<INode>) => {
                    if (isRelationDefined(newRelation)) {
                        return relation.node._id === newRelation.node._id &&
                            relation.type === newRelation.type &&
                            relation.node.class === newRelation.node.class;
                    }

                }
            );

            if (relationIndex !== -1) {
                document.relations[relationIndex] = newRelation;
            }
            else {
                document.relations.push(newRelation);
            }

        }

        // return await couchDbAdapter.insert(node, nodeId);
        return await CouchDbService.adapter.insert(document, id);
    }

    static async get(request: Requests.Relations.IGet) {
        const {
            params: { id },
            query: {
                type,
                class: targetClass = '',
                limit = DEFAULT_NEO4J_QUERY_LIMIT
            }
        } = request;
        const relations: Relation[] = [];
        const metaRelation = RELATION_MAP.get(<TRelationMeta>type);
        const records = await this.searchRelations(id, targetClass, metaRelation, type, limit);


        function addRelation(type: TRelationGeneric, nodeClass: string, nodeProperties: any, relation: Relationship) {
            relations.push(
                new RelationModel({
                    type,
                    node: {
                        class: nodeClass,
                        ...nodeProperties
                    },
                    properties: relation.properties
                })
            );
        }

        for (const rec of records) {
            const {
                labels: [nodeClass],
                properties: nodeProperties = {}
            } = rec.get('targetNode');
            let relation;

            try {
                relation = rec.get('relation');
            } catch (e) {
            }

            if (relation) {
                if (metaRelation) {
                    // meta relation output
                    addRelation(type,nodeClass, nodeProperties, relation);
                }
                else if (type) {
                    // real relation output
                    addRelation(type,nodeClass, nodeProperties, relation);
                }
            }
            else {
                let outRelation: Relationship;
                let inRelation: Relationship;

                try {
                    outRelation = rec.get('out');
                } catch (e) {
                }

                try {
                    inRelation = rec.get('in');
                } catch (e) {
                }

                if (outRelation) {
                    if (!outRelation.type) continue;

                    addRelation(<TRelation>outRelation.type, nodeClass, nodeProperties, outRelation);
                }

                if (inRelation) {
                    inRelation.type = RELATION_MAP_REVERSED.get(<TRelation>inRelation.type);

                    if (!inRelation.type) continue;

                    addRelation(<TRelation>inRelation.type, nodeClass, nodeProperties, inRelation);
                }
            }

        }

        return relations;
    }

    static async searchRelations(id: string, targetClass: string, metaRelation: TRelation, type: TRelation | TRelationMeta, limit: number) {
        let query = `MATCH (startNode {_id: '${id}'})-[]-(targetNode ${targetClass ? `:${targetClass}` : ''})`;


        if (metaRelation) {
            query +=
                ` OPTIONAL MATCH (startNode)<-[relation ${metaRelation ? `:${metaRelation}` : ''}]-(targetNode)
                RETURN relation, targetNode`;
        }
        else if (type) {
            query +=
                ` OPTIONAL MATCH (startNode)-[relation ${type ? `:${type}` : ''}]->(targetNode)
                RETURN relation, targetNode`;
        }
        else {
            query +=
                ` OPTIONAL MATCH (startNode)-[out]->(targetNode)
                OPTIONAL MATCH (startNode)<-[in]-(targetNode)
                RETURN targetNode, out, in`;
        }

        query += ` LIMIT ${limit}`;

        const { records } = await Neo4jService.runQuery(query);

        return records;
    }

    static async remove(request: Requests.Relations.IRemove) {
        const {
            params: { id },
            query: {
                type,
                nodeId
            }
        } = request;


        if (id && type) {
            const document = await CouchDbService.adapter.get(id) as IApolloDocument;

            document.relations = document.relations.filter((item: Relation) => {
                if (nodeId) {
                    return isRelationDefined(item) &&
                        item.node._id !== nodeId &&
                        item.type !== type;
                }
                else {
                    return item.type !== type;
                }
            });

            return await CouchDbService.adapter.insert(document);
        }
        else {
            throw new ApiError({ description: 'Please specify nodeId and type of relation' });
        }

    }

    private static formatIncomingRelations(list: Relation[]): Relation[] {
        return list.map(
            (item): any => ({
                ...item,
                type: item.type,
            })
        );
    }
};