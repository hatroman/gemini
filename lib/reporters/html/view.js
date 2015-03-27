var Handlebars = require('handlebars'),
    q = require('q'),
    fs = require('q-io/fs'),
    path = require('path'),

    hasFails = require('./view-data').hasFails,

    helpers = require('./lib').report;

Handlebars.registerHelper('status', function() {
    if (this.skipped) {
        return 'section_status_skip';
    }

    if (hasFails(this)) {
        return 'section_status_fail';
    }

    return this.warning ? 'section_status_warning' : 'section_status_success';
});
Handlebars.registerHelper('has-fails', function() {
    return this.failed > 0 ? 'summary__key_has-fails' : '';
});
Handlebars.registerHelper('image', function(kind) {
    return new Handlebars.SafeString('<img src="' + encodeURI(this[kind + 'Path']) + '">');
});
Handlebars.registerHelper('collapse', function() {
    return hasFails(this) ? '' : 'section_collapsed';
});

function loadTemplate(name) {
    return fs.read(path.join(__dirname, name));
}

/**
 * @param {Object} data
 * @param {Object} data.suites
 * @param {Object} data.summary
 * @param {Object} data.summary.total
 * @param {Object} data.summary.passed
 * @param {Object} data.summary.failed
 * @param {Object} data.summary.skipped
 * returns {String} html
 */
module.exports = {
    createHtml: function (data) {
        return loadTemplate('suite.hbs')
            .then(function(template) {
                Handlebars.registerPartial('suite', template);
            })
            .then(function() {
                return loadTemplate('report.hbs');
            })
            .then(function(template) {
                return Handlebars.compile(template)(data);
            })
    },

    save: function(html) {
        return q.all([
            helpers.save('index.html', html),
            helpers.copyToOutDir('report.js'),
            helpers.copyToOutDir('report.css')
        ]);
    }
};
