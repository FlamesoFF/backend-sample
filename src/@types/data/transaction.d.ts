import { IBank, IEnteredBy } from "./definitions.d";
import { MaybeDocument } from "nano";
import { IApolloDocument } from "../shared";
import { Entity } from "../types";


export interface Transaction extends MaybeDocument, IApolloDocument  {
    entered_on?: string;
    account: string;
    date: string;
    currency: string;
    type: string;
    value: string;
    status?: string;
    details?: string;
    comment?: string;
    entity: Entity;
    bank: IBank;
    entered_by: IEnteredBy;
    counterparty?: ITransactionCounterparty;
}

export interface ITransactionCounterparty {
    entity: Entity;
    bank?: IBank;
    account?: string;
}
