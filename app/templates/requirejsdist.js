'use strict';

// RequireJS configuration for distribution.
// https://github.com/jrburke/r.js/blob/master/build/example.build.js
module.exports = {
    modules: [
        {
            name: 'main',
            exclude: ['infra']
        }, {
            name: 'main2',
            exclude: ['infra']
        }, {
            name: 'infra'
        }
    ],
    stubModules: []
};