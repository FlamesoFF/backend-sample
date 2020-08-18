import { ICompany, TCompanyType } from '../../@types/data/company';
import { ICountry } from '../../@types/data/definitions';
import { ApiError, ERRORS } from '../errors';
import { ICompanyModelParameters, ICompanyModelUpdate } from '../@types/api/models.types';
import { GenericDocument } from './genericDocument';
import { RelationList } from '../../@types/types';
import moment from 'moment';


export class CompanyModel extends GenericDocument implements ICompany {
    type: TCompanyType[];
    name: string;
    country: ICountry;

    offices?: string[];
    certificate?: string;
    incorporated_on?: string;
    status?: string;
    authority?: { [k: string]: any; };
    _rev?: string;
    relations?: RelationList;


    private constructor({
        name,
        country,
        incorporated_on,
        certificate,

        _id,
        type
    }: ICompanyModelParameters) {
        super('company_v3', 'company', _id);

        if (
            !name ||
            !country ||
            !certificate ||
            !incorporated_on
        ) throw new ApiError(ERRORS.COMMON.MISSING_REQUIRED_PARAMETERS);


        this.name = name;
        this.country = country;
        this.certificate = certificate;
        this.incorporated_on = moment(incorporated_on).toISOString();


        if (_id) this._id = _id;
        // if (status) this.status = status;
        if (type) this.type = type;
    }

    static create(params: ICompanyModelParameters): CompanyModel {
        return new this(params);
    }

    static pickUpdateData(data: ICompanyModelUpdate): Partial<ICompanyModelUpdate> {
        const {
            type,
            authority,
            certificate,
            country,
            incorporated_on,
            name,
            offices,
            status,
        } = data;

        const pickedData: Partial<ICompanyModelUpdate> = {};

        type ? pickedData.type = type : null;
        authority ? pickedData.authority = authority : null;
        certificate ? pickedData.certificate = certificate : null;
        country ? pickedData.country = country : null;
        incorporated_on ? pickedData.incorporated_on = moment(incorporated_on).toISOString() : null;
        name ? pickedData.name = name : null;
        offices ? pickedData.offices = offices : null;
        status ? pickedData.status = status : null;

        return pickedData;
    }
}