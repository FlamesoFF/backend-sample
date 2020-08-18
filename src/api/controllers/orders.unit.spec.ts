import { expect } from 'chai';
import { PgSqlOrderResponseItem } from './order';
import { OrdersUtils } from '../utils/orders';
import { orderGenerator } from '../../../utils/dummy-data/order';
import { ajv } from "../../../tests/shared";

describe('Orders', () => {

    it('Create New', () => {
        const orders = [...orderGenerator(10)];

        orders.forEach(item => {

            const valid = ajv.validate('order_v3', item);

            if(!valid) console.log(ajv.errors);

            expect(valid).to.be.true;

        });
    });


    it('OrdersUtils.formatOrder', () => {
        const order: PgSqlOrderResponseItem = {
            order_id: 'ORD-000602TT',
            'manager_id': 'tester',
            'contact_id': 'qqq@mail.com',
            'order_status': 'creating',
            'compliance_status': 'new',
            'accounts_status': 'new',
            'client_status': 'new',
            'order_date': '2020-07-15',
            'tags': [],
            'stamp': '2020-07-15T17:31:14.016Z',
            data: {
                quotes: ['quote1', 'quote2'],
                companies: ['company1', 'company2']
            }
        };

        const result = OrdersUtils.formatOrder(order);

        expect(result).to.have.property('quotes');
        expect(result).to.have.property('companies');
        expect(result).not.to.have.property('data');

        expect(result.quotes).to.have.length(2);
        expect(result.companies).to.have.length(2);
    });

});
