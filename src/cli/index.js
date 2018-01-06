const debug = require('debug')('cgd-cli'),
  cli = {
    readArguments: require('./read-args'),
    printHelp: require('./print-help'),
    runInteractivePrompt: require('./run-interactive-prompt'),
    run: (args, next) => {
      return new Promise(resolve => {
        debug('CLI API started with:', args);

        const options = cli.readArguments(args);

        // show help when CLI called without args
        if (args.length === 2 || options.help || options.h) {
          cli.printHelp();
          return resolve();
        }

        if (options.interactive || options.i) {
          debug('Switching to interactive mode');

          return cli.runInteractivePrompt()
            .then(res => resolve(res.confirm ? resolve(res) : undefined));
        }

        resolve(options);
      })
        .then(options => {
          if (options) next(options);
        });
    }
  };

module.exports = cli;
