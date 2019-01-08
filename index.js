// Primary API file

// dependencies
var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;

// server will respond to all requests with a string
var server = http.createServer(function (req, res) {

  // get the url and parse it
  var parsedUrl = url.parse(req.url, true);

  // get the path
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // get query string as an object, qSO = queryStringObject
  var qSO = parsedUrl.query;

  // get the http method
  var method = req.method.toLowerCase();

  // get headers as an object
  var headers = req.headers;

  // get payload, if any
  var decoder = new StringDecoder('utf-8');
  var buffer = '';

  // decodes request data into a string and appends to the buffer
  req.on('data', function (data) {
    buffer += decoder.write(data);
  });

  req.on('end', function () {
    buffer += decoder.end();

    // send the response
    res.end('Hello World\n');

    // log the request path
    // console.log('Request received on path: ' + trimmedPath + '\n' + 
    // ' with method: ' + method + '\n' +
    // ' with query string parameters: ', qSO);
    // console.log('Request received with headers: ', headers);
    console.log('Request received with payload: ', buffer);

  });

});

// start server and listen
server.listen(3000, function () {
  console.log('The server is listening on port 3000');
});

