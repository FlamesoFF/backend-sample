import { IBasicEntity } from './definitions';
import { IApolloDocument } from '../shared';


export interface ICourier extends IApolloDocument  {
    client_reference: string
    name: string
    number: string
    sent_on: string
    contents: string
    modified_by?: Required<IBasicEntity>;
}