import { ajv, defaultPostfix, getApiAddress } from '../../../../tests/shared';
import { CONFIG } from '../../../shared/config';
import { gotInstance } from '../../routes/api.int.spec';
import { expect } from 'chai';
import { CouchDbService } from '../../../services/couchDb';
import { TaskDirector } from './model';
import { Task } from './types';
import exp from 'constants';


describe('Tasks', () => {
    const url = getApiAddress(CONFIG.API.ports.private);
    const docName = `task-${defaultPostfix}`;
    let tempDoc: Task;

    it('List tasks', async () => {
        const gqlQuery = JSON.stringify(`
            {
                list (limit: 1, group : "from_me") {
                    type
                    description
                    completed_on
                    comments {
                        text
                    }
                }
            }
        `);

        const { body } = await gotInstance.post(`${ url }/v3/tasks`, {
            body: gqlQuery,
            responseType: 'json'
        });

        expect(body).to.be.deep.equal({
            'data': {
                'list': [
                    {
                        'type': [
                            'task'
                        ],
                        'description': 'New task!123',
                        'completed_on': '2020-08-18 13:58:57',
                        'comments': [
                            {
                                'text': 'everything is working'
                            }
                        ]
                    }
                ]
            }
        });
    });


    it('Create new task', async () => {
        tempDoc = TaskDirector.buildNewTask({
            description: 'integration test task'
        });

        tempDoc._id = docName;

        const { statusCode } = await gotInstance.post(`${ url }/v3/tasks`, {
            json: tempDoc,
            responseType: 'json'
        });

        expect(statusCode).to.be.equal(200);

        const taskFromDb = await CouchDbService.adapter.get(docName);

        const valid = ajv.validate('task_v3', taskFromDb);

        if ( !valid ) console.log(ajv.errors);

        expect(valid).to.be.true;
    });

});
