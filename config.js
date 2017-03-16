let isunpayrpc_host = 'localhost';
let isunpayrpc_port = 27184;
let geth_ws_host = 'localhost';
let geth_ws_port = 8546;
let bitcoind_config = {
  host: 'localhost',
  password: '7hQqOQplnvykuzQCWEH3hMlRptYNj_p2Xf6Nvi1NjBg=',
  port: 8332,
  username: 'sum',
};

if (process.env.NODE_ENV === 'production') {
  isunpayrpc_host = '192.168.100.92';
  geth_ws_host = '192.168.100.117';
  bitcoind_config = {
    host: '192.168.100.117',
    password: '3qBqaKkDVMA6pVE0IvEtfIqjqNmj_M1QiCWB3JiflRk=',
    port: 18332,
    username: 'alex',
  };
} else if (process.env.NODE_ENV === 'staging') {
  isunpayrpc_host = '192.168.100.92';
  geth_ws_host = '192.168.100.117';
  bitcoind_config = {
    host: '192.168.100.117',
    password: '3qBqaKkDVMA6pVE0IvEtfIqjqNmj_M1QiCWB3JiflRk=',
    port: 18332,
    username: 'alex',
  };
}

const isunpayNotify = `http://${isunpayrpc_host}:${isunpayrpc_port}/notify`;

export default {
  connection: {
    eth: {
      wsPath: `ws://${geth_ws_host}:${geth_ws_port}`,
      reconnectInterval: 5000,  // 5 seconds
    },
    btc: bitcoind_config,
  },

  notifyURI: {
    newBlock: `${isunpayNotify}/newblock`,
    fundReceived: `${isunpayNotify}/received`,
  },

  port: 27185,
};
