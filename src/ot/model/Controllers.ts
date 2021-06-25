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

    export class OptionFilter {
        public txt: string = '';
        public dte: number = 0;

        public month: number = 0;


        public reset(): void {
            this.txt = '';
            this.dte = 0;
            this.month = 0;
        }
    }


    export class OptionController {

        static $inject = ['DbService', '$routeParams', '$mdSidenav', '$mdToast', '$mdDialog', '$mdMedia', '$mdBottomSheet'];
        title: string = 'Option';
        svr: DbService;

        stats: OptionStats = new OptionStats();
        isShowExpire: boolean = false;
        isShowStocks: boolean = true;
        isShowMonths: boolean = true;
        filter: OptionFilter = new OptionFilter();

        mock: Option = null;


        constructor(private DbService: DbService,
                    $routeParams: any,
                    private $mdSidenav: ng.material.ISidenavService,
                    private $mdToast: ng.material.IToastService,
                    private $mdDialog: ng.material.IDialogService,
                    private $mdMedia: ng.material.IMedia,
                    private $mdBottomSheet: ng.material.IBottomSheetService) {

            this.svr = DbService;


        }

        onMakeStock(): void {
            let stock = Stock.fromJson(this.svr, '');


            this.svr.mgr.stocks.add(stock);
        }


        getOptions(filter: OptionFilter): Option[] {

            let tmp = this.svr.mgr.options.getAll();

            if (!this.isShowExpire) {
                tmp = tmp.filter(e => {
                    return !e.isExpired()
                })
            }

            let res: Option[] = [];

            if (!Helper.isBlank(filter.txt)) {
                for (const re of tmp) {
                    if (re.match(filter.txt)) {
                        res.push(re);
                    }
                }

            } else {
                res = tmp;
            }

            res = res.filter(e => {
                return e.getStock()._isShow;
            });

            if (filter.dte > 0 && filter.month > 0) {
                console.warn('both dte and month filter on... dte: ' + filter.dte + ', month: ' + filter.month);
            }


            if (filter.dte > 0) {
                res = res.filter(e => {
                    return e._dayToExp <= filter.dte;
                })
            }

            if (filter.month > 0) {
                res = res.filter(e => {
                    return e.getMonth() == filter.month;
                })
            }


            this.stats.calc(res);

            let stocks = this.svr.mgr.stocks.getAll();


            stocks.forEach(e => {
                e._exposure_p = 0;
                e._exposure_c = 0;
                e._cash_in_amt = 0;
                e._cash_lost_amt = 0;
                e._num_call = 0;
                e._num_put = 0;

            });

            res.forEach(e => {

                let ep = e.getExposure();
                let stock = e.getStock();
                if (e.isCall()) {
                    stock._exposure_c += ep;
                    stock._num_call += e.NumContract;
                } else {
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
        }

        makeMock(option): void {
            let json = JSON.parse(JSON.stringify(option));
            this.mock = Option.fromJson(this.svr, json);
            this.mock._isMock = true;
            this.mock.DateBought = moment().format('YYYY-MM-DD');

            this.mock.PriceAtBought = option.getStock().Price;
            this.mock.init();
        }

        onUpdateMock(stock: Stock, month: number, isCall: boolean): void {


            if (!this.mock) {
                this.mock = Option.fromJson(this.svr, {});
            }
            let mock = this.mock;
            mock.P_C = isCall ? 'C' : 'P';
            mock._stock = stock;
            mock.StockTicker = stock.Symbol;

            let m = moment();
            let currMonth = m.month() + 1;
            let currYear = m.year();
            if (currMonth < month) {
                currYear++;
            }

            mock.DateExp = moment(currYear + '-' + month + '-' + 29, 'YYYY-MM-DD');
            mock.DateBought = m.format('YYYY-MM-DD');
            mock.init();

        }


        onParse(raw): ParseResult {

            let isHK = true;
            return Import.parseRaw(this.svr, raw, isHK);
        }

        getSubheaders(): NV[] {
            return [
                {name: 'main', value: '/'}
                , {name: 'import', value: '/option/'}
            ]
        }

        onCopyDataToClipboard(options: Option[]): void {

            //let res :Option[] = pr.parsed;
            let buf = JSON.stringify(options, Helper.json_replacer);
            Helper.copyTxtToClipboard(this.svr, buf);


        }

        refreshStockPrice(): void {

            let stocks = this.svr.mgr.stocks.getAll();
            stocks.forEach(e => {
                this.getStockPrice(e);
            })
        }


        onReset(): void {

            this.filter.reset();
            this.isShowExpire = false;
            this.isShowMonths = true;
            this.isShowStocks = true;
            // this.mock = null;
        }

        updateStockPriceHistory(stock: Stock): void {
            console.info('updating price history....');

            let symbol = stock.Symbol + (stock.isHK() ? '.HK' : '');
            let apikey = '4VDN7RLHYUFKHWXE';
            let url = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=' + symbol + '&apikey=4VDN7RLHYUFKHWXE&outputsize=full';

            let options = this.svr.mgr.options.getAll().filter(e => {
                return e.getStock() == stock
            });
            options = options.filter(e => {
                return !e.PriceAtBought || (e.isExpired() && !e.PriceAtExp)
            });


            this.svr.$http.get(url).then(res => {


                let price, last;
                let data = res.data['Time Series (Daily)'];

                for (const option of options) {
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


        }

        getStockPrice(stock: Stock): void {


            let symbol = stock.Symbol + (stock.isHK() ? '.HK' : '');
            let apikey = '4VDN7RLHYUFKHWXE';


            //let url = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=IBM&apikey=demo';
            let url = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=' + symbol + '&apikey=' + apikey;

            let url_date = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=IBM&apikey=4VDN7RLHYUFKHWXE&date=2020-02-01&outputsize=compact';

            // console.info(' ')

            this.svr.$http.get(url).then(res => {
                console.info(' res: ' + JSON.stringify(res));
                console.info(' curr price for ' + symbol + ' ==> ' + res.data);

                let price, last;

                try {

                    price = res.data['Global Quote']['05. price'];
                    last = res.data['Global Quote']['08. previous close'];
                    // change = res.data['Global Quote']['09. change'];
                    // change_pct = res.data['Global Quote']['10. change percent'];

                    stock.Price = parseFloat(price);
                    stock.PriceLast = parseFloat(last);


                    console.info(' price updated ' + stock.Symbol + ' --> ' + stock.Price);
                } catch (e) {
                    console.error(e);
                }

            });


        }

    }

}


