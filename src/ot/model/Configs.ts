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

            $routeProvider.when('/task/simple/:outletCode', {
                templateUrl: 'src/view/task/simple.html',
                reloadOnSearch: false,
                controller: 'TaskController as vm'
            });

            $routeProvider.when('/task/:outletCode/:itemIdx', {
                templateUrl: 'src/view/task/edit.html',
                reloadOnSearch: false,
                controller: 'TaskController as vm'
            });


            $routeProvider.when('/task/my', {
                templateUrl: 'src/view/task/my.html',
                reloadOnSearch: false,
                controller: 'TaskController as vm'
            });

            $routeProvider.when('/task/test', {
                templateUrl: 'src/view/task/test.html',
                reloadOnSearch: false,
                controller: 'TaskController as vm'
            });

            $routeProvider.when('/task/localstorage', {
                templateUrl: 'src/view/task/localstorage.html',
                reloadOnSearch: false,
                controller: 'TaskController as vm'
            });

            $routeProvider.when('/task/photopack', {
                templateUrl: 'src/view/task/photo_pack.html',
                reloadOnSearch: false,
                controller: 'TaskController as vm'
            });

            $routeProvider.when('/task', {
                templateUrl: 'src/view/task/list2.html',
                reloadOnSearch: false,
                controller: 'TaskController as vm'
            });

            // $routeProvider.when('/task2', {
            //     templateUrl: 'src/view/task/list.html',
            //     reloadOnSearch: false,
            //     controller: 'TaskController as vm'
            // });

            // $routeProvider.when('/task/:outletCode', {
            //     templateUrl: 'src/view/task/detail.html',
            //     reloadOnSearch: false,
            //     controller: 'TaskController as vm'
            // });



            $routeProvider.when('/plan/my', {

                templateUrl: 'src/view/plan/my.html',
                reloadOnSearch: false,
                controller: 'PlanController as vm'
            });

            $routeProvider.when('/plan/:year?', {
                templateUrl: 'src/view/plan/list.html',
                reloadOnSearch: false,
                controller: 'PlanController as vm'
            });
            $routeProvider.when('/template', {
                templateUrl: 'src/view/template/list.html',
                reloadOnSearch: false,
                controller: 'TemplateController as vm'
            });

            $routeProvider.when('/item', {
                templateUrl: 'src/view/item/list.html',
                reloadOnSearch: false,
                controller: 'ItemController as vm'
            });
            $routeProvider.when('/outlet/import', {
                templateUrl: 'src/view/outlet/import.html',
                reloadOnSearch: false,
                controller: 'OutletController as vm'
            });
            $routeProvider.when('/outlet', {
                templateUrl: 'src/view/outlet/list.html',
                reloadOnSearch: false,
                controller: 'OutletController as vm'
            });

            $routeProvider.when('/admin', {
                templateUrl: 'src/view/admin/list.html',
                reloadOnSearch: false,
                controller: 'AdminController as vm'
            });

            $routeProvider.when('/admin/convert_tasklets_txt2json', {
                templateUrl: 'src/view/admin/convert_tasklets_txt2json.html',
                reloadOnSearch: false,
                controller: 'AdminController as vm'
            });

            $routeProvider.when('/template/owner/import', {
                templateUrl: 'src/view/template/import_outlet_user.html',
                reloadOnSearch: false,
                controller: 'TemplateController as vm'
            });

            $routeProvider.when('/template/owner', {
                templateUrl: 'src/view/template/owner.html',
                reloadOnSearch: false,
                controller: 'TemplateController as vm'
            });

            $routeProvider.when('/template/import', {
                templateUrl: 'src/view/template/import.html',
                reloadOnSearch: false,
                controller: 'TemplateController as vm'
            });

            $routeProvider.when('/template/:outletCode', {
                templateUrl: 'src/view/template/detail.html',
                reloadOnSearch: false,
                controller: 'TemplateController as vm'
            });

            $routeProvider.when('/user/edit', {
                templateUrl: 'src/view/user/edit.html',
                reloadOnSearch: false,
                controller: 'UserController as vm'
            });

            $routeProvider.when('/user/:all', {
                templateUrl: 'src/view/user/list.html',
                reloadOnSearch: false,
                controller: 'UserController as vm'
            });
            $routeProvider.when('/config', {
                templateUrl: 'src/view/config/list.html',
                reloadOnSearch: false,
                controller: 'ConfigController as vm'
            });


            $routeProvider.when('/approve/refprice', {
                templateUrl: 'src/view/approve/ref_price.html',
                reloadOnSearch: false,
                controller: 'RefPriceController as vm'
            });

            $routeProvider.when('/approve/import', {
                templateUrl: 'src/view/approve/import_ref_price.html',
                reloadOnSearch: false,
                controller: 'RefPriceController as vm'
            });



            $routeProvider.when('/approve', {
                templateUrl: 'src/view/approve/list.html',
                reloadOnSearch: false,
                controller: 'ApproveController as vm'
            });


            $routeProvider.when('/approve/:outletCode', {
                templateUrl: 'src/view/approve/detail-edit.html',
                reloadOnSearch: false,
                controller: 'ApproveController as vm'
            });


            $routeProvider.when('/upc/', {
                templateUrl: 'src/view/upc/list.html',
                reloadOnSearch: false,
                controller: 'UpcController as vm'
            });

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
                templateUrl: 'src/view/admin/log.html',
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
