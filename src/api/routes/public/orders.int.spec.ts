import { ajv, getApiAddress } from '../../../../tests/shared';
import { CONFIG } from '../../../shared/config';
import { PostgreSqlService } from '../../../services/postgreSql';
import { PgSqlOrderResponseItem } from '../../controllers/order';
import { ORDER_DATE_PATTERN } from '../../constants';
import { Requests } from '../../@types/api/controllers.types';
import { gotInstance } from '../api.int.spec';
import moment from 'moment';
import { expect } from 'chai';


let tempDocId: string;
const url = getApiAddress(CONFIG.API.ports.public);


describe('PgSQL Orders', () => {

    it('POST /v3/orders (minimal)', async () => {
        let  statusCode,id;

        try {
            ({ statusCode, body: { id } } = await gotInstance.post(`${ url }/v3/orders`, {
                responseType: 'json'
            }));
        }
        catch ( e ) {
            console.error(e);
        }
        //
        // tempDocId = id;
        //
        // expect(statusCode).to.be.equal(201);
        //
        // const { rows: [order] = [] } = (await PostgreSqlService.adapter.query(
        //     `SELECT * FROM orders
        //     WHERE order_id = '${ id }'`
        // ) as { rows: PgSqlOrderResponseItem[] });
        //
        // expect(order).to.be.not.undefined;
        // expect(order).to.be.an('object');
        // expect(order.order_id).to.be.not.undefined;
        //
        // // assert payload
        // expect(order.order_status).to.be.equal('creating');
        // expect(order.compliance_status).to.be.deep.equal('new');
        // expect(order.accounts_status).to.be.equal('new');
        // expect(order.client_status).to.be.equal('new');
    });

    it('POST /v3/orders (complete)', async () => {
        const payload: Requests.Orders.IPgSqlBasicPayload = {
            contact_email: 'test.contact@gmail.com',
            order_status: 'creating',
            compliance_status: 'new',
            accounts_status: 'new',
            client_status: 'new',
            date: '2020-02-03',
            tags: ['test', 'order', 'create', 'pgsql', 't1', 't1', ''],
            company_id: 'id1',
            quotes: ['quote1', 'quote2', 'quote1'],
            thread_ids: ['T123456789', 't1', 't1', 't2', 't3'],
            companies: ['company'],
            client_reference: 'client_reference',
            client_id: 'client_id',
            comments: ['some', 'comments', 'here']
        };

        const valid = ajv.validate('external_client_order_v3#/definitions/create', payload);

        if ( !valid ) console.log(ajv.errors);
        expect(valid).to.be.true;


        const { statusCode, body: { id } } = await gotInstance.post(`${ url }/v3/orders`, {
            responseType: 'json',
            json: payload
        });

        tempDocId = id;

        expect(statusCode).to.be.equal(201);

        const { rows: [order] = [] } = (await PostgreSqlService.adapter.query(
            `SELECT * FROM orders
            WHERE order_id = '${ id }'`
        ) as { rows: PgSqlOrderResponseItem[] });

        expect(order).to.be.not.undefined;
        expect(order).to.be.an('object');
        expect(order.order_id).to.be.not.undefined;

        // assert payload
        expect(order.order_status).to.be.equal(payload.order_status);
        expect(order.compliance_status).to.be.deep.equal(payload.compliance_status);
        expect(order.accounts_status).to.be.equal(payload.accounts_status);
        expect(order.client_status).to.be.equal(payload.client_status);
        expect(
            moment(order.order_date).format(ORDER_DATE_PATTERN)
        ).to.be.equal(payload.date);
        expect(order.tags).to.be.deep.equal(['test', 'order', 'create', 'pgsql', 't1']);
        expect(order.company_id).to.be.equal(payload.company_id);
        expect(order.data.quotes).to.contain.all.members(payload.quotes);
        expect(order.data.comments).to.contain.all.members(payload.comments);
        expect(order.client_id).to.be.equal(payload.client_id);
        expect(order.client_reference).to.be.equal(payload.client_reference);
        expect(order.data.companies).to.contain.all.members(payload.companies);
        expect(order.contact_email).to.be.equal(payload.contact_email);
    });

    it('GET /v3/orders/<id>', async () => {
        const { statusCode, body: { data, ok } } = await gotInstance.get(`${ url }/v3/orders/${ tempDocId }`, {
            responseType: 'json'
        });

        expect(data).not.to.be.undefined;

        const valid = ajv.validate('external_client_order_v3#/definitions/item', data);

        if ( !valid ) console.log(ajv.errors);
        expect(valid).to.be.true;
    });

    it('GET /v3/orders', async () => {
        const { statusCode, body: { ok, data } } = await gotInstance.get(`${ url }/v3/orders`, {
            responseType: 'json'
        });

        expect(ok).to.be.true;
        expect(data).not.to.be.undefined;
        expect(data).to.have.length.above(0);

        for ( const order of data ) {
            const valid = ajv.validate('external_client_order_v3#/definitions/item', order);

            if ( !valid ) console.error(ajv.errors);

            expect(valid).to.be.true;
        }

        expect(statusCode).to.be.equal(200);
    });


    it('PUT /v3/orders', async () => {
        const payload: Requests.Orders.IPgSqlBasicPayload = {
            order_status: 'creating',
            compliance_status: 'new',
            accounts_status: 'new',
            client_status: 'new',
            date: '2010-12-12',
            tags: [
                'tag_1_UPDATED',
                'tag_2_UPDATED'
            ],
            company_id: 'company_id_UPDATED',
            quotes: ['quote_UPDATED'],
            comments: ['comment_UPDATED'],
            thread_ids: ['T123456789'],
            client_id: 'client_id_UPDATED',
            client_reference: 'client_reference_UPDATED',
            companies: ['company_UPDATED'],
            contact_email: 'contact.email@updated.com'
        };

        const valid = ajv.validate('external_client_order_v3#/definitions/update', payload);

        if ( !valid ) console.log(ajv.errors);
        expect(valid).to.be.true;

        const { statusCode, body } = await gotInstance.put(`${ url }/v3/orders/${ tempDocId }`, {
            responseType: 'json',
            json: payload
        });

        const { rows: [doc] = [] } = (await PostgreSqlService.adapter.query(
            `SELECT * FROM orders
            WHERE order_id = '${ tempDocId }'`
        ));

        expect(doc.order_status).to.be.equal(payload.order_status);
        expect(doc.compliance_status).to.be.deep.equal(payload.compliance_status);
        expect(doc.accounts_status).to.be.equal(payload.accounts_status);
        expect(doc.client_status).to.be.equal(payload.client_status);
        expect(
            moment(doc.order_date).format(ORDER_DATE_PATTERN)
        ).to.be.equal(payload.date);
        expect(doc.tags).to.be.deep.equal(payload.tags);
        expect(doc.company_id).to.be.equal(payload.company_id);
        expect(doc.data.quotes).to.contain.all.members(payload.quotes);
        expect(doc.data.comments).to.contain.all.members(payload.quotes);
        expect(doc.client_id).to.be.equal(payload.client_id);
        expect(doc.client_reference).to.be.equal(payload.client_reference);
        expect(doc.data.companies).to.contain.all.members(payload.companies);
        expect(doc.contact_email).to.be.equal(payload.contact_email);
    });

    it('PATCH /v3/orders/<id>/threads', async () => {
        const payload = {
            thread_ids: ['t1', 't2']
        };

        const { statusCode, body: { id } } = await gotInstance.patch(`${ url }/v3/orders/${ tempDocId }/threads`, {
            responseType: 'json',
            json: payload
        });

        expect(id).to.be.equal(tempDocId);

        let { rows: [link] } = await PostgreSqlService.adapter.query(
            `SELECT * FROM threads
            WHERE order_id = '${ tempDocId }'
            AND thread_id = '${ payload.thread_ids[0] }';`
        );

        expect(link).to.be.not.undefined;
        expect(link.thread_id).to.be.equal(payload.thread_ids[0]);

        ({ rows: [link] } = await PostgreSqlService.adapter.query(
            `SELECT * FROM threads
            WHERE order_id = '${ tempDocId }'
            AND thread_id = '${ payload.thread_ids[1] }';`
        ));

        expect(link).to.be.not.undefined;
        expect(link.thread_id).to.be.equal(payload.thread_ids[1]);

    });

    after(async () => {

        await PostgreSqlService.adapter.query(
            `DELETE FROM threads
            WHERE order_id = '${ tempDocId }';`
        );

        await PostgreSqlService.adapter.query(
            `DELETE FROM orders
            WHERE order_id = '${ tempDocId }';`
        );

    });

});