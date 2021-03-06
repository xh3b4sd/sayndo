/*
 * Dependencies.
 */
var vows = require('vows')
  , assert = require('assert')

  , view = require('../view.js')
  , appLocals = require('../../../config/app_locals.js');

var testHelper = {
    /*
     *
     */
    getResponseMock: function(expectedView) {
        return {
            end: function(html) {
                assert.equal(expectedView, html);
            },
            writeHead: function(statusCode, header) {
                assert.equal(200, statusCode);
                assert.equal(view.contentType, header);
            },
            session: {}
        }
    }
};

/*
 * View test module.
 */
vows.describe('view')
    .addBatch({
        /*
         *
         */
        'cache': {
            topic: view,
            'is object': function(view) {
                assert.isObject(view.cache);
            }
        },

        /*
         *
         */
        'contentType': {
            topic: view,
            'is object': function(view) {
                assert.isObject(view.contentType);
            },
            'contains 1 content type': function(view) {
                assert.equal(1, Object.keys(view.contentType).length);
            },
            'contains correct content type': function(view) {
                assert.equal('text/html', view.contentType['Content-Type']);
            }
        },

        /*
         *
         */
        'errors': {
            topic: view,
            'is function': function(view) {
                assert.isFunction(view.errors);
            },
            'send default error page': function(view) {
                var res = {
                    end: function(data) {
                        assert.equal('Not found', data);
                    },
                    writeHead: function(statusCode, header) {
                        assert.equal(404, statusCode);
                        assert.equal(view.contentType, header);
                    }
                };

                view.errors({}, res);
            }
        },

        /*
         *
         */
        'combineLocals': {
            topic: view,
            'is function': function(view) {
                assert.isFunction(view.combineLocals);
            },
            'combine view and app locals': function(view) {
                var count = Object.keys(appLocals).length
                  , req = {}
                  , res = {session: {}}
                  , locals = {local1: 'hello world'};

                view.combineLocals(req, res, locals, function(combinedLocals) {
                    assert.equal(1 + count, Object.keys(combinedLocals).length);
                    assert.equal('hello world', combinedLocals.local1);
                });
            }
        },

        /*
         *
         */
        'parseLocals': {
            topic: view,
            'is function': function(view) {
                assert.isFunction(view.parseLocals);
            },
            'parse locals into view': function(view) {
                var cachedView = '<h1>#{local1}</h1><p>#{local2}</p><p>#{local2}</p>'
                  , locals = {local1: 'Sayndo', local2: 'hello world'};

                view.parseLocals(cachedView, locals, function(html) {
                    assert.equal(null, html.match(/#\{.*?\}/g));
                    assert.equal(2, html.match(/hello world/g).length);
                    assert.equal(1, html.match(/Sayndo/g).length);
                });
            }
        },

        /*
         *
         */
        'render': {
            topic: view,
            'view with locals': function(view) {
                var viewPath = '/view/path'
                  , expectedView = '<h1>Sayndo</h1><p>hello world</p><p>hello world</p>'
                  , cachedView = '<h1>#{local1}</h1><p>#{local2}</p><p>#{local2}</p>'
                  , locals = {local1: 'Sayndo', local2: 'hello world'}
                  , res = testHelper.getResponseMock(expectedView);

                view.cache['default' + viewPath] = cachedView;
                view.render({}, res, viewPath, locals);
            },
            'view without locals': function(view) {
                var viewPath = '/view/path'
                  , expectedView = '<h1>#{local1}</h1><p>#{local2}</p><p>#{local2}</p>'
                  , res = testHelper.getResponseMock(expectedView);

                view.cache['default' + viewPath] = expectedView;
                view.render({}, res, viewPath);
            },
            'view with not default layout': function(view) {
                var viewPath = '/view/path'
                  , locals = {layout: 'test'}
                  , expectedView = '<h1>#{local1}</h1><p>#{local2}</p><p>#{local2}</p>'
                  , res = testHelper.getResponseMock(expectedView);

                view.cache['test' + viewPath] = expectedView;
                view.render({}, res, viewPath, locals);
            }
        }
    })
    .export(module);

