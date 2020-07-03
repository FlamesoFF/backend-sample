import axios from 'axios';
import elasticsearch from 'elasticsearch';
import mysql from 'mysql';
import util from 'util';
import { getConfig } from './utils/helper';

const
    // elasticsearch = require('elasticsearch'),
    // axios = require('axios'),
    // util = require('util'),
    config = getConfig(),
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

// @ts-ignore
mysqlDb.query = util.promisify(mysqlDb.query);

const TASK_CONTENT = 'On-going Monitoring Inspection: check task in Data Base/Inspections to follow up',
    TASK_ASSIGNED_BY = 'ff3f63eeeaec73fd38499d0eaf2e6d0d',
    TASK_CREATOR = 'n.mishicheva',
    TASK_ENDPOINT = 'http://192.168.1.5:3013/tasks',
    TASK_LIMIT = 5;

const updateStatus = async (document) => {
    const companyName = document.company.value || null;
    const certificate = document.company.fields.code.split(':')[1].trim() || null;
    const query = 'update tmp_inspections ti set ti.task_status=\'done\' where ti.CompanyName=? and ti.Certificate=?';

    await mysqlDb.query(query, [companyName, certificate]);
};

const getTask = async (company) => {
    const query = {
        'bool': {
            'must': [{
                'match_phrase': {
                    'content': TASK_CONTENT
                }
            }, {
                'match_phrase': {
                    'assigned_by.fields.code': 'CD'
                }
            }, {
                'match_phrase': {
                    'responsible.doc_id': company.manager
                }
            }, {
                'match_phrase': {
                    'company.doc_id': company.guid
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
            size: 100
        }
    });

    if (response.hits.hits && response.hits.hits.length) {
        return response.hits.hits[0];
    }

    return null;
};

const getIncompleteInspectionTasks = async (manager) => {
    const query = {
        'bool': {
            'must': [{
                'match_phrase': {
                    'content': TASK_CONTENT
                }
            }, {
                'match_phrase': {
                    'assigned_by.fields.code': 'CD'
                }
            }, {
                'match_phrase': {
                    'responsible.doc_id': manager
                }
            }, {
                'match_phrase': {
                    'completed': 'false'
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
            size: 100
        }
    });

    if (response.hits.hits && response.hits.hits.length) {
        return response.hits.hits;
    }

    return null;
};

const getCompanyListByManager = async (manager, limit) => {
    const query = `select c.ID as id, c.guid, c.Certificate as certificate, c.CompanyName as name, ti.Comments as comments,  m.username as manager
    from tmp_inspections ti inner join company_inspections ci on ti.CompanyName = ci.company_name
            inner join companies c on ci.company_id = c.id
            left join clients cl on c.ClientId = cl.ID
            left join managers m on cl.Manager = m.Manager
    where ti.Comments is not null and 
        ci.purpose = 'On-Going Monitoring' and 
        ci.inspected_on = '2019-07-30' and 
        ci.inspected_by = 'Natalia Mishicheva' and 
        ci.status = 'follow up' and m.username =? and (ti.task_created is null or ti.task_created <> 1) and 
        ti.task_status is null
        limit ${limit}`;


    return await mysqlDb.query(query, [manager]);
};

const createTask = async (company) => {
    const payload = {
        content: TASK_CONTENT,
        creator_guid: TASK_CREATOR,
        assigned_by_guid: TASK_ASSIGNED_BY,
        responsible_guid: company.manager,
        entity_guid: company.guid,
        start_task: false,
        type: ['todo', 'kyc-inspection'],
        responsible_group: {
            doc_id: null,
            value: ''
        }
    };

    return await axios.post(TASK_ENDPOINT, payload);
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const setTaskCreated = async (company) => {
    const query = 'update tmp_inspections ti set ti.task_created=1 where ti.CompanyName=? and ti.Certificate=?';


    return await mysqlDb.query(query, [company.name, company.certificate]);
};

const processCompanyList = async (companies) => {
    for (const company of companies) {
        company.manager = ['i.guseva', 'k.boiprav'].includes(company.manager) ? 'n.mishicheva' : company.manager;
        console.log('\t->', company.name);
        try {
            const task = await getTask(company);

            if (!task) {
                await createTask(company);
                await setTaskCreated(company);
                await sleep(1000);
            }
        } catch (error) {
            console.error(error);
        }
    }
};

const processDocument = async (document, setting) => {
    if (document.completed) {
        if (document.type && document.type.includes('kyc-inspection') && document.content === 'On-going Monitoring Inspection: check task in Data Base/Inspections to follow up') {
            await updateStatus(document);
        }
        const manager = document.responsible.doc_id;
        const tasks = await getIncompleteInspectionTasks(manager);
        const limit = Math.max(TASK_LIMIT - tasks.length, 0);

        if (limit) {
            const companies = await getCompanyListByManager(manager, limit);

            await processCompanyList(companies);
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