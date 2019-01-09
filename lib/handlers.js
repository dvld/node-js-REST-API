// 
// request handlers
// 

// dependencies


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

// export module
module.exports = handlers;