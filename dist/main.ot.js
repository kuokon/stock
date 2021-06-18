// import * as angular from "angular";
var MyApp;
(function (MyApp) {
    angular.module('MyApp', ['ngMaterial', 'ngSanitize', 'ngMessages',
        'md.data.table',
        // 'ngTouch',
        'ngRoute',
    ])
        .config(MyApp.ConfigMaterial)
        .config(MyApp.ConfigRoute)
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
        .controller('AdminController', MyApp.AdminController)
        .controller('OptionController', MyApp.OptionController)
        .service('DbService', MyApp.DbService)
        .run(["$rootScope", "$location", 'DbService',
        function ($rootScope, $location, svr) {
            $rootScope.svr = svr;
            // $rootScope.api = api;
            var host = $location.host();
            var port = $location.port();
            $rootScope._isDev = host == 'localhost';
            svr.goTo('/option/');
            // svr.goTo('/option/import');
        }]);
})(MyApp || (MyApp = {}));
//# sourceMappingURL=main.ot.js.map