// 
// request handlers
// 

// dependencies
var _data = require('./data');
var helpers = require('./helpers');

// define handlers
var handlers = {};

// ping
handlers.ping = function (data, callback) {
  callback(200);
};

// not found
handlers.notFound = function (data, callback) {
  callback(404);
};

// users
handlers.users = function (data, callback) {
  var acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
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
              callback(500, { 'Error': 'Could not create new user' });
            }
          });
        } else {
          callback(500, { 'Error': 'Could not hash user password' });
        }

      } else {
        // user already exists
        callback(400, { 'Error': 'A user with that phone number already exists'});
      }
    });

  } else {
    callback(400, { 'Error': 'Missing required fields' });
  }

};

// users - get
// required data: phone
// optional data: none
// @todo only let authenticated users to access their own object
handlers._users.get = function (data, callback) {

  // check that phone number is valid
  var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
  if (phone) {

    // lookup user
    _data.read('users', phone, function (err, data) {
      if (!err && data) {

        // remove hashed password before returning response
        delete data.hashedPassword;
        callback(200, data);
      } else {
        callback(404);
      }
    })
  } else {
    callback(400, {'Error' : 'Missing required field'});
  }
};

// users - put
handlers._users.put = function (data, callback) {

};

// users - delete
handlers._users.delete = function (data, callback) {

};

// export module
module.exports = handlers;