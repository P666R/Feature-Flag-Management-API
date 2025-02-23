import morgan from 'morgan';
import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';

const { combine, timestamp, json, colorize, printf } = format;

const isDevelopment = process.env.NODE_ENV === 'development';

//* Configure daily rotating file transport for combined logs
const fileRotateTransport = new transports.DailyRotateFile({
  filename: 'logs/combined-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d',
});

const errorRotateTransport = new transports.DailyRotateFile({
  filename: 'logs/error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d',
  level: 'error',
});

const consoleTransport = new transports.Console({
  format: combine(
    colorize(),
    printf(({ level, message, timestamp }) => {
      return `${format(timestamp, { format: 'YYYY-MM-DD hh:mm:ss.SSS A' })} [${level}]: ${JSON.stringify(message)}`;
    }),
  ),
});

const transportsList = [
  fileRotateTransport,
  errorRotateTransport,
  new transports.File({ level: 'error', filename: 'logs/error.log' }),
];

if (isDevelopment) {
  transportsList.push(consoleTransport);
}

//* Create a Winston logger with specified formats and transports
export const systemLogs = createLogger({
  level: isDevelopment ? 'debug' : 'http',
  format: combine(timestamp({ format: 'YYYY-MM-DD hh:mm:ss.SSS A' }), json()),
  transports: transportsList,
  exceptionHandlers: [new transports.File({ filename: 'logs/exceptions.log' })],
  rejectionHandlers: [new transports.File({ filename: 'logs/rejections.log' })],
});

//* Define Morgan middleware for logging HTTP requests
export const morganMiddleware = morgan(
  (tokens, req, res) => {
    const logData = {
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: Number.parseFloat(tokens.status(req, res)),
      content_length: tokens.res(req, res, 'content-length'),
      response_time: Number.parseFloat(tokens['response-time'](req, res)),
    };
    return JSON.stringify(logData);
  },
  {
    stream: {
      write: (message) => {
        const data = JSON.parse(message);
        systemLogs.info('incoming-request', data);
      },
    },
  },
);
