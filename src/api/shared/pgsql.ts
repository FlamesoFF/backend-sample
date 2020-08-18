import { DEFAULT_LIST_LIMIT } from '../constants';


interface IFuzzySearchParameters {
    // tableName: string
    searchString: string
    orderBy: string
    types?: string[]
    className?: string
    factor?: number
    limit?: number
}


// select * from fuzzy_search_v2('acme','{"class":"company", "type": ["shelf"]}')
export const getFuzzySearchQuery = ({
    searchString = '',
    factor,
    className,
    types = [],
    limit = DEFAULT_LIST_LIMIT,
    orderBy
}: IFuzzySearchParameters) => {
    const json: object = {};

    if (className)
    {json['class'] = className;}

    if (types.length > 0)
    {json['type'] = types;}

    return `
        SELECT *
        FROM fuzzy_search_v2('${searchString}'${Object.keys(json).length > 0 ? `,'${JSON.stringify(json)}'` : ', \'{}\''})
        ORDER BY ${orderBy} DESC
        LIMIT ${limit};
    `
        .trim()
        .replace(/[\s ]+/g, ' ');
};

