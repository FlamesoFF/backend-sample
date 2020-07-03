import faker, { address } from 'faker';
import { randexp } from 'randexp';
import { PersonModel } from '../../src/api/models/person';
import { DummyData } from './basic';
import { IPerson } from '../../src/@types/data/person';


export function* personGenerator(number: number): Generator<IPerson> {
    while (number--) {
        const person = PersonModel.create({
            _id: faker.random.uuid(),
            name: DummyData.Strings.personFullName(),
            address: `${address.country()}, ${address.city()}, ${address.streetAddress()} ${address.zipCode()}`,
            country: DummyData.Basic.randomCountry(),
            country_of_birth: faker.address.country(),
            date_of_birth: DummyData.Dates.randomDate(),
            email: {
                value: faker.internet.email()
            },
            initials: randexp(/[A-Z]{2}/),
            nationality: [faker.address.country()],
            occupation: faker.random.arrayElement(['driver', 'doctor', 'teacher', 'scientist', 'accountant', 'banker']),
        });

        PersonModel.addRelation(
            person,
            DummyData.randomRelation(
                faker.random.arrayElement(['has_contact', 'has_partner', 'related_to', 'has_director'])
            )
        );

        yield person;
    }
}

