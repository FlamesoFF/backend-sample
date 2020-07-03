import { ajv, gotInstance } from './integration.test';
import { expect } from 'chai';
import { PostgreSqlService } from '../../../src/services/postgreSql';
import { PgSqlOrderResponseItem } from '../../../src/api/controllers/order';
import moment from 'moment';
import { ORDER_DATE_PATTERN } from '../../../src/api/constants';


describe('PgSQL Orders', () => {
    let tempDocId: string;
    const url = 'https://localhost:3034';


    it('POST /v3/orders', async () => {
        const payload = {
            contact_email: 'test.contact@gmail.com',
            order_status: 'creating',
            compliance_status: 'new',
            accounts_status: 'new',
            client_status: 'new',
            date: '2020-02-03',
            tags: ['test', 'order', 'create', 'pgsql', 't1', 't1', ''],
            company_ids: ['id1'],
            quotes: ['quote1', 'quote2', 'quote1'],
            thread_ids: ['T123456789', 't1', 't1', 't2', 't3']
        };

        let valid = ajv.validate('external_client_order_v3#/definitions/create', payload);

        if (!valid) console.log(ajv.errors);
        expect(valid).to.be.true;


        const { statusCode, body: { id } } = await gotInstance.post(`${url}/v3/orders`, {
            responseType: 'json',
            json: payload
        });

        tempDocId = id;

        expect(statusCode).to.be.equal(201);

        const { rows: [order] = [] } = (await PostgreSqlService.adapter.query(
            `SELECT * FROM orders
            WHERE order_id = '${id}'`
        ) as { rows: PgSqlOrderResponseItem[] });

        expect(order).to.be.not.undefined;
        expect(order).to.be.an('object');
        expect(order.order_id).to.be.not.undefined;
    });

    it('GET /v3/orders/<id>', async () => {
        const { statusCode, body } = await gotInstance.get(`${url}/v3/orders/${tempDocId}`, {
            responseType: 'json'
        });

        expect(body).not.to.be.undefined;

        const valid = ajv.validate('external_client_order_v3#/definitions/list_item', body);

        if (!valid) console.log(ajv.errors);
        expect(valid).to.be.true;
    });

    it('GET /v3/orders', async () => {
        const { statusCode, body } = await gotInstance.get(`${url}/v3/orders`, {
            responseType: 'json'
        });

        expect(body).not.to.be.undefined;
        expect(body).to.have.length.above(0);

        expect(statusCode).to.be.equal(200);
    });


    it('PUT /v3/orders', async () => {
        const payload = {
            contact_email: 'test.contact@gmail.com',
            order_status: 'creating',
            compliance_status: 'new',
            accounts_status: 'new',
            client_status: 'new',
            date: '2020-02-03',
            tags: [
                'test',
                'order',
                'create',
                'pgsql'
            ],
            company_ids: ['test-company1'],
            quotes: ['quote1', 'quote2', 'quote3'],
            thread_ids: ['T123456789']
        };

        let valid = ajv.validate('external_client_order_v3#/definitions/update', payload);

        if (!valid) console.log(ajv.errors);
        expect(valid).to.be.true;

        const { statusCode, body } = await gotInstance.put(`${url}/v3/orders/${tempDocId}`, {
            responseType: 'json',
            json: payload
        });

        const { rows: [doc] = [] } = (await PostgreSqlService.adapter.query(
            `SELECT * FROM orders
            WHERE order_id = '${tempDocId}'`
        ));

        expect(doc.contact_id).to.be.equal(payload.contact_email);
        expect(doc.order_status).to.be.equal(payload.order_status);
        expect(doc.compliance_status).to.be.deep.equal(payload.compliance_status);
        expect(doc.accounts_status).to.be.equal(payload.accounts_status);
        expect(doc.client_status).to.be.equal(payload.client_status);
        expect(
            moment(doc.order_date).format(ORDER_DATE_PATTERN)
        ).to.be.equal(payload.date);
        expect(doc.tags).to.be.deep.equal(payload.tags);
        expect(doc.company_id).to.contain.all.members(payload.company_ids);
        expect(doc.company_id).to.have.length(payload.company_ids.length);
        expect(doc.data.quotes).to.contain.all.members(payload.quotes);
        expect(doc.data.quotes).to.have.length(payload.quotes.length);
    });

    it('PATCH /v3/orders/<id>/threads', async () => {
        const payload = {
            thread_ids: ['t1', 't2']
        };

        const { statusCode, body: { id } } = await gotInstance.patch(`${url}/v3/orders/${tempDocId}/threads`, {
            responseType: 'json',
            json: payload
        });

        expect(id).to.be.equal(tempDocId);

        let { rows: [link] } = await PostgreSqlService.adapter.query(
            `SELECT * FROM threads
            WHERE order_id = '${tempDocId}'
            AND thread_id = '${payload.thread_ids[0]}';`
        );

        expect(link).to.be.not.undefined;
        expect(link.thread_id).to.be.equal(payload.thread_ids[0]);

        ({ rows: [link] } = await PostgreSqlService.adapter.query(
            `SELECT * FROM threads
            WHERE order_id = '${tempDocId}'
            AND thread_id = '${payload.thread_ids[1]}';`
        ));

        expect(link).to.be.not.undefined;
        expect(link.thread_id).to.be.equal(payload.thread_ids[1]);

    });

    after(async () => {

        await PostgreSqlService.adapter.query(
            `DELETE FROM threads
            WHERE order_id = '${tempDocId}';`
        );

        await PostgreSqlService.adapter.query(
            `DELETE FROM orders
            WHERE order_id = '${tempDocId}';`
        );

    });

});