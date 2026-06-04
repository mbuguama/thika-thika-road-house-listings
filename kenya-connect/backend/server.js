const http = require('http');
const app = require('./app');
const { port } = require('./config/env');
const { attachSocketServer } = require('./socket');

const server = http.createServer(app);
attachSocketServer(server);

server.listen(port, () => {
  console.log(`Connect254 running on http://localhost:${port}`);
});
