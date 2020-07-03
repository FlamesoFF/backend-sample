import axios from 'axios';
import elasticsearch from 'elasticsearch';
import mysql from 'mysql';
import util from 'util';
import { getConfig } from './utils/helper';

const
    // axios = require('axios'),
    // elasticsearch = require('elasticsearch'),
    // util = require('util'),
    config = getConfig(),
    todoApi = config.API.todo,
    mysqlSetting = config.mysql.apollo,
    // mysql = require('mysql'),
    mysqlDb = mysql.createPool({
        host: mysqlSetting.host,
        user: mysqlSetting.username,
        password: mysqlSetting.password,
        database: mysqlSetting.database,
        port: mysqlSetting.port
    }),
    esSetting = config.elasticsearch,
    client = new elasticsearch.Client({
        host: esSetting
    });

//@ts-ignore
mysqlDb.query = util.promisify(mysqlDb.query);

const createTask = async (payload) => {
    return await axios.post(todoApi, payload);
};

const updateStatus = async (document) => {
    const company = document.company.value || null;
    const certificate = document.company.fields.code.split(':')[1].trim() || null;
    const query = 'update companies_to_shred_sc s set shred_status = \'done\' where s.company=? and s.certificate=?';

    await mysqlDb.query(query, [company, certificate]);
};

const updateCompanyShredStatus = async (document) => {
    const query = 'update companies c set file_status = \'shredded\' where c.guid=?';
    const companyGuid = document.company.doc_id || null;

    await mysqlDb.query(query, [companyGuid]);
};

const getTask = async (payload) => {
    const query = {
        'bool': {
            'must': [{
                'match_phrase': {
                    'type': 'shred'
                }
            },{
                'match_phrase': {
                    'content': payload.content
                }
            },{
                'match_phrase': {
                    'company.doc_id': payload.entity_guid
                }
            }],
            'must_not': [],
            'should': []
        }
    };
    const response = await client.search({
        index: 'todos',
        type: 'todo',
        body: {
            query,
            size: 1
        }
    });

    if (response.hits.hits && response.hits.hits.length) {
        return response.hits.hits[0];
    }

    return null;
};

const processDocument = async (document, setting) => {
    const payload = setting.defaults.payloads.find(p => {
        return p.enable && p.condition(document);
    });

    if (payload) {
        if (document.company) {
            payload.body.entity_guid = document.company.doc_id;
        }
        if (document.authority) {
            payload.body.authority = document.authority;
        }

        const task = await getTask(payload.body);

        if (!task){
            await createTask(payload.body);
        }
    }
    if (document.completed) {
        if (document.content === 'Shred file') {
            await updateCompanyShredStatus(document);
        }
        if (['File to FC', 'Shred file'].includes(document.content) || (document.comments || []).some(c => c.body.trim().toLowerCase().includes('not found'))) {
            await updateStatus(document);
        }
    }
};

const script = {
    apply: async (change, setting, params) => {
        const isDeleted = change.deleted;
        const document = change.doc;

        if (isDeleted) {
            //handle delete
        } else {
            await processDocument(document, setting);
        }
    }
};

module.exports = script;