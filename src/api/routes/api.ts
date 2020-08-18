import express from 'express';
import companies from './private/companies';
import couriers from './private/couriers';
import orders from './private/orders';
import contacts from './private/contacts';
import relations from './private/relations';
import persons from './private/persons';
import entities from './private/entities';
import files from './private/files';
import tasks from '../modules/tasks/routes';


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