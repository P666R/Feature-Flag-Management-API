import { envConfig } from '../config/env.config.js';
import fs from 'fs';
import path from 'path';
import morgan from 'morgan';
import DailyRotateFile from 'winston-daily-rotate-file';
import { createLogger, format, transports } from 'winston';

const { combine, timestamp, json, colorize, printf } = format;

// * Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const isDevelopment = envConfig.isDevelopment;
const isTest = envConfig.isTest;

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

// * Console transport
const consoleTransport = new transports.Console({
  format: combine(
    timestamp({ format: 'YYYY-MM-DD hh:mm:ss.SSS A' }),
    colorize(),
    printf(
      ({ level, message, timestamp }) => `${timestamp} [${level}]: ${message}`,
    ),
  ),
});

const transportsList = [fileRotateTransport, errorRotateTransport];

if (isDevelopment && !isTest) {
  transportsList.push(consoleTransport);
}

// * Winston logger with specified formats and transports
export const systemLogs = createLogger({
  level: isDevelopment ? 'debug' : 'info',
  format: combine(timestamp({ format: 'YYYY-MM-DD hh:mm:ss.SSS A' }), json()),
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
  exitOnError: false, // * Don’t exit on uncaught exceptions
  silent: isTest, // * Silence logs in test environment
});

// * Morgan middleware for logging HTTP requests without JSON parse/stringify overhead
export const morganMiddleware = morgan(
  (tokens, req, res) => {
    const logData = {
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: Number.parseFloat(tokens.status(req, res)),
      content_length: tokens.res(req, res, 'content-length') || '0', // * Fallback for undefined
      response_time: Number.parseFloat(tokens['response-time'](req, res)),
    };
    systemLogs.info('incoming-request', logData); // * Log the data directly
    return null; // * Morgan doesnt need the return value
  },
  {
    stream: { write: () => {} }, // * Dummy stream since we log directly
  },
);

// * Log startup
systemLogs.info(`Logger initialized in ${envConfig.NODE_ENV} mode`);

/** 
 * Morgan middleware for logging HTTP requests with JSON parse/stringify
 export const morganMiddleware = morgan(
  (tokens, req, res) => {
    return JSON.stringify({
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: Number.parseFloat(tokens.status(req, res)),
      content_length: tokens.res(req, res, 'content-length') || '0',
      response_time: Number.parseFloat(tokens['response-time'](req, res)),
    });
  },
  {
    stream: {
      write: (message) => systemLogs.info('incoming-request', JSON.parse(message)),
    },
  },
);
 */
