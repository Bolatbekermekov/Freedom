import morgan from 'morgan'
import { createLogger, format, transports } from 'winston'

const { combine, timestamp, printf, colorize, errors } = format

const loggerFormat = printf(({ level, message, timestamp, stack }) => {
	return `${timestamp} [${level}] ${message} ${stack ? `\nTrace: ${stack}` : ''}`
})

export const logger = createLogger({
	level: 'info',
	format: combine(
		timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
		errors({ stack: true }),
		loggerFormat,
	),
	transports: [
		new transports.Console({
			format: combine(colorize(), loggerFormat),
		}),
		new transports.File({
			level: 'error',
			filename: 'errors.log',
			format: loggerFormat,
		}),
	],
})

const httpLogger = createLogger({
	level: 'http',
	format: combine(
		timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
		errors({ stack: true }),
		loggerFormat,
	),
	transports: [
		new transports.Console({
			format: combine(colorize(), loggerFormat),
		}),
		new transports.File({
			level: 'error',
			filename: 'errors.log',
			format: loggerFormat,
		}),
	],
})

export const morganMiddleware = morgan(
	':method :url :status :res[content-length] - :response-time ms',
	{
		stream: {
			write: message => httpLogger.http(message.trim()),
		},
	},
)
