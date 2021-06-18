// import * as angular from "angular";


module MyApp {


    export class AdminController {

        static $inject = ['DbService', '$routeParams', '$mdSidenav', '$mdToast', '$mdDialog', '$mdMedia', '$mdBottomSheet'];
        title: string = 'Admin';
        svr: DbService;

        constructor(private DbService: DbService,
                    $routeParams: any,
                    private $mdSidenav: ng.material.ISidenavService,
                    private $mdToast: ng.material.IToastService,
                    private $mdDialog: ng.material.IDialogService,
                    private $mdMedia: ng.material.IMedia,
                    private $mdBottomSheet: ng.material.IBottomSheetService) {

            this.svr = DbService;

        }


    }



    export class OptionController {

        static $inject = ['DbService', '$routeParams', '$mdSidenav', '$mdToast', '$mdDialog', '$mdMedia', '$mdBottomSheet'];
        title: string = 'Option';
        svr: DbService;

        constructor(private DbService: DbService,
                    $routeParams: any,
                    private $mdSidenav: ng.material.ISidenavService,
                    private $mdToast: ng.material.IToastService,
                    private $mdDialog: ng.material.IDialogService,
                    private $mdMedia: ng.material.IMedia,
                    private $mdBottomSheet: ng.material.IBottomSheetService) {

            this.svr = DbService;

        }


        onParse(raw) : ParseResult {
            return Option.parseRaw(this.svr, raw);
        }

    }

}


