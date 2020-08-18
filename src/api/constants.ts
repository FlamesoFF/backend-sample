import { CONFIG } from '../shared/config';
import { TRelation, TRelationMeta } from '../@types/types';
import { ServerOptions } from 'spdy';
import fs from 'fs';
import path from 'path';


const { similarity = 0.1 } = CONFIG.servers.pgsql.databases.main;


export const DEFAULT_LIST_LIMIT = CONFIG.API.lists.limit || 20;
export const DEFAULT_NEO4J_QUERY_LIMIT = 1000;
export const DEFAULT_FACTOR = similarity;
export const DATE_PATTERN = 'YYYY-MM-DD hh:mm:ss';
export const ORDER_DATE_PATTERN = 'YYYY-MM-DD';
export const TASK_DATE_PATTERN = 'YYYY-MM-DD HH:mm:ss';
export const HASH_SHA_FORMAT = 'sha256';
export const HASH_MD5_FORMAT = 'md5';
export const HASH_DIGEST_FORMAT = 'base64';

export const RELATION_MAP = new Map<TRelationMeta, TRelation>([
    ['is_director', 'has_director'],
    ['is_member', 'has_member'],
    ['is_partner', 'has_partner'],
    ['is_inspection', 'has_inspection'],
    ['is_contact', 'has_contact'],
    ['is_client', 'has_client'],
    ['is_agent', 'has_agent'],
    ['ordered', 'ordered_by'],
    ['responsible_for', 'managed_by'],
    ['is_receiver', 'has_receiver'],
    ['is_sender', 'has_sender'],
    ['included_in', 'has_document'],
    ['issued', 'issued_by'],
    ['has', 'issued_to']
]);

export const RELATION_MAP_REVERSED = new Map<TRelation, TRelationMeta>([
    ['has_director', 'is_director'],
    ['has_member', 'is_member'],
    ['has_partner', 'is_partner'],
    ['has_inspection', 'is_inspection'],
    ['has_contact', 'is_contact'],
    ['has_client', 'is_client'],
    ['has_agent', 'is_agent'],
    ['ordered_by', 'ordered'],
    ['managed_by', 'responsible_for'],
    ['has_receiver', 'is_receiver'],
    ['has_sender', 'is_sender'],
    ['has_document', 'included_in'],
    ['issued_by', 'issued'],
    ['issued_to', 'has']
]);

// endpoint - class
export const ENDPOINT_CLASS_MAP = new Map([
    ['companies', 'company'],
    ['couriers', 'courier'],
    ['orders', 'order'],
    ['persons', 'person'],
    ['tasks', 'task'],
    ['files', 'file']
]);

export const RELATION_TYPE_MAP = new Map<string, Set<TRelation>>([
    ['company', new Set([
        'has_director',
        'has_member',
        'has_partner',
        'has_client',
        'has_agent',
        'has_manager',
        'has_contact',
        'has_inspection'
    ])],
    ['person', new Set([
        'has_client',
        'has_agent',
        'has_contact',
        'has_manager',
        'has_inspection'
    ])],
    ['order', new Set([
        'related_to',
        'linked_to',
        'ordered_by',
        'managed_by'
    ])],
    ['file', new Set(['related_to'])],
    ['document', new Set(['included_in'])],
    ['courier', new Set([
        'has_receiver',
        'has_sender',
        'ordered_by',
        'managed_by',
        'has_document',
        'contains'
    ])],
    ['invoice', new Set([
        'related_to',
        'issued_by',
        'issued_to'
    ])],
    ['assessment', new Set([])],
    ['member', new Set([])],
    ['receiver', new Set([])],
    ['sender', new Set([])],
    ['supporting_document', new Set([])],
    ['task', new Set([])],
    ['transaction', new Set([])]
]);
export const HOST = 'localhost';
export const SERVER_OPTIONS: ServerOptions = {
    // Fullchain file or cert file (prefer the former)
    cert: fs.readFileSync(path.resolve(__dirname, '../../ssl/server.cert')),
    // Private key
    key: fs.readFileSync(path.resolve(__dirname, '../../ssl/server.key')),

    // **optional** SPDY-specific options
    spdy: {
        protocols: [
            'h2',
            'http/1.1'
        ],
        plain: false,
        connection: {
            // Server's window size
            windowSize: 1024 * 1024,

            // **optional** if true - server will send 3.1 frames on 3.0 *plain* spdy
            autoSpdy31: false
        }
    }
};