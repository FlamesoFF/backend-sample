import { IEnteredBy } from './definitions';
import { IApolloDocument } from '../shared';
import { Entity } from "../types";


export interface BusinessDocument extends IApolloDocument {
    entered_by: IEnteredBy
    entity: Entity
    party: string;
    type: string[];

    comment?: string;
    currency?: string;
    entered_on?: string;
    issued_by?: string;
    issued_on?: string;
    number?: string;
    status?: string;
    valid_till?: string;
    value?: string;
}
