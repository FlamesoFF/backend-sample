import { orderGenerator } from '../../../utils/dummy-data/order';
import { expect } from 'chai';
import { ajv } from './unit.test';

describe('Orders', () => {

    // TODO: Fix unit test
    it('Create New', () => {
        const orders = [...orderGenerator(10)];

        orders.forEach(item => {

            const valid = ajv.validate('order_v3', item);

            if (!valid) console.log(ajv.errors);

            expect(valid).to.be.true;

        });
    });


    // TODO: Fix unit test
    it('payload', () => {
        const payload = {
            'manager_id': 'test-manager',
            'client_id': 'test-client',
            client_reference: 'reference',
            'thread_id': 'T123456789',
            date: '2020-02-25',
            'tags': 'test, order, validation',
            'contact_email': 'test.contact@gmail.com',
            'companies': [
                'test-company'
            ]
        };

        const valid = ajv.validate('client_order_v3#/definitions/create', payload);

        if (!valid) console.log(ajv.errors);

        expect(valid).to.be.true;

    });

});
