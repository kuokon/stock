module MyApp {


    export class Config {

        public static APP_ID: string = 'stock';
        public version: number = 71;
        public appID: string = Config.APP_ID;

        public phoneNativeClientVersion: number = 0;
        public loaded: boolean = false;
        public isPhone: boolean = false;
        public numTryLogout: number = 0;
        public currUser: User = null;

        public configYear: number = null;
        public configMonth: number = null;

        public actualYear: number = null;
        public actualMonth: number = null;

        public isDev: boolean = false;

        // used in header.html
        public minDate: Date = new Date("2017-08-01");
        public maxDate: Date;


        public minPaperDate: Date = new Date("2020-01-01");
        public maxPaperDate: Date;


        public paperReportDate = null;

        svr: DbService = null;
        $localStorage = null;

        public ItemCodeTerm: number = -1;

        // public isNewTerm(): boolean {
        //     return this.configYear > 2019
        //         || (this.configYear == 2019 && this.configMonth >= 10);
        // }
        //
        public startupTime: Date = new Date();

        constructor(svr: DbService, $localStorage) {

            let now = new Date();
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


        public getTimeInfo(): string {
            return this.getConfigYear() + '-' + this.getConfigMonth();
        }

        public getTimeDuration(): string {

            function lifeSpan(t0: Date) {
                let now = new Date();

                let x = (now.getTime() - t0.getTime()), a = x, i = 0, s = 0, m = 0, h = 0, j = 0;
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
                                    j = a;//...
                                }
                            }
                        }
                    }
                }
                return 'Elapsed: ' + h + 'h ' + m + 'm ' + s + 's.';
            }

            return lifeSpan(this.startupTime)

        }

        public setCurrUser(user: User, passwd: string) {

            this.currUser = user;

            let basicAuth = user ? 'Basic ' + window.btoa(user.Id + ':' + passwd) : null;
            // this.svr.api.$http.defaults.headers.common['Authorization'] = basicAuth;


            let auth_key = this.appID + '-basic-auth';
            let user_key = this.appID + '-user';

            let userId = user ? user.Id : '';

            this.$localStorage[user_key] = userId;
            this.$localStorage[auth_key] = basicAuth;
        }

        public selectPaperReportDate(d: Date) {
            this.paperReportDate = d;
        }

        public getPaperReportDate(): Date {
            if (this.paperReportDate == null) {

                let d = new Date();
                d.setMonth(d.getMonth() + 1);
                this.paperReportDate = d;
            }

            return this.paperReportDate;
        }


        public isConfigDateSameAsActual(): boolean {
            return this.configMonth === this.actualMonth
                && this.configYear === this.actualYear;
        }

        public getDateBackgroundColor(): string {

            if (this.isConfigDateSameAsActual()) {
                return ''
            } else {
                return 'orange';
            }
        }


        public getMonthOptions(): number[] {
            return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        }

        public getYearOptions(): number[] {
            return [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022]
        }

        public getActualMonth(): number {
            return this.actualMonth;
        }

        public getActualYear(): number {
            return this.actualYear;
        }

        public getConfigYear() {

            //let _db: Db = this.$localStorage;
            if (!this.configYear) {

                let year_key = Config.APP_ID + '-config-year';


                this.configYear = this.$localStorage[year_key];

                if (Helper.isBlank(this.configYear)) {
                    this.configYear = this.actualYear;
                }
            }
            return this.configYear;

        }


        public getConfigMonth() {
            if (!this.configMonth) {

                let month_key = Config.APP_ID + '-config-month';

                this.configMonth = this.$localStorage[month_key];
                // if (!this.svr.getCurrUser().isInspector() || this.svr.isDev()) {
                //     this.configMonth = this.$localStorage.configMonth;
                // }

                if (Helper.isBlank(this.configMonth)) {
                    this.configMonth = this.actualMonth;
                }
            }
            return this.configMonth;
        }

        public getNativeClientVersion(): number {
            return this.phoneNativeClientVersion;
        }

        onInitNative(ver: string) {

            this.phoneNativeClientVersion = parseInt(ver) || 0;
            console.info('phone client version: ' + this.phoneNativeClientVersion);

        }


        public isVersionMatch(): boolean {

            let jsVerClient = this.version;
            let jsVerServer = Meta.get().getVersion();

            let androidVerClient = (this.isPhone ? this.getNativeClientVersion() : 0);
            let androidVerServer = Meta.get().getPhoneClientVersion();

            let match = jsVerClient == jsVerServer && (androidVerClient == 0 || (androidVerClient == androidVerServer));
            if (!match) {
                console.info(' version mismatch : js: ' + jsVerClient + '-' + jsVerServer
                    + ' | android: ' + androidVerClient + '-' + androidVerServer);
            }
            return match;

        }

    }


    export abstract class Base {

        public Id = -1;
        public Name;

        public getKey(): string {
            return null;
        }


        toString() {
            return JSON.stringify(this, Helper.json_replacer);
        }


        public isNew(): boolean {
            return !(this.Id >= 0);
        }
    }


    export class User extends Base {

        private static ROLE_NAME_MAP = {
            INSPECTOR: "調查員",
            OPERATOR: "內勤",
            ADMIN: "管理員",
        };
        _dirty: boolean = false;
        private outletTaskCountMap = {};

        constructor(public Id: number,
                    public Name: string,
                    public Name_E: string,
                    public Role: string,
                    public Status: string) {

            super();
        }

        public static mkModel(): ModelGen {

            let str = 'User| Name:str; Role:str; Status:int; Dept:str';
            return ModelGen.from(str);

        }

        static fromJson(svr: DbService, json): User {

            return new User(json.Id, json.Name, json.Name_E, json.Role, json.Status);
        }

        static makeNullUser(): User {
            return new User(-1, 'Test', 'Test_E', "NA", "NA");
        }

        getKey(): string {
            return this.Id + '';
        }

        isNull(): boolean {
            return this.Name.startsWith('N/A');
        }

        addOutletTaskCount(outletCode) {
            if (!this.outletTaskCountMap[outletCode]) {
                this.outletTaskCountMap[outletCode] = 0;
            }
            this.outletTaskCountMap[outletCode] = this.outletTaskCountMap[outletCode] + 1;
        }

        getOutletTaskCount(outletCode) {
            return this.outletTaskCountMap[outletCode];
        }

        isInspector(): boolean {
            return this.Role === 'INSPECTOR';
        };

        isOperator(): boolean {
            return this.Role === 'OPERATOR';
        };

        isAdmin(): boolean {
            return this.Role === 'ADMIN';
        };

        isExpired(): boolean {
            return (this.Status === 'Expired');
        }

        isActive(): boolean {
            return !this.isExpired();
        }

        getRoleName() {
            return User.ROLE_NAME_MAP[this.Role] || this.Role;
        };

        onChange() {
            this._dirty = true;
        }
    }

    declare var STOCKS_JSON, OPTIONS_JSON;

    export class Mgr {


        public options: Cache<Option> = new Cache<Option>();
        public stocks: Cache<Stock> = new Cache<Stock>();
        private _svr: DbService;

        constructor(svr: DbService) {
            this._svr = svr;
        }

        initKV(): void {

            this.stocks.init(this._svr, Stock.name, Stock.fromJson, STOCKS_JSON);

            this.options.init(this._svr, Option.name, Option.fromJson, OPTIONS_JSON);
            this.options.doSort((a: Option, b: Option) => {

                let aDay = a.isExpired() ? (-Math.round(a._dayToExp / 10) * 1000) : a._dayToExp;
                let bDay = b.isExpired() ? (-Math.round(b._dayToExp / 10) * 1000) : b._dayToExp;

                return aDay - bDay;
            });


            let options = this.options.getAll().filter(e => {
                return !e.isExpired()
            });

            options.forEach(e => {
                e.getStock().addContract(e);
            });

        }

        public clearAll(): void {

            this.options.clearAll();
        }

        //
        //
        // init(svr: DbService, res) {
        //
        //     this.clearAll();
        //
        //
        //
        //
        // }
    }


    export class Meta {

        private static _instance: Meta = new Meta;

        _map: {} = {};

        constructor() {
        }

        public static get(): Meta {
            return this._instance;
        }

        public static isNeedUpdate(localVer: number) {

            let serverVer = this.get().getVersion();

            let res = serverVer > 0 && serverVer > localVer;
            return res;
        }

        public static isNativeClientNeedUpdate(currNativeClientVersion: number) {

            let expectedVer = this.get().getPhoneClientVersion();

            let res = expectedVer > 0 && (currNativeClientVersion < expectedVer);
            return res;
        }

        static init(jsons): void {

            let meta = new Meta();
            jsons = jsons || [];

            for (let i = 0; i < jsons.length; i++) {
                let json = jsons[i];
                meta.put(json.Name, json.Value2);
            }

            this._instance = meta;

            console.info(' meta: ' + JSON.stringify(this._instance._map));
        }

        public put(key: string, val: string): void {
            if (this._map[key]) {
                console.warn('duplicate meta key: ' + key + ", val:" + this._map[key] + ", newVal: " + val);
            } else {
                this._map[key] = val;
            }
        }

        public get(key: string): string {

            return this._map[key];
        }

        public getVersion(): number {
            let v = this.get('version');
            return parseInt(v);
        }

        public getPhoneClientVersion(): number {
            let v = this.get('phoneClientVersion');
            return parseInt(v);
        }


    }


    export class CvsHelper {


        public static dash(val, idx?: number): string {
            if (idx == null) {
                idx = 4;
            }
            if (val && val.length > idx) {
                val = val.substr(0, idx) + '-' + val.substr(idx);
            }
            return val;
        }


        public static valueOrNA(val): string {
            return (val == null || val == undefined || val === 0 || val == 'NA') ? '--' : val;
        }

        public static cleanTxt(txt: string): string {
            txt = txt || '';
            return txt.replace(/,/g, '，').replace(/\n/g, '　').replace(/\"/g, '`');

        }
    }

    export class NetworkMgr {

        public _isNetworkError: boolean = false;
        public _networkErrorStart: Date = new Date();

        public svr: DbService;
        public $timeout = null;
        public _delayedSyncTask = null;
        public delaySeconds = 2;

        constructor(svr: DbService, $timeout) {
            this.svr = svr;
            this.$timeout = $timeout;
        }

        public onDelayedSyncTasks(): void {

            console.info('onDelayedSyncTasks ....');

            if (this._delayedSyncTask) {

                //this._delayedSyncTask.cancel();
                this.$timeout.cancel(this._delayedSyncTask);
                console.info(' prev delayed sync cancelled....');
            }

            this._delayedSyncTask = this.$timeout(() => {

                console.info(this.delaySeconds + 's  times up, really do the sync ');
                // this.svr.doSyncTasks();

            }, this.delaySeconds * 1000)

        }

        public onNetworkOk(): void {
            this._isNetworkError = false;
        }

        public onNetworkError(): void {

            this._isNetworkError = true;
            if (this.isTimeUp()) {
                this._networkErrorStart = new Date();
            }
        }

        public getTimeElapsed(): number {

            if (this._networkErrorStart == null) {
                return 9999;
            }

            let now = new Date();
            let elapsed = (now.getTime() - this._networkErrorStart.getTime()) / 1000;

            console.info(' network error time elapsed: ' + elapsed);
            return elapsed;
        }

        public isTimeUp(): boolean {
            return this.getTimeElapsed() > 60;
        }

        public isTimeToRetry(): boolean {

            // if no network error, yet, do it.
            if (!this._isNetworkError) {
                return true;
            }

            // other-wise, if it elapsed 1 min?

            return this.isTimeUp();

        }

        public reset() {
            this._networkErrorStart = new Date();
        }

        public isNetworkError(): boolean {
            return this._isNetworkError;
        }

    }


    declare let _;

    export class Helper {

        public static toDiff(obj1, obj2): string {


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

            let res = 'diff-NA';
            try {

                res = difference(obj1, obj2);
            } catch (e) {
                console.warn(e);
            }

            return '' + res;

        }

        public static json_replacer = (key, value) => {
            if (key.startsWith('_#')) {
                return '_#' + key

            } else {
                return value;
            }
        };


        public static getNumber(str: string): number {
            // parseInt ('xx12xx34xx'.replace( /^\D+/g, ''))

            return parseInt(str.replace(/^\D+/g, ''));
        }

        public static timeDiffInSeconds(d1: Date, d2: Date): number {

            if (!d1 || !d2) {
                return 99999;
            }

            let diff = d1.getTime() - d1.getTime();
            return Math.abs(diff / 1000);

        }

        public static timeDiffInMinutes(d1: Date, d2: Date): number {

            if (!d1 || !d2) {
                return 99999999;
            }

            let diff = d1.getTime() - d1.getTime();
            return Math.abs(diff / 60000);

        }


        static showDate(date): string {
            if (date) {

                if (!date.format) {
                    date = moment(date);
                }

                return date.format('YYYY-MM-DD');
            } else {
                return 'NA-' + (date || '');
            }
        }

        static showTime(date): string {


            if (date) {

                if (!date.format) {


                    date = moment(date);
                }

                return date.format('HH:mm');
            } else {
                return 'NA-' + (date || '');
            }
        }

        public static getDateStr(date?: Date): string {


            if (!date) {
                date = new Date();
            }

            return this.showDate(date);

        }

        public static isEmpty(obj): boolean {
            return obj === undefined || obj === null;
        }

        public static isBlank(obj): boolean {
            return obj === undefined || obj === null || ('' + obj).trim() === '';
        }

        public static copyTxtToClipboard(svr: DbService, text: string): void {

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


                svr.UiInfo('copied ok')

            } catch (err) {
                console.log('Oops, unable to copy');

                svr.UiInfo('copied failed! ')
            }

            document.body.removeChild(textArea);

        }

        public static copyToClipboard(svr: DbService, docId): void {


            // https://www.w3schools.com/howto/howto_js_copy_clipboard.asp

            /* Get the text field */
            let copyText = document.getElementById(docId);

            /* Select the text field */
            // @ts-ignore
            copyText.select();

            // @ts-ignore
            copyText.setSelectionRange(0, 99999); /* For mobile devices */

            /* Copy the text inside the text field */
            document.execCommand("copy");

            /* Alert the copied text */
            // alert("Copied the text: " + copyText.value);


            svr.UiInfo('data copied ')


        }


        public static clearAll(obj): void {

            if (obj === null || obj === undefined) {
                return;
            }

            if (obj.constructor === Array) {
                while (obj.length > 0) {
                    obj.pop();
                }
            } else {
                for (let prop in obj) {
                    if (obj.hasOwnProperty(prop)) {
                        delete obj[prop];
                    }
                }
            }
        }


        static dateTime2date(datetime: string): string {
            if (this.isBlank(datetime)) {
                return datetime;
            }
            return datetime.substr(0, 10);
        }

        // compare date1, date2,   return -1, 0, 1  as  date1 - date 2
        static compareDate(date1: string, date2: string): number {
            if (Helper.isBlank(date1)) {
                return -1
            }

            if (Helper.isBlank(date2)) {
                return 1
            }

            // date format '2018-01-01
            let d1 = this.dateTime2date(date1).replace('-', '').replace('-', '');
            let d2 = this.dateTime2date(date2).replace('-', '').replace('-', '');

            return parseInt(d1) - parseInt(d2);

        }


        public static getLocalTime(): Date {

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


        }
    }


    declare var Upload;

    export class TmpStore {

        public static TAG: string = 'TmpStore';
        PIN_KEY = Config.APP_ID + '-outlet-pin-';
        private _svr: DbService = null;
        private storage = window.localStorage;
        private _all: Option[] = null;
        private _pins: string[] = null;

        constructor(svr: DbService) {
            this._svr = svr;
        }

        public getAllPin(): string[] {

            if (this._pins == null) {
                this._pins = [];
                let key = this.getPinKey();
                let jsonStr = this.storage.getItem(key);
                if (!Helper.isBlank(jsonStr)) {
                    let items = JSON.parse(jsonStr);
                    for (const item of items) {
                        this._pins.push(item);
                    }
                }

                console.info(key + ' pins: ' + JSON.stringify(this._pins));
            }
            return this._pins;
        }

        public getPinKey(): string {
            return this.PIN_KEY + this._svr.getConfigYear() + '-' + this._svr.getConfigMonth();
        }

        public doSavePins() {
            let key = this.getPinKey();
            let json = JSON.stringify(this.getAllPin());
            this.storage.setItem(key, json);
        }

        public doPin(outletCode: string): void {

            let pins = this.getAllPin();
            if (pins.indexOf(outletCode) < 0) {
                pins.push(outletCode);
                this.doSavePins();
            }
        }

        public isPinned(outletCode: string): boolean {
            let pins = this.getAllPin();
            return pins.indexOf(outletCode) >= 0;
        }

        public doPinToggle(outletCode: string): void {
            if (this.isPinned(outletCode)) {
                this.doUnpin(outletCode);
            } else {
                this.doPin(outletCode);
            }
        }

        public doUnpin(outletCode: string): void {
            let pins = this.getAllPin();

            let idx = pins.indexOf(outletCode);

            if (idx < 0) {
                let msg = ' hmm...  unpin non-existing one... : ' + outletCode;
                console.warn(msg);

            } else {
                pins.splice(idx, 1);
                this.doSavePins();

            }
            return;
        }

        public listUpdated(): void {
            this._all = null;
        }

        public clearAll(): void {
            this._all = null;
            this._pins = null;
        }


        public clearById(id: number) {
            let key = this.makeKeyByTaskId(id);

            console.info(TmpStore.TAG + ' clearing id key: ' + key);
            this.storage.removeItem(key);

            this.listUpdated();
        }

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


        public hasPending(): boolean {
            return this.getAll().length > 0;
        }

        public getAll(): Option[] {

            if (this._all == null) {

                let year = this._svr.config.getConfigYear();
                let month = this._svr.config.getConfigMonth();

                let prefix = 'smkt-task-' + year + '-' + month + '-';

                let keys = Object.keys(this.storage);
                let res: Option[] = [];
                let skipped = [];

                for (const key of keys) {
                    if (key.startsWith(prefix)) {
                        let task = this.getByKey(key);
                        if (task) {
                            res.push(task);
                        }
                    } else {
                        // console.info(TmpStore.TAG + ' skipped key: ' + key);
                        skipped.push(key);

                        let pinKey = this.getPinKey();
                        if (key.startsWith(this.PIN_KEY) && key != pinKey) {
                            // this.storage.removeItem(key);
                            let msg = 'skip removing old pin key: ' + key;
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

        }

        public save(task: Option) {

            let tag = this.makeKey(task);

            // task.onChange();
            // task.prepareSave();
            this.storage.setItem(tag, JSON.stringify(task));

            this.listUpdated();

            console.info(TmpStore.TAG + ' saved : ' + task.Id);
        }


        public getByKey(key: string): Option {
            let jsonStr = this.storage.getItem(key);

            let res: Option = null;
            if (jsonStr) {
                let json = JSON.parse(jsonStr);
                res = Option.fromJson(this._svr, json);
                // console.info(TmpStore.TAG + ' unpacking: ' + jsonStr );
                // console.info(TmpStore.TAG + ' unpacked: ' + JSON.stringify(res) );
                res._dirty = true;

                // let tlet0 = res.getTasklets()[0];
                console.info(TmpStore.TAG + ' load id: ' + res.Id);

            } else {
                let msg = TmpStore.TAG + ' task not found on local-storage for key' + key;
                console.info(msg);

                // this._svr.doLogServerMsg(msg);
            }

            return res;

        }

        public getByTaskId(id: number): Option {

            let tag = this.makeKeyByTaskId(id);
            return this.getByKey(tag);
        }

        public makeKeyByTaskId(taskId: number): string {
            // sample : smkt-2019-1-xxxx  , where xxx is task.id
            return 'smkt-task-' + this._svr.config.getConfigYear() + '-' + this._svr.config.getConfigMonth() + '-' + taskId

        }

        public makeKey(t: Option): string {
            return this.makeKeyByTaskId(t.Id)
        }
    }


    export class Cache<T extends Base> {

        private _all: T[] = [];
        private _idMap: { [id: string]: T } = {};
        private _keyMap: { [id: string]: T } = {};

        public clearAll(): void {
            Helper.clearAll(this._all);
            Helper.clearAll(this._idMap);
            Helper.clearAll(this._keyMap);
        }

        public getAll(): T[] {
            return this._all;
        }

        public get(id: number): T {
            return this._idMap[id];
        }

        public getByKey(key: string): T {
            return this._keyMap[key];
        }

        public add(e: T) {
            //this._all.push(e);
            this._all.unshift(e);
            this._idMap[e.Id] = e;


            let key = e.getKey();
            if (key) {

                if (this._keyMap[key]) {
                    let msg = ' ! duplicate key for ' + name + ', key: ' + key;
                    console.warn(msg);
                    alert(msg);
                } else {
                    this._keyMap[key] = e;
                }
            }
        }

        public doSort(fn?): void {

            if (!fn) {
                fn = (a: T, b: T) => {

                    if (a.getKey()) {
                        return a.getKey().localeCompare(b.getKey());
                    } else {
                        return a.Id - b.Id;
                    }
                }
            }

            this._all.sort(fn);

        }


        public init(svr: DbService, name: string, maker, jsons) {

            // let res = new Cache<T>();
            this.clearAll();
            jsons = jsons || [];

            for (let i = 0; i < jsons.length; i++) {
                let json = jsons[i];

                //let e: T =   T.fromJson2(json);
                let e: T = maker(svr, json);
                this.add(e);
            }
            console.info(' ' + name + ' :' + this._all.length);
        }
    }

    export class OptionStats {
        exposure: number;
        exposure_c: number;
        exposure_p: number;
        amtCost: number;
        amtDaySum: number;
        numContracts: number;
        numRows: number;
        amtCashIn: number;

        cost_exposure_ratio: number;


        calc(options: Option[]) {
            this.exposure = 0;
            this.exposure_p = 0;
            this.exposure_c = 0;
            this.amtCost = 0;
            this.numContracts = 0;
            this.numRows = 0;
            this.amtDaySum = 0;
            this.amtCashIn = 0;


            this.cost_exposure_ratio = 0;

            for (const option of options) {
                this.exposure += option.toHKD(option.getExposure());

                if (option.isCall()) {
                    this.exposure_c += option.toHKD(option.getExposure());
                } else {
                    this.exposure_p += option.toHKD(option.getExposure());
                }

                this.amtCost += option.toHKD(option.getCashIn());
                this.numContracts += Math.abs(option.NumContract);
                this.numRows++;


                this.amtDaySum += option.toHKD(option.getAmtPerDay())
            }

            this.cost_exposure_ratio = (this.amtCost / this.exposure * 100);


        }
    }

    export class Stock extends Base {
        static str = 'Stock| Name:str; Symbol:str; Price:number; OptionMultiple:num; IsHK:int; ';

        // js --
        public Name: string = '';
        public Symbol: string = '';
        public Price: number = 0;
        public OptionMultiple: number = 0;
        public IsHK: number = 0;
        public PriceLast: number = 0;

        public _dirty: boolean = true;

        _exposure_p: number = 0;
        _exposure_c: number = 0;
        _cash_in_amt: number = 0;
        _cash_lost_amt: number = 0;
        _num_call = 0;
        _num_put = 0;

        _month_contracts = {};

        // _change: number = 0;
        // _change_pct: string = '';


        static fromJson(svr: DbService, json): Stock {
            let e = new Stock();
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
        }

        addContract(option: Option): void {

            let month = option.getMonth();
            let isCall = option.isCall();
            let num = option.NumContract;

            let cell = this._month_contracts[month];
            if (!cell) {
                cell = [0, 0];
                this._month_contracts[month] = cell;
            }

            let idx = isCall ? 0 : 1;
            cell[idx] += num;
        }

        getContractNum(month: number, isCall: boolean): number {
            let cell = this._month_contracts[month];

            let res = 0;
            if (cell) {
                let idx = isCall ? 0 : 1;
                res = cell[idx];
            }
            return res;
        }

        getKey(): string {
            return this.Symbol;
        }

        isHK(): boolean {
            return this.IsHK > 0;
        }

        getChange(): number {
            return this.Price - this.PriceLast;
        }

        getChangePct(): number {
            return (this.getChange() / this.PriceLast * 100);
        }


    }


    export class Option extends Base {

        static str = 'Option| Name:str; Strike:num; StockTicker:str; DateBought:str; DateExp: str; Price:num; PriceAtBought:num; PriceAtExp:num Premium:int; AmtCost:int; NumContract:int; NumShareExposed; P_C:str; ';


        // js --
        public Id: number = -1;
        public Status: number = 0;
        public Remark: string = '';
        public UpdateBy: number = 0;
        public UpdateAt: Date;


        public Name: string = '';
        public Strike: number = 0;
        public StockTicker: string = '';
        public DateBought: string = '';
        public DateExp: string = '';
        public Premium: number = 0;
        // public AmtCost: number = 0;
        public NumContract: number = 0;
        // public NumShareExposed: number = 0;
        public P_C: string = '';


        public _dirty: boolean = true;
        public _dayToExp: number;
        public _dayBoughtTillExp: number;
        public _stock: Stock;

        static fromJson(svr: DbService, json): Option {
            let e = new Option();
            e._dirty = false;
            e.Id = json.Id;
            e.Status = json.Status;
            e.Remark = json.Remark;
            e.UpdateBy = json.UpdateBy;
            e.UpdateAt = json.UpdateAt;
            e.Name = json.Name;
            e.Strike = json.Strike;
            e.StockTicker = json.StockTicker;
            e.DateBought = json.DateBought;
            e.DateExp = json.DateExp;
            e.Premium = json.Premium;
            // e.AmtCost = json.AmtCost;

            e.NumContract = json.NumContract;
            // e.NumShareExposed = json.NumShareExposed;
            e.P_C = json.P_C;


            e._stock = svr.mgr.stocks.getByKey(e.getStockSymbol());

            e.init();
            return e;
        }


        getStockSymbol(): string {

            if (this.Name.startsWith('騰訊')) {
                return '0700';
            }

            if (this.Name.startsWith('阿里') || this.Name.startsWith('BA')) {
                return '9988';
            }
            if (this.Name.startsWith('FU')) {
                return 'FUTU';
            }

            console.warn(' cannot map to symbol, name: ' + this.Name);
            return 'N/A'
        }

        getMonth(): number {

            let m = moment(this.DateExp);
            let res = m.month() + 1;

            // hack()  if it's next year's this month, put it to previous month so that it won't overlap with this year's this month;
            if(this._dayToExp > 365) {
                res--;

                if(res < 1) {
                    res = 12;
                }
            }

            return res;
        }

        getColor(): string {

            let day = this._dayToExp;


            let res = '';
            if (this.isExpired()) {
                res = 'lightgrey';
            } else {


                if (!this.isOutOfMoney(false)) {

                    if (this.isOutOfMoney(true)) {
                        res = 'pink';
                    } else {
                        res = 'lightcoral'
                    }

                } else {

                    let buffer = this.getPriceBufferPct();
                    if (buffer < 5) {
                        res = 'lightyellow'
                    }

                }

            }
            return res;

            // if (day < 10) {
            //     return 'light'
            // }

        }

        getAmtPerDay(): number {
            return (this.getCashIn()) / this._dayBoughtTillExp;
        }

        getExposure(): number {
            return this.getNumShares() * this.Strike;
        }

        getNumShares(): number {
            return Math.abs(this.getStock().OptionMultiple * this.NumContract);
        }


        getStock(): Stock {
            return this._stock;
        }

        init() {


            if (this.DateExp.indexOf('-') < 0) {
                let str = this.DateExp;
                // str = '20201127'
                this.DateExp = str.substr(0, 4) + '-' + str.substr(4, 2) + '-' + str.substr(6);
            }

            if (this.DateBought.indexOf('/') > 0) {
                let mm = moment(this.DateBought);
                this.DateBought = mm.format('YYYY-MM-DD');
            }


            let datExp = moment(this.DateExp);
            let dayBought = moment(this.DateBought);
            let today = moment();

            // Helper.compareDate()
            this._dayToExp = datExp.diff(today, 'days') + 1;
            this._dayBoughtTillExp = datExp.diff(dayBought, 'days') + 1;


        }

        isExpired(): boolean {
            return this._dayToExp < 0;
        }

        match(filter: string): boolean {
            let txt = this.Strike + '-' + this.P_C;

            return (txt.indexOf(filter) >= 0);
        }

        toHKD(amtPerDay: number): number {
            let ratio = 1;
            if (!this.isHK()) {
                ratio = 7.76;
            }

            return amtPerDay * ratio;
        }

        isHK(): boolean {

            return this.getStock().isHK();

            // return !this.Name.startsWith('FU')
        }

        isCall(): boolean {
            return this.P_C == 'C';
        }

        getSign(): number {


            let res = 1;

            if (this.NumContract < 0) {
                res = -res;
            }


            if (this.isCall()) {
                res = -res;
            }


            return res;
        }


        isOutOfMoney(withPremium = false): boolean {


            let breakEven = this.getBreakEvenPrice(withPremium);
            let price = this.getStock().Price;
            let delta = this.getSign() * (price - breakEven);
            return delta < 0;
        }

        getBreakEvenPrice(withPremium = true): number {

            let delta = 0;
            if (withPremium) {

                let sign = this.getSign();

                delta = (sign * this.Premium);
            }

            return this.Strike + delta;
        }

        getCashIn(): number {
            return -this.getNumShares() * this.Premium;
        }


        getRisk(): number {

            let price = this.getStock().Price;

            return price / (price - this.Strike) * (this._dayToExp / 365);

        }

        getReturn(): number {

            return -this.getCashIn() / this.getExposure() * (this._dayToExp / 365);

        }

        getLost(): number {
            let res = 0;
            if (!this.isOutOfMoney(true)) {
                let breakEven = this.getBreakEvenPrice(true);
                let price = this.getStock().Price;
                let delta = this.getSign() * (price - breakEven);
                res = delta * this.getNumShares();
            }

            return res;
        }

        getPriceBufferPct(): number {

            let bep = this.getBreakEvenPrice(true);
            let price = this.getStock().Price;

            return (this.getSign() * (bep - price) / price * 100)
        }


    }


}
