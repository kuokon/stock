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
            this.isShowStocks = true;
            this.svr = DbService;
        }
        OptionController.prototype.onMakeStock = function () {
            var stock = MyApp.Stock.fromJson(this.svr, '');
            this.svr.mgr.stocks.add(stock);
        };
        OptionController.prototype.getOptions = function (filter) {
            var tmp = this.svr.mgr.options.getAll();
            if (!this.isShowExpire) {
                tmp = tmp.filter(function (e) {
                    return !e.isExpired();
                });
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
            var stocks = this.svr.mgr.stocks.getAll();
            stocks.forEach(function (e) {
                e._exposure_p = 0;
                e._exposure_c = 0;
                e._cash_in_amt = 0;
                e._cash_lost_amt = 0;
                e._num_call = 0;
                e._num_put = 0;
            });
            res.forEach(function (e) {
                var ep = e.getExposure();
                var stock = e.getStock();
                if (e.isCall()) {
                    stock._exposure_c += ep;
                    stock._num_call += e.NumContract;
                }
                else {
                    stock._exposure_p += ep;
                    stock._num_put += e.NumContract;
                }
                stock._cash_in_amt += e.getCashIn();
                stock._cash_lost_amt += e.getLost();
            });
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
        OptionController.prototype.refreshStockPrice = function () {
            var _this = this;
            var stocks = this.svr.mgr.stocks.getAll();
            stocks.forEach(function (e) {
                _this.getStockPrice(e);
            });
        };
        OptionController.prototype.getStockPrice = function (stock) {
            var symbol = 'goog';
            var apikey = '4VDN7RLHYUFKHWXE';
            symbol = stock.Symbol + (stock.isHK() ? '.HK' : '');
            //let url = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=IBM&apikey=demo';
            var url = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=' + symbol + '&apikey=' + apikey;
            // console.info(' ')
            this.svr.$http.get(url).then(function (res) {
                console.info(' res: ' + JSON.stringify(res));
                console.info(' curr price for ' + symbol + ' ==> ' + res.data);
                var price, last;
                try {
                    price = res.data['Global Quote']['05. price'];
                    last = res.data['Global Quote']['08. previous close'];
                    // change = res.data['Global Quote']['09. change'];
                    // change_pct = res.data['Global Quote']['10. change percent'];
                    stock.Price = parseFloat(price);
                    stock.PriceLast = parseFloat(last);
                    console.info(' price updated ' + stock.Symbol + ' --> ' + stock.Price);
                }
                catch (e) {
                    console.error(e);
                }
            });
            return 100;
        };
        OptionController.$inject = ['DbService', '$routeParams', '$mdSidenav', '$mdToast', '$mdDialog', '$mdMedia', '$mdBottomSheet'];
        return OptionController;
    }());
    MyApp.OptionController = OptionController;
})(MyApp || (MyApp = {}));
//# sourceMappingURL=Controllers.js.map