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
    var OptionFilter = /** @class */ (function () {
        function OptionFilter() {
            this.txt = '';
            this.dte = 0;
            this.month = 0;
        }
        OptionFilter.prototype.reset = function () {
            this.txt = '';
            this.dte = 0;
            this.month = 0;
        };
        return OptionFilter;
    }());
    MyApp.OptionFilter = OptionFilter;
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
            this.isShowMonths = true;
            this.filter = new OptionFilter();
            this.mock = null;
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
            if (!MyApp.Helper.isBlank(filter.txt)) {
                for (var _i = 0, tmp_1 = tmp; _i < tmp_1.length; _i++) {
                    var re = tmp_1[_i];
                    if (re.match(filter.txt)) {
                        res.push(re);
                    }
                }
            }
            else {
                res = tmp;
            }
            res = res.filter(function (e) {
                return e.getStock()._isShow;
            });
            if (filter.dte > 0 && filter.month > 0) {
                console.warn('both dte and month filter on... dte: ' + filter.dte + ', month: ' + filter.month);
            }
            if (filter.dte > 0) {
                res = res.filter(function (e) {
                    return e._dayToExp <= filter.dte;
                });
            }
            if (filter.month > 0) {
                res = res.filter(function (e) {
                    return e.getMonth() == filter.month;
                });
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
            if (this.mock) {
                res.unshift(this.mock);
            }
            return res;
        };
        OptionController.prototype.makeMock = function (option) {
            var json = JSON.parse(JSON.stringify(option));
            this.mock = MyApp.Option.fromJson(this.svr, json);
            this.mock._isMock = true;
            this.mock.DateBought = moment().format('YYYY-MM-DD');
            this.mock.PriceAtBought = option.getStock().Price;
            this.mock.init();
        };
        OptionController.prototype.onUpdateMock = function (stock, month, isCall) {
            if (!this.mock) {
                this.mock = MyApp.Option.fromJson(this.svr, {});
            }
            var mock = this.mock;
            mock.P_C = isCall ? 'C' : 'P';
            mock._stock = stock;
            mock.StockTicker = stock.Symbol;
            var m = moment();
            var currMonth = m.month() + 1;
            var currYear = m.year();
            if (currMonth < month) {
                currYear++;
            }
            mock.DateExp = moment(currYear + '-' + month + '-' + 29, 'YYYY-MM-DD');
            mock.DateBought = m.format('YYYY-MM-DD');
            mock.init();
        };
        OptionController.prototype.onParse = function (raw) {
            var isHK = true;
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
        OptionController.prototype.onReset = function () {
            this.filter.reset();
            this.isShowExpire = false;
            this.isShowMonths = true;
            this.isShowStocks = true;
            this.svr.mgr.stocks.getAll().forEach(function (e) {
                e._isShow = true;
            });
            // this.mock = null;
        };
        OptionController.prototype.updateStockPriceHistory = function (stock) {
            console.info('updating price history....');
            var symbol = stock.Symbol + (stock.isHK() ? '.HK' : '');
            var apikey = '4VDN7RLHYUFKHWXE';
            var url = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=' + symbol + '&apikey=4VDN7RLHYUFKHWXE&outputsize=full';
            var options = this.svr.mgr.options.getAll().filter(function (e) {
                return e.getStock() == stock;
            });
            options = options.filter(function (e) {
                return !e.PriceAtBought || (e.isExpired() && !e.PriceAtExp);
            });
            this.svr.$http.get(url).then(function (res) {
                var price, last;
                var data = res.data['Time Series (Daily)'];
                for (var _i = 0, options_1 = options; _i < options_1.length; _i++) {
                    var option = options_1[_i];
                    if (data[option.DateBought]) {
                        price = data[option.DateBought]['4. close'];
                        option.PriceAtBought = parseFloat(price);
                        if (option.isExpired()) {
                            price = data[option.DateExp]['4. close'];
                            option.PriceAtExp = parseFloat(price);
                        }
                        console.info('option price history updated: bought: ' + option.PriceAtBought + ', exp: ' + option.PriceAtExp);
                    }
                }
            });
        };
        OptionController.prototype.getStockPrice = function (stock) {
            var symbol = stock.Symbol + (stock.isHK() ? '.HK' : '');
            var apikey = '4VDN7RLHYUFKHWXE';
            //let url = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=IBM&apikey=demo';
            var url = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=' + symbol + '&apikey=' + apikey;
            var url_date = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=IBM&apikey=4VDN7RLHYUFKHWXE&date=2020-02-01&outputsize=compact';
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
        };
        OptionController.$inject = ['DbService', '$routeParams', '$mdSidenav', '$mdToast', '$mdDialog', '$mdMedia', '$mdBottomSheet'];
        return OptionController;
    }());
    MyApp.OptionController = OptionController;
})(MyApp || (MyApp = {}));
//# sourceMappingURL=Controllers.js.map