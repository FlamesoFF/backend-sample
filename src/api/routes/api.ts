import express from 'express';
import companies from './companies';
import couriers from './couriers';
import orders from './orders';
import contacts from './contacts';
import relations from './relations';
import persons from './persons';
import entities from './entities';
import files from './files';
import tasks from './tasks';


export default express.Router({ mergeParams: true })
    .use('/:class/:id/relations', relations)
    .use('/contacts', contacts)
    .use('/companies', companies)
    .use('/couriers', couriers)
    .use('/entities', entities)
    .use('/files', files)
    .use('/orders', orders)
    .use('/persons', persons)
    .use('/tasks', tasks);