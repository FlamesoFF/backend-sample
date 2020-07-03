export interface INodeParameters {
    type: string;
    name?: string;
    where?: object;
}

export interface IRelationParameters {
    type: string;
    name?: string;
    source?: string;
    target?: string;
    where?: object;
}


/**
 * @description Class for construction Cypher queries
 */
export abstract class Cypher {
    private static query: string[] = [];
    private static buffer: any;


    private static stringify(obj: object) {
        let result: string;

        if (Object.keys(obj).length > 0)
            result = obj ? JSON.stringify(obj) : '';
        else
            result = '';

        return result ? result.replace(/"([$\w]+)":/, '$1:') : '';
    }

    private static parseBlock(block: string) {
        try {
            const [, , name = '', type = ''] = /^(([\d\w]+)+)?:([\d\w]+)$/i.exec(block);
            return { name, type };
        }
        catch (error) {
            return {
                name: '',
                type: ''
            };
        }
    }


    static CREATE() {
        Cypher.query.push('CREATE ');

        const { node, relation } = this;
        return { node, relation };
    }

    static MATCH() {
        Cypher.query.push('MATCH ');

        const { node, relation } = this;
        return { node, relation };
    }

    static INSERT() {
        Cypher.query.push('INSERT ');

        return { node: Cypher.node };
    }

    static RETURN(key: string) {
        Cypher.query.push(` RETURN ${key}`);

        const { node, end } = this;
        return { node, end };
    }


    static node(
        block: string,
        where = {}
    ) {
        const { name, type } = Cypher.parseBlock(block);

        if (type)
            block = `${name}:${type}`;
        else
            block = '';


        const part = `(${block}${Cypher.stringify(where)})`;

        Cypher.query.push(part);

        const { relation, end, RETURN } = Cypher;
        return { relation, end, RETURN };
    }

    static relation(
        block: string,
        where = {}
    ) {
        const { name, type } = Cypher.parseBlock(block);

        if (type)
            block = `${name}:${type}`;
        else
            block = '';

        Cypher.buffer = `[${block}${Cypher.stringify(where)}]`;

        const { to, from, both, implicit } = Cypher;
        return { to, from, both, implicit };
    }

    static to() {
        Cypher.query.push('-');
        Cypher.query.push(Cypher.buffer);
        Cypher.query.push('->');

        return { node: Cypher.node };
    }

    static from() {
        Cypher.query.push('<-');
        Cypher.query.push(Cypher.buffer);
        Cypher.query.push('-');

        return { node: Cypher.node };
    }

    static both() {
        Cypher.query.push('<-');
        Cypher.query.push(Cypher.buffer);
        Cypher.query.push('->');

        return { node: Cypher.node };
    }

    static implicit() {
        Cypher.query.push('-');
        Cypher.query.push(Cypher.buffer);
        Cypher.query.push('-');

        return { node: Cypher.node };
    }

    static end() {
        const query = Cypher.query.join('');
        Cypher.query = [];
        Cypher.buffer = '';

        return query;
    }
}
