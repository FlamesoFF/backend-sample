import { INode, INodeAbstract } from '../../../@types/data/definitions';


type TNode = INode & INodeAbstract;

export const isNode = (node: any): node is INode => node._id && node.class;
export const isAbstract = (node: any): node is INodeAbstract => node.name && !node._id && !node.class;


// Classes
export class NodeModel implements INode {
    readonly _id: string;
    readonly class: string;
    readonly name: string;
    readonly description?: string;

    constructor({
        _id,
        class: className,
        name
    }: INode) {
        if (!_id || !className)
        {throw new Error('node required parameters are missing');}

        this._id = _id;
        this.class = className;

        name ? this.name = name : 0;
        // number ? this.number = number : 0;
    }
}

export class NodeAbstractModel implements INodeAbstract {
    readonly name: string;

    constructor({
        name
    }: INodeAbstract) {
        if (name) {this.name = name;}
        else {throw new Error('node.name parameter is missing');}
    }
}