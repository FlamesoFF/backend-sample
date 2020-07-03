import { CouchDbService } from '../../services/couchDb';
import { Neo4jService } from '../../services/neo4j';
import { Requests } from '../@types/api/controllers.types';
import { commonController } from './common';
import { Utils } from '../shared/utils';
import { MangoQuery } from 'nano';
import { ApiError, ERRORS } from '../errors';

interface EntityParameters {
    limit: number
    name: string
    class: string
    type: string
}


export const entitiesController = new class Controller {

    async get(request: Requests.Common.IGetSpecific) {
        const { id } = request.params;

        const query: MangoQuery = {
            selector: {
                _id: { $eq: id },
                $or: [
                    {
                        class: { $eq: 'company' }
                    },
                    {
                        class: { $eq: 'person' }
                    }
                ]
            }
        };

        const {
            docs: [result] = []
        } = await CouchDbService.adapter.find(query)
            .catch(error => {
                throw new Error(error);
            });

        if (!result) {
            throw new ApiError(ERRORS.COUCH_DB.UNABLE_TO_FIND_DOCUMENT);
        } else {
            return result;
        }
    }


    async search(request: Requests.Entities.Search) {
        const {
            class: className
        } = request.query;

        const response = await commonController.fuzzySearch(request, className);

        return Utils.PostgreSQL.fuzzySearchResultsToEntityList(response);
    }


    /**@description List first 1-100 entities */
    /*
     * async list(request: Requests.Common.IGetList): Promise<Responses.Lists.Default[]> {
     *     const response = await commonController.list(request, null, ['name']);
     *     // return Utils.CouchDB.resultsToList(response, 'name');
     *     return response;
     * }
     */


    /*
     * async getShares(entityId, params) {
     *     try {
     *         const {
     *             relatedTo
     *         } = params;
     */

    /*
     *         let result = {
     *             type: 'ordinary',
     *             total: 0
     *         };
     */

    /*
     *         if (relatedTo) {
     *             const response = await couchDbAdapter.view(designShares, viewShares, {
     *                 start_key: [entityId, relatedTo],
     *                 end_key: [entityId, relatedTo, 'Z'],
     *                 reduce: true,
     *                 group: true,
     *                 group_level: 2
     *             });
     */

    /*
     *             if (response.rows && response.rows.length) {
     *                 result.total = response.rows[0].value;
     *             }
     */

    /*
     *             return result;
     *         } else {
     *             throw new Error('relatedId parameter is required');
     *         }
     *     } catch (error) {
     *         throw error;
     *     }
     * };
     */

    async getRelations(request: Requests.Entities.IGet) {
        const { id } = request.params;
        const { type } = request.query;

        try {
            const filter = type ? `{type: "${type}"}` : '';
            const query = `MATCH ({ _id: "${id}" })-[r ${filter}]-(n) RETURN r, n, (startNode(r) = n) as isStartNode`;
            const result = await Neo4jService.adapter.run(query);


            return result.records.map(record => {
                const relation = {
                    node: record.get('n').getters,
                    ...record.get('r').getters
                };

                if (record.get('isStartNode') && relation.type.startsWith('has_')) {
                    relation.type = relation.type.replace(/^has_/, 'is_');
                }


                return relation;
            });
        } catch (error) {
            throw error;
        }
    }
};