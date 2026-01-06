import winston from 'winston';
import config from 'config';

const level = config.get<string>('log.level');
const disabled = config.get<boolean>('log.disabled');

const logger = winston.createLogger({
  level: level,
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
  ),
  transports: [new winston.transports.Console({ silent: disabled })],
});

export const getLogger = () => logger;