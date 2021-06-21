// import * as angular from "angular";
var MyApp;
(function (MyApp) {
    var AdminController = /** @class */ (function () {
        function AdminController(DbService, $routeParams, $mdSidenav, $mdToast, $mdDialog, $mdMedia, $mdBottomSheet) {
            this.DbService = DbService;
            this.$mdSidenav = $mdSidenav;
            this.$mdToast = $mdToast;
            this.$mdDialog = $mdDialog;
            this.$mdMedia = $mdMedia;
            this.$mdBottomSheet = $mdBottomSheet;
            this.title = 'Admin';
            this.svr = DbService;
        }
        AdminController.$inject = ['DbService', '$routeParams', '$mdSidenav', '$mdToast', '$mdDialog', '$mdMedia', '$mdBottomSheet'];
        return AdminController;
    }());
    MyApp.AdminController = AdminController;
    var OptionController = /** @class */ (function () {
        function OptionController(DbService, $routeParams, $mdSidenav, $mdToast, $mdDialog, $mdMedia, $mdBottomSheet) {
            this.DbService = DbService;
            this.$mdSidenav = $mdSidenav;
            this.$mdToast = $mdToast;
            this.$mdDialog = $mdDialog;
            this.$mdMedia = $mdMedia;
            this.$mdBottomSheet = $mdBottomSheet;
            this.title = 'Option';
            this.stats = new MyApp.OptionStats();
            this.isShowExpire = false;
            this.isShowStocks = false;
            this.svr = DbService;
        }
        OptionController.prototype.onMakeStock = function () {
            var stock = MyApp.Stock.fromJson(this.svr, '');
            this.svr.mgr.stocks.add(stock);
        };
        OptionController.prototype.getOptions = function (filter) {
            var tmp = this.svr.mgr.options.getAll();
            if (!this.isShowExpire) {
                tmp = tmp.filter(function (e) { return !e.isExpired(); });
            }
            var res = [];
            if (!MyApp.Helper.isBlank(filter)) {
                for (var _i = 0, tmp_1 = tmp; _i < tmp_1.length; _i++) {
                    var re = tmp_1[_i];
                    if (re.match(filter)) {
                        res.push(re);
                    }
                }
            }
            else {
                res = tmp;
            }
            this.stats.calc(res);
            return res;
        };
        OptionController.prototype.onParse = function (raw) {
            var isHK = false;
            return MyApp.Import.parseRaw(this.svr, raw, isHK);
        };
        OptionController.prototype.getSubheaders = function () {
            return [
                { name: 'main', value: '/' },
                { name: 'import', value: '/option/' }
            ];
        };
        OptionController.prototype.onCopyDataToClipboard = function (options) {
            //let res :Option[] = pr.parsed;
            var buf = JSON.stringify(options, MyApp.Helper.json_replacer);
            MyApp.Helper.copyTxtToClipboard(this.svr, buf);
        };
        OptionController.$inject = ['DbService', '$routeParams', '$mdSidenav', '$mdToast', '$mdDialog', '$mdMedia', '$mdBottomSheet'];
        return OptionController;
    }());
    MyApp.OptionController = OptionController;
})(MyApp || (MyApp = {}));
//# sourceMappingURL=Controllers.js.map