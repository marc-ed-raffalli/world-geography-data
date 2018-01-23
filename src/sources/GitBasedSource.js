const debug = require('debug')('cgd-sources-GitBasedSource'),
  path = require('path'),
  Promise = require('bluebird'),
  Git = require('../common/Git')
;

/**
 * Class handling git based sources.
 *
 * @class GitBasedSource
 */
class GitBasedSource {

  /**
   * @param {String} url  repository URL
   * @param {String} [dest] forces repository to be cloned in dest/repoName. Defaults to process.cwd() /tmp/git
   */
  constructor(url, dest) {
    const repoName = Git.getRepoNameFromUrl(url),
      repoLocalPath = path.join(dest || path.join(process.cwd(), 'tmp', 'git'), repoName);

    this._sourceName = repoName;
    this._git = new Git(url, repoLocalPath);
  }

  get sourceName() {
    return this._sourceName;
  }

  get git() {
    return this._git;
  }

  loadData() {
    debug('loadData:', this.sourceName);

    if (this._load === undefined) {
      this._load = Promise.resolve(this.git.initialize())
        .then(() => this.git.resetToRemote('origin/master'))
        .tap(() => debug('loadData: done loading', this.sourceName));
    }

    return this._load;
  }

  /**
   * Extract the data targeted by the options provided.
   * Should be implemented.
   *
   * @param options
   * @return {Promise}
   */
  extract(options) {
    return Promise.resolve({});
  }

  /**
   * Returns if the source is required based on the config provided.
   * Generic implementation, should be overridden for better performance.
   *
   * @param  {Object} options config passed to the script
   * @return {Boolean}
   */
  static isRequired(options) {
    return true;
  }

}

module.exports = GitBasedSource;
