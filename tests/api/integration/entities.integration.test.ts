import { CouchDbService } from '../../../src/services/couchDb';
import { expect } from 'chai';
import { Entity } from '../../../src/@types/types';
import { ajv, getAddress, gotInstance } from './integration.test';


describe('/v3/entities', () => {

    it('GET /v3/entities/<id>', async () => {
        const { docs: [entity] } = await CouchDbService.adapter.find({
            selector: {
                $or: [
                    { class: { $eq: 'company' } },
                    { class: { $eq: 'person' } }
                ]
            }
        });


        let statusCode, body;

        try {
            ({ statusCode, body } = await gotInstance.get(`${getAddress()}/v3/entities/${entity._id}`, {
                responseType: 'json'
            })
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
        const { body: data1 } = await gotInstance.get<Entity[]>(`${getAddress()}/v3/entities`, {
            json: {
                params: {
                    type: 'agent, client',
                    name: 'ltd',
                    limit: 50
                }
            },
            responseType: 'json'
        });

        const { body: data2 } = await gotInstance.get<Entity[]>(`${getAddress()}/v3/entities`, {
            json: {
                params: {
                    name: 'ltd'
                }
            },
            responseType: 'json'
        });

        for (const doc of [...data1, ...data2]) {
            expect(['company', 'person']).to.contain(doc.class);

            const valid = ajv.validate('client_entity_v3#/definitions/list_item', doc);

            if (!valid) console.log(ajv.errors);

            expect(valid).to.be.true;
        }


    });

    it('GET /v3/entities/<entityId>/relations', async () => {
        const { docs: [entity] } = await CouchDbService.adapter.find({
            selector: {
                $or: [
                    {
                        class: { $eq: 'company' },
                        schema_id: { $eq: 'company_v3' }
                    },
                    {
                        class: { $eq: 'person' },
                        schema_id: { $eq: 'person_v3' }
                    }
                ]
            }
        });

        const { statusCode: status, body: data } = await gotInstance.get<Entity[]>(`${getAddress()}/v3/entities/${entity._id}/relations`, {
            json: {
                params: {
                    type: 'has_contact'
                }
            },
            responseType: 'json'
        }).catch(error => {
            throw new Error(error);
        });

        expect(status).to.be.equal(200);

        for (const rel of data) {
            const valid = ajv.validate('server_definitions_v3#/definitions/relation', rel);

            if (!valid) console.log(ajv.errors);

            expect(valid).to.be.true;
        }

    });

});
