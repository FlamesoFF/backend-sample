import moment from 'moment';
import { DocumentFetchResponse, MangoResponse } from 'nano';
import { Path, QueryResult } from 'neo4j-driver';
import { QueryResultRow } from 'pg';
import { Responses } from '../@types/api/controllers.types';
import { IRelation } from '../../@types/data/definitions';
import { IFileDocument } from '../../@types/data/file';
import { IOrder } from '../../@types/data/order';
import { TASK_DATE_PATTERN } from '../constants';
import { ApolloDocument, NodeAmbiguous, Relation, RelationAbstract, TRelation } from '../../@types/types';
import { isDeleted, isResponseFetch, isResponseMango, isRow } from '../../shared/utils/typeGuards';
import { ApolloJwtToken } from '../middlewares/types';
import { ITaskParsedInput, ITimeRecord, ITimeTrack, Task, TaskListItem } from "../modules/tasks/types";


export namespace Utils {

    /** @description Removes undefined elements from an array. */
    export const trimArray = <T>( array: T[] ): T[] => {
        return array.filter(
            ( value: T, index: number ) => value !== undefined
        );
    };

    /** @description Removes properties which values are empty strings, undefined or null */
    export const trimObject = <T extends object>( object: T ) => {
        return Object.entries(object)
            .reduce(( accumulator, [key, value], index, array ) => {

                if (
                    value !== undefined &&
                    value !== null &&
                    value !== Infinity
                ) {
                    accumulator[key] = value;
                }


                return accumulator;

            }, {});
    };

    /** @description Converts string to valid MongoDB query search regular expression. */
    type TRegexOptions = 'i' | 'm';
    export const stringToMangoQueryRegex = ( string: string, options: TRegexOptions[] = [] ) => {
        let words: string[];
        const wordRegExp = /(\W+)|(\d+)/g;

        words = string
            .replace(wordRegExp, ' ')
            .trim()
            .split(' ');

        words = words.map(word => {
            return `(?=.*${ word })`;
        });

        words.push('.*');

        const optionsStr = options.length > 0 ? `(?${ options.join('') })` : '';
        const wordsStr = words.join('');

        return `${ optionsStr }${ wordsStr }`;
    };


    export namespace Tasks {
        type TTaskWithFlattenRelations = {
            [K in TRelation]: any
        };

        export interface ITaskListItem extends Exclude<Task, 'relations'>, TTaskWithFlattenRelations {
        }


        export namespace Sort {
            export type TOrder = 'asc' | 'desc';

            export const byDate = ( rows: Task[], order: TOrder = 'desc' ): typeof rows => {
                return rows.sort(( a: Task, b: Task ) => {
                    const date1 = moment(a.timestamps.created, TASK_DATE_PATTERN);
                    const date2 = moment(b.timestamps.created, TASK_DATE_PATTERN);

                    if ( order === 'asc' ) {
                        return date1.isAfter(date2) ? 1 : -1;
                    } else {
                        return date1.isAfter(date2) ? -1 : 1;
                    }

                });
            };
        }

        export namespace Filter {

            export const fromUser = ( tasks: Task[] ) => {

                return tasks.filter(task => {
                    const { relations = [] } = task;

                    /*
                     * if (relations.assigned to task.responsible || task.responsible_group) {
                     *     const responsible = task.responsible || task.responsible_group;
                     */

                    /*
                     *     if (responsible && responsible.doc_id && task.assigned_by) {
                     *         return task.assigned_by.doc_id !== responsible.doc_id;
                     *     }
                     * }
                     */
                });

            };

        }

        export namespace Time {
            export const elapsed = () => {

            };

            /**
             * @param timestamp string in ISO 8601 format
             * @returns string in ISO 8601 format
             */
            export const toLocalTime = ( timestamp: string ): string => {
                return moment
                    .parseZone(timestamp)
                    .local()
                    .format();
            };
        }

        export const parseInput = ( input: string ): ITaskParsedInput | void => {
            // const regExp = /(\d{2}:\d{2})+ (\+\d{1,2})+ (\w{2,3}:)? ([\d\w ]+) (:\w{2,3})?/;
            const regExp = /(\d{2}:\d{2})? ?(\+\d{1,2})? ?((\w{2,3}):)? ?([\d\w&\\/ ]+) ?(:(\w{2,3}))?/;
            const allowedRegExp = /(?![:+\d\d\w\s&/])/;

            const charTest = input.match(allowedRegExp);

            if ( charTest && charTest.index && charTest.index < input.length ) {
                const allowed = ['a-z', ':', ' ', '+', '/', '&'];

                throw new Error(`
                    Unexpected characters in task input! 
                    Allowed characters are: <${ allowed.join('>, <') }>.
                `);
            }

            // FORMAT : '12:30 +1 AB: my new task :FA';

            // .match(/(\d{2}:\d{2})+ (\+\d{1,2})+ (\w{2,3}:)? ([\d\w ]+) (:\w{2,3})?/)

            const match = input.match(regExp);

            if ( match ) {
                const [
                    ,
                    time,
                    timeOffset,
                    ,
                    from,
                    text,
                    ,
                    to
                ] = match;

                const parsedData: ITaskParsedInput = {
                    reminder: {
                        time,
                        timeOffset: Number(timeOffset)
                    },
                    from,
                    text,
                    to
                };

                if ( text ) {
                    parsedData.text = text.trim();
                }


                return parsedData;
            }
        };

        const searchUserTrack = ( time_track: ITimeTrack[], user: ApolloJwtToken ): ITimeTrack | void => {
            const { _id } = user;

            return time_track.filter(track => {
                if ( track.who ) {
                    return track.who._id === _id;
                }

            })[0];
        };

        const getLastRecord = ( userTrack: ITimeTrack ): ITimeRecord | void => {
            const { time_records } = userTrack;

            if ( time_records ) {
                return time_records[time_records.length - 1];
            }

        };

        /*
         *Public
         */
        /*
         * static addTimeTrack(task: ITask, user: IPerson, time: string): TimeTrack {
         *  const { time_track } = task;
         *  const taskUser = Task.getTaskEntity(user);
         *
         *  const newTimeTrack = new TimeTrack({
         *      who: taskUser,
         *      time_records: [
         *          new Record({
         *              // created: moment().format(Todo.DATE_FORMAT)
         *              created: time
         *          })
         *      ]
         *  });
         *
         *  if (time_track) {
         *      time_track.push(newTimeTrack);
         *  }
         *
         *  task.time_track = time_track;
         *
         *  return newTimeTrack;
         * }
         */

        // YYYY-MM-DDThh:mm:ssTZD (eg 1997-07-16T19:20:30+01:00)
        /*
         * static addTimeRecord(task: ITask, user: IPerson, time: string): TimeRecord {
         *  const { time_track } = task;
         *  const newRecord = new Record({
         *      // created: moment().format(Todo.DATE_FORMAT)
         *      created: time
         *  });
         *
         *  if (time_track) {
         *      for (let track of time_track) {
         *          if (
         *              track.time_records &&
         *              track.who &&
         *              track.who.doc_id === user._id
         *          ) {
         *              track.time_records.push(
         *                  newRecord
         *              );
         *          }
         *      }
         *  }
         *
         *  return newRecord;
         * }
         */

        /*
         * static getTimeTrackForUser(task: ITask, user: IPerson): ITimeTrack | void {
         *  let { time_track } = task;
         *
         *  if (time_track) {
         *      const track = this.searchUserTrack(time_track, user);
         *
         *      return track ? track : undefined;
         *  } else {
         *      throw new Error(`Time Track for user ${user._id} has not found!`);
         *  }
         * }
         */

        /*
         * static addStart(task: ITask, user: IPerson, time: string): ITask {
         *  let { time_track } = task;
         *  const parsedTime = moment(time).toISOString();
         *
         *  const start = (userTrack: ITimeTrack) => {
         *      const lastRecord = this.getLastRecord(userTrack);
         *
         *      if (lastRecord) {
         *          if (!lastRecord.start) {
         *              // lastRecord.start = moment().format(Todo.DATE_FORMAT);
         *              lastRecord.start = parsedTime;
         *          } else if (lastRecord.end) {
         *              const newRecord = this.addTimeRecord(task, user, parsedTime);
         *              // newRecord.start = moment().format(Todo.DATE_FORMAT);
         *              newRecord.start = parsedTime;
         *          } else {
         *              throw new Error('Task has already started!');
         *          }
         *      }
         *  };
         *
         *  if (time_track) {
         *      let track = this.searchUserTrack(time_track, user);
         *
         *      if (!track) {
         *          track = this.addTimeTrack(task, user, time);
         *          start(track);
         *      } else {
         *          start(track);
         *      }
         *  } else {
         *      throw new Error(`Task ${task._id} has invalid structure: property "time_track" does not exist!`);
         *  }
         *
         *  return task;
         * }
         */

        export const addStop = ( task: Task, user: ApolloJwtToken, time: string ): Task => {
            const { time_track } = task;
            const parsedTime = moment(time).unix();

            const stop = ( userTrack: ITimeTrack ) => {
                const lastRecord = getLastRecord(userTrack);

                if ( lastRecord && !lastRecord.end )
                    // lastRecord.end = moment().format(Todo.DATE_FORMAT);
                {
                    lastRecord.end = parsedTime;
                }

            };

            if ( time_track ) {
                const track = searchUserTrack(time_track, user);

                if ( track ) {
                    stop(track);
                } else {
                    throw new Error('Task hasn\'t been started once!');
                }


            }

            return task;
        };

        /*
         * static getElapsedTimeForUser(task: ITask, user: IPerson): number {
         *  const timeTrack = this.getTimeTrackForUser(task, user);
         *
         *  if (timeTrack && timeTrack.time_records) {
         *      let sum = 0;
         *
         *      for (let record of timeTrack.time_records) {
         *          if (record.start && record.end) {
         *              let { start, end } = record;
         *
         *              let startTime = moment(start, NTasks.DATE_FORMAT);
         *              let endTime = moment(end, NTasks.DATE_FORMAT);
         *
         *              sum += Math.abs(startTime.diff(endTime));
         *          }
         *      }
         *
         *      return sum;
         *  }
         *
         *  return 0;
         * }
         */

        /*
         * static getUserElapsedTimeToday(task: ITask, user: IPerson): number {
         *  const timeTrack = this.getTimeTrackForUser(task, user);
         *  const today = moment().hour(0).minute(0).second(0);
         *
         *  function getTimeDifference(start: string, end: string) {
         *      let startTime = moment(start);
         *      let endTime = moment(end);
         *
         *      return Math.abs(startTime.diff(endTime));
         *  }
         *
         *  if (timeTrack && timeTrack.time_records) {
         *      let sum = 0;
         *      const { time_records } = timeTrack;
         *
         *      const todayTimes = time_records.filter(time => {
         *          const { start, end } = time;
         *
         *          let startDate = moment(start, Todo.DATE_FORMAT);
         *          let endDate = moment(end, Todo.DATE_FORMAT);
         *
         *          return startDate.startOf('day').isSame(today.startOf('day')) &&
         *              endDate.startOf('day').isSame(today.startOf('day'));
         *      });
         *
         *      for (let record of todayTimes) {
         *          if (record) {
         *              let { start, end } = record;
         *
         *              if (start && end) {
         *                  sum += getTimeDifference(start, end);
         *              }
         *          }
         *      }
         *
         *      return sum;
         *  }
         *
         *  return 0;
         * }
         */

        /*
         * static getUserLastStartToday(task: ITask, user: IPerson): string | void {
         *  const timeTrack = this.getTimeTrackForUser(task, user);
         *  const today = moment().hour(0).minute(0).second(0);
         *
         *  function getLastStart(lastRecord: TimeRecord): string | void {
         *      if (lastRecord.start && !lastRecord.end) {
         *          const { start } = lastRecord;
         *          const isToday = moment(start)
         *              .startOf('day')
         *              .isSame(today.startOf('day'));
         *
         *          if (isToday) {
         *              return start;
         *          }
         *      }
         *  }
         *
         *  if (timeTrack && timeTrack.time_records) {
         *      const {
         *          time_records,
         *          time_records: {
         *              length
         *          }
         *      } = timeTrack;
         *
         *      let lastRecord = time_records[length - 1];
         *      if (lastRecord) {
         *          return getLastStart(lastRecord);
         *      }
         *  }
         * }
         */

        /*
         * static isOccupiedBy(task: ITask, user: IPerson): NTasks.Response.IOccupiedBy {
         *  const timeTracks = task.time_track;
         *
         *  function scanTracks(tracks: ITimeTrack[]): ITimeTrack {
         *      const result = tracks.filter(track => {
         *          if (
         *              track.time_records &&
         *              track.who &&
         *              track.who.doc_id &&
         *              track.who.doc_id !== user._id
         *          ) {
         *              return scanRecords(track.time_records);
         *          }
         *      });
         *
         *      return result[0];
         *  }
         *
         *  function scanRecords(records: TimeRecord[]): boolean {
         *      const result = records.filter(record => {
         *          return record.start && !record.end;
         *      });
         *
         *      return result.length > 0;
         *  }
         *
         *  if (timeTracks) {
         *      const track: ITimeTrack = scanTracks(timeTracks);
         *
         *      if (track && track.who) {
         *          return {
         *              status: true,
         *              value: track.who.value
         *          };
         *      }
         *  }
         *
         *  return {
         *      status: false
         *  };
         * }
         */

        /*
         * static async addFile(
         *  task: ITask,
         *  fileData: NTasks.Request.IAddFile['body'],
         *  user: IPerson
         * ): Promise<NTasks.Response.IAddFile> {
         *  task.files = task.files || {};
         *
         *  const {
         *      id,
         *      name,
         *      url
         *  } = fileData;
         *
         *  const file: IFile = {
         *      filename: name,
         *      created: moment().toISOString(),    // current date in ISO format
         *      url,
         *      author: {
         *          doc_id: user._id,
         *          value: user.name
         *      }
         *  };
         *
         *  if (!task.files[id]) {
         *      task.files[id] = file;
         *
         *      return {
         *          id,
         *          ...file
         *      };
         *  } else {
         *      throw new Error(`File with the same id (${fileData.id}) is already exists!`);
         *  }
         * }
         */

        /*
         * static removeFile(task: ITask, fileId: string): ITask {
         *  if (task.files && task.files[fileId]) {
         *      delete task.files[fileId];
         *  } else {
         *      throw new Error(`No file with the id ${fileId}!`);
         *  }
         *
         *  return task;
         * }
         */

        /*
         * static changeResponsible(task: ITask, entity: IPerson | ICompany): ITask {
         *  if (entity.type) {
         *      delete task.responsible;
         *      delete task.responsible_group;
         *
         *      if (entity.type.includes('company')) {
         *          task.responsible_group = Task.getTaskEntity(entity);
         *      } else if (entity.type.includes('user')) {
         *          task.responsible = Task.getTaskEntity(entity);
         *      }
         *  }
         *
         *  return task;
         * }
         */

    }

    export namespace Neo4j {

        export const queryResultsToRelationList = ( response: QueryResult ): (Relation<NodeAmbiguous>)[] => {
            const { records } = response;

            return records.map(record => {
                const {
                    segments: [
                        {
                            relationship: {
                                type: relationType,
                                properties: relationProperties
                            }
                        }
                    ],
                    end: {
                        labels: [endNodeLabel],
                        properties: {
                            _id,
                            name,
                            description
                        } = <any>{}
                    }
                } = record.get('result') as Path;

                return {
                    type: relationType,
                    ...relationProperties,
                    node: {
                        _id,
                        class: endNodeLabel,
                        name,
                        description
                    }
                } as Relation | RelationAbstract;
            });
        };

        export const getNeo4jNodeLabelByEntityClass = ( className: string ): string => {
            const map = new Map([
                ['companies', 'company'],
                ['persons', 'person'],
                ['entities', 'entity'],
                ['couriers', 'courier'],
                ['orders', 'order'],
                ['tasks', 'task'],
                ['files', 'document']
            ]);

            return map.get(className);
        };
    }

    export namespace Relations {

        interface IFlattenRelations {
            [key: string]: NodeAmbiguous
        }


        export const flattenRelations = ( relations: Partial<IRelation[]>, filter: TRelation[] ): IFlattenRelations => {
            const flatten: {
                [key: string]: NodeAmbiguous
            } = {};

            relations.forEach(relation => {
                const { type, node } = relation;

                if ( filter.indexOf(<TRelation>type) >= 0 ) {
                    flatten[type] = node;
                }

            });

            return flatten;
        };

    }

    export namespace PostgreSQL {

        export function resultsToList( rows: QueryResultRow[] ): Responses.Lists.Generic {
            return rows.map(item => {
                const {
                    id: _id,
                    name,
                    class: className,
                    fuzzy,
                    median
                } = item;

                return {
                    _id,
                    name,
                    class: className,
                    weight: fuzzy
                };
            });
        }

        export const fuzzySearchResultsToEntityList = <T extends Responses.Common.FuzzySearch>( rows: T ): Responses.IEntityItem[] => rows.map(
            item => {
                const {
                    id: _id,
                    class: className = '',
                    name,
                    description
                } = item;

                return {
                    _id,
                    class: className,
                    name,
                    description
                };
            });

    }


    export namespace Nano {

        export type NanoResponsesWithDocs<D> =
            DocumentFetchResponse<D>
            | MangoResponse<D>;



        export function normalizeResponse<D extends ApolloDocument>( response: NanoResponsesWithDocs<D> ): D[] {
            let docs: D[] = [];


            if ( isResponseFetch(response) ) {
                docs = response.rows
                    .filter(row => !isDeleted(row) && isRow(row))
                    .map(row => isRow(row) ? row.doc : null);
            }

            if ( isResponseMango(response) ) {
                docs = response.docs;
            }


            return docs;
        }


        export const resultsToList = <D extends ApolloDocument = ApolloDocument>(
            docs: D[],
            additionalProperties: string[]
        ): Responses.Lists.Default => {
            const props = new Set(additionalProperties);

            return docs.map(doc => {
                const {
                    _id,
                    class: className
                } = doc;

                const listItem = {
                    _id,
                    class: className
                };

                props.forEach(( prop: keyof ApolloDocument ) => {
                    if ( prop in doc ) {
                        listItem[prop] = doc[prop];
                    }

                });

                return listItem;
            });
        };

        export function resultsToFilesList<T>( docs: IFileDocument[] ): Responses.Lists.Default {
            return docs.map(doc => {
                const {
                    _id,
                    class: className,
                    name,
                    alias,
                    description
                } = doc;

                return {
                    _id,
                    class: className,
                    name,
                    alias,
                    description
                };
            });
        }

        export const resultsToTasksList = <T>( tasks: Task[] ): TaskListItem[] => {
            const list = tasks.map(doc => {
                const relationsFilter: TRelation[] = ['related_to'];

                const {
                    _id,
                    class: c,
                    type,
                    description,
                    timestamps: {
                        created,
                        completed,
                        reminder
                    },
                    estimated_time,
                    notes,
                    relations,
                    comments,
                    files
                } = doc;

                const task: TaskListItem = {
                    _id,
                    type,
                    estimated_time,
                    description: description,
                    created_on: moment(created).format(TASK_DATE_PATTERN),
                    completed_on: moment(completed).format(TASK_DATE_PATTERN),
                    remind_on: moment(reminder).format(TASK_DATE_PATTERN),
                    notes,
                    comments: comments,
                    files: files,
                    ...Utils.Relations.flattenRelations(relations, relationsFilter),
                };

                delete doc.relations;

                return task;
            });

            return list;
        };

        export function resultsToOrderList<T>( docs: IOrder[] ): Responses.Lists.Generic {
            return docs.map(doc => {
                const {
                    _id,
                    class: className,
                    number
                } = doc;

                return {
                    _id,
                    class: className,
                    number
                };
            });
        }

    }
}