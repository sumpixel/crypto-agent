import eth from './client/eth';
import config from './config';

eth.connect(config.connection.eth);
