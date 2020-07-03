import { IApolloDocument } from '../../../@types/shared';
import { IPerson } from '../../../@types/data/person';


export interface ApolloDocumentList {
    items: IApolloDocument[]
}

export const PersonTG = (object: any): object is IPerson => object;