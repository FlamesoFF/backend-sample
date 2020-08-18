import { ApolloDocument } from '../../@types/types';
import { DatabaseChangesResultItem } from 'nano';


export interface ApplyParams {
    change: DatabaseChangesResultItem;
    type: string
    document?: ApolloDocument
    dbName?: string;
}

export interface SettingScript {
    [key: string]: any;
}

export type PropertyGetter = (o: any) => any;

export interface GettersList {
    [key: string]: PropertyGetter
}

export interface Model {
    condition: (doc: ApolloDocument) => boolean

    script?: SettingScript
    getters?: {
        [key: string]: GettersList
    }
    batchSize?: number
    mappings?: {
        [key: string]: string
    }

    apply?: (params: ApplyParams) => Promise<void>;
}
