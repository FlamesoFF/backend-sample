import { INode, IRelation } from '../../@types/data/definitions';
import { Requests } from '../@types/api/controllers.types';
import { CouchDbService } from '../../services/couchDb';
import { isDocumentWithName, isTask } from '../../shared/utils/typeGuards';
import { ApolloDocument, RelationDefinedMeta } from '../../@types/types';
import nano from 'nano';
import { PostgreSqlService } from '../../services/postgreSql';
import { ApiError, ERRORS } from '../errors';
import { ResponseFormatterData } from '../middlewares/response';


export const contactsController = new class Controller {

    async fetch(request: Requests.Contacts.IGetByEmail): Promise<IRelation | RelationDefinedMeta> {
        const { email } = request.params;

        try {
            const query: nano.MangoQuery = {
                selector: {
                    $and: [
                        {
                            relations: {
                                $exists: true,
                                $elemMatch: {
                                    $and: [
                                        { type: 'has_contact' },
                                        { email }
                                    ]
                                }
                            }
                        }
                    ]
                },
                fields: [
                    '_id',
                    'class',
                    'name',
                    'type',
                    'relations'
                ]
            };

            const mongoResponse = await CouchDbService.adapter.find(query);

            const mapFunction = (doc: ApolloDocument): RelationDefinedMeta => {
                const {
                    name,
                    email: relationEmail,
                    initials,
                    node
                } = doc.relations.find(
                    (item: IRelation<INode>) =>
                        item.type === 'has_contact' && item.email === email
                );

                const {
                    _id: docId,
                    class: docClass
                } = doc;

                let docName: string = '';

                if (isTask(doc)) {
                    docName = doc.content;
                }
                else if (isDocumentWithName(doc)) {
                    docName = doc.name;
                }


                // Todo: simplify with spread operator
                return {
                    name: name ? name : node.name,
                    type: 'is_contact',
                    email,
                    initials: initials || '',
                    node: {
                        _id: docId,
                        class: docClass,
                        name: docName
                    }
                };
            };

            const { docs } = mongoResponse;

            if (docs && docs.length > 0) {
                const [result] = docs.map(mapFunction);

                return result;
            }

            throw { statusCode: 404 };
        } catch (error) {
            throw error;
        }
    }
};


export class ContactsPgSQLController {

    static async create({
        params: { id },
        body: {
            contact_id,
            message_id,
            data = '{}'
        }
    }: Requests.Contacts.ICreatePgSQL): Promise<ResponseFormatterData | void> {
        const quit = (parameterName) => {
            throw new ApiError(ERRORS.COMMON.MISSING_REQUIRED_PARAMETERS, [parameterName]);
        };

        if (!contact_id) quit('contact_id');
        if (!id) quit('entity_id');

        let queryParams = '';

        if (contact_id) queryParams += `p_contact_id:='${contact_id}'`;
        if (message_id) queryParams += `,p_message_id:='${message_id}'`;
        if (id) queryParams += `,p_entity_id:='${id}'`;

        queryParams += `,p_data:='${JSON.stringify(data)}'`;

        const query = `CALL add_contact(${queryParams})`;

        const errorMessage = 'Unable to create contact. PgSQL internal error.';

        try {
            const result = await PostgreSqlService.adapter.query(query);

            console.log(result);
        } catch (e) {
            throw `${errorMessage} ${e}`;
        }
    }


    static async get({
        params: { id },
        query: { entity_id }
    }: Requests.Contacts.IGetPgSQL): Promise<any> {
        let queryParams = '';

        if (id) queryParams += `p_contact_id:='${id}'`;
        if (entity_id) queryParams += `,p_entity_id:='${entity_id}'`;

        const query = `SELECT * FROM get_contacts(${queryParams})`;

        try {
            const { rows } = await PostgreSqlService.adapter.query(query);

            return rows;
        } catch (e) {
            throw 'Unable to get contact. PgSQL internal error:' + e;
        }
    }
}
