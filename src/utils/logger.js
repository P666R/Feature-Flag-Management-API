import { envConfig } from '../config/env.config.js';
import fs from 'fs';
import path from 'path';
import morgan from 'morgan';
import DailyRotateFile from 'winston-daily-rotate-file';
import { createLogger, format, transports } from 'winston';

const { combine, timestamp, colorize, printf } = format;

// * Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const isDevelopment = envConfig.isDevelopment;
const isTest = envConfig.isTest;

// * Custom format to merge message and metadata into one JSON object
const customJsonFormat = format((info) => {
  const { timestamp, level, message, ...metadata } = info;
  return {
    timestamp,
    level,
    message,
    ...metadata, // * Spread metadata into the top-level object
  };
})();

// * File rotation transports
const fileRotateTransport = new DailyRotateFile({
  filename: 'logs/combined-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d',
  maxSize: '20m',
});

const errorRotateTransport = new DailyRotateFile({
  filename: 'logs/error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d',
  maxSize: '20m',
  level: 'error',
});

// * Console transport for development
const consoleTransport = new transports.Console({
  format: combine(
    timestamp({ format: 'YYYY-MM-DD hh:mm:ss.SSS A' }),
    colorize(),
    printf(({ level, message, timestamp, ...metadata }) => {
      const metaString = Object.keys(metadata).length
        ? ' ' + JSON.stringify(metadata)
        : '';
      return `${timestamp} [${level}]: ${message}${metaString}`;
    }),
  ),
});

const transportsList = [fileRotateTransport, errorRotateTransport];
if (isDevelopment && !isTest) {
  transportsList.push(consoleTransport);
}

// * Winston logger with combined format
export const systemLogs = createLogger({
  level: isDevelopment ? 'debug' : 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD hh:mm:ss.SSS A' }),
    customJsonFormat,
    format.json(),
  ),
  transports: transportsList,
  exceptionHandlers: [
    new DailyRotateFile({
      filename: 'logs/exceptions-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      maxSize: '20m',
    }),
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      filename: 'logs/rejections-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      maxSize: '20m',
    }),
  ],
  exitOnError: false,
  silent: isTest,
});

// * Morgan middleware for HTTP request logging
export const morganMiddleware = morgan((tokens, req, res) => {
  const logData = {
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: Number.parseFloat(tokens.status(req, res)),
    content_length: tokens.res(req, res, 'content-length') || '0',
    response_time: Number.parseFloat(tokens['response-time'](req, res)),
  };
  systemLogs.info('incoming-request', logData);
  return null; // * Morgan doesn't need a return value since we're logging directly
});

// Log startup
systemLogs.info(`Logger initialized in ${envConfig.NODE_ENV} mode`);
