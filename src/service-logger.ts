import winston, { Logger } from 'winston';
import path from 'path';
import moment from 'moment';
import util from 'util';


interface Data {
    message?: string
    data?: object | string

    [key: string]: object | string
}

interface LogData extends Data {
    type?: 'INFO' | 'REQUEST' | 'ERROR'
}


class ServiceLogger {
    private logger: Logger
    private path = path.resolve(__dirname, '../logs/')

    constructor(private name: string) {
        const date = moment().format('YYYY-MM-DD');

        this.logger = winston.createLogger({
            level: 'verbose',
            defaultMeta: { service: 'user-service' },
            format: winston.format.printf((info) => {
                const { level, message = '-' } = info;

                // utc_date | service_name | info_level | type | ?message? | ?data?
                const formatted = [
                    ServiceLogger.currentDate,
                    this.name,
                    level.toUpperCase(),
                    `\n${message}`
                ].filter(item => !!item).join(' | ');

                return `> ${formatted} \n`;
            }),
            transports: [
                // new winston.transports.Console(),
                new winston.transports.File({
                    filename: path.join(this.path, this.name, `/${date}.log`),
                })
            ]
        });
    }


    static get currentDate(): string {
        return new Date(Date.now()).toUTCString();
    }


    private log(level: 'verbose' | 'error', data: LogData) {
        this.logger.log({
            level,
            message: util.inspect(data)
        });
    }


    logError(data: Data) {
        this.log('error', { type: 'ERROR', ...data });
    }

    logInfo(data: Data) {
        this.log('verbose', { type: 'INFO', ...data });
    }

    logRequest(data: Data) {
        this.log('verbose', { type: 'REQUEST', ...data });
    }
}

export const syncLogger = new ServiceLogger('sync-logger');
export const apiLogger = new ServiceLogger('api-logger');
