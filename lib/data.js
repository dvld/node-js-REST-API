
// 
// library for storing and editing data
// 

// dependencies
var fs = require('fs');
var path = require('path');

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

// export module
module.exports = lib;