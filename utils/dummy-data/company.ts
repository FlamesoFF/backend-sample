import faker from 'faker';
import { randexp } from 'randexp';
import { DummyData } from './basic';
import { CompanyModel } from '../../src/api/models/company';
import { ICompany, TCompanyType } from '../../src/@types/data/company';


export function* companyGenerator(number: number): Generator<ICompany> {
    while (number--) {
        const company = CompanyModel.create({
            _id: faker.random.uuid(),
            certificate: randexp(/[A-Z]{10}/),
            country: DummyData.Basic.randomCountry(),
            incorporated_on: DummyData.Dates.randomDateISO(),
            name: faker.company.companyName(),
            type: <TCompanyType[]>[faker.random.arrayElement(['agent', 'authority', 'bank', 'client', 'receiver', 'sender', 'shelf'])]
        });

        CompanyModel.addRelation(
            company,
            DummyData.randomRelation(
                faker.random.arrayElement(['has_contact', 'has_director', 'has_inspection'])
            )
        );

        yield company;
    }
}

