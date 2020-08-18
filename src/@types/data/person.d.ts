import { IComment, ICountry, IQuote } from './definitions.d';
import { IApolloDocument } from '../shared';


export type TPersonType =
    'agent'
    | 'attorney'
    | 'beneficial owner'
    | 'client'
    | 'contact'
    | 'director'
    | 'employee'
    | 'notary'
    | 'receiver'
    | 'sender'
    | 'shareholder'
    | 'user'
    | 'webuser';

export interface IPersonStructuredName {
    family: string;
    given: string;
}

export interface IPerson extends IApolloDocument {
        name: string;
        date_of_birth: string;
        country_of_birth: string;

        place_of_birth?: string;
        country?: ICountry;
        occupation?: string;
        organization?: string;
        address?: string;
        phone?: string;
        initials?: string;
        ip?: string;
        login?: string;
        email?: string
        nationality?: string[];
        structured_name?: IPersonStructuredName;
        type?: TPersonType[];
        notes?: string;
        comments?: IComment[];
        quotes?: IQuote[];
}
