var MyApp;
(function (MyApp) {
    var ConfigMaterial = /** @class */ (function () {
        function ConfigMaterial($mdThemingProvider) {
            // // console.info('config material theme');
            // config(function ($mdInkRippleProvider) {
            //     $mdInkRippleProvider.disableInkRipple();
            // });
            this.$mdThemingProvider = $mdThemingProvider;
            $mdThemingProvider.theme('default')
                .primaryPalette('blue')
                .backgroundPalette('grey')
                .accentPalette('indigo');
            // Available palettes: red, pink, purple, deep-purple, indigo, blue, light-blue, cyan, teal, green, light-green, lime, yellow,
            // amber, orange, deep-orange, brown, grey, blue-grey
        }
        return ConfigMaterial;
    }());
    MyApp.ConfigMaterial = ConfigMaterial;
    var ConfigRoute = /** @class */ (function () {
        // @ts-ignore
        function ConfigRoute($routeProvider) {
            this.$routeProvider = $routeProvider;
            $routeProvider.when('/option', {
                templateUrl: 'src/ot/view/option/list.html',
                reloadOnSearch: false,
                controller: 'OptionController as vm'
            });
            $routeProvider.when('/option/import', {
                templateUrl: 'src/ot/view/option/import.html',
                reloadOnSearch: false,
                controller: 'OptionController as vm'
            });
            $routeProvider.when('/admin/modelgen', {
                templateUrl: 'src/ot/view/admin/model-gen.html',
                reloadOnSearch: false,
                controller: 'AdminController as vm'
            });
            $routeProvider.when('/admin', {
                templateUrl: 'src/ot/view/admin/list.html',
                reloadOnSearch: false,
                controller: 'AdminController as vm'
            });
            $routeProvider.otherwise({
                // redirect: '/user'
                templateUrl: 'src/ot/view/admin/list.html',
                reloadOnSearch: false,
                controller: 'AdminController as vm'
            });
        }
        return ConfigRoute;
    }());
    MyApp.ConfigRoute = ConfigRoute;
    var ConfigLoadingBar = /** @class */ (function () {
        function ConfigLoadingBar(cfpLoadingBarProvider) {
            this.cfpLoadingBarProvider = cfpLoadingBarProvider;
            console.info('config loading bar');
            cfpLoadingBarProvider.parentSelector = '#loading-bar-container';
            cfpLoadingBarProvider.latencyThreshold = 10;
            // cfpLoadingBarProvider.spinnerTemplate = '<div><span class="fa fa-spinner" style="color: yellowgreen">Loading...</div>';
        }
        return ConfigLoadingBar;
    }());
    MyApp.ConfigLoadingBar = ConfigLoadingBar;
})(MyApp || (MyApp = {}));
//# sourceMappingURL=Configs.js.map