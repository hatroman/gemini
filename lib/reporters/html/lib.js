var path = require('path'),
    fs = require('q-io/fs'),

    REPORT_OUT_DIR = 'gemini-report';

/**
 * @param {TestSuiteInfo} info
 * @param {String} kind
 */
function makePath(info, kind) {
    var imagePath = info.suitePath.concat(info.stateName, info.browserId + '~' + kind + '.png');
    return path.join.apply(null, imagePath);
}

/**
 * @param {TestSuiteInfo} info
 * @param {String} kind
 */
function relativePath(info, kind) {
    return path.join('images', makePath(info, kind));
}

/**
 * @param {TestSuiteInfo} info
 */
function referencePath(info) {
    return relativePath(info, 'ref')
}

/**
 * @param {TestSuiteInfo} info
 */
function currentPath(info) {
    return relativePath(info, 'current')
}

/**
 * @param {TestSuiteInfo} info
 */
function diffPath(info) {
    return relativePath(info, 'diff')
}

function toAbsolute(relativePath) {
    return path.resolve(REPORT_OUT_DIR, relativePath);
}

function copyImage(srcPath, destPath) {
    return fs.makeTree(path.dirname(destPath))
        .then(function() {
            return fs.copy(srcPath, destPath);
        })
}

/**
 * @param {TestSuiteInfo} info
 * @param {string} diffPath
 */
function saveDiff(info, diffPath) {
    return fs.makeTree(path.dirname(diffPath))
        .then(function() {
            return info.saveDiffTo(diffPath);
        })
}

module.exports = {
    paths: {
        makeReference: referencePath,
        makeCurrent: currentPath,
        makeDiff: diffPath
    },

    reportImages: {
        copyReference: function(suiteInfo) {
            return copyImage(suiteInfo.referencePath, toAbsolute(referencePath(suiteInfo)))
        },
        copyCurrent: function(suiteInfo) {
            return copyImage(suiteInfo.currentPath, toAbsolute(currentPath(suiteInfo)))
        },
        saveDiff: function(suiteInfo) {
            return suiteInfo.equal || saveDiff(suiteInfo, toAbsolute(diffPath(suiteInfo)))
        }
    },

    report: {
        copyImage: copyImage,
        copyToOutDir: function(fileName) {
            return fs.copy(path.join(__dirname, fileName), path.join(REPORT_OUT_DIR, fileName));
        },
        save: function(fileName, content) {
            return fs.write(path.join(REPORT_OUT_DIR, fileName), content)
        }
    }
};
