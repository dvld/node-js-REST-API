// 
// request handlers
// 

// dependencies
var _data = require('./data');
var helpers = require('./helpers');
var config = require('./config');

// define handlers
var handlers = {};

// users (declares acceptable methods and determines what method is being requested)
handlers.users = function (data, callback) {
  var acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405, { 'Handlers Error 28': 'Not an acceptable method' });
  }
};

// container for users submethods
handlers._users = {};

// users - post
// required data: firstName, lastName, phone, password, tosAgreement
// optional data: none
handlers._users.post = function (data, callback) {

  // validate required fields
  var firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;

  var lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;

  var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

  var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  var tosAgreement = typeof (data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

  if (firstName && lastName && phone && password && tosAgreement) {

    // check if user data already exists
    _data.read('users', phone, function (err, data) {
      if (err) {

        // hash password
        var hashedPassword = helpers.hash(password);

        // create user object
        if (hashedPassword) {
          var userObject = {
            'firstName': firstName,
            'lastName': lastName,
            'phone': phone,
            'hashedPassword': hashedPassword,
            'tosAgreement': true
          };

          // store user
          _data.create('users', phone, userObject, function (err) {
            if (!err) {
              callback(200);
            } else {
              console.log(err);
              callback(500, { 'Handlers Error 76': 'Could not create new user' });
            }
          });
        } else {
          callback(500, { 'Handlers Error 80': 'Could not hash user password' });
        }

      } else {
        // user already exists
        callback(400, { 'Handlers Error 85': 'A user with that phone number already exists' });
      }
    });

  } else {
    callback(400, { 'Handlers Error 90': 'Missing required fields' });
  }

};

// users - get
// required data: phone
// optional data: none
handlers._users.get = function (data, callback) {

  // check that phone number is valid
  var phone = typeof (data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
  if (phone) {

    // get token from headers
    var token = typeof (data.headers.token) == 'string' ? data.headers.token : false;

    // verify if given token is valid for user by phone number
    handlers._tokens.verifyToken(token, phone, function (tokenIsValid) {
      if (tokenIsValid) {

        // lookup user
        _data.read('users', phone, function (err, data) {
          if (!err && data) {

            // remove hashed password before returning response
            delete data.hashedPassword;
            callback(200, data);
          } else {
            callback(404, { 'Handlers Error 113': 'Hashing Error' });
          }
        });
      } else {
        callback(403, { 'Handlers Error ': 'Missing required token in header, or token is invalid' });
      }
    });
  } else {
    callback(400, { 'Handlers Error 117': 'Missing required field' });
  }
};

// users - put
// required data : phone
// optional data : firstName, lastName, password (at least one must be specified)
handlers._users.put = function (data, callback) {

  // check required field
  var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

  // check optional fields
  var firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;

  var lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;

  var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

  var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  // error if the phone is invalid
  if (phone) {

    // error if nothing is sent
    if (firstName || lastName || password) {

      // get token from headers
      var token = typeof (data.headers.token) == 'string' ? data.headers.token : false;

      // verify if given token is valid for user by phone number
      handlers._tokens.verifyToken(token, phone, function (tokenIsValid) {
        if (tokenIsValid) {

          // lookup user
          _data.read('users', phone, function (err, userData) {
            if (!err && userData) {

              // update neccessary fields
              if (firstName) {
                userData.firstName = firstName;
              }
              if (lastName) {
                userData.lastName = lastName;
              }
              if (password) {
                userData.hashedPassword = helpers.hash(password);
              }

              // store new updates
              _data.update('users', phone, userData, function (err) {
                if (!err) {
                  callback(200);
                } else {
                  console.log(err);
                  callback(500, { 'Handlers Error 166': 'Could not update the user' });
                }
              });
            } else {
              callback(400, { 'Handlers Error 170': 'Specified user does not exist' });
            }
          });
        } else {
          callback(403, { 'Handlers Error ': 'Missing required token in header, or token is invalid' });
        }
      });
    } else {
      callback(400, { 'Handlers Error 174': 'Missing fields' });
    }
  } else {
    callback(400, { 'Handlers Error 177': 'Missing required field' });
  }
};

// users - delete
// required field : phone
// @todo clean (delete) any other data files associated with this user
handlers._users.delete = function (data, callback) {

  // check phone is valid
  var phone = typeof (data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
  if (phone) {

    // get token from headers
    var token = typeof (data.headers.token) == 'string' ? data.headers.token : false;

    // verify if given token is valid for user by phone number
    handlers._tokens.verifyToken(token, phone, function (tokenIsValid) {
      if (tokenIsValid) {

        // lookup user
        _data.read('users', phone, function (err, data) {
          if (!err && data) {

            _data.delete('users', phone, function (err) {
              if (!err) {
                callback(200);
              } else {
                callback(500, { 'Handlers Error 199': 'Could not delete specified user' });
              }
            });
          } else {
            callback(400, { 'Handlers Error 203': 'Could not find specified user' });
          }
        });
      } else {
        callback(403, { 'Handlers Error ': 'Missing required token in header, or token is invalid' });
      }
    });
  } else {
    callback(400, { 'Handlers Error 207': 'Missing required field' });
  }
};

// tokens
handlers.tokens = function (data, callback) {
  var acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._tokens[data.method](data, callback);
  } else {
    callback(405, { 'Handlers Error 217': 'Not an acceptable method' });
  }
};

// container for token submethods
handlers._tokens = {};

// tokens - post
// required data: phone, password
// optional data: none
handlers._tokens.post = function (data, callback) {

  // validate required fields
  var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

  var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  if (phone && password) {

    // look up the matching user by phone number
    _data.read('users', phone, function (err, userData) {
      if (!err && userData) {
        // hash sent password and compare to password stored in user object
        var hashedPassword = helpers.hash(password);
        if (hashedPassword == userData.hashedPassword) {
          // if valid create a new token with a random name (1 hour expiration)
          var tokenId = helpers.createRandomString(20);
          var expires = Date.now() + 1000 * 60 * 60;
          var tokenObject = {
            'phone': phone,
            'id': tokenId,
            'expires': expires
          };

          // store the token
          _data.create('tokens', tokenId, tokenObject, function (err) {
            if (!err) {
              callback(200, tokenObject);
            } else {
              callback(500, { 'Handlers Error ': 'Could not create new token' });
            }
          });
        } else {
          callback(400, { 'Handlers Error ': 'Password does not match' })
        }
      } else {
        callback(400, { 'Handlers Error ': 'Could not find user' });
      }
    });
  } else {
    callback(400, { 'Handlers Error ': 'Missing required fields' });
  }
};

// tokens - get
// required data : id
// optional data : none
handlers._tokens.get = function (data, callback) {

  // check that id is valid
  var id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
  if (id) {

    // lookup token
    _data.read('tokens', id, function (err, tokenData) {
      if (!err && tokenData) {
        callback(200, tokenData);
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, { 'Handlers Error ': 'Missing required field' });
  }
};

// tokens - put
// required data : id, extend
// optional data : none
handlers._tokens.put = function (data, callback) {
  var id = typeof (data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
  var extend = typeof (data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;

  if (id && extend) {

    // lookup token
    _data.read('tokens', id, function (err, tokenData) {
      if (!err && tokenData) {

        // check to make sure token isnt expired
        if (tokenData.expires > Date.now()) {

          // extend expiration 1 hour from now
          tokenData.expires = Date.now() + 1000 * 60 * 60;

          // store updated token
          _data.update('tokens', id, tokenData, function (err) {
            if (!err) {
              callback(200);
            } else {
              callback(500, { 'Handlers Error ': 'Could not update token expiration' });
            }
          });
        } else {
          callback(400, { 'Handlers Error ': 'Token has expired' });
        }
      } else {
        callback(400, { 'Handlers Error ': 'Specified token does not exist' })
      }
    });
  } else {
    callback(400, { 'Handlers Error ': 'Missing required field(s) or field(s) are invalid' });
  }
};

// tokens - delete
// required data : id
// optional data : none
handlers._tokens.delete = function (data, callback) {

  // check if id is valid
  var id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
  if (id) {

    // lookup token
    _data.read('tokens', id, function (err, data) {
      if (!err && data) {

        _data.delete('tokens', id, function (err) {
          if (!err) {
            callback(200);
          } else {
            callback(500, { 'Handlers Error 199': 'Could not delete specified token' });
          }
        });
      } else {
        callback(400, { 'Handlers Error 203': 'Could not find specified token' });
      }
    });
  } else {
    callback(400, { 'Handlers Error 207': 'Missing required field' });
  }
};

// verify if a given id is currently valid for a given user
handlers._tokens.verifyToken = function (id, phone, callback) {

  // lookup token
  _data.read('tokens', id, function (err, tokenData) {
    if (!err && tokenData) {

      // check if token is for given user and has not expired
      if (tokenData.phone == phone && tokenData.expires > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

// checks
handlers.checks = function (data, callback) {
  var acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._checks[data.method](data, callback);
  } else {
    callback(405, { 'Handlers checks Error ': 'Not an acceptable method' });
  }
};

// container for all checks methods
handlers._checks = {};

// checks - post
// required data: protocol, url, method, successCodes, timeoutSeconds
// optional data: none

handlers._checks.post = function (data, callback) {

  // validate
  var protocol = typeof (data.payload.protocol) == 'string' && ['https', 'http'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
  var url = typeof (data.payload.url) == 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
  var method = typeof (data.payload.method) == 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
  var successCodes = typeof (data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
  var timeoutSeconds = typeof (data.payload.timeoutSeconds) == 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >=1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;

  if (protocol && url && method && successCodes && timeoutSeconds) {

    // get token from headers
    var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

    // look user by token
    _data.read('tokens', token, function (err, tokenData) {
      if (!err && tokenData) {
        var userPhone = tokenData.phone;

        // lookup user data
        _data.read('users', userPhone, function (err, userData) {
          if (!err && userData) {
            var userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];

            // verify user checks are not maxed
            if (userChecks.length < config.maxChecks) {

              // generate random id for check
              var checkId = helpers.createRandomString(20);

              // create check object, include reference to user's phone
              var checkObject = {
                'id': checkId,
                'userPhone': userPhone,
                'protocol': protocol,
                'url': url,
                'method': method,
                'successCodes': successCodes,
                'timeoutSeconds': timeoutSeconds
              };

              // save the object
              _data.create('checks', checkId, checkObject, function (err) {
                if (!err) {

                  // add checkId to user's object
                  userData.checks = userChecks;
                  userData.checks.push(checkId);

                  // save new user data
                  _data.update('users', userPhone, userData, function (err) {
                    if (!err) {

                      // return the new check data
                      callback(200, checkObject);
                    } else {
                      callback(500, { 'Handlers Error ' : 'Could not update user with new check' });
                    }
                  });
                } else {
                  callback(500, { 'Handlers Error ' : 'Could not create new check' });
                }
              });
            } else {
              callback(400, { 'Handlers Error ' : 'Max number of checks reached ('+config.maxChecks+')' });
            }
          } else {
            callback(403, { 'Handlers Error' : 'Token not found' });
          }
        });
      } else {
        callback(403, { 'Handlers Error ' : 'Unauthorized' });
      }
    });
  } else {
    callback(400, { 'Handlers Error ' : 'Missing required inputs, or inputs are invalid' });
  }
};


// ping
handlers.ping = function (data, callback) {
  callback(200);
};

// not found
handlers.notFound = function (data, callback) {
  callback(404, { 'Handlers Error 19': 'Not Found' });
};

// export module
module.exports = handlers;