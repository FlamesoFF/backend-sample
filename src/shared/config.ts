import path from 'path';
import fs from 'fs';
import nconf from 'nconf';
import { Configuration } from '../api/@types/api/common.types';


const { config: configFilePath = 'config.template.json' } = nconf.argv().load();

console.log(`Using config: ${configFilePath}`);

if (!configFilePath) {
    throw `Configuration file was not specified!
    Use "config.template.json" to create your own configuration file.
    Run application with "--config <path>" flag`;
}

const pathConfig = path.resolve(process.cwd(), configFilePath);


let CONFIG: Configuration;

try {
    CONFIG = <Configuration>JSON.parse(fs.readFileSync(pathConfig, 'utf-8'));
} catch (error) {
    console.error(error);
    process.exit(1);
}

export { CONFIG };