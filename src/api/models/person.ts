import { ICountry, IQuote, IRelation } from '../../@types/data/definitions';
import { IPerson, IPersonStructuredName, TPersonType } from '../../@types/data/person';
import { IPersonModelParameters } from '../@types/api/models.types';
import { GenericDocument } from './genericDocument';


export class PersonModel extends GenericDocument implements IPerson {
    readonly name: string;
    readonly date_of_birth: string;
    readonly country_of_birth: string;

    readonly place_of_birth?: string;
    readonly country?: ICountry;
    readonly occupation?: string;
    readonly organization?: string;
    readonly address?: string;
    readonly phone?: string;
    readonly initials?: string;
    readonly ip?: string;
    readonly login?: string;
    readonly email?: string;
    readonly nationality?: any[];
    readonly comments?: any[];
    readonly structured_name?: IPersonStructuredName;
    readonly type?: TPersonType[];
    readonly quotes?: IQuote[];
    readonly notes?: string;
    readonly relations?: IRelation[];


    private constructor({
        _id,
        name,
        // optional
        address,
        country,
        country_of_birth,
        date_of_birth,
        email,
        initials,
        nationality,
        occupation,
        organization,
        phone,
        place_of_birth,
        type
    }: IPersonModelParameters) {
        super('person_v3', 'person', _id);

        this._id = _id;
        this.name = name;

        address ? this.address = address : 0;
        country ? this.country = country : 0;
        country_of_birth ? this.country_of_birth = country_of_birth : 0;
        date_of_birth ? this.date_of_birth = date_of_birth : 0;
        email ? this.email = email : 0;
        initials ? this.initials = initials : 0;
        nationality ? this.nationality = nationality : 0;
        occupation ? this.occupation = occupation : 0;
        organization ? this.organization = organization : 0;
        phone ? this.phone = phone : 0;
        place_of_birth ? this.place_of_birth = place_of_birth : 0;
        type ? this.type = type : 0;

        Object.seal(this);
    }


    static create(params: IPersonModelParameters): PersonModel {
        return new this(params);
    }
}