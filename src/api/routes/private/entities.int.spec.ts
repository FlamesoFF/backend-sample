import { CouchDbService } from '../../../services/couchDb';
import { expect } from 'chai';
import { Entity } from '../../../@types/types';
import { ajv, defaultPostfix, getApiAddress } from '../../../../tests/shared';
import { CONFIG } from '../../../shared/config';
import { ICompany } from '../../../@types/data/company';
import { RelationModel } from '../../models/shared/relation';
import { IPerson } from '../../../@types/data/person';
import { gotInstance } from '../api.int.spec';


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


    it('GET /v3/entities/<id>', async () => {
        let statusCode, body;

        try {
            (
                { statusCode, body } = await gotInstance.get(
                    `${url}/v3/entities/company-${defaultPostfix}`,
                    {
                        responseType: 'json'
                    }
                )
            );
        } catch (error) {
            console.error(error.message);
        }

        expect(statusCode).to.be.equal(200);

        const valid = ajv.validate('entity_v3', body);

        if (!valid) console.log(ajv.errors);

        expect(valid).to.be.true;
    });


    it('GET /v3/entities', async () => {
        const { body: data1 } = await gotInstance.get<Entity[]>(`${url}/v3/entities`, {
            searchParams: {
                type: 'agent, client',
                name: 'ltd',
                limit: 50
            },
            responseType: 'json'
        });

        const { body: data2 } = await gotInstance.get<Entity[]>(`${url}/v3/entities`, {
            searchParams: { name: 'ltd' },
            responseType: 'json'
        });

        for (const doc of [...data1, ...data2]) {
            expect(['company', 'person']).to.contain(doc.class);

            const valid = ajv.validate('client_entity_v3#/definitions/list_item', doc);

            if (!valid) console.log(ajv.errors);

            expect(valid).to.be.true;
        }


    });

    // it('GET /v3/entities/<entityId>/relations', async () => {
    //     const entity = await CouchDbService.adapter.get(`company-${defaultPostfix}`) as ICompany;
    //
    //     try {
    //         const { statusCode: status, body: data } = await gotInstance.get<Entity[]>(`${url}/v3/entities/${entity._id}/relations`, {
    //             searchParams: {
    //                 type: 'has_contact'
    //             },
    //             responseType: 'json'
    //         });
    //
    //         expect(status).to.be.equal(200);
    //         expect(data).length.to.be.above(0);
    //
    //         for (const rel of data) {
    //             const valid = ajv.validate('server_definitions_v3#/definitions/relation', rel);
    //
    //             if (!valid) console.log(ajv.errors);
    //
    //             expect(valid).to.be.true;
    //         }
    //     } catch (error) {
    //         console.error(error.message);
    //     }
    // });

});
