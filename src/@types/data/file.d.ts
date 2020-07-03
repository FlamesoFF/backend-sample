import { IBasicEntity } from './definitions';
import { AttachmentData } from 'nano';
import { IApolloDocument, IIndexSignature } from '../shared';


export type TCreatedBy = Required<IBasicEntity>;


export interface IFileDocument extends IApolloDocument {
    name: string;
    description: string;
    type: string[];
    tags: string[];
    alias?: string;
    files?: IFileDetails[];
    _attachments?: IIndexSignature<IAttachment>;
}

export interface IAttachment extends AttachmentData {
    content_type: string;
    revpos: number;
    digest: string;
    length: number;
    stub: boolean;
}

export interface IFileDetails {
    sha: string;
    digest: string;
    type: string;
    created_on: string;
    created_by: TCreatedBy;

    description?: string;
}