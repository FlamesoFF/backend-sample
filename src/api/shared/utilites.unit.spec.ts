import { Utils } from './utils';
import { RelationDefined, TRelation } from '../../@types/types';
import { QueryResultRow } from 'pg';
import fs from 'fs';
import path from 'path';
import { getFuzzySearchQuery } from './pgsql';
import { DocumentFetchResponse, DocumentResponseRow, MangoResponse } from 'nano';
import { IOrder } from '../../@types/data/order';
import { orderGenerator } from '../../../utils/dummy-data/order';
import { ICompany } from '../../@types/data/company';
import { companyGenerator } from '../../../utils/dummy-data/company';
import { expect } from 'chai';


describe('Utils', () => {

    it('trimArray', () => {
        const arr = [1, 2, '3', , , , '4'];
        const result = Utils.trimArray(arr);

        expect(result).to.be.deep.equal([1, 2, '3', '4']);
    });

    it('trimObject', () => {
        const ob = {
            a: 1,
            b: -1,
            c: 'two',
            d: '',
            e: true,
            f: false,
            g: null,
            h: undefined,
            i: NaN
        };

        expect(Utils.trimObject(ob)).to.be.deep.equal({
            a: 1,
            b: -1,
            c: 'two',
            d: '',
            e: true,
            f: false,
            i: NaN
        });
    });

    it('stringToMangoQueryRegex', () => {
        const str = 'john, doe,lisa';

        const result = Utils.stringToMangoQueryRegex(str);

        expect(result).to.be.equal('(?=.*john)(?=.*doe)(?=.*lisa).*');
    });


    describe('Neo4j', () => {

        it('getNeo4jNodeLabelByEntityClass', () => {
            expect(Utils.Neo4j.getNeo4jNodeLabelByEntityClass('companies')).to.be.equal('company');
            expect(Utils.Neo4j.getNeo4jNodeLabelByEntityClass('persons')).to.be.equal('person');
            expect(Utils.Neo4j.getNeo4jNodeLabelByEntityClass('couriers')).to.be.equal('courier');
            expect(Utils.Neo4j.getNeo4jNodeLabelByEntityClass('orders')).to.be.equal('order');
            expect(Utils.Neo4j.getNeo4jNodeLabelByEntityClass('tasks')).to.be.equal('task');
            expect(Utils.Neo4j.getNeo4jNodeLabelByEntityClass('files')).to.be.equal('document');
        });

    });


    describe('Relations', () => {

        it('flattenRelations', async () => {
            const filter: TRelation[] = [
                'related_to',
                'has_document',
                'has_director'
            ];

            const relations: RelationDefined[] = [
                {
                    type: 'related_to',
                    node: {
                        _id: '_id',
                        class: 'class',
                        name: 'name'
                    }
                },
                {
                    type: 'has_document',
                    node: {
                        _id: '_id',
                        class: 'class',
                        name: 'name'
                    }
                },
                {
                    type: 'has_director',
                    node: {
                        _id: '_id',
                        class: 'class',
                        name: 'name'
                    }
                }
            ];
            //  await CouchDb.adapter.get('task_v3');

            const result = Utils.Relations.flattenRelations(relations, filter);

            expect(result).to.have.property('related_to');
            expect(result['related_to']).to.be.equal(relations[0].node);
        });

    });

    describe('PostgreSQL', () => {

        it('resultsToList', async () => {
            const data: QueryResultRow = JSON.parse(
                fs.readFileSync(
                    path.resolve(__dirname, '../../../utils/db-samples/pgsql-samples.json'),
                    'utf8'
                )
            );

            const result = Utils.PostgreSQL.resultsToList(data.rows);

            result.forEach(item => {
                expect(item).to.have.property('_id');
                expect(item).to.have.property('name');
                expect(item).to.have.property('class');
                expect(item).to.have.property('weight');
            });
        });


        it('getFuzzySearchQuery', () => {
            const pattern = /from fuzzy_search_v2\('[a-zA-Z]+', *'{(.+)?}'\)/i;

            const queries = [

                getFuzzySearchQuery({
                    searchString: 'ltd',
                    className: 'company',
                    limit: 10,
                    types: ['director', 'shareholder'],
                    orderBy: 'similarity'
                }),

                getFuzzySearchQuery({
                    searchString: 'ltd',
                    orderBy: 'similarity'
                }),

                getFuzzySearchQuery({
                    searchString: 'john',
                    className: 'person',
                    limit: 100,
                    types: ['shareholder'],
                    orderBy: 'similarity'
                }),

                getFuzzySearchQuery({
                    searchString: 'john',
                    className: 'person',
                    orderBy: 'similarity'
                })

            ];

            for (const query of queries) {
                expect(query).to.match(pattern);

                const json = query.match(pattern)?.[1];
                const result = JSON.parse(`{${json || ''}}`);

                expect(typeof result === 'object').to.be.true;
            }

        });

    });


    describe('Nano', () => {

        it('normalizeResponse', async () => {
            const fetch: DocumentFetchResponse<IOrder> = {
                offset: 0,
                rows: [
                    {
                        doc: orderGenerator(1).next().value
                    } as DocumentResponseRow<IOrder>
                ],
                total_rows: 1
            };
            const find: MangoResponse<ICompany> = {
                bookmark: 'test',
                docs: [
                    <ICompany & { _id: string, _rev: string }>companyGenerator(1).next().value
                ],
                warning: 'test'
            };


            Utils.Nano.normalizeResponse(fetch).forEach(doc => {
                expect(typeof doc === 'object').to.be.true;
            });

            Utils.Nano.normalizeResponse(find).forEach(doc => {
                expect(typeof doc === 'object').to.be.true;
            });
        });

    });
});
