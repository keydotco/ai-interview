const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const server = express();

server.use(
  cors({
    origin: ['*'],
    methods: ['GET'],
    exposedHeaders: ['X-Requested-With', 'Content-Type', 'X-Api-Access-Token'],
    credentials: true,
  }),
);
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.get('/_health', (_, res) => res.status(200).json({ status: 'ok' }));
server.use('/', routes);

server.start = () => {
  const port = process.env.APP_PORT || 4133;

  server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

module.exports = server;
