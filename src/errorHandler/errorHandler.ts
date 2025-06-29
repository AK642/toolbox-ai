import Logger from './logger_service';
const logger = new Logger('errors');

export = (err: Error, url: string) => {
    logger.error(err, url);
};