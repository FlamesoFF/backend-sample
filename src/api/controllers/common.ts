import { DocumentDestroyResponse, DocumentInsertResponse, MangoQuery } from 'nano';
import { QueryResult } from 'pg';
import { IApolloDocument } from '../../@types/shared';
import { Requests, Responses } from '../@types/api/controllers.types';
import { CouchDbService } from '../../services/couchDb';
import { PostgreSqlService } from '../../services/postgreSql';
import { getFuzzySearchQuery } from '../shared/pgsql';
import { Utils } from '../shared/utils';
import { ApiError, ERRORS } from '../errors';
import { DEFAULT_LIST_LIMIT } from '../constants';


export const commonController = new class Controller {

    async fetch(request: Requests.Common.IGetSpecific, className?: string) {
        const { id } = request.params;

        const query: MangoQuery = {

            selector: {
                _id: { $eq: id }
            }
        };

        className ? query.selector.class = { $eq: className } : 0;

        const { docs: [result] = [] } = await CouchDbService.adapter.find(query);

        if (!result) {
            throw new ApiError(ERRORS.COUCH_DB.UNABLE_TO_FIND_DOCUMENT);
        } else {
            return result;
        }
    }

    async update<T extends IApolloDocument>(request: Requests.Common.IUpdate<T>): Promise<DocumentInsertResponse> {
        const {
            body: patch,
            params: { id }
        } = request;

        // Insert new document into CouchDB
        const document: T = await CouchDbService.adapter.get(id) as T;

        Object.assign(document, patch);

        if (document) {
            return await CouchDbService.adapter.insert(document);
        } else {
            throw new ApiError(ERRORS.COUCH_DB.UNABLE_TO_FIND_DOCUMENT);
        }
    }

    async remove(request: Requests.Common.IRemove, entityClass: string): Promise<DocumentDestroyResponse> {
        const { id } = request.params;
        const entity = await CouchDbService.adapter.get(id);

        if (entity._id && entityClass && entityClass === entity.class) {
            return await CouchDbService.adapter.destroy(id, entity._rev);
        } else {
            throw new ApiError(ERRORS.COUCH_DB.UNABLE_TO_FIND_DOCUMENT);
        }
    }

    async fuzzySearch(request: Requests.Common.ISearch, className?: string): Promise<Responses.Common.FuzzySearch> {
        const {
            name: searchString,
            type,
            limit = DEFAULT_LIST_LIMIT
        } = request.query;

        if (!searchString) {
            throw new ApiError(ERRORS.COMMON.MISSING_REQUIRED_PARAMETERS);
        }

        const query = getFuzzySearchQuery({
            // tableName: 'entities',
            searchString,
            className,
            types: type ? type.split(',') : [],
            limit: Number(limit),
            orderBy: 'similarity'
        });

        // Queuing the DB
        const response: QueryResult = await PostgreSqlService.adapter.query(query);

        return response.rows;
        // return Utils.PostgreSQL.resultsToList(response.rows);
    }


    async search(
        request: Requests.Common.ISearch,
        className: string,
        additionalProperties?: string[]
    ): Promise<Responses.Lists.Default> {
        let { limit = DEFAULT_LIST_LIMIT } = request.query;

        if (limit < 1) limit = 1;
        if (limit > 100) limit = 100;

        const query: MangoQuery = {
            selector: className ?
                {
                    class: { $eq: className }
                } :
                {
                    class: { $in: ['person', 'company'] }
                },
            limit: Number(limit)
        };

        const response = await CouchDbService.adapter.find(query);
        const docs = Utils.Nano.normalizeResponse(response);

        // return Utils.CouchDB.resultsToList(result.docs, 'name');
        return Utils.Nano.resultsToList(docs, additionalProperties);
    }
};