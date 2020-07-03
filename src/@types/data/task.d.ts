import { IApolloDocument } from '../shared';
import { IComment, IQuote } from './definitions';
import { IFileDetails } from './file';


export interface ITask extends IApolloDocument {
    type?: string[];
    estimated_time?: string;
    created_on?: string;
    completed_on?: string;
    time_track?: ITimeTrack[];
    content?: string;
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
    who?: IEntity;
}

export interface ITimeRecord {
    start?: string;
    end?: string;
    created?: string;
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