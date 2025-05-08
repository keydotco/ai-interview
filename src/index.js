const blocked = require('blocked');
const server = require('./server.js');

(async () => {
  server.start();
})();

blocked((ms) => {
  console.warn(`event-loop-blocked: ${ms}ms`);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled promise rejection: ', err);
  console.error(err.stack);
});