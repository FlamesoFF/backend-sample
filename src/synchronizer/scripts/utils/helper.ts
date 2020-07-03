import check from 'check-types';
import { DocumentGetParams, DocumentGetResponse } from 'nano';
import nconf from 'nconf';
import path from 'path';
import { IndexSignature } from '../../@types/shared';
import { CouchDbService } from '../../../services/couchDb';
import { ApolloDocument } from '../../../@types/types';
import { PropertyGetter } from '../../@types/models';


export const _args = nconf.argv().load();

const {
    config,
    settings
} = _args;


export class Strings {

    static capitalize(str: string = '') {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    static cleanName(str: string = '') {
        try {
            return str.replace(/["\\]/g, '');
        } catch (error) {
            return str;
        }
    }

}

export class Arrays {
    /**
     * @param {Array} a
     * @param {Array} b
     * @returns Array
     */
    static intersection(a, b) {
        const s1 = new Set(a);
        const s2 = new Set(b);

        return [...s1].filter(i => s2.has(i));
    }
}

export class Objects {

    static pickProps(object: object, props: string[]): IndexSignature {
        const picked = {};

        new Set(props).forEach(prop => {
            if (object[prop]) {
                picked[prop] = object[prop];
            }

        });

        return picked;
    }

    static extractProps(object: object, getters: { [key: string]: PropertyGetter }): IndexSignature {
        const extracted = {};
        const keys = Object.keys(getters);

        new Set(keys).forEach(key => {
            if (getters[key](object)) extracted[key] = getters[key](object);
        });

        return extracted;
    }


    /**
     * @param {Object} object
     * @returns Object
     */
    static getFlat = (object) => {

        if (check.not.object(object)) {
            return {};
        }


        return Object.entries(object).reduce((accumulator, [key, value]) => {

            if (
                check.not.undefined(value) &&
                check.not.null(value) &&
                check.not.object(value)
            ) {
                accumulator[key] = value;
            }


            return accumulator;

        }, {});

    }
}

export class Relations {
    getCLassByType(type) {

    }
}


export const args = () => {
    return _args;
};

export const getConfig = () => {
    const configFilePath = path.resolve(__dirname, '../..', config || 'config.js');


    return require(configFilePath);
};


export const getSettings = () => {
    const settingFilePath = path.resolve(__dirname, '../..', settings || 'setting.js');


    return require(settingFilePath);
};

export namespace NanoDB {
    interface GetParams {
        dbName: string;
        id: string;
        params?: DocumentGetParams;
    }

    // TODO: make this resolve automatically. One adapter with auto-switching between DBs.
    export const get = async ({ dbName, id, params }: GetParams): Promise<(DocumentGetResponse & ApolloDocument) | null> => {
        CouchDbService.switchDb(dbName);

        try {
            return await CouchDbService.adapter.get(id, params);
        } catch (error) {
            return null;
        }
    };

    export const getPreviousRevision = async (dbName: string, id: string): Promise<ApolloDocument | null> => {
        let docAvailable = false;
        let revision = '';

        try {
            let {
                _revs_info: [
                    // skip 0 element
                    ,
                    { rev, status }
                ]
            } = await get({
                dbName,
                id,
                params: {
                    revs_info: true
                }
            });

            revision = rev;
            if (status === 'available') docAvailable = true;

        } catch (error) {
        }

        if (docAvailable) {
            return await get({
                dbName,
                id,
                params: { rev: revision }
            });
        } else {
            return null;
        }
    };
}