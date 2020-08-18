import { ApplyParams, GettersList, Model } from '../@types/models';
import { ApolloDocument } from '../../@types/types';


export abstract class SyncModel implements Model {
    abstract batchSize: number;
    abstract mappings: { [p: string]: string };
    abstract getters: { [p: string]: GettersList };
    apply?(params: ApplyParams) : Promise<void>;

    abstract initialize() : void
    abstract condition(doc: ApolloDocument) : boolean
}