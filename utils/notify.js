import request from 'superagent';
import config from '../config';
import logger from './logger';

function notifyFundReceived(txInfo) {
  request
    .post(config.notifyURI.fundReceived)
    .send(txInfo)
    .end((err, resp) => {
      if (!err && resp.ok) {
        logger.debug('Notify fund received success', txInfo);
      } else {
        // TODO resend notification if failed?
        logger.error('Notify fund received failed', err || resp.body, txInfo);
      }
    });
}

function notifyNewBlock(blockInfo) {
  request
    .post(config.notifyURI.newBlock)
    .send(blockInfo)
    .end((err, resp) => {
      if (!err && resp.ok) {
        logger.debug('Notify new block success', blockInfo);
      } else {
        // TODO resend notification if failed?
        logger.error('Notify new block failed', err || resp.body, blockInfo);
      }
    });
}

export default {
  notifyFundReceived,
  notifyNewBlock,
};
