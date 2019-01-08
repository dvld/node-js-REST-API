// Primary API file

// dependencies
const http = require('http');

// server will respond to all requests with a string
const server = http.createServer(function (req, res) {
  res.end('Hello World\n');
});

// start server and listen
server.listen(3000, function () {
  console.log('The server is listening on port 3000');
});
