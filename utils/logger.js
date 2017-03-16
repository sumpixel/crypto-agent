import winston from 'winston';
import util from 'util';

const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      level: 'debug',
      timestamp: true,
      colorize: true,
      prettyPrint: meta => `\n${util.inspect(meta, { colors: false })}`,
    }),
  ],
});

const logStream = {
  write: (data) => {
    logger.info(data.replace(/\n$/, ''));
  },
};

export default logger;
export { logStream };
