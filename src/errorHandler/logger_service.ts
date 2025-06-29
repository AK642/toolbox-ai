import winston, { Logform, LoggerOptions } from 'winston';

const myFormat = () => {
    const currentTime = new Date();
    const currentOffset = currentTime.getTimezoneOffset();
    const ISTOffset = 330;   // IST offset UTC +5:30
    return new Date(currentTime.getTime() + (ISTOffset + currentOffset) * 60000);
};

// Define types for the input parameters
interface ErrorObject {
    stack?: string;
}

class LoggerService {
    route: string;
    logger: winston.Logger;

    constructor(route: string) {
        this.route = route;

        const loggerOptions: LoggerOptions = {
            transports: [
                new winston.transports.File({
                    filename: `./errorHandler/${route}.log`
                })
            ],
            format: winston.format.printf((info: Logform.TransformableInfo & { obj?: ErrorObject }) => {
                let message = `${myFormat()} | ${info.level.toUpperCase()} | ${route}.log | ${info.message} | `;
                message = info.obj?.stack ? `${message}Error Stack: ${JSON.stringify(info.obj.stack)} | ` : message;
                return message;
            })
        };

        // Creating the logger instance
        this.logger = winston.createLogger(loggerOptions);
    }
    async error(obj: ErrorObject, message: string) {
        this.logger.log('error', message, {
            obj
        });
    }
}

export = LoggerService;