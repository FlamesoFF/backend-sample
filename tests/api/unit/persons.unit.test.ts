import { personGenerator } from '../../../utils/dummy-data/person';
import { expect } from 'chai';
import { ajv } from './unit.test';

describe('Persons', () => {

    // TODO: Fix unit test
    it('Create New', () => {
        const persons = [...personGenerator(10)];

        persons.forEach(item => {

            const valid = ajv.validate('person_v3', item);

            if (!valid) console.log(ajv.errors);

            expect(valid).to.be.true;

        });
    });
});
