import { ICompany, TCompanyType } from '../../../@types/data/company';
import { ICourier } from '../../../@types/data/courier';
import { IBasicEntity, IComment, ICountry, IEmail, IQuote } from '../../../@types/data/definitions';
import { IFileDetails, IFileDocument } from '../../../@types/data/file';
import { IPerson, IPersonStructuredName, TPersonType } from '../../../@types/data/person';
import { QuoteModel } from '../../models/shared/quote';
import { CommentModel } from '../../models/shared/comment';
import { Relation, RelationList } from '../../../@types/types';


export type TExcludeCommon =
    '_rev'
    | '_attachments'
    | 'class'
    | 'schema_id'
    | 'relations'
    | 'modified_by';

export type TExcludeUpdate =
    '_id'
    | '_rev'
    | '_attachments'
    | 'class'
    | 'schema_id'
    | 'relations';


interface BasicParameters {
    _id?: string
}


export interface IOrderModelParameters {
    manager: IPerson
    client: IPerson | ICompany
    initials: string
    number: number

    client_reference?: string
    contactRelation?: Relation
    thread_id?: string
    date?: string
    tags?: string
    type?: string[]
    companies?: string[]
    statuses?: {
        account: string
        compliance: string
        client: string
        order: string
    }
    order_date?: string
    quotes?: QuoteModel[]
    comments?: CommentModel[]
}

export interface ICourierModelParameters extends Omit<ICourier, TExcludeCommon> {
    threadId: string
    relations?: RelationList
}

export interface IFileModelParameters extends BasicParameters {
    name: string;
    description: string;
    type: string[];
    tags: string[];

    alias?: string;
}

// type TCompanyExclude = TExcludeCommon;
export interface ICompanyModelParameters extends BasicParameters {
    name: string
    country: ICountry
    incorporated_on: string
    certificate: string

    type?: TCompanyType[]
}

export interface ICompanyModelUpdate extends Omit<ICompany, TExcludeUpdate> { }

export interface IPersonModelParameters extends BasicParameters {
    name: string;
    date_of_birth: string;
    country_of_birth: string;

    type?: TPersonType[];
    place_of_birth?: string;
    country?: ICountry;
    occupation?: string;
    organization?: string;
    address?: string;
    phone?: string;
    initials?: string;
    ip?: string;
    login?: string;
    email?: IEmail;
    nationality?: string[];
    structured_name?: IPersonStructuredName;
    notes?: string;
    modified_by?: Required<IBasicEntity>;
    comments?: IComment[];
    quotes?: IQuote[];
}

type TFileExclude =
    TExcludeCommon
    | 'files'
    | '_attachments';
export interface IFileModelParameters extends Omit<IFileDocument, TFileExclude> { }

type TFileDetailsExclude =
    TExcludeCommon
    | 'created_on'
    | 'created_by';
export interface IFileDetailsParams extends Omit<IFileDetails, TFileDetailsExclude> { }