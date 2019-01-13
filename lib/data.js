
// 
// library for storing and editing data
// 

// dependencies
var fs = require('fs');
var path = require('path');
var helpers = require('./helpers');

// module container
var lib = {};

// base data directory
lib.baseDir = path.join(__dirname, '/../.data/');

// write data to a file
lib.create = function (dir, file, data, callback) {

  // open the file to be written
  fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', function (err, fileDescriptor) {
    if (!err && fileDescriptor) {

      // convert data to a string
      var stringData = JSON.stringify(data);

      //  write to the file and clse it
      fs.writeFile(fileDescriptor, stringData, function (err) {
        if (!err) {
          fs.close(fileDescriptor, function (err) {
            if (!err) {
              callback(false);
            } else {
              callback('Error closing new file');
            }
          });
        } else {
          callback('Error writing to new file');
        }
      });
    } else {
      callback('Could not create a new file, it may already exist');
    }
  })
};

// read data from a file
lib.read = function (dir, file, callback) {
  fs.readFile(lib.baseDir + dir + '/' + file + '.json', 'utf8', function (err, data) {
    if (!err && data) {
      var parsedData = helpers.parseJsonToObject(data);
      callback(false, parsedData)
    } else {
      callback(err, data);
    }
  });
};

// update data inside a file
lib.update = function (dir, file, data, callback) {

  // open the file to be written
  fs.open(lib.baseDir + dir + '/' + file + '.json', 'r+', function (err, fileDescriptor) {
    if (!err && fileDescriptor) {

      // convert data to a string
      var stringData = JSON.stringify(data);

      // truncate the file
      fs.ftruncate(fileDescriptor, function (err) {
        if (!err) {

          // write to the file and close it
          fs.writeFile(fileDescriptor, stringData, function (err) {
            if (!err) {
              fs.close(fileDescriptor, function (err) {
                if (!err) {
                  callback(false);
                } else {
                  callback('Error closing existing file');
                }
              });
            } else {
              callback('Error writing to existing file');
            }
          });
        } else {
          callback('Error truncating file');
        }
      });
    } else {
      callback('Could not open the file for updating, it may not exist yet');
    }
  });
};

// delete a file
lib.delete = function (dir, file, callback) {

  // unlink the file
  fs.unlink(lib.baseDir + dir + '/' + file + '.json', function (err) {
    if (!err) {
      callback(false);
    } else {
      callback('Error deleting file');
    }
  });
}

// export module
module.exports = lib;