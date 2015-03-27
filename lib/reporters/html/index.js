'use strict';

var q = require('q'),

    helpers = require('./lib'),

    reportImages = helpers.reportImages,
    paths = helpers.paths,

    view = require('./view'),

    ViewData = require('./view-data');

function prepareViewData(tester) {
    var result = q.defer(),
        viewData = new ViewData();

    tester.on('skipState', function(suiteInfo) {
        viewData.addSkipped(suiteInfo);
    });

    tester.on('endTest', function(suiteInfo) {
        suiteInfo.equal ?
            viewData.addSuccess(suiteInfo) :
            viewData.addFail(suiteInfo);
    });

    tester.on('error', function(e) {
        viewData.addError(e, e.stack || e.message || e);
    });

    tester.on('warning', function(e) {
        viewData.addWarning(e, e.message);
    });

    tester.on('end', function() {
        result.resolve(viewData.getData());
    });

    return result.promise;
}

function prepareImages(tester) {
    var imagesReady = q.defer();

    tester.on('endTest', function(suiteInfo) {
        return q.all([
            reportImages.copyCurrent(suiteInfo),
            reportImages.copyReference(suiteInfo),
            reportImages.saveDiff(suiteInfo)
        ]);
    });

    tester.on('end', function() {
        imagesReady.resolve();
    });

    return imagesReady.promise;
}

function timeLogger(tester){
    tester.on('begin', function() {
        console.time('Tests timing');
    });

    tester.on('end', function() {
        console.timeEnd('Tests timing');
    });

    return true;
}

module.exports = function htmlReporter(tester) {
    q.all([
        prepareViewData(tester),
        prepareImages(tester),
        timeLogger(tester)
    ])
        .spread(function(viewData) {
            return view.createHtml(viewData)
        })
        .then(function(html) {
            return view.save(html);
        })
        .fail(function(e) {
            console.log(e.stack);
        });
};

