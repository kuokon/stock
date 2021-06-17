module MyApp {

    export class ConfigMaterial {

        constructor(private $mdThemingProvider: ng.material.IThemingProvider) {

            // // console.info('config material theme');
            // config(function ($mdInkRippleProvider) {
            //     $mdInkRippleProvider.disableInkRipple();
            // });

            $mdThemingProvider.theme('default')
                .primaryPalette('blue')
                .backgroundPalette('grey')
                .accentPalette('indigo');

            // Available palettes: red, pink, purple, deep-purple, indigo, blue, light-blue, cyan, teal, green, light-green, lime, yellow,
            // amber, orange, deep-orange, brown, grey, blue-grey

        }

    }

    export class ConfigRoute {
        // @ts-ignore
        constructor(private $routeProvider: ng.route.IRouteProvider,) {

            // console.info('config router');

            $routeProvider.when('/admin/log', {
                templateUrl: 'src/view/admin/log.html',
                reloadOnSearch: false,
                controller: 'AdminController as vm'
            });


            $routeProvider.when('/admin/modelgen', {
                templateUrl: 'src/view/admin/model-gen.html',
                reloadOnSearch: false,
                controller: 'AdminController as vm'
            });

            $routeProvider.when('/admin', {
                templateUrl: 'src/view/admin/list.html',
                reloadOnSearch: false,
                controller: 'AdminController as vm'
            });

            $routeProvider.otherwise({
                // redirect: '/user'
                templateUrl: 'src/view/user/list.html',
                reloadOnSearch: false,
                controller: 'UserController as vm'

            })


        }
    }


    export class ConfigLoadingBar {
        constructor(private cfpLoadingBarProvider) {

            console.info('config loading bar');

            cfpLoadingBarProvider.parentSelector = '#loading-bar-container';
            cfpLoadingBarProvider.latencyThreshold = 10;
            // cfpLoadingBarProvider.spinnerTemplate = '<div><span class="fa fa-spinner" style="color: yellowgreen">Loading...</div>';
        }
    }

}
