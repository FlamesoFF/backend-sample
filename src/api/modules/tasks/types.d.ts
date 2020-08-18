import { IBasicEntity, IComment, INode, IQuote } from '../../../@types/data/definitions';
import { IFileDetails } from '../../../@types/data/file';
import { IApolloDocument } from '../../../@types/shared';

type TaskType = 'task' | 'break';

export interface TaskPayload {
    description: string;
    notes?: string;
    reminder_time?: string;
    comments?: IComment[];
    files?: IFileDetails[];
    quotes?: IQuote[];
}

export interface ISubEntity {
    doc_id?: string;
    value?: string;
}


export interface IEntity extends ISubEntity {
    fields?: IEntityFields;
}

export interface IEntityFields {
    code?: string;
}

export interface ITimeTrack {
    time_records?: ITimeRecord[];
    who?: IBasicEntity;
}

export interface ITimeRecord {
    start?: number;
    end?: number;
    created?: number;
}


export interface ITaskParsedInputReminder {
    time: string
    timeOffset: number
}

export interface ITaskParsedInput {
    reminder: ITaskParsedInputReminder
    from: string
    to: string
    text: string
}

export interface Task extends IApolloDocument {
    type: TaskType[]
    description: string
    completed: boolean
    timestamps: {
        created: number
        reminder: number
        completed: number
    }
    time_track: ITimeTrack[]
    notes?: string
    estimated_time?: number
    comments?: IComment[]
    files?: IFileDetails[]
}

export interface TaskListItem {
    _id: string
    type: TaskType[]
    description: string
    created_on: string
    completed_on: string
    remind_on?: string
    notes: string
    estimated_time?: number
    comments: IComment[]
    assigned_by?: INode
    assigned_to?: INode
    related_to?: INode
    files?: IFileDetails[]
}

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