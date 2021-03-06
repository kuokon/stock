var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var MyApp;
(function (MyApp) {
    var Config = /** @class */ (function () {
        function Config(svr, $localStorage) {
            this.version = 71;
            this.appID = Config.APP_ID;
            this.phoneNativeClientVersion = 0;
            this.loaded = false;
            this.isPhone = false;
            this.numTryLogout = 0;
            this.currUser = null;
            this.configYear = null;
            this.configMonth = null;
            this.actualYear = null;
            this.actualMonth = null;
            this.isDev = false;
            // used in header.html
            this.minDate = new Date("2017-08-01");
            this.minPaperDate = new Date("2020-01-01");
            this.paperReportDate = null;
            this.svr = null;
            this.$localStorage = null;
            this.ItemCodeTerm = -1;
            // public isNewTerm(): boolean {
            //     return this.configYear > 2019
            //         || (this.configYear == 2019 && this.configMonth >= 10);
            // }
            //
            this.startupTime = new Date();
            var now = new Date();
            this.actualYear = now.getFullYear();
            this.actualMonth = now.getMonth() + 1;
            this.svr = svr;
            this.$localStorage = $localStorage;
            this.maxDate = new Date();
            this.maxDate.setMonth(this.maxDate.getMonth() + 1);
            this.minPaperDate = new Date();
            this.minPaperDate.setMonth(this.minPaperDate.getMonth() - 4);
            this.maxPaperDate = new Date();
            this.maxPaperDate.setMonth(this.maxPaperDate.getMonth() + 8);
            this.getPaperReportDate();
        }
        Config.prototype.getTimeInfo = function () {
            return this.getConfigYear() + '-' + this.getConfigMonth();
        };
        Config.prototype.getTimeDuration = function () {
            function lifeSpan(t0) {
                var now = new Date();
                var x = (now.getTime() - t0.getTime()), a = x, i = 0, s = 0, m = 0, h = 0, j = 0;
                if (a >= 1) {
                    i = a % 1000;
                    a = (a - i) / 1000;
                    if (a >= 1) {
                        s = a % 60;
                        a = (a - s) / 60;
                        if (a >= 1) {
                            m = a % 60;
                            a = (a - m) / 60;
                            if (a >= 1) {
                                h = a % 24;
                                a = (a - h) / 24;
                                if (a >= 1) {
                                    j = a; //...
                                }
                            }
                        }
                    }
                }
                return 'Elapsed: ' + h + 'h ' + m + 'm ' + s + 's.';
            }
            return lifeSpan(this.startupTime);
        };
        Config.prototype.setCurrUser = function (user, passwd) {
            this.currUser = user;
            var basicAuth = user ? 'Basic ' + window.btoa(user.Id + ':' + passwd) : null;
            // this.svr.api.$http.defaults.headers.common['Authorization'] = basicAuth;
            var auth_key = this.appID + '-basic-auth';
            var user_key = this.appID + '-user';
            var userId = user ? user.Id : '';
            this.$localStorage[user_key] = userId;
            this.$localStorage[auth_key] = basicAuth;
        };
        Config.prototype.selectPaperReportDate = function (d) {
            this.paperReportDate = d;
        };
        Config.prototype.getPaperReportDate = function () {
            if (this.paperReportDate == null) {
                var d = new Date();
                d.setMonth(d.getMonth() + 1);
                this.paperReportDate = d;
            }
            return this.paperReportDate;
        };
        Config.prototype.isConfigDateSameAsActual = function () {
            return this.configMonth === this.actualMonth
                && this.configYear === this.actualYear;
        };
        Config.prototype.getDateBackgroundColor = function () {
            if (this.isConfigDateSameAsActual()) {
                return '';
            }
            else {
                return 'orange';
            }
        };
        Config.prototype.getMonthOptions = function () {
            return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        };
        Config.prototype.getYearOptions = function () {
            return [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022];
        };
        Config.prototype.getActualMonth = function () {
            return this.actualMonth;
        };
        Config.prototype.getActualYear = function () {
            return this.actualYear;
        };
        Config.prototype.getConfigYear = function () {
            //let _db: Db = this.$localStorage;
            if (!this.configYear) {
                var year_key = Config.APP_ID + '-config-year';
                this.configYear = this.$localStorage[year_key];
                if (Helper.isBlank(this.configYear)) {
                    this.configYear = this.actualYear;
                }
            }
            return this.configYear;
        };
        Config.prototype.getConfigMonth = function () {
            if (!this.configMonth) {
                var month_key = Config.APP_ID + '-config-month';
                this.configMonth = this.$localStorage[month_key];
                // if (!this.svr.getCurrUser().isInspector() || this.svr.isDev()) {
                //     this.configMonth = this.$localStorage.configMonth;
                // }
                if (Helper.isBlank(this.configMonth)) {
                    this.configMonth = this.actualMonth;
                }
            }
            return this.configMonth;
        };
        Config.prototype.getNativeClientVersion = function () {
            return this.phoneNativeClientVersion;
        };
        Config.prototype.onInitNative = function (ver) {
            this.phoneNativeClientVersion = parseInt(ver) || 0;
            console.info('phone client version: ' + this.phoneNativeClientVersion);
        };
        Config.prototype.isVersionMatch = function () {
            var jsVerClient = this.version;
            var jsVerServer = Meta.get().getVersion();
            var androidVerClient = (this.isPhone ? this.getNativeClientVersion() : 0);
            var androidVerServer = Meta.get().getPhoneClientVersion();
            var match = jsVerClient == jsVerServer && (androidVerClient == 0 || (androidVerClient == androidVerServer));
            if (!match) {
                console.info(' version mismatch : js: ' + jsVerClient + '-' + jsVerServer
                    + ' | android: ' + androidVerClient + '-' + androidVerServer);
            }
            return match;
        };
        Config.APP_ID = 'stock';
        return Config;
    }());
    MyApp.Config = Config;
    var Base = /** @class */ (function () {
        function Base() {
            this.Id = -1;
        }
        Base.prototype.getKey = function () {
            return null;
        };
        Base.prototype.toJSON = function () {
            var _this = this;
            var json = {};
            var ignore = ['db', 'svr', '$$hashKey'];
            Object.getOwnPropertyNames(this).filter(function (name) {
                return (ignore.indexOf(name) < 0 && !name.startsWith('_'));
            }).forEach(function (name) {
                json[name] = _this[name];
            });
            return json;
        };
        Base.prototype.toString = function () {
            return JSON.stringify(this, Helper.json_replacer);
        };
        Base.prototype.isNew = function () {
            return !(this.Id >= 0);
        };
        return Base;
    }());
    MyApp.Base = Base;
    var User = /** @class */ (function (_super) {
        __extends(User, _super);
        function User(Id, Name, Name_E, Role, Status) {
            var _this = _super.call(this) || this;
            _this.Id = Id;
            _this.Name = Name;
            _this.Name_E = Name_E;
            _this.Role = Role;
            _this.Status = Status;
            _this._dirty = false;
            _this.outletTaskCountMap = {};
            return _this;
        }
        User.mkModel = function () {
            var str = 'User| Name:str; Role:str; Status:int; Dept:str';
            return MyApp.ModelGen.from(str);
        };
        User.fromJson = function (svr, json) {
            return new User(json.Id, json.Name, json.Name_E, json.Role, json.Status);
        };
        User.makeNullUser = function () {
            return new User(-1, 'Test', 'Test_E', "NA", "NA");
        };
        User.prototype.getKey = function () {
            return this.Id + '';
        };
        User.prototype.isNull = function () {
            return this.Name.startsWith('N/A');
        };
        User.prototype.isInspector = function () {
            return this.Role === 'INSPECTOR';
        };
        ;
        User.prototype.isOperator = function () {
            return this.Role === 'OPERATOR';
        };
        ;
        User.prototype.isAdmin = function () {
            return this.Role === 'ADMIN';
        };
        ;
        User.prototype.isExpired = function () {
            return (this.Status === 'Expired');
        };
        User.prototype.isActive = function () {
            return !this.isExpired();
        };
        User.prototype.getRoleName = function () {
            return User.ROLE_NAME_MAP[this.Role] || this.Role;
        };
        ;
        User.prototype.onChange = function () {
            this._dirty = true;
        };
        User.ROLE_NAME_MAP = {
            INSPECTOR: "?????????",
            OPERATOR: "??????",
            ADMIN: "?????????",
        };
        return User;
    }(Base));
    MyApp.User = User;
    var Mgr = /** @class */ (function () {
        function Mgr(svr) {
            this.options = new Cache();
            this.stocks = new Cache();
            this._svr = svr;
        }
        Mgr.prototype.initKV = function () {
            this.stocks.init(this._svr, Stock.name, Stock.fromJson, STOCKS_JSON);
            this.options.init(this._svr, Option.name, Option.fromJson, OPTIONS_JSON);
            this.options.doSort(function (a, b) {
                var aDay = a.isExpired() ? (-Math.round(a._dayToExp / 10) * 1000) : a._dayToExp;
                var bDay = b.isExpired() ? (-Math.round(b._dayToExp / 10) * 1000) : b._dayToExp;
                var res = aDay - bDay;
                if (aDay == bDay) {
                    var aName = a.Name + a.P_C + '-' + a.Strike + a.DateBought;
                    var bName = b.Name + b.P_C + '-' + b.Strike + b.DateBought;
                    res = -aName.localeCompare(bName);
                }
                return res;
            });
            var options = this.options.getAll().filter(function (e) {
                return !e.isExpired();
            });
            options.forEach(function (e) {
                e.getStock().addContract(e);
            });
        };
        Mgr.prototype.clearAll = function () {
            this.options.clearAll();
        };
        return Mgr;
    }());
    MyApp.Mgr = Mgr;
    var Meta = /** @class */ (function () {
        function Meta() {
            this._map = {};
        }
        Meta.get = function () {
            return this._instance;
        };
        Meta.isNeedUpdate = function (localVer) {
            var serverVer = this.get().getVersion();
            var res = serverVer > 0 && serverVer > localVer;
            return res;
        };
        Meta.isNativeClientNeedUpdate = function (currNativeClientVersion) {
            var expectedVer = this.get().getPhoneClientVersion();
            var res = expectedVer > 0 && (currNativeClientVersion < expectedVer);
            return res;
        };
        Meta.init = function (jsons) {
            var meta = new Meta();
            jsons = jsons || [];
            for (var i = 0; i < jsons.length; i++) {
                var json = jsons[i];
                meta.put(json.Name, json.Value2);
            }
            this._instance = meta;
            console.info(' meta: ' + JSON.stringify(this._instance._map));
        };
        Meta.prototype.put = function (key, val) {
            if (this._map[key]) {
                console.warn('duplicate meta key: ' + key + ", val:" + this._map[key] + ", newVal: " + val);
            }
            else {
                this._map[key] = val;
            }
        };
        Meta.prototype.get = function (key) {
            return this._map[key];
        };
        Meta.prototype.getVersion = function () {
            var v = this.get('version');
            return parseInt(v);
        };
        Meta.prototype.getPhoneClientVersion = function () {
            var v = this.get('phoneClientVersion');
            return parseInt(v);
        };
        Meta._instance = new Meta;
        return Meta;
    }());
    MyApp.Meta = Meta;
    var CvsHelper = /** @class */ (function () {
        function CvsHelper() {
        }
        CvsHelper.dash = function (val, idx) {
            if (idx == null) {
                idx = 4;
            }
            if (val && val.length > idx) {
                val = val.substr(0, idx) + '-' + val.substr(idx);
            }
            return val;
        };
        CvsHelper.valueOrNA = function (val) {
            return (val == null || val == undefined || val === 0 || val == 'NA') ? '--' : val;
        };
        CvsHelper.cleanTxt = function (txt) {
            txt = txt || '';
            return txt.replace(/,/g, '???').replace(/\n/g, '???').replace(/\"/g, '`');
        };
        return CvsHelper;
    }());
    MyApp.CvsHelper = CvsHelper;
    var NetworkMgr = /** @class */ (function () {
        function NetworkMgr(svr, $timeout) {
            this._isNetworkError = false;
            this._networkErrorStart = new Date();
            this.$timeout = null;
            this._delayedSyncTask = null;
            this.delaySeconds = 2;
            this.svr = svr;
            this.$timeout = $timeout;
        }
        NetworkMgr.prototype.onDelayedSyncTasks = function () {
            var _this = this;
            console.info('onDelayedSyncTasks ....');
            if (this._delayedSyncTask) {
                //this._delayedSyncTask.cancel();
                this.$timeout.cancel(this._delayedSyncTask);
                console.info(' prev delayed sync cancelled....');
            }
            this._delayedSyncTask = this.$timeout(function () {
                console.info(_this.delaySeconds + 's  times up, really do the sync ');
                // this.svr.doSyncTasks();
            }, this.delaySeconds * 1000);
        };
        NetworkMgr.prototype.onNetworkOk = function () {
            this._isNetworkError = false;
        };
        NetworkMgr.prototype.onNetworkError = function () {
            this._isNetworkError = true;
            if (this.isTimeUp()) {
                this._networkErrorStart = new Date();
            }
        };
        NetworkMgr.prototype.getTimeElapsed = function () {
            if (this._networkErrorStart == null) {
                return 9999;
            }
            var now = new Date();
            var elapsed = (now.getTime() - this._networkErrorStart.getTime()) / 1000;
            console.info(' network error time elapsed: ' + elapsed);
            return elapsed;
        };
        NetworkMgr.prototype.isTimeUp = function () {
            return this.getTimeElapsed() > 60;
        };
        NetworkMgr.prototype.isTimeToRetry = function () {
            // if no network error, yet, do it.
            if (!this._isNetworkError) {
                return true;
            }
            // other-wise, if it elapsed 1 min?
            return this.isTimeUp();
        };
        NetworkMgr.prototype.reset = function () {
            this._networkErrorStart = new Date();
        };
        NetworkMgr.prototype.isNetworkError = function () {
            return this._isNetworkError;
        };
        return NetworkMgr;
    }());
    MyApp.NetworkMgr = NetworkMgr;
    var Helper = /** @class */ (function () {
        function Helper() {
        }
        Helper.toDiff = function (obj1, obj2) {
            /**
             * https://gist.github.com/Yimiprod/7ee176597fef230d1451
             *
             * Deep diff between two object, using lodash
             * @param  {Object} obj1 Object compared
             * @param  {Object} obj2   Object to compare with
             * @return {Object}        Return a new object who represent the diff
             */
            function difference(obj1, obj2) {
                function changes(obj1, obj2) {
                    return _.transform(obj1, function (result, value, key) {
                        if (!_.isEqual(value, obj2[key])) {
                            result[key] = (_.isObject(value) && _.isObject(obj2[key])) ? changes(value, obj2[key]) : value;
                        }
                    });
                }
                return changes(obj1, obj2);
            }
            var res = 'diff-NA';
            try {
                res = difference(obj1, obj2);
            }
            catch (e) {
                console.warn(e);
            }
            return '' + res;
        };
        Helper.getNumber = function (str) {
            // parseInt ('xx12xx34xx'.replace( /^\D+/g, ''))
            return parseInt(str.replace(/^\D+/g, ''));
        };
        Helper.timeDiffInSeconds = function (d1, d2) {
            if (!d1 || !d2) {
                return 99999;
            }
            var diff = d1.getTime() - d1.getTime();
            return Math.abs(diff / 1000);
        };
        Helper.timeDiffInMinutes = function (d1, d2) {
            if (!d1 || !d2) {
                return 99999999;
            }
            var diff = d1.getTime() - d1.getTime();
            return Math.abs(diff / 60000);
        };
        Helper.showDate = function (date) {
            if (date) {
                if (!date.format) {
                    date = moment(date);
                }
                return date.format('YYYY-MM-DD');
            }
            else {
                return 'NA-' + (date || '');
            }
        };
        Helper.showTime = function (date) {
            if (date) {
                if (!date.format) {
                    date = moment(date);
                }
                return date.format('HH:mm');
            }
            else {
                return 'NA-' + (date || '');
            }
        };
        Helper.getDateStr = function (date) {
            if (!date) {
                date = new Date();
            }
            return this.showDate(date);
        };
        Helper.isEmpty = function (obj) {
            return obj === undefined || obj === null;
        };
        Helper.isBlank = function (obj) {
            return obj === undefined || obj === null || ('' + obj).trim() === '';
        };
        Helper.copyTxtToClipboard = function (svr, text) {
            // https://www.codegrepper.com/code-examples/javascript/how+to+copy+to+clipboard+in+angularjs+w3schools
            // Since Async Clipboard API is not supported for all browser!
            var textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                var successful = document.execCommand('copy');
                var msg = successful ? 'successful' : 'unsuccessful';
                console.log('Copying text command was ' + msg);
                svr.UiInfo('copied ok');
            }
            catch (err) {
                console.log('Oops, unable to copy');
                svr.UiInfo('copied failed! ');
            }
            document.body.removeChild(textArea);
        };
        Helper.copyToClipboard = function (svr, docId) {
            // https://www.w3schools.com/howto/howto_js_copy_clipboard.asp
            /* Get the text field */
            var copyText = document.getElementById(docId);
            /* Select the text field */
            // @ts-ignore
            copyText.select();
            // @ts-ignore
            copyText.setSelectionRange(0, 99999); /* For mobile devices */
            /* Copy the text inside the text field */
            document.execCommand("copy");
            /* Alert the copied text */
            // alert("Copied the text: " + copyText.value);
            svr.UiInfo('data copied ');
        };
        Helper.clearAll = function (obj) {
            if (obj === null || obj === undefined) {
                return;
            }
            if (obj.constructor === Array) {
                while (obj.length > 0) {
                    obj.pop();
                }
            }
            else {
                for (var prop in obj) {
                    if (obj.hasOwnProperty(prop)) {
                        delete obj[prop];
                    }
                }
            }
        };
        Helper.dateTime2date = function (datetime) {
            if (this.isBlank(datetime)) {
                return datetime;
            }
            return datetime.substr(0, 10);
        };
        // compare date1, date2,   return -1, 0, 1  as  date1 - date 2
        Helper.compareDate = function (date1, date2) {
            if (Helper.isBlank(date1)) {
                return -1;
            }
            if (Helper.isBlank(date2)) {
                return 1;
            }
            // date format '2018-01-01
            var d1 = this.dateTime2date(date1).replace('-', '').replace('-', '');
            var d2 = this.dateTime2date(date2).replace('-', '').replace('-', '');
            return parseInt(d1) - parseInt(d2);
        };
        Helper.getLocalTime = function () {
            return new Date();
            //
            // let now = new Date();
            // let localDate = new Date(now.getTime() + now.getTimezoneOffset() * 60 * 1000);
            // let offset = now.getTimezoneOffset() / 60;
            // let hours = now.getHours();
            //
            // localDate.setHours(hours - offset);
            //
            // return localDate;
        };
        Helper.json_replacer = function (key, value) {
            if (key.startsWith('_#')) {
                return '_#' + key;
            }
            else {
                return value;
            }
        };
        return Helper;
    }());
    MyApp.Helper = Helper;
    var TmpStore = /** @class */ (function () {
        function TmpStore(svr) {
            this.PIN_KEY = Config.APP_ID + '-outlet-pin-';
            this._svr = null;
            this.storage = window.localStorage;
            this._all = null;
            this._pins = null;
            this._svr = svr;
        }
        TmpStore.prototype.getAllPin = function () {
            if (this._pins == null) {
                this._pins = [];
                var key = this.getPinKey();
                var jsonStr = this.storage.getItem(key);
                if (!Helper.isBlank(jsonStr)) {
                    var items = JSON.parse(jsonStr);
                    for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
                        var item = items_1[_i];
                        this._pins.push(item);
                    }
                }
                console.info(key + ' pins: ' + JSON.stringify(this._pins));
            }
            return this._pins;
        };
        TmpStore.prototype.getPinKey = function () {
            return this.PIN_KEY + this._svr.getConfigYear() + '-' + this._svr.getConfigMonth();
        };
        TmpStore.prototype.doSavePins = function () {
            var key = this.getPinKey();
            var json = JSON.stringify(this.getAllPin());
            this.storage.setItem(key, json);
        };
        TmpStore.prototype.doPin = function (outletCode) {
            var pins = this.getAllPin();
            if (pins.indexOf(outletCode) < 0) {
                pins.push(outletCode);
                this.doSavePins();
            }
        };
        TmpStore.prototype.isPinned = function (outletCode) {
            var pins = this.getAllPin();
            return pins.indexOf(outletCode) >= 0;
        };
        TmpStore.prototype.doPinToggle = function (outletCode) {
            if (this.isPinned(outletCode)) {
                this.doUnpin(outletCode);
            }
            else {
                this.doPin(outletCode);
            }
        };
        TmpStore.prototype.doUnpin = function (outletCode) {
            var pins = this.getAllPin();
            var idx = pins.indexOf(outletCode);
            if (idx < 0) {
                var msg = ' hmm...  unpin non-existing one... : ' + outletCode;
                console.warn(msg);
            }
            else {
                pins.splice(idx, 1);
                this.doSavePins();
            }
            return;
        };
        TmpStore.prototype.listUpdated = function () {
            this._all = null;
        };
        TmpStore.prototype.clearAll = function () {
            this._all = null;
            this._pins = null;
        };
        TmpStore.prototype.clearById = function (id) {
            var key = this.makeKeyByTaskId(id);
            console.info(TmpStore.TAG + ' clearing id key: ' + key);
            this.storage.removeItem(key);
            this.listUpdated();
        };
        // public doUploadAll(): void {
        //
        //     // sync all memory dirty-tasks first;
        //     this._svr.doSyncTasks().then((res) => {
        //
        //         this.listUpdated();
        //
        //         // then, sync all local-tmp tasks
        //         let tmpTasks = this.getAll();
        //
        //         if (tmpTasks.length > 0) {
        //             this._svr.doSyncTasks(tmpTasks).then(() => {
        //
        //                     // need to refresh data from server, since tmpStore (local-storage) has latest data uploaded, and sync from server
        //                     // to match newly updated data.
        //                     this._svr.doRefreshData()
        //                 }
        //             );
        //         } else {
        //             this._svr.refreshView();
        //         }
        //
        //         let msg = TmpStore.TAG + ' doUploadAll : ' + tmpTasks.length + ', tmp: ' + this.getAll().length;
        //         console.info(msg);
        //         this._svr.doLogServerMsg(msg);
        //     });
        //
        //
        // }
        TmpStore.prototype.hasPending = function () {
            return this.getAll().length > 0;
        };
        TmpStore.prototype.getAll = function () {
            if (this._all == null) {
                var year = this._svr.config.getConfigYear();
                var month = this._svr.config.getConfigMonth();
                var prefix = 'smkt-task-' + year + '-' + month + '-';
                var keys = Object.keys(this.storage);
                var res = [];
                var skipped = [];
                for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                    var key = keys_1[_i];
                    if (key.startsWith(prefix)) {
                        var task = this.getByKey(key);
                        if (task) {
                            res.push(task);
                        }
                    }
                    else {
                        // console.info(TmpStore.TAG + ' skipped key: ' + key);
                        skipped.push(key);
                        var pinKey = this.getPinKey();
                        if (key.startsWith(this.PIN_KEY) && key != pinKey) {
                            // this.storage.removeItem(key);
                            var msg = 'skip removing old pin key: ' + key;
                            console.info(msg);
                            // this._svr.doLogServerMsg(msg);
                        }
                    }
                }
                this._all = res;
                console.info(TmpStore.TAG + ' skipped keys: ' + JSON.stringify(skipped));
                console.info(TmpStore.TAG + ' found tmp tasks: ' + this._all.length);
            }
            return this._all;
        };
        TmpStore.prototype.save = function (task) {
            var tag = this.makeKey(task);
            // task.onChange();
            // task.prepareSave();
            this.storage.setItem(tag, JSON.stringify(task));
            this.listUpdated();
            console.info(TmpStore.TAG + ' saved : ' + task.Id);
        };
        TmpStore.prototype.getByKey = function (key) {
            var jsonStr = this.storage.getItem(key);
            var res = null;
            if (jsonStr) {
                var json = JSON.parse(jsonStr);
                res = Option.fromJson(this._svr, json);
                // console.info(TmpStore.TAG + ' unpacking: ' + jsonStr );
                // console.info(TmpStore.TAG + ' unpacked: ' + JSON.stringify(res) );
                res._dirty = true;
                // let tlet0 = res.getTasklets()[0];
                console.info(TmpStore.TAG + ' load id: ' + res.Id);
            }
            else {
                var msg = TmpStore.TAG + ' task not found on local-storage for key' + key;
                console.info(msg);
                // this._svr.doLogServerMsg(msg);
            }
            return res;
        };
        TmpStore.prototype.getByTaskId = function (id) {
            var tag = this.makeKeyByTaskId(id);
            return this.getByKey(tag);
        };
        TmpStore.prototype.makeKeyByTaskId = function (taskId) {
            // sample : smkt-2019-1-xxxx  , where xxx is task.id
            return 'smkt-task-' + this._svr.config.getConfigYear() + '-' + this._svr.config.getConfigMonth() + '-' + taskId;
        };
        TmpStore.prototype.makeKey = function (t) {
            return this.makeKeyByTaskId(t.Id);
        };
        TmpStore.TAG = 'TmpStore';
        return TmpStore;
    }());
    MyApp.TmpStore = TmpStore;
    var Cache = /** @class */ (function () {
        function Cache() {
            this._all = [];
            this._idMap = {};
            this._keyMap = {};
        }
        Cache.prototype.clearAll = function () {
            Helper.clearAll(this._all);
            Helper.clearAll(this._idMap);
            Helper.clearAll(this._keyMap);
        };
        Cache.prototype.getAll = function () {
            return this._all;
        };
        Cache.prototype.get = function (id) {
            return this._idMap[id];
        };
        Cache.prototype.getByKey = function (key) {
            return this._keyMap[key];
        };
        Cache.prototype.add = function (e) {
            //this._all.push(e);
            this._all.unshift(e);
            this._idMap[e.Id] = e;
            var key = e.getKey();
            if (key) {
                if (this._keyMap[key]) {
                    var msg = ' ! duplicate key for ' + name + ', key: ' + key;
                    console.warn(msg);
                    alert(msg);
                }
                else {
                    this._keyMap[key] = e;
                }
            }
        };
        Cache.prototype.doSort = function (fn) {
            if (!fn) {
                fn = function (a, b) {
                    if (a.getKey()) {
                        return a.getKey().localeCompare(b.getKey());
                    }
                    else {
                        return a.Id - b.Id;
                    }
                };
            }
            this._all.sort(fn);
        };
        Cache.prototype.init = function (svr, name, maker, jsons) {
            // let res = new Cache<T>();
            this.clearAll();
            jsons = jsons || [];
            for (var i = 0; i < jsons.length; i++) {
                var json = jsons[i];
                //let e: T =   T.fromJson2(json);
                var e = maker(svr, json);
                this.add(e);
            }
            console.info(' ' + name + ' :' + this._all.length);
        };
        return Cache;
    }());
    MyApp.Cache = Cache;
    var OptionStats = /** @class */ (function () {
        function OptionStats() {
            this.exposure_c = 0;
            this.exposure_p = 0;
            this.numCall = 0;
            this.numPut = 0;
            this.numContracts = 0;
            this.numRows = 0;
            this.amtCashIn = 0;
            this.amtDaySum = 0;
            this.amtLost = 0;
            this.cost_exposure_ratio = 0;
        }
        OptionStats.prototype.calc = function (options) {
            this.exposure_p = 0;
            this.exposure_c = 0;
            this.numCall = 0;
            this.numPut = 0;
            this.numContracts = 0;
            this.numRows = 0;
            this.amtDaySum = 0;
            this.amtCashIn = 0;
            this.amtLost = 0;
            this.cost_exposure_ratio = 0;
            for (var _i = 0, options_1 = options; _i < options_1.length; _i++) {
                var option = options_1[_i];
                if (option.isCall()) {
                    this.exposure_c += option.toHKD(option.getExposure());
                    this.numCall++;
                }
                else {
                    this.exposure_p += option.toHKD(option.getExposure());
                    this.numPut++;
                }
                this.amtCashIn += option.toHKD(option.getCashIn());
                this.amtLost += option.toHKD(option.getLost());
                this.numContracts += Math.abs(option.NumContract);
                this.numRows++;
                this.amtDaySum += option.toHKD(option.getAmtPerDay());
            }
            this.cost_exposure_ratio = (this.amtCashIn / (this.exposure_c + this.exposure_p) * 100);
        };
        return OptionStats;
    }());
    MyApp.OptionStats = OptionStats;
    var Stock = /** @class */ (function (_super) {
        __extends(Stock, _super);
        function Stock() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            // js --
            _this.Name = '';
            _this.Symbol = '';
            _this.Price = 0;
            _this.OptionMultiple = 0;
            _this.IsHK = 0;
            _this.PriceLast = 0;
            _this._dirty = true;
            // _exposure_p: number = 0;
            // _exposure_c: number = 0;
            // _cash_in_amt: number = 0;
            // _cash_lost_amt: number = 0;
            // _num_call = 0;
            // _num_put = 0;
            _this._isShow = true;
            _this._stats = new OptionStats();
            _this._month_contracts = {};
            return _this;
        }
        // _change: number = 0;
        // _change_pct: string = '';
        Stock.fromJson = function (svr, json) {
            var e = new Stock();
            e._dirty = false;
            e.Name = json.Name || '';
            e.Symbol = json.Symbol || '';
            e.Price = json.Price || 0;
            e.OptionMultiple = json.OptionMultiple || 0;
            e.IsHK = json.IsHK || 0;
            e.PriceLast = json.PriceLast || 0;
            if (!e.PriceLast) {
                e.PriceLast = e.Price;
            }
            return e;
        };
        Stock.prototype.addContract = function (option) {
            var month = option.getMonth();
            var isCall = option.isCall();
            var num = option.NumContract;
            var cell = this._month_contracts[month];
            if (!cell) {
                cell = { num_call: 0, num_put: 0, cash_in_daily: 0 };
                this._month_contracts[month] = cell;
            }
            var idx = isCall ? 'num_call' : 'num_put';
            cell[idx] += num;
            cell.cash_in_daily += option.getAmtPerDay();
            this._stats.amtCashIn += option.getCashIn();
            this._stats.amtDaySum += option.getAmtPerDay();
            this._stats.amtLost += option.getLost();
        };
        Stock.prototype.getCashIn = function (month) {
            var cell = this._month_contracts[month];
            return cell.cash_in_daily;
        };
        Stock.prototype.getContractNum = function (month, isCall) {
            var cell = this._month_contracts[month];
            var res = 0;
            if (cell) {
                var idx = isCall ? 'num_call' : 'num_put';
                res = cell[idx];
            }
            return res;
        };
        Stock.prototype.getKey = function () {
            return this.Symbol;
        };
        Stock.prototype.isHK = function () {
            return this.IsHK > 0;
        };
        Stock.prototype.getChange = function () {
            return this.Price - this.PriceLast;
        };
        Stock.prototype.getChangePct = function () {
            return (this.getChange() / this.PriceLast * 100);
        };
        Stock.str = 'Stock| Name:str; Symbol:str; Price:number; OptionMultiple:num; IsHK:int; ';
        return Stock;
    }(Base));
    MyApp.Stock = Stock;
    var Option = /** @class */ (function (_super) {
        __extends(Option, _super);
        function Option() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            // js --
            _this.Id = -1;
            // public Status: number = 0;
            // public Remark: string = '';
            // public UpdateBy: number = 0;
            // public UpdateAt: Date;
            _this.Name = '';
            _this.Strike = 0;
            _this.StockTicker = '';
            _this.DateBought = '';
            _this.DateExp = '';
            _this.Premium = 0;
            _this.NumContract = 0;
            _this.P_C = '';
            _this._dirty = true;
            _this._isMock = false;
            return _this;
        }
        Option.fromJson = function (svr, json) {
            var e = new Option();
            e._dirty = false;
            e.Id = json.Id;
            // e.Status = json.Status;
            // e.Remark = json.Remark;
            // e.UpdateBy = json.UpdateBy;
            // e.UpdateAt = json.UpdateAt;
            e.Name = json.Name;
            e.Strike = json.Strike;
            e.StockTicker = json.StockTicker;
            e.DateBought = json.DateBought;
            e.DateExp = json.DateExp;
            e.Premium = json.Premium;
            e.PriceAtBought = json.PriceAtBought;
            e.PriceAtExp = json.PriceAtExp;
            e.PriceAtClose = json.PriceAtClose;
            e.NumContract = json.NumContract;
            e.P_C = json.P_C;
            e._stock = svr.mgr.stocks.getByKey(e.getStockSymbol());
            e.init();
            return e;
        };
        Option.prototype.onUpdate = function () {
            this._dirty = true;
        };
        Option.prototype.getStockSymbol = function () {
            if (this.Name.startsWith('??????')) {
                return '0700';
            }
            if (this.Name.startsWith('??????')) {
                return '9988';
            }
            if (this.Name.startsWith('BA')) {
                return 'BABA';
            }
            if (this.Name.startsWith('FU')) {
                return 'FUTU';
            }
            console.warn(' cannot map to symbol, name: ' + this.Name);
            return 'N/A';
        };
        Option.prototype.getMonth = function () {
            var m = moment(this.DateExp);
            var res = m.month() + 1;
            // hack()  if it's next year's this month, put it to previous month so that it won't overlap with this year's this month;
            if (this._dayToExp > 360) {
                res--;
                if (res < 1) {
                    res = 12;
                }
            }
            return res;
        };
        Option.prototype.getColor = function () {
            var day = this._dayToExp;
            var res = '';
            if (this._isMock) {
                res = 'lightblue';
            }
            else if (this.isExpired()) {
                res = 'lightgrey';
            }
            else {
                if (!this.isOutOfMoney(false)) {
                    if (this.isOutOfMoney(true)) {
                        res = 'pink';
                    }
                    else {
                        res = 'lightcoral';
                    }
                }
                else {
                    var buffer = this.getPriceBufferPct();
                    if (buffer < 5) {
                        res = 'lightyellow';
                    }
                }
            }
            return res;
            // if (day < 10) {
            //     return 'light'
            // }
        };
        Option.prototype.getExposure = function () {
            return this.getNumShares() * this.Strike;
        };
        Option.prototype.getNumShares = function () {
            return Math.abs(this.getStock().OptionMultiple * this.NumContract);
        };
        Option.prototype.getStock = function () {
            return this._stock;
        };
        Option.prototype.init = function () {
            if (this.DateExp.indexOf('-') < 0) {
                var str = this.DateExp;
                // str = '20201127'
                this.DateExp = str.substr(0, 4) + '-' + str.substr(4, 2) + '-' + str.substr(6);
            }
            if (this.DateBought.indexOf('/') > 0) {
                var mm = moment(this.DateBought, 'YYYY/MM/DD');
                this.DateBought = mm.format('YYYY-MM-DD');
            }
            var datExp = moment(this.DateExp);
            var dayBought = moment(this.DateBought);
            var today = moment();
            // Helper.compareDate()
            this._dayToExp = datExp.diff(today, 'days') + 1;
            this._dayBoughtTillExp = datExp.diff(dayBought, 'days') + 1;
        };
        Option.prototype.isExpired = function () {
            return this._dayToExp < 0;
            // return this._dayToExp <= 0;
        };
        Option.prototype.match = function (filter) {
            var txt = this.getStock().Symbol + this.Strike + '-' + this.P_C + '-' + this.DateBought;
            return (txt.indexOf(filter) >= 0);
        };
        Option.prototype.toHKD = function (amtPerDay) {
            var ratio = 1;
            if (!this.isHK()) {
                ratio = 7.76;
            }
            return amtPerDay * ratio;
        };
        Option.prototype.isHK = function () {
            return this.getStock().isHK();
            // return !this.Name.startsWith('FU')
        };
        Option.prototype.isCall = function () {
            return this.P_C == 'C';
        };
        Option.prototype.getSign = function () {
            var res = 1;
            if (this.NumContract < 0) {
                res = -res;
            }
            if (this.isCall()) {
                res = -res;
            }
            return res;
        };
        Option.prototype.isOutOfMoney = function (withPremium) {
            if (withPremium === void 0) { withPremium = false; }
            var breakEven = this.getBreakEvenPrice(withPremium);
            var price = this.getStock().Price;
            var delta = this.getSign() * (price - breakEven);
            return delta < 0;
        };
        Option.prototype.getBreakEvenPrice = function (withPremium) {
            if (withPremium === void 0) { withPremium = true; }
            var delta = 0;
            if (withPremium) {
                var sign = this.getSign();
                delta = (sign * this.Premium);
            }
            return this.Strike + delta;
        };
        Option.prototype.getCashIn = function () {
            return this.getNumShares() * this.Premium;
        };
        Option.prototype.getAmtPerDay = function () {
            return this.getCashIn() / this._dayBoughtTillExp;
        };
        Option.prototype.getReturn = function () {
            return this.getCashIn() / this._dayBoughtTillExp;
        };
        Option.prototype.getRisk = function () {
            var price = this.getStock().Price;
            return (price / (price - this.Strike) * (this._dayToExp / 365) * this.getNumShares());
        };
        Option.prototype.getLost = function () {
            var res = 0;
            if (!this.isOutOfMoney(false)) {
                var breakEven = this.getBreakEvenPrice(false);
                var price = this.getStock().Price;
                var delta = this.getSign() * (price - breakEven);
                res = delta * this.getNumShares();
            }
            return res;
        };
        Option.prototype.getPriceBufferPct = function () {
            var bep = this.getBreakEvenPrice(true);
            var price = this.getStock().Price;
            return (this.getSign() * (bep - price) / price * 100);
        };
        Option.str = 'Option| Name:str; Strike:num; StockTicker:str; DateBought:str; DateExp: str; Price:num; PriceAtBought:num; PriceAtExp:num Premium:int; AmtCost:int; NumContract:int; NumShareExposed; P_C:str; ';
        return Option;
    }(Base));
    MyApp.Option = Option;
})(MyApp || (MyApp = {}));
//# sourceMappingURL=Models.js.map