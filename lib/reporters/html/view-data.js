var extend = require('node.extend'),
    paths = require('./lib').paths,
    fs = require('fs'),
    path = require('path');

module.exports = ViewData;

/**
 * @typedef {Object} TestSuiteInfo
 * @property {String} suitePath
 * @property {String} stateName
 * @property {String} browserId
 * @property {Boolean} equal
 * @property {Function} saveDiffTo
 */

function ViewData() {
    var tree = {name: 'root'},
        failed = 0,
        passed = 0,
        skipped = 0;

    /**
     * @param {TestSuiteInfo} info
     */
    this.addSkipped = function(info) {
        extendBrowserNode(info, {
            skipped: true
        });

        skipped++;
    };

    /**
     * @param {TestSuiteInfo} info
     */
    this.addSuccess = function(info) {
        extendBrowserNode(info, {
            success: true,
            actualPath: paths.makeCurrent(info),
            expectedPath: paths.makeReference(info)
        });

        passed++;
    };

    /**
     * @param {TestSuiteInfo} info
     */
    this.addFail = function(info) {
        extendBrowserNode(info, {
            fail: true,
            actualPath: paths.makeCurrent(info),
            expectedPath: paths.makeReference(info),
            diffPath: paths.makeDiff(info)
        });

        failed++;
    };

    /**
     * @param {TestSuiteInfo} info
     * @param {string} reason
     */
    this.addError = function(info, reason) {
        extendBrowserNode(info, {
            error: true,
            reason: (reason || '').replace('\n', '<br>')
        });

        failed++;
    };

    /**
     * @param {TestSuiteInfo} info
     * @param {string} reason
     */
    this.addWarning = function(info, reason) {
        extendBrowserNode(info, {
            warning: true,
            reason: (reason || '').replace('\n', '<br>')
        });

        skipped++;
    };

    /**
     * @returns {{suites: *, summary: {total: number, failed: number, passed: number, skipped: number}}}
     */
    this.getData = function() {
        return {
            suites: tree.children,
            summary: {
                total: failed + passed + skipped,
                failed: failed,
                passed: passed,
                skipped: skipped
            }
        }
    };

    /**
     * @param {TestSuiteInfo} info
     * @param {Object} extras
     */
    function extendBrowserNode(info, extras) {
        var node = findOrCreate(info.suitePath.concat(info.stateName), tree);
        addResult(info.browserId, extras, node);
    }
}

ViewData.hasFails = hasFails;

/**
 *
 * @param {Array} suitePath
 * @param {Object} currentNode
 * @returns {Object}
 */
function findOrCreate(suitePath, currentNode) {
    if (suitePath.length === 0)
        return currentNode;

    var children = Array.isArray(currentNode.children) ? currentNode.children : (currentNode.children = []),
        pathPart = suitePath.shift(),
        childNode = find('name', pathPart, children);

    if (!childNode) {
        childNode = { name: pathPart };
        children.push(childNode);
    }

    return findOrCreate(suitePath, childNode);
}

/**
 *
 * @param {string} propName
 * @param {Object} testResult
 * @param {Object} node
 */

function addResult(propName, testResult, node) {
    var arr = Array.isArray(node.browsers) ? node.browsers : (node.browsers = []);
    arr.push(extend({ name: propName }, testResult));
}

function find(name, value, arr) {
    for (var i = 0, item; i < arr.length, item = arr[i]; i++) {
        if (item[name] === value) {
            return item;
        }
    }
}

function hasFails(node) {
    return ['children', 'browsers'].reduce(function(result, prop) {
        var collection = node[prop];
        return result || (Array.isArray(collection) ? collection.some(hasFails) : false);
    }, node.fail || node.error);
}
