import winston from 'winston';

const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      level: 'debug',
      timestamp: true,
      colorize: true,
      prettyPrint: true,
    }),
  ],
});

const logStream = {
  write: (data) => {
    winston.info(data.replace(/\n$/, ''));
  },
};

export default logger;
export { logStream };
