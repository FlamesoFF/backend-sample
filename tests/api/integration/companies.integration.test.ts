import { expect } from 'chai';
import { ajv, defaultPostfix, getAddress, gotInstance } from './integration.test';
import { CouchDbService } from '../../../src/services/couchDb';
import { ICompany } from '../../../src/@types/data/company';
import moment from 'moment';


describe('/v3/companies', () => {
    const ID = 'test-company';
    let tempCompany: string;

    it('GET /v3/companies', async () => {
        const { statusCode, body } = await gotInstance.get(`${getAddress()}/v3/companies`, {
            responseType: 'json'
        });

        expect(body).not.to.be.undefined;

        const valid = ajv.validate('client_definitions_v3#/definitions/list_standard', body);

        if (!valid) console.log(ajv.errors);

        expect(valid).to.be.true;
        expect(statusCode).to.be.equal(200);
    });

    it('GET /v3/companies/<id>', async () => {
        const { statusCode, body } = await gotInstance.get(`${getAddress()}/v3/companies/company-${defaultPostfix}`, {
            responseType: 'json'
        });

        expect(body).not.to.be.undefined;

        const valid = ajv.validate('company_v3', body);

        if (!valid) console.log(ajv.errors);

        expect(valid).to.be.true;
        expect(statusCode).to.be.equal(200);
    });

    it('POST /v3/companies', async () => {
        const payload = {
            name: 'Qwe Ltd.',
            country: {
                id: 'country_ru',
                name: 'Russia',
                code: 'RU'
            },
            certificate: '12345678901',
            incorporated_on: '2010-11-24'
        };

        let valid = ajv.validate('client_company_v3#/definitions/create', payload);

        if (!valid) console.log(ajv.errors);
        expect(valid).to.be.true;

        const { statusCode, body: { id } } = await gotInstance.post(`${getAddress()}/v3/companies`, {
            responseType: 'json',
            json: payload
        });

        tempCompany = id;

        expect(statusCode).to.be.equal(201);

        const doc = await CouchDbService.adapter.get(tempCompany);

        valid = ajv.validate('company_v3', doc);
        if (!valid) console.log(ajv.errors);

        expect(valid).to.be.true;
        expect(statusCode).to.be.equal(201);
    });


    it('PUT /v3/companies', async () => {
        const payload = {
            type: ['client'],
            name: 'WWW Ltd.',
            offices: ['office1', 'office1'],
            country: {
                id: 'country_us',
                name: 'USA',
                code: 'US'
            },
            certificate: '12345678901',
            incorporated_on: '2010-11-24'
        };

        let valid = ajv.validate('client_company_v3#/definitions/update', payload);

        if (!valid) console.log(ajv.errors);
        expect(valid).to.be.true;

        const { statusCode } = await gotInstance.put(`${getAddress()}/v3/companies/${tempCompany}`, {
            responseType: 'json',
            json: payload
        });

        expect(statusCode).to.be.equal(204);

        const doc = (await CouchDbService.adapter.get(tempCompany)) as ICompany;

        valid = ajv.validate('company_v3', doc);
        if (!valid) console.log(ajv.errors);
        expect(valid).to.be.true;

        expect(doc.type).to.be.deep.equal(payload.type);
        expect(doc.name).to.be.equal(payload.name);
        expect(doc.offices).to.be.deep.equal(payload.offices);
        expect(doc.certificate).to.be.equal(payload.certificate);
        expect(doc.incorporated_on).to.be.equal(
            moment(payload.incorporated_on).toISOString()
        );
    });

    it('DELETE /v3/companies/<id>', async () => {
        const { statusCode } = await gotInstance.delete(`${getAddress()}/v3/companies/${tempCompany}`, {
            responseType: 'json'
        });

        expect(statusCode).to.be.equal(204);

        try {
            const doc = (await CouchDbService.adapter.get(tempCompany)) as ICompany;

            expect(doc).to.be.not.undefined;
        } catch (error) {
            expect(error.statusCode).to.be.equal(404);
        }
    });

});
