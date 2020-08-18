import { CouchDbService } from '../services/couchDb';
import { expect } from 'chai';
import { Entity } from '../@types/types';
import { ajv, defaultPostfix, getApiAddress } from '../../tests/shared';
import { CONFIG } from '../shared/config';
import { ICompany } from '../@types/data/company';
import { RelationModel } from '../api/models/shared/relation';
import { IPerson } from '../@types/data/person';
import { gotInstance } from "../api/routes/api.int.spec";


describe('/v3/entities', () => {
    const url = getApiAddress(CONFIG.API.ports.private);

    before(async () => {
        const company = await CouchDbService.adapter.get(`company-${defaultPostfix}`) as ICompany;
        const { _id, class: personClass, name, email } = await CouchDbService.adapter.get(`person-${defaultPostfix}`) as IPerson;

        company.relations.push(new RelationModel({
            type: 'has_contact',
            node: {
                _id,
                class: personClass,
                name
            },
            properties: {
                email
            }
        }));

        // Update this company
        try {
            await CouchDbService.adapter.insert(company, { rev: company._rev });
        } catch (e) {
            console.error(e);
        }
    });

    it('GET /v3/entities/<entityId>/relations', async () => {
        const entity = await CouchDbService.adapter.get(`company-${defaultPostfix}`) as ICompany;

        try {
            const { statusCode: status, body: data } = await gotInstance.get<Entity[]>(`${url}/v3/entities/${entity._id}/relations`, {
                searchParams: {
                    type: 'has_contact'
                },
                responseType: 'json'
            });

            expect(status).to.be.equal(200);
            expect(data).length.to.be.above(0);

            for (const rel of data) {
                const valid = ajv.validate('server_definitions_v3#/definitions/relation', rel);

                if (!valid) console.log(ajv.errors);

                expect(valid).to.be.true;
            }
        } catch (error) {
            console.error(error.message);
        }
    });

});