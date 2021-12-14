import express from 'express';
import cors from 'cors';
import http from 'http';
import morgan from './middlewares/morgan';
import * as config from './env';
import * as Routes from './routes';
import errorHandler from './middlewares/errorHandler';
import successHandler from './middlewares/successHandler';
import logger from './middlewares/logger';
import './connections';

const app = express();
const server = http.createServer(app);

app.use(morgan);

app.use('/uploads', express.static('uploads'));
app.use(cors());
app.use(express.json());

// app.use('/', routes);
app.get('/', (req, res) => {
  res.send({ working: 'Working ....' });
});
app.use('/api', Routes.default);
app.use(errorHandler);
app.use(successHandler);

server.listen(config.port, () => {
  logger.info(`Server is up and running @ http://localhost:${config.port}`);
});
