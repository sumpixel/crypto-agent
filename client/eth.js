import Web3 from '../packages/web3.js';
import logger from '../utils/logger';
import notify from '../utils/notify';

const web3 = new Web3();
let latestBlockNumber = 0;

function processNewTransaction(txHash, blockHash, txIndex, isAddressInsideWallet) {
  return web3.eth.getTransactionFromBlock(blockHash, txIndex)
    .then((tx) => {
      return Promise.all([tx, isAddressInsideWallet(tx.to)]);
    })
    .then((results) => {
      const [tx, isInsideWallet] = results;
      if (isInsideWallet) {
        const txInfo = {
          address: tx.to,
          value: web3.utils.fromWei(tx.value, 'ether'),
          currency: 'ETH',
          txHash: tx.hash,
          blockHash: tx.blockHash,
          blockNumber: tx.blockNumber,
        };
        notify.notifyFundReceived(txInfo);
      }
    })
    .catch((err) => {
      logger.error(`[ETH] Failed to process new transaction ${txHash}`, err.message);
    });
}

function processNewBlock(block, isAddressInsideWallet) {
  let txIndex = 0;
  const {
    hash: blockHash,
    transactions: txHashes,
  } = block;
  return Promise.all(
    txHashes.map((txHash) => {
      const txPromise = processNewTransaction(txHash, blockHash, txIndex, isAddressInsideWallet);
      txIndex += 1;
      return txPromise;
    }));
}

function processNewBlockHeader(blockHeader) {
  // FIXME hash is undefined in blockHeader from notification
  const { number: blockNumber } = blockHeader;
  latestBlockNumber = blockNumber;

  const accountPromise = web3.eth.getAccounts()
    .then((addresses) => {
      const isAddressInsideWallet = (address) => {
        return addresses.indexOf(address) >= 0;
      };
      return isAddressInsideWallet;
    });
  const blockPromise = web3.eth.getBlock(blockNumber);

  Promise.all([accountPromise, blockPromise])
    .then((results) => {
      const [isAddressInsideWallet, block] = results;
      logger.debug('[ETH] Block', blockNumber);
      return processNewBlock(block, isAddressInsideWallet);
    })
    .catch((err) => {
      // TODO should we try to process it again?
      logger.error(`[ETH] Failed to process new block ${blockNumber}`, err.message);
    })
    .then(() => {
      const blockInfo = {
        currency: 'ETH',
        // blockHash,
        blockNumber,
      };
      notify.notifyNewBlock(blockInfo);
    });
}

function subscribe() {
  web3.eth.subscribe('newBlockHeaders', (err, newBlockHeader) => {
    if (err) {
      logger.error('[ETH] Failed to subscribe to latest block', err.reason);
    }
  })
  .on('data', (newBlockHeader) => {
    processNewBlockHeader(newBlockHeader);
  })
  .on('error', (err) => {
    logger.error('[ETH] Failed to get latest block', err.reason);
  });
}

function connect(options) {
  const {
    wsPath,
    reconnectInterval,
  } = options;

  const connectionProvider = new web3.providers.WebsocketProvider(wsPath);

  connectionProvider.on('connect', () => {
    logger.info('[ETH] connected', wsPath);
    subscribe();
    // const blockHeader = { number: 583845 };
    // processNewBlockHeader(blockHeader);
  });

  connectionProvider.on('notification', (err, notification) => {
    if (!err) {
      return;
    }
    logger.info('[ETH] disconnected', wsPath);

    setTimeout(() => {
      logger.info('[ETH] reconnect', wsPath);
      connect(options);
    }, reconnectInterval);
  });

  web3.setProvider(connectionProvider);
}

function getInfo() {
  return web3.eth.getBlockNumber()
    .then((serverBlockNumber) => {
      return Promise.resolve({
        server: { blockNumber: serverBlockNumber },
        client: { blockNumber: latestBlockNumber },
      });
    });
}

export default {
  connect,
  getInfo,
};
