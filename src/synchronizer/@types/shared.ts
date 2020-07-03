import { DocumentViewResponse } from 'nano';


export namespace NanoExtended {
    export type DocumentViewResponseRow = DocumentViewResponse<unknown, IndexSignature>['rows'][0];
}

export interface IndexSignature<T = any> {
    [key: string]: T
}