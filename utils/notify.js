import request from 'superagent';
import config from '../config';
import logger from './logger';

function notifyFundReceived(txInfo) {
  request
    .post(config.notifyURI.fundReceived)
    .send(txInfo)
    .end((err, resp) => {
      if (!err && resp.ok) {
        logger.debug('Notify fund received success', { response: resp.body, txInfo });
      } else {
        // TODO resend notification if failed?
        const message = err ? err.message : resp.body;
        logger.error('Notify fund received failed', { message, txInfo });
      }
    });
}

function notifyNewBlock(blockInfo) {
  request
    .post(config.notifyURI.newBlock)
    .send(blockInfo)
    .end((err, resp) => {
      if (!err && resp.ok) {
        logger.debug('Notify new block success', { response: resp.body, blockInfo });
      } else {
        // TODO resend notification if failed?
        const message = err ? err.message : resp.body;
        logger.error('Notify new block failed', { message, blockInfo });
      }
    });
}

export default {
  notifyFundReceived,
  notifyNewBlock,
};
