import moment from 'moment';
import { ORDER_DATE_PATTERN } from '../constants';
import { PgSqlOrderResponseItem } from '../controllers/order';

export class OrdersUtils {

    static formatOrderList(rows: PgSqlOrderResponseItem[]) {
        return rows.map(row => {
            return this.formatOrder(row);
        });
    }

    static formatOrder(orderItem: PgSqlOrderResponseItem) {
        if(orderItem.data) {
            // flatten data objects
            for(const [key, value] of Object.entries(orderItem.data)) {
                orderItem[key] = value;
            }
        }

        delete orderItem.data;

        // Format date
        orderItem.order_date = moment(orderItem?.order_date ?? new Date()).format(ORDER_DATE_PATTERN);

        return orderItem;
    }
}