import { companyGenerator } from '../../../utils/dummy-data/company';
import { expect } from 'chai';
import { ajv } from "../../../tests/shared";

describe('Companies', () => {

    // TODO: Fix unit test
    it('Create New', () => {
        const companies = [...companyGenerator(10)];

        companies.forEach(item => {

            const valid = ajv.validate('company_v3', item);

            if (!valid) console.log(ajv.errors);

            expect(valid).to.be.true;

        });
    });
});