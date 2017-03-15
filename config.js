let isunpayrpc_host = 'localhost';
let isunpayrpc_port = 27184;
let geth_ws_host = 'localhost';
let geth_ws_port = 8546;

if (process.env.NODE_ENV === 'production') {
  isunpayrpc_host = '192.168.100.92';
  geth_ws_host = '192.168.100.117';
} else if (process.env.NODE_ENV === 'staging') {
  isunpayrpc_host = '192.168.100.92';
  geth_ws_host = '192.168.100.117';
}

const isunpayNotify = `http://${isunpayrpc_host}:${isunpayrpc_port}/notify`;

export default {
  connection: {
    eth: {
      wsPath: `ws://${geth_ws_host}:${geth_ws_port}`,
      reconnectInterval: 5000,  // 5 seconds
    },
  },

  notifyURI: {
    newBlock: `${isunpayNotify}/newblock`,
    fundReceived: `${isunpayNotify}/received`,
  },
};
