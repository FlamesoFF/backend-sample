import faker from 'faker';
import { randexp } from 'randexp';
import { OrderModel } from '../../src/api/models/order';
import { QuoteModel } from '../../src/api/models/shared/quote';
import { DummyData } from './basic';
import { personGenerator } from './person';
import { IOrder } from '../../src/@types/data/order';
import { CommentModel } from '../../src/api/models/shared/comment';
import { TextUtils } from '@apollo4u/auxiliary';

function randomInitials(): string {
    const name = `${faker.name.firstName()}${faker.name.lastName()}`;

    return TextUtils.nameToInitials(name);
}


export function* orderGenerator(number: number): Generator<IOrder> {
    while (number--) {
        const order = OrderModel.create({
            manager: personGenerator(1).next().value,
            client: personGenerator(1).next().value,
            number: faker.random.number(100000),
            initials: randomInitials(),
            client_reference: randexp(/\w{2}-[\w\d]{9}$/),
            contactRelation: DummyData.randomRelation(),
            thread_id: faker.random.uuid(),
            date: DummyData.Dates.randomDate(),
            tags: faker.lorem.words(5),
            type: faker.random.words(5).split(' '),
            companies: [...DummyData.Arrays.randomUUID(5)],
            statuses: {
                account: 'new',
                compliance: 'new',
                client: 'new',
                order: 'creating'
            },
            quotes: [
                QuoteModel.create({
                    headers: {
                        date: DummyData.Dates.randomDate(),
                        from: `${DummyData.Strings.personFullName()} <${faker.internet.email()}>`,
                        message_id: faker.random.uuid(),
                        thread_id: faker.random.uuid(),
                        subject: faker.lorem.sentence(3),
                        to: faker.internet.email()
                    },
                    items: [
                        {
                            manager_id: faker.internet.userName(),
                            text: faker.lorem.paragraph()
                        }
                    ]
                })
            ],
            comments: [
                CommentModel.create({
                    created_on: DummyData.Dates.randomDate(),
                    text: faker.lorem.paragraph(),
                    user: {
                        _id: faker.random.uuid(),
                        name: DummyData.Strings.personFullName()
                    }
                })
            ]
        });

        yield order;
    }
}