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
            this.svr = DbService;
        }
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