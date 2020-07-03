import { IEnteredBy } from './definitions';
import { IApolloDocument } from '../shared';
import { Entity } from "../types";


export interface Assessment extends IApolloDocument {
    entered_by: IEnteredBy;
    entity: Entity;
    risks: IRisk[];

    template?: string;
    jurisdiction?: string;
    assessed_on: string;
    percent?: string;
    comment?: string;
}

export interface IRisk {
    name: string;
    type: string;
    items: IRiskItem[];
}

export interface IRiskItem {
    description: string;
    values?: IRiskItemValue[];
}

export interface IRiskItemValue {
    weight: number;
    name: string;
}
