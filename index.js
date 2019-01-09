// 
// Primary API file
// 

// dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');
// var _data = require('./lib/data');

// instantiate http server
var httpServer = http.createServer(function (req, res) {
  unifiedServer(req, res);
});

// start http server
httpServer.listen(config.httpPort, function () {
  console.log('The server is listening on port ' + config.httpPort + ' in ' + config.envName + ' mode');
});

// instantiate https server
var httpsServerOptions = {
  'key' : fs.readFileSync('./https/key.pem'),
  'cert' : fs.readFileSync('./https/cert.pem')
};

var httpsServer = https.createServer(httpsServerOptions, function (req, res) {
  unifiedServer(req, res);
});

// start https server
httpsServer.listen(config.httpsPort, function () {
  console.log('The server is listening on port ' + config.httpsPort + ' in ' + config.envName + ' mode');
});

// server logic for both http and https
var unifiedServer = function (req, res) {

  // get the url and parse it
  var parsedUrl = url.parse(req.url, true);

  // get the path
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // get query string as an object
  var queryStringObject = parsedUrl.query;

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

    // choose request handler, or use notFound
    var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

    // construct data object to send to handler
    var data = {
      'trimmedPath' : trimmedPath,
      'queryStringObject' : queryStringObject,
      'method' : method,
      'headers' : headers,
      'payload' : buffer
    };

    // route request to specified handler
    chosenHandler(data, function (statusCode, payload) {
      // use status code called back by handler or default to 200
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

      // use payload called back by handler or default to empty object
      payload = typeof(payload) == 'object' ? payload : {};

      // convert payload to a string
      var payloadString = JSON.stringify(payload);

      // return the response
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);

      // log the request path
    // console.log('Request received on path: ' + trimmedPath);
    // console.log(' with method: ' + method);
    // console.log(' with query string parameters: ', queryStringObject);
    // console.log('Request received with headers: ', headers);
    // console.log('Request received with payload: ', buffer);
    console.log('Returning response: ', statusCode, payloadString);

    });

  });

};

// define handlers
var handlers = {};

// ping handler
handlers.ping = function (data, callback) {
  callback(200);
};

// not found handler
handlers.notFound = function (data, callback) {
  callback(404);
};

// define a request router
var router = {
  'ping' : handlers.ping
};