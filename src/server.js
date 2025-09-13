const http = require('http');
const { app } = require('./app');

async function start(port = process.env.PORT || 3000) {
  return new Promise((resolve) => {
    const server = http.createServer(app);
    server.listen(port, () => resolve(server));
  });
}

if (require.main === module) {
  start().then((server) => {
    const address = server.address();
    console.log(`REST API listening on http://localhost:${address.port}`);
  });
}

module.exports = { start };

