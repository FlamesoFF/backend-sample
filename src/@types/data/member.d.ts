import { MaybeDocument } from 'nano';
import { IApolloDocument } from '../shared';

export interface Member extends MaybeDocument, IApolloDocument {
    name: string;
    type: 'is_member';
    credential: IMemberCredential;
}

export interface IMemberCredential {
    accepted: boolean;
    password: string;
    password_scheme: string;
    registered_on: string;
    roles: string[];
    salt: string;
    status: string;
    name: string;
    login: string;
    email: string;
    [k: string]: any;
}
