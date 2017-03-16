import Client from 'bitcoin-core';
import { Router } from 'express';
import logger from '../utils/logger';
import notify from '../utils/notify';

let client;
let latestBlockHash = '';

function init(options) {
  client = new Client(options);
}

function handleBlockNotify(req, res) {
  const { blockhash: blockHash } = req.body;
  latestBlockHash = blockHash;

  logger.debug('[BTC] Block', blockHash);
  client.getBlock(blockHash)
    .then((block) => {
      const blockInfo = {
        currency: 'BTC',
        blockHash,
        blockNumber: block.height,
      };
      notify.notifyNewBlock(blockInfo);
      res.json(blockInfo);
    })
    .catch((err) => {
      logger.error(`[BTC] Failed to process new block ${blockHash}`, err.message);
      res.status(500).json({
        message: `Failed to process block ${blockHash}`,
        reason: err.message,
      });
    });
}

function handleWalletNotify(req, res) {
  const { txid: txID } = req.body;
  logger.debug('[BTC] Wallet', txID);
  client.getTransaction(txID)
    .then((tx) => {
      if (tx.confirmations === 0) {
        res.json({ txID, message: 'Ignored unconfirmed transaction' });
        return Promise.reject(null);
      }
      const receiveDetail = tx.details.find((detail) => {
        return detail.category === 'receive';
      });
      if (!receiveDetail) {
        res.json({ txID, message: 'Ignored transaction sent' });
        return Promise.reject(null);
      }
      return Promise.all([tx, receiveDetail.address, client.getBlock(tx.blockhash)]);
    })
    .then((results) => {
      const [tx, receivingAddress, block] = results;
      // TODO wait for 6 confirmations
      const txInfo = {
        address: receivingAddress,
        value: String(tx.amount),
        currency: 'BTC',
        txHash: txID,
        blockHash: tx.blockhash,
        blockNumber: block.height,
      };
      notify.notifyFundReceived(txInfo);
      res.json(txInfo);
    })
    .catch((err) => {
      if (err) {
        logger.error(`[BTC] Failed to process new transaction ${txID}`, err.message);
        res.status(500).json({
          message: `Failed to process transaction ${txID}`,
          reason: err.message,
        });
      }
    });
}

function getInfo() {
  return client.getInfo()
    .then((serverInfo) => {
      return Promise.resolve({
        server: serverInfo,
        client: { latestBlockHash },
      });
    });
}

const router = Router();
router.post('/btc/block', handleBlockNotify);
router.post('/btc/wallet', handleWalletNotify);

export default {
  init,
  router,
  getInfo,
};
