import express from 'express';
import bodyParser from 'body-parser';
import config from './config';
import logger from './utils/logger';
import eth from './client/eth';
import btc from './client/btc';

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

eth.connect(config.connection.eth);
btc.init(config.connection.btc);

function getInfo(req, res) {
  return Promise.all([eth.getInfo(), btc.getInfo()])
    .then((infos) => {
      const [ethInfo, btcInfo] = infos;
      res.json({ eth: ethInfo, btc: btcInfo });
    })
    .catch((err) => {
      res.status(500).json({ message: err.message });
    });
}

app.use('/notify', btc.router);
app.get('/info', getInfo);

const port = process.env.PORT || config.port || 3000;
app.listen(port, () => {
  logger.info(`Listening on port ${port}`);
});
