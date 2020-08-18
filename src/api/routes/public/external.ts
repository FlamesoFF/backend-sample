import { Router } from 'express';
import orders from './orders';
import contacts from './contacts';
import entities from './entities';

export default Router({ mergeParams: true })
    .use('/orders', orders)
    .use('/contacts', contacts)
    .use('/entities', entities);
