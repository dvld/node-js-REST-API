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
  callback(404, { 'Handlers Error 19' : 'Not Found' });
};

// users (declares acceptable methods and determines what method is being requested)
handlers.users = function (data, callback) {
  var acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405, { 'Handlers Error 28' : 'Not an acceptable method' });
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
        callback(400, { 'Handlers Error 85': 'A user with that phone number already exists'});
      }
    });

  } else {
    callback(400, { 'Handlers Error 90': 'Missing required fields' });
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
        callback(404, { 'Handlers Error 113' : 'Hashing Error' });
      }
    });
  } else {
    callback(400, { 'Handlers Error 117' : 'Missing required field' });
  }
};

// users - put
// required data : phone
// optional data : firstName, lastName, password (at least one must be specified)
// @todo only let authenticated user update their own object
handlers._users.put = function (data, callback) {

  // check required field
  var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

  // check optional fields
  var firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;

  var lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;

  var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

  var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  // error if the phone is invalid
  if (phone) {

    // error if nothing is sent
    if (firstName || lastName || password) {

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
              callback(500, {'Handlers Error 166' : 'Could not update the user'});
            }
          })
        } else {
          callback(400, {'Handlers Error 170' : 'Specified user does not exist'});
        }
      })
    } else {
      callback(400, {'Handlers Error 174' : 'Missing fields'});
    }
  } else {
    callback(400, {'Handlers Error 177' : 'Missing required field'});
  }
};

// users - delete
// required field : phone
// @todo only let authenticated users delete their object
// @todo clean (delete) any other data files associated with this user
handlers._users.delete = function (data, callback) {

  // check phone is valid
  var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
  if (phone) {

    // lookup user
    _data.read('users', phone, function (err, data) {
      if (!err && data) {

        _data.delete('users', phone, function (err) {
          if (!err) {
            callback(200);
          } else {
            callback(500, {'Handlers Error 199' : 'Could not delete specified user'});
          }
        });
      } else {
        callback(400, {'Handlers Error 203' : 'Could not find specified user'});
      }
    });
  } else {
    callback(400, {'Handlers Error 207' : 'Missing required field'});
  }
};

// export module
module.exports = handlers;