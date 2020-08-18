import { ICountry } from './definitions';
import { IApolloDocument } from '../shared';


export interface ICompany extends IApolloDocument {
    type: TCompanyType[]
    name: string

    offices?: string[]
    certificate?: string
    incorporated_on?: string
    status?: string
    authority?: {
        [k: string]: any
    };
    country: ICountry
}


/*
 * export interface Company extends MaybeDocument, IApolloDocument {
 *     name: string
 *     country: ICountry
 *     incorporated_on: string
 *     certificate: string
 *     type: TCompanyType[]
 */

/*
 *     offices?: string[]
 *     status?: string
 *     authority?: ICompanyAuthority
 *     client_status?: string;
 *     company_status?: string;
 *     struck_off_on?: string;
 *     renewal_due_on?: string;
 *     capital?: number;
 *     currency?: string;
 * }
 */

export interface ICompanyAuthority {
    _id: string;
    name: string;
}

export type TCompanyType =
    'agent' |
    'authority' |
    'bank' |
    'client' |
    'receiver' |
    'sender' |
    'shelf';