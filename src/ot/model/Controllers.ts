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

        stats: OptionStats = new OptionStats();
        isShowExpire: boolean = false;
        isShowStocks: boolean = true;
        filter:string;


        constructor(private DbService: DbService,
                    $routeParams: any,
                    private $mdSidenav: ng.material.ISidenavService,
                    private $mdToast: ng.material.IToastService,
                    private $mdDialog: ng.material.IDialogService,
                    private $mdMedia: ng.material.IMedia,
                    private $mdBottomSheet: ng.material.IBottomSheetService) {

            this.svr = DbService;

        }

        onMakeStock() : void {
            let stock = Stock.fromJson(this.svr,'');

            this.svr.mgr.stocks.add(stock);
        }



        getOptions(filter:string) : Option[] {

            let tmp = this.svr.mgr.options.getAll();

            if(!this.isShowExpire) {
                tmp  = tmp.filter( e=> { return !e.isExpired()})
            }

            let res = [];

            if(!Helper.isBlank(filter)) {
                for (const re of tmp) {
                    if(re.match(filter)){
                        res.push(re);
                    }
                }

            } else  {
                res = tmp;
            }

            this.stats.calc(res);
            return res;

        }


        onParse(raw) : ParseResult {

            let isHK = false;
            return Import.parseRaw(this.svr, raw, isHK);
        }

        getSubheaders() : NV[] {
            return [
                {name: 'main', value: '/'}
                , {name: 'import', value: '/option/'}
            ]
        }

        onCopyDataToClipboard(options:Option[] ) : void {

            //let res :Option[] = pr.parsed;
            let buf = JSON.stringify(options, Helper.json_replacer);
            Helper.copyTxtToClipboard(this.svr, buf);

        }

    }

}


