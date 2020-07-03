import { MangoQuery } from 'nano';
import { CouchDbService } from '../../services/couchDb';
import { CourierModel } from '../models/courier';
import { Requests, Responses } from '../@types/api/controllers.types';
import { Utils } from '../shared/utils';
import { RelationModel } from '../models/shared/relation';
import { DEFAULT_LIST_LIMIT } from '../constants';
import { commonController } from './common';
import { ICourier } from '../../@types/data/courier';
import { MwAuth } from '../middlewares/auth';
import { RelationList, TRelation } from '../../@types/types';


export const couriersController = new class Controller {

    /**
     *@description List first 1-100 couriers
     * @deprecated
     */
    async list(request: Requests.Common.ISearch): Promise<Responses.Lists.Default> {
        const response = await commonController.search(request, 'courier', ['name']);
        // return Utils.CouchDB.resultsToList(response, 'name');

        return response;
    }

    /**@description Search for courier by its name */
    async search(request: Requests.Common.ISearch): Promise<Responses.Lists.Default> {
        const { name, limit = DEFAULT_LIST_LIMIT } = request.query;

        const mangoQuery: MangoQuery = {
            selector: {
                class: {
                    $eq: 'courier'
                },
                name: {
                    $regex: Utils.stringToMangoQueryRegex(name, ['i'])
                }
            },
            fields: [
                '_id',
                'class',
                'name'
            ],
            limit: Number(limit)
        };

        const response = Utils.Nano.normalizeResponse(
            await CouchDbService.adapter.find(mangoQuery)
        );

        return Utils.Nano.resultsToList(response, ['name']);
    }

    // TODO: Schema validation
    async create(request: Requests.Couriers.ICreate) {
        const {
            clientId,
            contactId,
            receiverId,
            senderId
        } = request.body;

        const { _id: userId } = MwAuth.user;

        const relationMap: [TRelation, string][] = [
            ['ordered_by', clientId],
            ['has_contact', contactId],
            ['managed_by', userId],
            ['has_sender', senderId],
            ['has_receiver', receiverId]
        ];

        const relations: RelationList = [];


        for (const [type, id] of relationMap)
        {if (id) {
            const relation = await RelationModel.createFromDocument(type, id);

            if (relation) relations.push(relation);
        }}



        // Creating new Courier object
        const courier = new CourierModel({
            relations,
            ...request.body
        });

        // Insert new document into CouchDB
        return await CouchDbService.adapter.insert(courier);
    }

    // TODO: Schema validation
    async update(request: Requests.Couriers.IUpdate) {
        const {
            body: patch,
            params: { id }
        } = request;

        // Insert new document into CouchDB
        const courier: ICourier = await CouchDbService.adapter.get(id) as ICourier;

        Object.assign(courier, patch);

        if (courier)
        {return await CouchDbService.adapter.insert(courier);}
        else
        {throw { statusCode: 404 };}
    }

};