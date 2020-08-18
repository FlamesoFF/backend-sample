import { MangoQuery } from 'nano';
import { CouchDbService } from '../../../services/couchDb';
import { Requests } from '../../@types/api/controllers.types';
import { Utils } from '../../shared/utils';
import { Query } from '../../shared/mango';
import { DEFAULT_LIST_LIMIT } from '../../constants';
import { Task, TaskListItem, TaskPayload } from './types';
import { MwAuth } from '../../middlewares/auth';
import { TaskDirector } from './model';
import NanoResponsesWithDocs = Utils.Nano.NanoResponsesWithDocs;


export const tasksController = new class {

    async create( { body }: Requests.Tasks.ICreate ) {
        const task = TaskDirector.buildNewTask(body);

        return await CouchDbService.adapter.insert(task);
    }

    // async update( request: Requests.Tasks.IUpdate ) {
    //     const { id } = request.params;
    //
    //     if ( !id ) throw new ApiError(ERRORS.COMMON.MISSING_REQUIRED_PARAMETERS);
    //
    //     const document = await CouchDbService.adapter.get(id);
    //
    //     if ( !document ) throw new ApiError(ERRORS.COUCH_DB.UNABLE_TO_FIND_DOCUMENT);
    //
    //     const {
    //         description,
    //         type
    //     } = request.body;
    //
    //     Object.assign(document, {
    //         description: description,
    //         type
    //     });
    //
    //     return await CouchDbService.adapter.insert(document);
    // }

    async list( { limit = 20, group }: Requests.Tasks.ISearch ): Promise<TaskListItem[]> {
        const { _id: userId } = MwAuth.user;
        let sorted: TaskPayload[];


        if ( group === undefined ) throw new Error('Parameter "group" is required');


        let queryGroup;

        switch ( group ) {
            case 'to_me':
                queryGroup = Query.Tasks.groups.toMe(userId);
                break;
            case 'from_me':
                queryGroup = Query.Tasks.groups.fromMe(userId);
                break;
            case 'completed':
                queryGroup = Query.Tasks.groups.completed(userId);
                break;
        }

        const query: MangoQuery = {
            selector: {
                class: { $eq: 'task' },
                type: {
                    $elemMatch: { $eq: 'task' },
                    $not: {
                        $elemMatch: { $eq: 'break' }
                    }
                },
                ...queryGroup
            }
        };


        const response = await CouchDbService.adapter.find(query);
        const docs = Utils.Nano.normalizeResponse(response);

        /*
         * docs = docs.map((item: ITask) => {
         *     return Utils.Relations.flattenRelations(item, relationsFilter);
         * });
         */

        if ( group ) {
            sorted = Utils.Tasks.Sort.byDate(<Task[]>docs, 'desc');
        } else {
            sorted = Utils.Tasks.Sort.byDate(<Task[]>docs, 'asc');
        }


        const from = sorted.length > Math.abs(Number(limit)) ? sorted.length - Math.abs(Number(limit)) : 0;
        const to = sorted.length;
        const sliced = sorted.slice(from, to);

        // Format relations
        const list = Utils.Nano.resultsToTasksList(<Task[]>sliced);

        // const result = Utils.Tasks.convertToList(sorted);

        return list;
        // return Utils.Nano.normalizeResponse(sorted);
    }

    async search({
        description,
        group,
        limit = DEFAULT_LIST_LIMIT
    }: Requests.Tasks.ISearch ): Promise<TaskListItem[]> {

        const mangoQuery: MangoQuery = {
            selector: {
                class: {
                    $eq: 'task'
                },
                content: {
                    $regex: Utils.stringToMangoQueryRegex(description, ['i'])
                }
            },
            limit: Number(limit)
        };

        const response: NanoResponsesWithDocs<Task> = await CouchDbService.adapter.find(mangoQuery);
        let docs = Utils.Nano.normalizeResponse(response);

        docs = Utils.Tasks.Sort.byDate(<Task[]>docs, 'asc');

        return Utils.Nano.resultsToTasksList(<Task[]>docs);
    }

    // async complete( request: Requests.Tasks.IComplete ) {
    //     const { user } = MwAuth;
    //     const {
    //         params: { id },
    //         body: { datetime }
    //     } = request;
    //     const localTime = Utils.Tasks.Time.toLocalTime(datetime);
    //     let document = await CouchDbService.adapter.get(id) as TaskPayload;
    //
    //     if ( !document.completed_on ) {
    //         document = Utils.Tasks.addStop(document, user, localTime);
    //
    //         document.completed_on = localTime;
    //     } else {
    //         throw new ApiError(ERRORS.TASKS.TASK_IS_ALREADY_COMPLETED);
    //     }
    //
    //
    //     return await CouchDbService.adapter.insert(document);
    // }
};