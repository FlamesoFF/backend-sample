import faker from 'faker';
import moment from 'moment';
import { ICountry } from '../../src/@types/data/definitions';
import { RelationDefined, TRelation } from '../../src/@types/types';

export namespace DummyData {

    export namespace Basic {
        export function randomCountry(): ICountry {
            return {
                id: faker.address.countryCode(),
                code: faker.address.countryCode(),
                name: faker.address.country(),
                state: faker.address.state()
            };
        }
    }

    export namespace Dates {
        export function randomDate(): string {
            return moment(faker.date.past()).format('YYYY-MM-DD');
        }

        export function randomDateISO(): string {
            return moment(faker.date.past()).toISOString();
        }
    }

    export namespace Arrays {
        export function* randomUUID(count: number): Generator<string> {
            while (count--) {
                yield faker.random.uuid();
            }
        }
    }

    export namespace Strings {
        export function personFullName(): string {
            return `${faker.name.firstName()} ${faker.name.lastName()}`;
        }

        export function address(): string {
            return `${faker.address.country()}, ${faker.address.city()}, ${faker.address.streetAddress()} ${faker.address.zipCode()}`;
        }
    }


    export function randomRelation(type?: TRelation): RelationDefined {
        const types: TRelation[] = [
            'has_director',
            'has_member',
            'has_manager',
            'has_partner',
            'has_client',
            'has_agent',
            'has_inspection',
            'has_contact',
            'is_client',
            'is_agent',
            'related_to',
            'linked_to',
            'ordered_by',
            'managed_by',
            'has_receiver',
            'has_sender',
            'has_document',
            'contains',
            'issued_by',
            'issued_to'
        ];

        const classes = [
            'person',
            'company'
        ];

        const nodeClass = faker.random.arrayElement(classes);
        const relationType = type || <TRelation>faker.random.arrayElement(types);
        const properties: { [key: string]: any } = {};

        if (relationType === 'has_contact') {
            properties.email = faker.internet.email();
        }

        return {
            type: relationType,
            node: {
                _id: faker.random.uuid(),
                class: nodeClass,
                name: nodeClass === 'person' ?
                    DummyData.Strings.personFullName() :
                    faker.company.companyName(),
                description: faker.lorem.words(5)
            },
            ...properties
        };
    }

    export function* generateAddresses(number: number): Generator<string> {
        while (number--) {
            yield DummyData.Strings.address();
        }

    }

}