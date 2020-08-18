import { Requests } from '../@types/api/controllers.types';
import { IPerson } from '../../@types/data/person';
import { PersonModel } from '../models/person';
import { CouchDbService } from '../../services/couchDb';
import { Utils } from '../shared/utils';
import { commonController } from './common';
import { MwAuth } from '../middlewares/auth';


export const personsController = new class Controller {

    async create(request: Requests.Persons.ICreate) {

        const person = PersonModel.create(request.body);

        return await CouchDbService.adapter.insert(person);

    }

    async update(request: Requests.Persons.IUpdate) {
        const {
            body: details,
            params: { id }
        } = request;
        const { user } = MwAuth;

        try {
            const person = await CouchDbService.adapter.get(id) as IPerson;

            return await CouchDbService.adapter.insert(Object.assign(person, details));
        } catch (error) {
            throw error;
        }
    }

    /**@description Search for company by its name */
    async search(request: Requests.Common.ISearch) {
        const { name, type } = request.query;

        if (!name && !type) {
            const response = await commonController.fuzzySearch(request, 'person');

            return Utils.PostgreSQL.resultsToList(response);
        } else {
            return await commonController.search(request, 'person', ['name']);
        }

    }

    /*
     * async list(request: Requests.Common.ISearch): Promise<Responses.Lists.Default[]> {
     *     // return Utils.CouchDB.resultsToList(response, 'name');
     *     return response;
     * }
     */

};