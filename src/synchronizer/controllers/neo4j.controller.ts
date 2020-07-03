import { syncLogger } from '../../service-logger';
import { Neo4jService, TransactionQuery } from '../../services/neo4j';
import { ApolloDocument, Relation } from '../../@types/types';
import { ApplyParams, Model } from '../@types/models';
import { NanoDB, Objects, Strings } from '../scripts/utils/helper';
import { isDocumentWithName, isRelationDefined } from '../../shared/utils/typeGuards';
import { ApiError, ERRORS } from '../../api/errors';
import { QueryInfo, QueryInfos, QueryNode, QueryRelation } from '../models/query-info';
import { ICompany } from '../../@types/data/company';
import { IPerson } from '../../@types/data/person';
import { IOrder } from '../../@types/data/order';
import { ITask } from '../../@types/data/task';


export class Neo4jController {
    private static baseQuery = 'UNWIND $batch as row';
    private static queries = {
        nodeMerge: className => `
            MERGE (n:${className} {_id: $properties._id}) 
            ON CREATE SET n = $properties 
            ON MATCH SET n += $properties
            `,

        relationMerge: type => `
            MATCH (sn {_id: $startNodeId}), (en {_id: $endNodeId})
            MERGE (sn)-[r1: ${type}]->(en)
            ON CREATE SET r1 = $properties
            ON MATCH SET r1 += $properties
            `
    };

    static getters = {
        company: {
            _id: (doc: ICompany) => doc._id,
            name: (doc: ICompany) => doc.name,
            type: (doc: ICompany) => doc.type,
            certificate: (doc: ICompany) => doc.certificate,
            country: (doc: ICompany) => doc?.country?.code
        },
        person: {
            _id: (doc: IPerson) => doc._id,
            name: (doc: IPerson) => doc.name,
            type: (doc: IPerson) => doc.type,
            date_of_birth: (doc: IPerson) => doc.date_of_birth,
            country_of_birth: (doc: IPerson) => doc.country_of_birth
        },
        order: {
            _id: (doc: IOrder) => doc._id,
            created_on: (doc: IOrder) => doc.created_on,
            client_reference: (doc: IOrder) => doc.client_reference
        },
        task: {
            _id: (doc: ITask) => doc._id,
            content: (doc: ITask) => doc.content,
            created_on: (doc: ITask) => doc.created_on
        }
    }


    static async syncChange({ change, type, dbName, document }: ApplyParams) {
        const { deleted, id } = change;
        let previousRevision: ApolloDocument;

        try {
            previousRevision = await NanoDB.getPreviousRevision(dbName, id);
        } catch (error) {
            console.warn(`Can't find previous revision for ${id}`);
        }

        if (deleted) {
            await this.deleteNode(id);
        } else {
            await this.mergeNode(previousRevision, document, type);
        }

    }

    static async populate(docs: ApolloDocument[]) {
        const qi = new QueryInfo();

        // const nodeQueryInfos = this.getNodesQueryInfo(docs);
        // const relationsQueryInfo = this.getNodesQueryInfo(document);

        syncLogger.logInfo({ message: 'Populating Neo4j...' });

        for (const doc of docs) {
            const { _id, class: cn, relations } = doc;

            if (!qi.node[cn]) {
                qi.addNodeQuery(
                    cn,
                    this.queries.nodeMerge(cn)
                );
            }

            qi.addNodeParams(cn, doc);

            for (const rel of relations) {
                const { type, node } = rel;

                if (!qi.relations[type]) {
                    qi.addRelationQuery(
                        type,
                        this.queries.relationMerge(type)
                    );
                }

                qi.addRelationParams(rel, doc);
            }
        }

        await this.executeAllQueryInfos(qi);
    }


    private static async mergeNode(previousRevision: ApolloDocument, document: ApolloDocument, type: string) {
        // Alter relations
        if (previousRevision) {
            const removedRelationsQueryInfo = Neo4jController.getRemovedRelationsQueryInfo(document, previousRevision);

            for (const { query, params } of removedRelationsQueryInfo) {
                try {
                    await Neo4jService.adapter.run(query, params[0]);
                } catch (error) {
                    syncLogger.logError({ message: error.message, data: error });
                }
            }
        }

        // Forming query data
        const queryInfos = this.getNodesQueryInfo(document);

        if (type === 'on-change') {
            await this.executeAllQueryInfos(queryInfos);
        } else {
            await this.executeAllQueryInfos(queryInfos);
        }
    }

    private static async deleteNode(id) {
        const { query } = Neo4jController.getDeleteNodeQueryInfo(id);

        try {
            await Neo4jService.adapter.run(query);
            syncLogger.logInfo({ message: `Node "${id}" was deleted.` });
        } catch (error) {
            syncLogger.logError({ message: error });
        }
    }

    static async purge() {
        syncLogger.logInfo({ message: 'Deleting all nodes and relations.' });

        try {
            await Neo4jService.runQuery('MATCH (n) DETACH DELETE n');
        } catch (error) {
            syncLogger.logError({ data: error });
        }
    }

    static getRemovedRelations(document: ApolloDocument, previousRevision: ApolloDocument): Relation[] {
        return previousRevision?.relations.filter(
            (pr) =>
                !document?.relations.some(
                    (dr) =>
                        isRelationDefined(pr) &&
                        isRelationDefined(dr) &&
                        dr.node._id === pr.node._id &&
                        dr.type === pr.type
                )
        ) || [];
    }

    static async createConstraints(setting: Model) {
        syncLogger.logInfo({ message: 'Creating unique constraints ...' });

        const constraints = Object.keys(setting.getters)
            .map(key => `CREATE CONSTRAINT ON (${key}:${key}) ASSERT ${key}._id IS UNIQUE`);
        // const query = constraints.join(' ');

        for (const query of constraints) {
            try {
                await Neo4jService.adapter.run(query);
            } catch (error) {
                syncLogger.logError({ message: error });
            }
        }


        syncLogger.logInfo({ message: 'Finished creating unique constraints.' });
    }

    static getNodesQueryInfo(document: ApolloDocument): QueryInfo {
        const queryInfo = new QueryInfo();

        if (!document.class) {
            throw new ApiError(ERRORS.SYNCHRONIZER.DOCUMENT_CORRUPTED);
        }

        if (isDocumentWithName(document)) {
            document.name = Strings.cleanName(document.name);
        }

        // Add query for specific class

        let documentQuery = `
        MERGE (n:${document.class} {_id: $properties._id}) 
        ON CREATE SET n = $properties 
        ON MATCH SET n += $properties
        `;

        queryInfo.addNodeQuery(document.class, documentQuery);
        queryInfo.addNodeParams(document.class, document);


        if (document.relations) {
            this.getRelationsQueryInfo(document, queryInfo);
        }

        return queryInfo;
    }


    private static getRelationsQueryInfo(document: ApolloDocument, queryInfos: QueryInfo) {
        const condition = relation =>
            !!relation &&
            relation?.node?._id &&
            relation?.node?.class;

        const relations = document.relations.filter(relation => condition(relation));

        for (const relation of relations) {

            if (isRelationDefined(relation)) {

                const {
                    node,
                    type,
                    ...properties
                } = relation;
                const flattenProperties = Objects.getFlat(properties);

                if (node.class) {   // TODO: merge into single condition
                    if (!queryInfos.node?.[node.class]) {
                        const nodeQuery = `
                            MERGE (n:${node.class} {_id: $properties._id})
                            ON CREATE SET n = $properties
                            ON MATCH SET n += $properties
                            `;

                        queryInfos.addNodeQuery(node.class, nodeQuery);
                    }

                    const nodeClass = node.class;

                    delete node.class;

                    queryInfos.addNodeParams(nodeClass, node);

                    const relationQuery = `
                            MATCH (sn {_id: $startNodeId}), (en {_id: $endNodeId}) 
                            MERGE (sn)-[r1: ${relation.type}]->(en)
                            ON CREATE SET r1 = $properties
                            ON MATCH SET r1 += $properties
                            `;

                    if (!queryInfos.relations?.[relation.type]) {
                        queryInfos.addRelationQuery(relation.type, relationQuery);
                    }

                    queryInfos.addRelationParams(relation, document);
                }
            }
        }
    }

    static getRemovedRelationsQueryInfo(document: ApolloDocument, previousRevision: ApolloDocument): QueryNode[] {
        const removedRelations = this.getRemovedRelations(document, previousRevision);


        return removedRelations.map((relation) => {
            if (!isRelationDefined(relation)) {
                return <QueryNode>{ query: '' };
            }


            const { node, type } = relation;

            // TODO: delete linked relations (has\is)
            const query = `
            MATCH ({_id: $leftNodeId})-[relation:${type}]-({_id: $rightNodeId})
            DELETE relation
            `;

            return {
                query,
                params: [
                    {
                        leftNodeId: document._id,
                        rightNodeId: node._id,
                        properties: []
                    }
                ]
            };
        });
    }

    static getDeleteNodeQueryInfo(id: string = '') {
        return { query: `MATCH (n {_id: "${id}"}) DETACH DELETE n;` };
    }

    static async executeQueryInfo(queryInfo: QueryNode | QueryRelation) {
        const query = this.batchifyQuery(queryInfo.query);

        await Neo4jService.runTransaction(query, { batch: queryInfo.params }).catch(error => {
            syncLogger.logInfo({ message: error });
        });
    }

    static batchifyQuery(query): string {
        return `${Neo4jController.baseQuery}
                ${query}`;
    }

    static async executeAllQueryInfos(queryInfos: QueryInfos) {
        const { node, relations } = queryInfos;
        const infos: (QueryNode | QueryRelation)[] = [...Object.values(node), ...Object.values(relations)];
        const queries: TransactionQuery[] = [];

        for (const queryInfo of infos) {
            // await this.executeQueryInfo(queryInfo);
            const {
                query,
                params
            } = queryInfo;
            //

            for (const param of params) {
                queries.push({ query, parameters: param });
            }
        }

        await Neo4jService.runAsyncSession(queries);
    }

}