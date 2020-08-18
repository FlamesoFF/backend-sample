import { Document } from 'nano';

export interface QueryInfo {
    query: string
    params: Object
}

export interface Row {
    deleted: boolean,
    doc: any & Document
}

export type Rows = Array<Row>;