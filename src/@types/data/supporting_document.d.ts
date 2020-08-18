import { IEnteredBy } from "./definitions.d";
import { IApolloDocument } from "../shared";
import { Entity } from "../types";


export interface SupportingDocument extends  IApolloDocument {
    type: string[];
    issued_by?: string;
    number?: string;
    issued_on?: string;
    entered_on?: string;
    valid_till?: string;
    status?: string;
    verification?: string;
    comment?: string;
    entity: Entity;
    entered_by: IEnteredBy;
}
