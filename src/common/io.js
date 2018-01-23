const debug = require('debug')('cgd-io'),
  fs = require('fs'),
  path = require('path'),
  pathExists = require('path-exists'),
  Promise = require('bluebird'),
  glob = Promise.promisify(require('glob')),
  mkdirp = Promise.promisify(require('mkdirp')),
  rimraf = Promise.promisify(require('rimraf')),
  asyncFs = {
    stat: Promise.promisify(fs.stat),
    readFile: Promise.promisify(fs.readFile),
    writeFile: Promise.promisify(fs.writeFile),
    readDir: Promise.promisify(fs.readdir)
  },
  io = {
    read,
    write,
    dir: {
      create: mkdir,
      exists: exists(stat => stat.isDirectory()),
      remove: rmdir,
      list
    },
    json: {
      read: readJsonFile,
      write: writeJsonFile
    }
  }
;

/**
 * Wrapper for fs.readFile, UTF-8 encoding is forced.
 *
 * @param {String} filePath
 * @return {Promise}
 */
function read(filePath) {
  debug('read:', filePath);

  return asyncFs.readFile(filePath, 'utf8');
}

/**
 * Wrapper for fs.writeFile.
 * Will create the directory containing the file if it does not exist
 *
 * @param {String}  filePath
 * @param {String}  data
 * @return {Promise}
 */
function write(filePath, data) {
  debug('write:', filePath);

  const dirname = path.dirname(filePath),
    _write = () => asyncFs.writeFile(filePath, data, 'utf8');

  return io.dir.exists(dirname)
    .then(exists =>
      exists ? _write() : mkdirp(dirname).then(() => _write())
    );
}

/**
 * Execute the provided test after calling fs.stat.
 * Returns a promise which get resolves with the test result
 *
 * @param {Function}  test
 * @returns function(*=): Promise<T>
 */
function exists(test) {
  return path =>
    pathExists(path)
      .then(exists => {
        if (!exists) return false;

        return asyncFs.stat(path)
          .then(stat => test(stat));
      })
      .catch(err => {
        debug('exists: error for path', path, err);
        throw err;
      });
}

/**
 * Wrapper for rimraf
 *
 * @param {String} path
 * @return {Promise}
 */
function rmdir(path) {
  debug('rmdir:', path);

  return rimraf(path)
    .catch(err => {
      debug('failed cleaning path', path, err);
      throw err;
    });
}

/**
 * Wrapper for mkdirp
 *
 * @param {String} path
 * @return {Promise}
 */
function mkdir(path) {
  debug('mkdir:', path);

  return mkdirp(path);
}

/**
 * List files and directories inside the path provided
 *
 * @param {String} path
 * @param {String} pattern
 * @param {Object} options
 * @return {Promise}
 */
function list(path, pattern, options = {}) {
  debug('list:', path, pattern);

  return glob(pattern, {...options, cwd: path})
    .then(res => {
      debug('list:', res.length ? `${res.length} matches found` : 'No match found');
      return res;
    });
}

//<editor-fold desc="JSON">

// IMPR implement stream based JSON read / write for better performance on big files

function readJsonFile(filePath) {
  debug('read Json:', filePath);

  return read(filePath)
    .then(data => JSON.parse(data));
}

function writeJsonFile(filePath, data) {
  debug('write Json:', filePath);

  const serializedData = typeof data === 'string' ? data : JSON.stringify(data);

  return write(filePath, serializedData);
}

//</editor-fold>

module.exports = io;
