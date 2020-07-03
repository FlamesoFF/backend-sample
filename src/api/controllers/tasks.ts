import { MangoQuery } from 'nano';
import { CouchDbService } from '../../services/couchDb';
import { ApiError, ERRORS } from '../errors';
import { Requests, Responses } from '../@types/api/controllers.types';
import { Utils } from '../shared/utils';
import { Query } from '../shared/mango';
import { DEFAULT_LIST_LIMIT } from '../constants';
import { ITask } from '../../@types/data/task';
import { MwAuth } from '../middlewares/auth';


interface IElapsedTimeData {
    elapsed: number
    lastStart?: string
}

interface IReport {
    workDate: string
    created_on: string
    completed: boolean
    content: string
    company: string
    time: number
}


export const tasksController = new class Controller {

    async getById(id: string) {
        return await CouchDbService.adapter.get(id);
    }


    /*
     * static async create(request: NTasks.ICreateRequest): Promise<DocumentInsertResponse> {
     *  let task;
     *
     *  task = await TaskFactory.create(request);
     *
     *  if (!task._id && !task._rev) {
     *      return await tasksDbService.create(task);
     *  } else {
     *      throw new Error('Task with the same _id or _rev already exists!');
     *  }
     * }
     */

    async update(request: Requests.Tasks.IUpdate) {
        const { id } = request.params;

        if (!id) throw new ApiError(ERRORS.COMMON.MISSING_REQUIRED_PARAMETERS);

        const document = await CouchDbService.adapter.get(id);

        if (!document) throw new ApiError(ERRORS.COUCH_DB.UNABLE_TO_FIND_DOCUMENT);

        const {
            content,
            type
        } = request.body;

        Object.assign(document, {
            content,
            type
        });

        return await CouchDbService.adapter.insert(document);
    }

    /*
     * static async listTasks(): Promise<ITask[]> {
     *  const query: MangoQuery = {
     *      selector: {
     *          type: {
     *              $elemMatch: { $eq: 'task' },
     *              $not: {
     *                  $elemMatch: { $eq: 'break' }
     *              }
     *          }
     *      }
     *  };
     *
     *  const response = await couchDbAdapter.find(query);
     *
     *  return Utils.Tasks.Sort.byDate(response.docs, 'desc');
     * }
     */

    /*
     * static async listBreaks(request: NTasks.IForSpecificUserRequest): Promise<ITask[]> {
     *  try {
     *      let query = new Utils.ApiMangoQuery({
     *          selector: {
     *              ...API.Query.Tasks.break
     *          }
     *      });
     *
     *      let response = await tasksDbService.find(query.data);
     *      return Utils.Tasks.Sort.byDate(response.docs, 'asc');
     *  } catch (error) {
     *      throw error;
     *  }
     * }
     */

    /*
     * static async listFor(request: NTasks.IForSpecificUserRequest): Promise<ITask[]> {
     *  const { params: { userId } } = request;
     *
     *  try {
     *      let query = new Utils.ApiMangoQuery({
     *          selector: {
     *              ...API.Query.Tasks.task,
     *              $and: [
     *                  { ...API.Query.Tasks.notCompleted },
     *                  {
     *                      responsible: {
     *                          doc_id: {
     *                              $eq: userId
     *                          }
     *                      }
     *                  }
     *              ]
     *          }
     *      });
     *
     *      let response = await tasksDbService.find(query.data);
     *
     *      return Utils.Tasks.Sort.byDate(response.docs, 'asc');
     *  } catch (error) {
     *      throw error;
     *  }
     * }
     */

    /*
     * static async listFrom(request: NTasks.IForSpecificUserRequest): Promise<ITask[]> {
     *  const { params: { userId } } = request;
     *
     *  try {
     *      let query = new Utils.ApiMangoQuery({
     *          selector: {
     *              ...API.Query.Tasks.task,
     *              $and: [
     *                  { ...API.Query.Tasks.notCompleted },
     *                  {
     *                      assigned_by: {
     *                          doc_id: {
     *                              $eq: userId
     *                          }
     *                      }
     *                  }
     *              ]
     *          }
     *      });
     *
     *      let response = await tasksDbService.find(query.data);
     *      const filteredTasks = Utils.Tasks.Filter.fromUser(response.docs);
     *
     *      return Utils.Tasks.Sort.byDate(filteredTasks, 'asc');
     *  } catch (error) {
     *      throw error;
     *  }
     * }
     */

    /*
     * static async listCompleted(): Promise<ITask[]> {
     *  try {
     *      let query = new Utils.ApiMangoQuery({
     *          selector: {
     *              ...API.Query.Tasks.task,
     *              ...API.Query.Tasks.completed
     *          }
     *      });
     *
     *      let response = await tasksDbService.find(query.data);
     *      return Utils.Tasks.Sort.byDate(response.docs, 'asc');
     *  } catch (error) {
     *      throw error;
     *  }
     * }
     */

    async list(request: Requests.Tasks.ISearch): Promise<Responses.Lists.Task> {
        const { _id: userId } = MwAuth.user;
        const { group, limit = 20 } = request.query;
        let sorted: ITask[];


        if (group === undefined) throw new Error('Parameter "group" is required');


        let queryGroup;

        switch (group) {
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
            },
            fields: [
                '_id',
                'content',
                'created_on',
                'completed_on',
                'estimated_time',
                'reminder_time',
                'related_to',
                'assigned_to',
                'assigned_by',
                'notes',
                'comments',
                'files',
                'quotes',
                'relations'

            ]
        };


        const response = await CouchDbService.adapter.find(query);
        const docs = Utils.Nano.normalizeResponse(response);

        /*
         * docs = docs.map((item: ITask) => {
         *     return Utils.Relations.flattenRelations(item, relationsFilter);
         * });
         */

        if (group) {
            sorted = Utils.Tasks.Sort.byDate(<ITask[]>docs, 'desc');
        } else {
            sorted = Utils.Tasks.Sort.byDate(<ITask[]>docs, 'asc');
        }


        const from = sorted.length > Math.abs(Number(limit)) ? sorted.length - Math.abs(Number(limit)) : 0;
        const to = sorted.length;
        const sliced = sorted.slice(from, to);

        // Format relations
        const list = Utils.Nano.resultsToTasksList(<ITask[]>sliced);

        // const result = Utils.Tasks.convertToList(sorted);

        return list;
        // return Utils.Nano.normalizeResponse(sorted);
    }

    /*
     * static async addComment(request: NTasks.IAddCommentRequest): Promise<DocumentInsertResponse> {
     *  const {
     *      params: { taskId }
     *  } = request;
     *
     *  const comment = await TaskCommentFactory.create(request);
     *  const task = await tasksDbService.getById(taskId);
     *
     *  if (task.comments) {
     *      task.comments.push(comment);
     *  } else {
     *      task.comments = [comment];
     *  }
     *
     *  return await tasksDbService.update(taskId, task);
     * }
     */


    async search(request: Requests.Tasks.ISearch): Promise<Responses.Lists.Task> {
        const { content, limit = DEFAULT_LIST_LIMIT } = request.query;

        const mangoQuery: MangoQuery = {
            selector: {
                class: {
                    $eq: 'task'
                },
                content: {
                    $regex: Utils.stringToMangoQueryRegex(content, ['i'])
                }
            },
            fields: [
                '_id',
                'class',
                'content'
            ],
            limit: Number(limit)
        };

        const response = await CouchDbService.adapter.find(mangoQuery);
        let docs = Utils.Nano.normalizeResponse<ITask>(response);

        docs = Utils.Tasks.Sort.byDate(<ITask[]>docs, 'asc');

        const list = Utils.Nano.resultsToTasksList(<ITask[]>docs);

        return list;
    }

    /*
     * static async createBreak(request: NTasks.IUpdateRequest): Promise<DocumentInsertResponse> {
     *  throw 'Not implemented';
     * }
     */

    /*
     * static async startTask(request: NTasks.ITimeTrackRequest): Promise<DocumentInsertResponse> {
     *  const {
     *      params: { userId, taskId },
     *      body: { time }
     *  } = request;
     *
     *  try {
     *      const taskData = await tasksDbService.getById(taskId);
     *      const user = await entitiesDbService.getById(userId);
     *      const occupation = TaskManipulator.isOccupiedBy(taskData, user);
     *
     *      if (!occupation.status) {
     *          const updateContent = TaskManipulator.addStart(taskData, user, time);
     *          return await tasksDbService.update(taskId, updateContent);
     *      } else {
     *          throw occupation;
     *      }
     *  } catch (error) {
     *      throw new Error('Wrong break parameters!' + error);
     *  }
     * }
     */

    /*
     * static async stopTask(request: NTasks.ITimeTrackRequest): Promise<DocumentInsertResponse> {
     *  const {
     *      params: { userId, taskId },
     *      body: { time }
     *  } = request;
     *
     *  try {
     *      const taskData = await tasksDbService.getById(taskId);
     *      const user = await entitiesDbService.getById(userId);
     *      let occupation = TaskManipulator.isOccupiedBy(taskData, user);
     *
     *      if (!occupation.status) {
     *          const updateContent = TaskManipulator.addStop(taskData, user, time);
     *          return await tasksDbService.update(taskId, updateContent);
     *      } else {
     *          throw occupation;
     *      }
     *  } catch (error) {
     *      throw new Error('Wrong break parameters!' + error);
     *  }
     * }
     */

    /*
     * static async taskElapsedTime(request: NTasks.ITimeTrackRequest): Promise<IElapsedTimeData> {
     *  const {
     *      params: {
     *          userId,
     *          taskId
     *      }
     *  } = request;
     *
     *  let elapsedTimeData: IElapsedTimeData = {
     *      elapsed: 0
     *  };
     *
     *  try {
     *      const taskData = await tasksDbService.getById(taskId);
     *      const user = await entitiesDbService.getById(userId);
     *      const lastStart = TaskManipulator.getUserLastStartToday(taskData, user);
     *
     *      if (lastStart) {
     *          elapsedTimeData.lastStart = lastStart;
     *      }
     *  } catch (error) {
     *      elapsedTimeData.elapsed = 0;
     *      // throw `Cannot get elapsed time! ${error}`;
     *  }
     *
     *  return elapsedTimeData;
     * }
     */

    /*
     * static async taskElapsedTimeToday(request: NTasks.ITimeTrackRequest): Promise<IElapsedTimeData> {
     *  const {
     *      params: {
     *          userId,
     *          taskId
     *      }
     *  } = request;
     *
     *  let elapsedTimeData: IElapsedTimeData = {
     *      elapsed: 0
     *  };
     *
     *  try {
     *      const taskData = await tasksDbService.getById(taskId);
     *      const user = await entitiesDbService.getById(userId);
     *      const lastStart = TaskManipulator.getUserLastStartToday(taskData, user);
     *
     *      elapsedTimeData.elapsed = TaskManipulator.getUserElapsedTimeToday(taskData, user);
     *
     *      if (lastStart) {
     *          elapsedTimeData.lastStart = lastStart;
     *      }
     *  } catch (error) {
     *      elapsedTimeData.elapsed = 0;
     *      // throw `Cannot get elapsed time! ${error}`;
     *  }
     *
     *  return elapsedTimeData;
     * }
     */


    /*
     * static async addFile(request: NTasks.Request.IAddFile): Promise<NTasks.Response.IAddFile> {
     *  const {
     *      params: {
     *          taskId,
     *          userId
     *      },
     *      body
     *  } = request;
     *
     *  let taskData = await tasksDbService.getById(taskId);
     *  const user = await entitiesDbService.getById(userId);
     *  const fileInfo = await TaskManipulator.addFile(taskData, body, user);
     *
     *  await tasksDbService.update(taskId, taskData);
     *
     *  return fileInfo;
     * }
     */

    /*
     * static async removeFile(request: NTasks.Request.IRemoveFile): Promise<DocumentInsertResponse> {
     *  const {
     *      params: {
     *          taskId,
     *          fileId
     *      }
     *  } = request;
     *
     *  let taskData = await tasksDbService.getById(taskId);
     *  await TaskManipulator.removeFile(taskData, fileId);
     *
     *  return await tasksDbService.update(taskId, taskData);
     * }
     */

    /*
     * static async changeResponsible(request: NTasks.Request.IChangeResponsible): Promise<DocumentInsertResponse> {
     *  const {
     *      params: {
     *          taskId,
     *          entityId
     *      }
     *  } = request;
     *
     *  let taskData = await tasksDbService.getById(taskId);
     *  const entity = await entitiesDbService.getById(entityId);
     *  let occupation = TaskManipulator.isOccupiedBy(taskData, entity);
     *
     *  if (!occupation.status) {
     *      TaskManipulator.changeResponsible(taskData, entity);
     *      return await tasksDbService.update(taskId, taskData);
     *  } else {
     *      throw 'Task is occupied by other user!';
     *  }
     * }
     */

    /*
     * static async generateReport(request: NTasks.Request.IReport): Promise<IReport[]> {
     *  const {
     *      params: {
     *          userId
     *      },
     *      body: {
     *          from,
     *          to
     *      }
     *  } = request;
     *
     *  const reports = new Map<string, Set<IReport>>();
     *
     *  // Filter tasks where user
     *  let filteredTasks = (await tasksDbService.list()).filter((task: ITask) => {
     *      let userTrackExists = false;
     *      const {
     *          time_track,
     *          created_on
     *      } = task;
     *
     *      if (
     *          time_track &&
     *          moment(created_on).isSameOrAfter(moment(from)) &&
     *          moment(created_on).isSameOrBefore(moment(to))
     *      ) {
     *          time_track.forEach(track => {
     *              if (track.who && track.who.doc_id === userId) {
     *                  userTrackExists = true;
     *                  return;
     *              }
     *          });
     *      }
     *
     *      return userTrackExists;
     *  });
     *
     *  filteredTasks.forEach(task => {
     *      const { time_track } = task;
     *
     *      function scanTracks(tracks: ITimeTrack[]) {
     *          tracks.forEach(tracker => {
     *              if (tracker.who && tracker.who.doc_id === userId && tracker.time_records) {
     *                  scanTimeRecords(tracker.time_records);
     *              }
     *          })
     *      }
     *
     *      function scanTimeRecords(records: TimeRecord[]) {
     *          let timeSum: Duration = moment.duration();
     *          let date: Moment = moment(records[0].start);
     *
     *          records.forEach(record => {
     *              const start = moment(record.start);
     *              const created_on = moment(record.created);
     *              let end: Moment;
     *
     *              if (record.end) {
     *                  end = moment(record.end);
     *              }
     *              else {
     *                  end = moment().add(start.utcOffset(), 'hours');
     *              }
     *
     *              if (!(date && date.isSame(end, 'day'))) {
     *                  if (timeSum.milliseconds() > 0) {
     *                      createReport(timeSum, start, created_on);
     *                  }
     *                  // timeSum.add(moment.duration(start.diff(end)));
     *                  date = start;
     *              }
     *
     *              const diff = Math.abs(start.diff(end));
     *              timeSum.add(moment.duration(diff));
     *          });
     *      }
     *
     *      function createReport(timeSum: Duration, workDate: Moment, created_on: Moment) {
     *          let formats = {
     *              workDate: 'YYYY-MM-D',
     *              created_on: 'D MMMM hh:mm'
     *          };
     *
     *          const {
     *              company = {},
     *              completed,
     *              content,
     *          } = task;
     *
     *          if (completed !== undefined && content) {
     *
     *              let report: IReport = {
     *                  company: company.value ? company.value : '',
     *                  completed,
     *                  content,
     *                  created_on: created_on.format(formats.created_on),
     *                  time: timeSum.asMilliseconds(),
     *                  workDate: workDate.format(formats.workDate)
     *              };
     *
     *              if (!reports.get(report.workDate)) {
     *                  reports.set(report.workDate, new Set());
     *              }
     *
     *
     *              let reportList = reports.get(report.workDate);
     *
     *              if (reportList) {
     *                  reportList.add(report);
     *              }
     *          }
     *      }
     *
     *      if (time_track) {
     *          scanTracks(time_track);
     *      }
     *  });
     *
     *  let result: IReport[] = [];
     *
     *  Array.from(reports.values())
     *      .map(report => {
     *          result = result.concat(Array.from(report.values()));
     *      });
     *
     *  return result;
     * }
     */

    async complete(request: Requests.Tasks.IComplete) {
        const { user } = MwAuth;
        const {
            params: { id },
            body: { datetime }
        } = request;
        const localTime = Utils.Tasks.Time.toLocalTime(datetime);
        let document = await CouchDbService.adapter.get(id) as ITask;

        if (!document.completed_on) {
            document = Utils.Tasks.addStop(document, user, localTime);

            document.completed_on = localTime;
        } else {
            throw new ApiError(ERRORS.TASKS.TASK_IS_ALREADY_COMPLETED);
        }


        return await CouchDbService.adapter.insert(document);
    }
};