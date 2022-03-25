var Vinyl   = require('vinyl'),
    through = require('through2');

// Gulp Plugin that helps older gulp plugins use the newer vinyl objects
module.exports = function () {
  function transform(file, enc, cb) {
    cb(null, new Vinyl({
      cwd: file.cwd,
      base: file.base,
      path: file.path,
      contents: file._contents
    }));
  }

  return through.obj(transform);
};
