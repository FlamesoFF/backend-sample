import { Arrays, Objects, Strings } from '../../../src/synchronizer/scripts/utils/helper';
import { expect } from 'chai';


describe('Helper', () => {

    describe('Objects', () => {

        it('getFlat', () => {
            const good1 = {
                type: 'related_to',
                node: {
                    '_id': 'www-ltd',
                    'class': 'company',
                    'name': 'WWW Ltd.'
                }
            };

            const bad1 = {
                type: 'related_to',
                date: '2018-01-23',
                parameters: {
                    one: 'one',
                    two: 'two'
                },
                node: {
                    '_id': 'www-ltd'
                }
            };

            const bad2 = {
                type: 'related_to',
                date: '2018-01-23',
                parameters: undefined,
                node: {
                    '_id': 'www-ltd'
                }
            };

            const bad3 = {
                type: 'related_to',
                date: '2018-01-23',
                parameters: null,
                node: {
                    '_id': 'www-ltd'
                }
            };

            const bad4 = undefined;
            const bad5 = null;
            const bad6 = NaN;


            expect(Objects.getFlat(good1))
                .to.be.deep.equal({ type: 'related_to' });

            expect(Objects.getFlat(bad1)).to.be.deep.equal({
                type: 'related_to',
                date: '2018-01-23'
            });

            expect(Objects.getFlat(bad2)).to.be.deep.equal({
                type: 'related_to',
                date: '2018-01-23'
            });

            expect(Objects.getFlat(bad3)).to.be.deep.equal({
                type: 'related_to',
                date: '2018-01-23'
            });

            expect(Objects.getFlat(bad4)).to.be.deep.equal({});

            expect(Objects.getFlat(bad5)).to.be.deep.equal({});

            expect(Objects.getFlat(bad6)).to.be.deep.equal({});
        });

        it('pickProps', () => {
            const testObj = {
                type: 'related_to',
                date: '2018-01-23',
                parameters: undefined,
                node: {
                    '_id': 'www-ltd'
                }
            };

            const result = Objects.pickProps(testObj, ['type', 'node']);

            expect(result).to.be.deep.equal({
                type: 'related_to',
                node: {
                    '_id': 'www-ltd'
                }
            });
        });


    });

    describe('Arrays', () => {

        it('intersection', () => {
            const arr1 = [1, 2, 3, 4, 5];
            const arr2 = [3, 4, 5, 6, 7];

            expect(Arrays.intersection(arr1, arr2))
                .to.be.deep.equal([3, 4, 5]);
        });

    });

    describe('Strings', () => {

        it('cleanName', () => {
            const name = 'The "Name"';

            expect(Strings.cleanName(name)).to.match(/^[\w ]+$/);
        });

    });

});