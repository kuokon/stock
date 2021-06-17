// import * as angular from "angular";


module MyApp {


    export class AdminController {

        static $inject = ['DbService', 'ApiService', '$routeParams', '$mdSidenav', '$mdToast', '$mdDialog', '$mdMedia', '$mdBottomSheet'];
        title: string = 'Info';
        svr: DbService;

        constructor(private DbService: DbService, private Api: ApiService,
                    $routeParams: any,
                    private $mdSidenav: ng.material.ISidenavService,
                    private $mdToast: ng.material.IToastService,
                    private $mdDialog: ng.material.IDialogService,
                    private $mdMedia: ng.material.IMedia,
                    private $mdBottomSheet: ng.material.IBottomSheetService) {

            this.svr = DbService;

        }


    }



}


