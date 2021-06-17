module.exports = function (config) {
    config.set({

        basePath: './',

        files: [


            'node_modules/angular/angular.js',

            'node_modules/angular/angular.min.js',
            'node_modules/angular-animate/angular-animate.min.js',
            'node_modules/angular-aria/angular-aria.min.js',
            'node_modules/angular-material/angular-material.js',
            'node_modules/angular-messages/angular-messages.min.js',
            'node_modules/angular-sanitize/angular-sanitize.min.js',
            'node_modules/angular-route/angular-route.min.js',


            // 'app/bower_components/angular-route/angular-route.js',
            //     'app/bower_components/angular-mocks/angular-mocks.js',
            //     'app/bower_components/angular-bootstrap/ui-bootstrap.min.js',
            //
            //     'app/bower_components/is_js/is.min.js',
            'lib/lodash.core.min.js',
            'lib/moment.min.js',

            'index-idv2.html',

            // todo, remove follow two line after ah-hoc test
            // 'src/js/global.js',

            'src/idv2/js/dict.js',
            'src/idv2/js/data.js',
            'dist/idv2/Configs.js',
            'dist/idv2/Consts.js',
            'dist/idv2/Models.js',
            'dist/idv2/Validator.js',
            'dist/idv2/PlaceRegion.js',
            'dist/idv2/Pages.js',
            'dist/idv2/Controllers.js',
            'dist/idv2/Services.js',
            'dist/main.idv2.js',

            'test/*.js',
            'test/*/*.js',
        ],

        autoWatch: true,

        frameworks: ['jasmine'],

        browsers: ['Chrome'],

        plugins: [
            'karma-chrome-launcher',
            // 'karma-firefox-launcher',
            'karma-jasmine',
            'karma-junit-reporter'
        ],

        junitReporter: {
            outputFile: 'test_out/unit.xml',
            suite: 'unit'
        }

    });
};
