// import * as angular from "angular";

module MyApp {

    angular.module('MyApp', ['ngMaterial', 'ngSanitize', 'ngMessages',
        // 'md.data.table',
        // 'ngTouch',
        'ngRoute',
        // 'angular-loading-bar',
        // 'ngAnimate'
    ])
        .config(ConfigMaterial)
        .config(ConfigRoute)

        // In the angular `config` phase...
        .config(function ($mdGestureProvider) {
            // To skip attachToDocument() and addEventListener(s)
            $mdGestureProvider.skipClickHijack();


            // If hijcacking clicks, change default 6px click distance
            $mdGestureProvider.setMaxClickDistance(12);

            // console.info('skipped click hijacking');
        })


        .config(function ($mdInkRippleProvider) {
            $mdInkRippleProvider.disableInkRipple();
        })

        .config(function ($mdAriaProvider) {
            // Globally disables all ARIA warnings.
            $mdAriaProvider.disableWarnings();
        })

        .config(function ($animateProvider) {

            // disable all animation!
            $animateProvider.customFilter(function (node, event, options) {
                return false;
                // Example: Only animate `enter` and `leave` operations.
                // return event === 'enter' || event === 'leave';
            });
        })

        .controller('AdminController', AdminController)
        .controller('OptionController', OptionController)


        .service('DbService', DbService)

        .run(["$rootScope", "$location", 'DbService',
            function ($rootScope, $location, svr: DbService) {

                $rootScope.svr = svr;
                // $rootScope.api = api;

                let host = $location.host();
                let port = $location.port();


                $rootScope._isDev = host == 'localhost';

                svr.goTo('/option/import');

            }]
        );





}



