import { IndexedSignature } from '../../@types/types';


export class NeoQuery {
    private readonly _query: string;
    private _params: IndexedSignature;


    constructor(queryString: string, parameters?: IndexedSignature) {
        this._query = queryString;

        if(parameters) {
            this.setParameters(queryString, parameters);
        }
    }


    private setParameters(queryString: string, parameters: IndexedSignature<any>) {
        const matches = NeoQuery.getMatches(queryString);

        const result = Object.keys(parameters).some(item => {
            return matches.includes(item);
        });

        if (!result) throw new Error('Provided query missing some parameters!');

        this._params = parameters;
    }

    private static getMatches(queryString: string) {
        const matchArrays = [...queryString.matchAll(/\$(\w+)/g)];

        return matchArrays
            .map(match => match[1])
            .filter(match => !!match);
    }

    get query() {
        return this._query;
    }
}