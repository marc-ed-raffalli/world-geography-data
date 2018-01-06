const debug = require('debug')('cgd-git'),
  simpleGit = require('simple-git/promise'),
  GitUrlParse = require('git-url-parse'),
  Promise = require('bluebird'),

  io = require('./io')
;

/**
 * Class helping with git specific operations
 * APIs from
 * - Simple Git
 * - GitUrlParse
 *
 * Notes:
 * SimpleGit uses child processes to perform git commands.
 */
class Git {

  constructor(url, localPath) {
    this._url = url;
    this._localPath = localPath;
  }

  /**
   * Sets the instance of simple git from the localPath
   * @private
   */
  _setSimpleGitInstance() {
    this._simpleGit = Git._getSimpleGitInstance(this.localPath);
  }

  get url() {
    return this._url;
  }

  get localPath() {
    return this._localPath;
  }

  /**
   * Checks if localPath dir exists, if not creates dir and initialize repository
   *
   * @return {Promise}
   */
  initialize() {
    debug('initialize:', this.url, this.localPath);

    return io.dir.exists(this.localPath)
      .then(exists => {
        // SimpleGit will throw if the directory does not exist

        if (!exists) {
          return io.dir.create(this.localPath)
            .then(() => {
              debug('initialize: git init', this.url);

              this._setSimpleGitInstance();
              return Promise.resolve(this._simpleGit.init());
            })
            .then(() => {
              debug('initialize: git add remote', this.url);
              return Promise.resolve(this._simpleGit.addRemote('origin', this.url));
            });
        }

        this._setSimpleGitInstance();
      })
      .catch(err => {
        debug('initialize: failed for', this.url, err);
        throw err;
      });
  }

  /**
   *
   * @param {String} [commitOrTagName]
   * @return {Promise}
   */
  resetToRemote(commitOrTagName) {
    if (this._simpleGit === undefined) {
      throw new Error('Git repo not initialized');
    }
    debug('resetToRemote: fetching', this.url);

    return Promise.resolve(this._simpleGit.fetch())
      .then(() => debug('resetToRemote: fetched', this.url))
      .then(() => this._simpleGit.reset(['--hard', commitOrTagName]));
  }

  /**
   * Extracts the repo name from URL provided, supports common git url formats.
   *
   * @param {String}  url
   * @return {String}
   */
  static getRepoNameFromUrl(url) {
    return GitUrlParse(url).name;
  }

  /**
   * Allows stubbing in the tests
   *
   * @param {String} [workingDirPath]
   * @return SimpleGit instance
   * @protected
   */
  static _getSimpleGitInstance(workingDirPath) {
    return simpleGit(workingDirPath);
  }
}

module.exports = Git;
