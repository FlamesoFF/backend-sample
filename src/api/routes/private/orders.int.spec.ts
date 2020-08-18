import { CONFIG } from '../../../shared/config';
import { ajv, defaultPostfix, getApiAddress } from '../../../../tests/shared';
import { gotInstance } from '../api.int.spec';
import { expect } from 'chai';
import { CouchDbService } from '../../../services/couchDb';
import { Utils } from '../../shared/utils';


describe('/v3/orders', () => {
    let orderId: string;
    const url = getApiAddress(CONFIG.API.ports.private);
    const managerId = `person-${defaultPostfix}`;
    const clientId = `company-${defaultPostfix}`;

    it('POST /v3/orders', async () => {
        const payload = {
            'manager_id': managerId,
            'client_id': clientId,
            client_reference: 'AA-123456789',
            'thread_id': 'FMfcgxwHMPnfrvRNrQXgQBLSKwRcdwJL',
            date: '2020-01-11',
            tags: 'ABC, CBA, BCA',
            'contact_email': 'j.doe@gmail.com',
            companies: [
                'company1',
                'company2'
            ]
        };

        let valid = ajv.validate('client_order_v3#/definitions/create', payload);

        if ( !valid ) console.log(ajv.errors);
        expect(valid).to.be.true;

        const {
            statusCode,
            body: { id }
        } = await gotInstance.post(`${ url }/v3/orders`, {
            json: payload,
            responseType: 'json'
        });

        orderId = id;

        expect(statusCode).to.be.equal(201);

        const order = await CouchDbService.adapter.get(id);

        valid = ajv.validate('order_v3', order);
        if ( !valid ) console.log(ajv.errors);
        expect(valid).to.be.true;

        expect(statusCode).to.be.equal(201);


    });

    it('GET /v3/orders', async () => {
        const { statusCode, body } = await gotInstance.get(`${ url }/v3/orders`, {
            responseType: 'json'
        });

        expect(statusCode).to.be.equal(200);

        const valid = ajv.validate('client_order_v3#/definitions/list', body);

        if ( !valid ) console.log(ajv.errors);

        expect(valid).to.be.true;
    });

    it('GET /v3/orders?manager_id=<managerId>', async () => {
        const { statusCode, body } = await gotInstance.get<any[]>(`${ url }/v3/orders?manager_id=${ managerId }`, {
            responseType: 'json'
        });

        expect(statusCode).to.be.equal(200);

        const keys = body.map(item => item._id);
        const orders = Utils.Nano.normalizeResponse(await CouchDbService.adapter.fetch({ keys }));


        orders.forEach(doc => {
            const map = doc.relations
                .filter(r => r.type === 'managed_by')
                .map(r => r.node['_id']);

            expect(map[0]).to.be.equal(managerId);

            // expect(managed_by).toBeTruthy();
        });


        const valid = ajv.validate('client_order_v3#/definitions/list', body);

        if ( !valid ) console.log(ajv.errors);

        expect(valid).to.be.true;
    });

    it('GET /v3/orders/<id>', async () => {
        const { statusCode, body } = await gotInstance.get(`${ url }/v3/orders/${ orderId }`, {
            responseType: 'json'
        });

        expect(statusCode).to.be.equal(200);

        const valid = ajv.validate('order_v3', body);

        expect(valid).to.be.true;

        if ( !valid ) console.log(ajv.errors);


    });

    it('DELETE /v3/orders/<id>', async () => {
        const { statusCode } = await gotInstance.delete(`${ url }/v3/orders/${ orderId }`, {
            responseType: 'json'
        });

        expect(statusCode).to.be.equal(204);

        try {
            await gotInstance.get(`${ url }/v3/orders/${ orderId }`);
        } catch ( error ) {
            expect(error.response.statusCode).to.be.equal(404);
        }
    });
});