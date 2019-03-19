
// 
// helpers for various tasks
// 

// dependencies
var crypto = require('crypto');
var config = require('./config');

// container for helpers
var helpers = {};

// create a SHA256 hash
helpers.hash = function (str) {
  if (typeof (str) == 'string' && str.length > 0) {
    var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    return hash;
  } else {
    return false;
  }
};

// parse JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = function (str) {
  try {
    var obj = JSON.parse(str);
    return obj;
  } catch (e) {
    return {};
  }
};

// create a string of random alphanumeric characters, pass in desired length
helpers.createRandomString = function (strLength) {
  strLength = typeof (strLength) == 'number' && strLength > 0 ? strLength : false;

  if (strLength) {

    // define all possible characters
    var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

    // create the randomized string
    var str = '';
    for (var i = 1; i <= strLength; i++) {
      // get a random character from possibleCharacters string
      var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));

      // append random character to randomized string
      str += randomCharacter;
    }

    // return the randomized string
    return str;

  } else {

    return false;

  }
};


// export module
module.exports = helpers;