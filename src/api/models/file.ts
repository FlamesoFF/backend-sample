import { INode, INodeAbstract, IRelation } from '../../@types/data/definitions';
import { IFileDetails, IFileDocument, TCreatedBy } from '../../@types/data/file';
import { DATE_PATTERN } from '../constants';
import moment from 'moment';
import { IFileDetailsParams, IFileModelParameters } from '../@types/api/models.types';
import { MwAuth } from '../middlewares/auth';


export class FileModel implements IFileDocument {
    readonly schema_id = 'file_v3';
    readonly class = 'file';

    readonly name: string;
    readonly description: string;
    readonly type: string[];
    readonly tags: string[];

    readonly _id?: string;
    readonly alias?: string;
    readonly files?: IFileDetails[];
    readonly relations?: IRelation<INode | INodeAbstract>[];


    constructor({
        _id,
        name,
        description,
        type,
        tags,
        alias
    }: IFileModelParameters) {
        this.name = name;
        this.description = description;
        this.type = type.map(item => item.trim());
        this.tags = tags.map(item => item.trim());

        _id ? this._id = _id : null;
        alias ? this.alias = alias : null;

    }

    private static getFileByName(files: Express.Multer.File[], name: string): Express.Multer.File {
        return files.filter(file => file.originalname === name)[0];
    }

    static addFileDetails(fileDoc: IFileDocument, fileDetail: FileDetails) {
        const { user } = MwAuth;

        !fileDoc.files ? fileDoc.files = [] : fileDoc.files;

        fileDoc.files.push(fileDetail);
    }
}


export class FileDetails implements IFileDetails {
    // sha-256
    sha: string;
    // md5
    digest: string;
    type: string;
    created_on: number;
    created_by: TCreatedBy;

    description?: string;

    constructor({
        sha,
        digest,
        type,
        description
    }: IFileDetailsParams) {
        const { _id, name } = MwAuth.user;

        this.sha = sha;
        this.digest = digest;
        this.created_on = moment().unix();
        this.created_by = {
            _id,
            name
        };

        description ? this.description = description : null;

        try {
            this.type = type.match(/.*\/(\w+)/i)[0];
        } catch (error) {
            throw new Error(error);
        }
    }
}