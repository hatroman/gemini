'use strict';
var chalk = require('chalk');

var CHECK = chalk.green('\u2713'),
    XMARK = chalk.red('\u2718'),
    EXCLAMATION = chalk.bold.yellow('!');

module.exports = function(runner) {
    var failed, passed, skipped;

    runner.on('begin', function() {
        failed = passed = skipped = 0;
    });

    //for test command
    runner.on('endTest', function(r) {
        (r.equal? success : fail)(r);
    });

    //for gather command
    runner.on('capture', success);

    runner.on('error', function(error) {
        fail(error);
        logError(error.originalError || error);
    });

    /**
     * @param {NoRefImageError} error
     */
    runner.on('warning', function(error) {
        warn(error);
        console.warn(error.message);
    });

    runner.on('end', function() {
        var total = failed + passed + skipped;
        console.log('Total: %s Passed: %s Failed: %s Skipped: %s',
            chalk.underline(total),
            chalk.green(passed),
            chalk.red(failed),
            chalk.cyan(skipped)
        );
    });

    function success(r) {
        report(CHECK, r);
        passed++;
    }

    function fail(r) {
        report(XMARK, r);
        failed++;
    }

    function warn(r) {
        report(EXCLAMATION, r);
        skipped++;
    }

    function report(mark, r) {
        console.log('%s %s ' + chalk.underline('%s') + ' ' + chalk.yellow('[%s]'),
            mark,
            r.suitePath.join(' '),
            r.stateName,
            r.browserId
        );
    }

    function logError(e) {
        console.error(e.stack || e.message);
    }
};
