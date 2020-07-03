import { IComment, ICommentUser } from '../../../@types/data/definitions';

export class CommentModel implements IComment {
    user: ICommentUser;
    text: string;
    created_on: string;
    updated_on?: string;

    private constructor(params: IComment) {
        const {
            user,
            text,
            created_on,
            updated_on
        } = params;

        this.user = user;
        this.text = text;
        this.created_on = created_on;
        updated_on ? this.updated_on = updated_on : 0;
    }

    static create(params: IComment) : IComment{
        return new this(params);
    }
}