module MyApp {

    // import setPrototypeOf = Reflect.setPrototypeOf;
    // import RentJob = RentApp.RentJob;
    // let appId: string = 'smkt-';

    declare let GROUP_DATA;

    declare let NativeApp: {
        takePhoto, listFiles, uploadAllFiles, setFileUploadURL, doRefreshZip, toast, doDisplayAndShutdown, listPhotoPack, doRemoveAllPhotoPacks, downloadToPhotoPack, removeObsoletePhotoPack,
    };


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

        public getUserInfo(): string {

            let u = this.svr.getCurrUser();
            return u.Name + '-' + u.Id;
            //return u.Name + '-' + u.Id + '-' + u.Name_E;
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
            this.svr.api.$http.defaults.headers.common['Authorization'] = basicAuth;


            let auth_key = this.appID + '-basic-auth';
            let user_key = this.appID + '-user';

            let userId = user ? user.Id : '';

            this.$localStorage[user_key] = userId;
            this.$localStorage[auth_key] = basicAuth;
        }

        public selectYearMonth(selected: Date) {
            console.info('selected : ' + JSON.stringify(selected));
            let year = selected.getFullYear();
            let month = selected.getMonth() + 1;
            this.setConfigYearMonth(year, month);
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

        setConfigYearMonth(year, month, force?: boolean): boolean {

            let date = new Date();

            if (year == this.getConfigYear() && month == this.getConfigMonth()) {
                console.info('same as configured year/month, skipped ');
                return;
            }


            if (year || month) {
                if (!force) {
                    if (!confirm('Are you sure to change default to : ' + year + '年 ' + month + ' 月 ? ')) {
                        return
                    }
                }
            }

            year = year || date.getFullYear();
            month = month || date.getMonth() + 1;

            if (year && year >= 2015 && year < 2015 + 30 && month >= 1 && month <= 12) {

                if (year != this.getConfigYear() || month != this.getConfigMonth()) {

                    this.configYear = year;
                    this.configMonth = month;

                    let year_key = Config.APP_ID + '-config-year';
                    let month_key = Config.APP_ID + '-config-month';

                    if (this.isConfigDateSameAsActual()) {
                        // set the curr, clear all;
                        delete this.$localStorage[year_key];
                        delete this.$localStorage[month_key];
                    } else {

                        // if it's other days and not inspector
                        let user = this.svr.getCurrUser();
                        // if (!user.isInspector()) {
                        this.$localStorage[year_key] = year;
                        this.$localStorage[month_key] = month;
                        // }
                    }

                    this.svr.clearAllData();
                    this.svr.doRefreshData();
                    return true;

                } else {
                    console.info(' skipped, same year/month: ' + year + '/' + month);
                }

            } else {
                let msg = 'Invalid date :' + year + '|' + month;
                console.info(msg);
                alert(msg);
            }

            return false

        };

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

    export class TemplateStatus {
        public numTotal: number = 0;
        public numActive: number = 0;
        numPhotos: number = 0;
        public outletCode: string;
        public owners: User[] = null;
        public inspectors: User[] = [];
        public isActive: boolean = false;
        public isOwnerMissing: boolean = false;
        public isOwnerNoTask = false;
        public numTaskletMissing: number = 0;
        public numMissingInApprove: number = 0;


        isNeedHighRank(): boolean {
            return this.isOwnerNoTask || this.isOwnerMissing || this.numTaskletMissing > 0 || this.numMissingInApprove > 0;
        }

        toJSON(): { [name: string]: any } {

            let json = {};
            // let ignore = ['db', 'svr', '$$hashKey'];
            //
            // Object.getOwnPropertyNames(this).filter(name => ignore.indexOf(name) < 0).forEach(name => {
            //     json[name] = this[name];
            // });

            json['isOwnerMissing'] = this.isOwnerMissing;
            json['isOwnerNoTask'] = this.isOwnerNoTask;
            json['numTaskletMissing'] = this.numTaskletMissing;
            json['numMissingInApprove'] = this.numMissingInApprove;

            return json;
        }

        getColor(): string {
            if (this.isOwnerMissing) {
                return 'lightcoral';
            }
            if (this.isOwnerNoTask) {
                return 'indianred'
            }
            if (this.numTaskletMissing > 0) {
                return 'lightpink'
            }
            if (this.numMissingInApprove > 0) {
                return 'lightsalmon'
            }

            return '';

        }

    }

    export abstract class Base {

        public Id = -1;
        public Name;

        public getKey(): string {
            return null;
        }

        // static fromJson(json): Base ;

        toString() {
            //return '[' + this.constructor.name + ', id:' + this.Id + ', name: ' + this.Name + ' ]';
            return JSON.stringify(this);
        }

        public isNew(): boolean {
            return !(this.Id >= 0);
        }
    }


    export class TemplateMgr {

        public templates: Cache<Template> = new Cache<Template>();
        public _svr: DbService = null;
        // private _all: Template[] = [];
        private _statuses: TemplateStatus[] = null;
        // private _keyMap: { [id: string]: Template } = {};
        private _outletTemplateMap: { [outletCode: string]: Template[] } = {};

        public getOutletCodes(): string[] {
            let outletCodes = Object.keys(this._outletTemplateMap);

            outletCodes.sort((a, b) => {
                return a.localeCompare(b);
            });
            return outletCodes;
        }

        public getOutletsWith(filter): string[] {
            let allOutletCodes = this.getOutletCodes();

            if (Helper.isBlank(filter)) {
                return allOutletCodes;
            }

            let outletCodes = allOutletCodes.filter(code => {
                return code.indexOf(filter) >= 0
            });

            return outletCodes;
        }


        public getStatuses(filter?: string): TemplateStatus[] {

            if (this._statuses == null) {
                this._statuses = [];


                for (const outletCode of this.getOutletCodes()) {

                    let status = new TemplateStatus();
                    status.outletCode = outletCode;


                    let templates = this._svr.getTemplateOfOutlet(outletCode);

                    status.numTotal = templates.length;
                    status.owners = this._svr.getTemplateOutletOwners(status.outletCode) || [];
                    status.inspectors = this._svr.getTaskOutletOwners(status.outletCode) || [];
                    status.isActive = this._svr.templateMgr.getActiveTemplates(status.outletCode).length > 0;


                    status.isOwnerMissing = (status.isActive && (status.owners.length == 0 && status.inspectors.length == 0));
                    status.isOwnerNoTask = (!status.isActive && (status.owners.length > 0));

                    status.numActive = this._svr.templateMgr.getActiveTemplates(outletCode).length;

                    for (const template of templates) {
                        status.numPhotos = template.getAllPhotos().length;
                        if (template.getTasklets().length == 0 && template.isActive()) {
                            status.numTaskletMissing++;
                        }


                        if (this._svr.isMissingInApprove(template)) {
                            status.numMissingInApprove++;
                        }

                    }


                    this._statuses.push(status);
                }


                this._statuses.sort((a, b) => {

                    if (!(a.isNeedHighRank() || b.isNeedHighRank())) {
                        return a.outletCode.localeCompare(b.outletCode)
                    } else {
                        return a.isNeedHighRank() ? -1 : 1;
                    }

                    // if (!(a.isOwnerNoTask || a.isOwnerMissing || b.isOwnerNoTask || b.isOwnerNoTask || a.numTaskletMissing > 0 || b.numTaskletMissing > 0)) {
                    //     return a.outletCode.localeCompare(b.outletCode)
                    // } else {
                    //     return (a.isOwnerMissing || a.isOwnerNoTask) ? -1 : 1;
                    // }
                });
                console.info('Template status, total: ' + this._statuses.length);
            }

            let res = this._statuses;
            if (filter) {


                // res = this._statuses.map(value => {
                res = this._statuses.filter(status => {

                    let txt = filter.toLowerCase().trim();

                    let outlet = this._svr.getOutlet(status.outletCode);
                    //return status.isOwnerMissing || outlet.OutletCode.indexOf(txt) >= 0 || outlet.Name.toLowerCase().indexOf(txt) >= 0;
                    return outlet.OutletCode.indexOf(txt) >= 0 || outlet.Name.toLowerCase().indexOf(txt) >= 0;
                });

                console.info('filter: ' + filter + ' # ' + res.length);

            }

            return res;
        }

        public getTemplateOutlets(): { [outletCode: string]: Template[] } {
            return this._outletTemplateMap;
        }

        public getByKey(key: string): Template {
            return this.templates.getByKey(key);
            // return this._keyMap[key];
        }

        public get(outletCode: string, itemCode: string): Template {
            let key = outletCode + '_' + itemCode;
            return this.getByKey(key);
        }

        public getByOutlet(outletCode: string): Template[] {
            return this._outletTemplateMap[outletCode];
        }

        public getActiveTemplates(outletCode: string): Template[] {
            let ts = this.getByOutlet(outletCode) || [];
            let res = [];
            for (const t of ts) {
                if (t.isActive() && t.isEnabled(this._svr.config.getConfigMonth())) {
                    res.push(t);
                }
            }
            return res;
        }

        public clearAll(): void {
            // Helper.clearAll(this._statuses);
            this._statuses = null;
            Helper.clearAll(this._outletTemplateMap);
        }

        public init(svr: DbService, jsons): void {

            this.clearAll();

            this.templates.init('templates', Template.from, jsons);
            this.templates.doSort((a: Template, b: Template) => {
                return a.OutletCode.localeCompare(b.OutletCode);
            });


            for (const template of this.templates.getAll()) {
                template.svr = svr;
                if (!this._outletTemplateMap[template.OutletCode]) {
                    this._outletTemplateMap[template.OutletCode] = [];
                }
                this._outletTemplateMap[template.OutletCode].push(template);

            }

            this._svr = svr;
        }
    }


    export class Template extends Base {

        public static OPTION_SUM_TASKS = 'SUM_TASKS';
        public svr: DbService = null;
        public _dirty: boolean = true;
        public Status: number = 1;  // Status:  [0 : inactive , 1: active],

        public _isSelected: boolean = false;
        public IsAddedRecently: number = 0;
        UpdateBy: number = null;
        UpdateAt: string = null;
        // public OptionsJson: string = '';
        public _cycle: string = null;
        // private _options: Object = null;
        private _tasklets: Tasklet[] = null;
        private _oldTxt: string = null;
        private _oldObj = null;

        constructor(public Id: number,
                    public OutletCode: string,
                    public ItemCode: string,
                    public BasePrice: number,
                    public BaseQty: number,
                    public BaseUnit: string,
                    public TaskletsJson: string,
                    public TaskletsText: string,
                    public Jan: number,
                    public Feb: number,
                    public Mar: number,
                    public Apr: number,
                    public May: number,
                    public Jun: number,
                    public Jul: number,
                    public Aug: number,
                    public Sep: number,
                    public Oct: number,
                    public Nov: number,
                    public Dec: number,) {

            super();

            this.IsAddedRecently = 0;


        }

        // getOptions(): Object {
        //
        //     if (!this._options) {
        //         // this._options = {};
        //         this.OptionsJson = this.OptionsJson || '{}';
        //         this._options = JSON.parse(this.OptionsJson);
        //
        //         if (!this._options) {
        //             this._options = {}
        //         }
        //     }
        //
        //     return this._options;
        // }

        public static mapsMonth_to_str(month: number): string {

            let map = {
                1: 'Jan',
                2: 'Feb',
                3: 'Mar',
                4: 'Apr',
                5: 'May',
                6: 'Jun',
                7: 'Jul',
                8: 'Aug',
                9: 'Sep',
                10: 'Oct',
                11: 'Nov',
                12: 'Dec'
            };
            return map[month];
        }

        public static make(outletCode: string, itemCode: string, baseQty: number, baseUnit: string): Template {
            let template = new Template(-1, outletCode, itemCode, 0, baseQty, baseUnit, "{}", "",
                1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1);
            template.IsAddedRecently = 1;

            return template;
        }

        static from(json): Template {
            let template = new Template(json.Id, json.OutletCode, json.ItemCode, json.BasePrice, json.BaseQty, json.BaseUnit,
                json.TaskletsJson, json.TaskletsText, json.Jan, json.Feb, json.Mar, json.Apr, json.May,
                json.Jun, json.Jul, json.Aug, json.Sep, json.Oct, json.Nov, json.Dec);

            template.Status = json.Status;
            // template.OptionsJson = json.OptionsJson;
            template._dirty = false;

            if (json.IsAddedRecently) {
                template.IsAddedRecently = json.IsAddedRecently;
            }

            // template.svr = db;
            // template._isSelected = template.isActive();

            template.UpdateBy = json.UpdateBy;
            template.UpdateAt = json.UpdateAt;

            template._oldObj = template.toJSON();

            return template;

        }

        getKey(): string {
            return this.makeKey();
        }

        toJSON(): { [name: string]: any } {

            let json = {};
            let ignore = ['db', 'svr', '$$hashKey'];

            Object.getOwnPropertyNames(this).filter(name => {
                // return (ignore.indexOf(name) < 0 );
                return (ignore.indexOf(name) < 0 && !name.startsWith('_'));
            }).forEach(name => {
                json[name] = this[name];
            });

            return json;
        }

        toCycle(): string {
            let res = '['
                + 'cycle: ' + (this._cycle || ' NA') + ' => '
                + (this.Jan ? ' 1 ' : '')
                + (this.Feb ? '2 ' : '')
                + (this.Mar ? '3 ' : '')
                + (this.Apr ? '4 ' : '')
                + (this.May ? '5 ' : '')
                + (this.Jun ? '6 ' : '')
                + (this.Jul ? '7 ' : '')
                + (this.Aug ? '8 ' : '')
                + (this.Sep ? '9 ' : '')
                + (this.Oct ? '10 ' : '')
                + (this.Nov ? '11 ' : '')
                + (this.Dec ? '12 ' : '')
                + ']'
            ;

            return res;

        }

        clearAllMonth(): void {

            this.Jan = 0;
            this.Feb = 0;
            this.Mar = 0;
            this.Apr = 0;
            this.May = 0;
            this.Jun = 0;
            this.Jul = 0;
            this.Aug = 0;
            this.Sep = 0;
            this.Oct = 0;
            this.Nov = 0;
            this.Dec = 0;
        }

        initMonthFromCycleTxt(txt): void {
            // (每半年)-1 , (每月)

            let monthly = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
            let quarterly = [];
            txt = txt && txt.trim() || '';
            let prefix = txt.substring(0, 4);
            let months = [];
            let base = 100;
            switch (prefix) {
                case '(每月)':
                    months = monthly;
                    break;

                case '(每季)':

                    // 週期1 :　1,4,7,10月出街
                    // 週期2 :　2,5,8,11月出街
                    // 週期3 :　3,6,9,12月出街

                    base = Helper.getNumber(txt);
                    months.push(base);
                    months.push(base + 3);
                    months.push(base + 3 * 2);
                    months.push(base + 3 * 3);
                    break;

                case '(每半年':
                    base = Helper.getNumber(txt);
                    months.push(base);
                    months.push(base + 6);
                    break;

                case '(每年)':
                    base = Helper.getNumber(txt);
                    months.push(base);
                    break;
                case '逄2,9':
                    months = [2, 9];
                    break;

                case '(每週)':
                    break;

                default:
                    months = [];
                    console.warn('unrecognized month cycle: ' + txt);

            }

            for (const month of months) {
                let month_tag = Template.mapsMonth_to_str(month);
                this[month_tag] = 1;
            }

            return;

        }

        public needFix(): boolean {
            let tlets = this.getTasklets();
            for (let tlet of tlets) {
                if (!(tlet.Price === undefined)) {
                    return true;
                }
            }
            return false;
        }

        public isActive(): boolean {
            return this.Status == 1;
        }

        public isEnabled(month: number): boolean {

            //month = month || this.db.config.getConfigMonth();

            let str = Template.mapsMonth_to_str(month);
            if (!str) {
                console.error('cannot map month:' + month + ', str: ' + str);
                return false;
            } else {
                return this[str] == 1;
            }
        }

        public getIsAddedRecently(): boolean {
            return this.IsAddedRecently == 1;
        }

        public makeKey(): string {
            return this.OutletCode + '_' + this.ItemCode;
        }


        public prepareSave(): void {

            let tlets = this.getTasklets();
            for (let i = 0; i < tlets.length; i++) {
                let tlet = tlets[i];

                // tlet.Price = null;
                // tlet.SpecialPrice = null;
                // tlet.isNew = false;
                // tlet.isItemMissing = false;

                delete tlet.Price;
                delete tlet.SpecialPrice;
                delete tlet.isNew;
                delete tlet.isItemMissing;
                delete tlet.isChecked;


                tlet.Id = i + 1;
            }

            // this.options2Json();
            this.tasklet2Json();
            this.tasklet2Text();
            this._oldTxt = null;
        }

        // private options2Json(): void {
        //     this.OptionsJson = JSON.stringify(this.getOptions())
        // }

        public isTextOk(): boolean {

            if (!this._oldTxt) {
                this._oldTxt = this.TaskletsText;
                this.tasklet2Text();
            }

            let ok = this._oldTxt == this.TaskletsText;
            if (!ok) {
                this._dirty = true;
            }
            return ok;

        }

        public setTasklets(tlets: Tasklet[]) {

            this._tasklets = tlets;

            this.prepareSave();

            this._dirty = true;

        }

        public getTasklets(): Tasklet[] {

            if (!this._tasklets) {
                let tlets = Tasklet.fromJsons(this.svr, JSON.parse(this.TaskletsJson));
                for (let i = 0; i < tlets.length; i++) {
                    let tlet = tlets[i];
                    if (!tlet.Qty) {
                        tlet.Qty = this.BaseQty;
                    }
                    if (!tlet.Unit) {
                        tlet.Unit = this.BaseUnit;
                    }
                }
                this._tasklets = tlets;
            }
            return this._tasklets;
        }

        text2Tasklet(): void {
            let txt = this.TaskletsText;
            let sp = ';';

            let lines = txt.split(sp);
            let tlets = [];

            function massageName(name) {

                // remove leading newline '\n'
                return name.replace(/^(\r\n|\n|\r)*/, "");
            }

            for (let i = 0; i < lines.length; i++) {

                tlets.push({
                    Name: massageName(lines[i])
                    , Qty: this.BaseQty
                    , Unit: this.BaseUnit
                });
            }
            this._tasklets = tlets;
            this._dirty = true;

            console.info('text2Tasklet templateId: ' + this.Id + ', tlets: ' + this._tasklets.length);
        }

        public onChange() {
            this._dirty = true;
        }

        addNewTasklet(): void {


            let nextId = Helper.findMaxId(this.getTasklets()) + 1;

            let tlet = Tasklet.makeNew(nextId, this.BaseQty, this.BaseUnit);
            this._tasklets.push(tlet);

            this._dirty = true;
        };

        removeTasklet(tlet): void {
            let tlets = this.getTasklets();

            let idx = tlets.indexOf(tlet);
            if (idx >= 0) {
                tlets.splice(idx, 1);
                this._dirty = true;
            }
        };

        public getAllPhotos(): FileX[] {

            let res: FileX[] = [];
            for (const tlet of this.getTasklets()) {
                res = res.concat(tlet.fileXs);
            }
            return res;
        }

        public getDiff(): string {

            let res = 'diff-NA';

            let json = {};
            let ignore = ['_isChecked', '_isUpcExported', '$$hashKey'];

            Object.getOwnPropertyNames(this)
                .filter(name => ignore.indexOf(name) < 0 && !name.startsWith('_'))
                .forEach(name => {
                    json[name] = this[name];
                });


            res = Helper.toDiff(json, this._oldObj);


            return res;
        }

        private tasklet2Json(): void {
            this.TaskletsJson = JSON.stringify(this.getTasklets())
        }

        private tasklet2Text(): void {

            let tlets = this.getTasklets();
            let sp = ';';
            let txt = '';

            for (let i = 0; i < tlets.length; i++) {
                txt += tlets[i].Name + '; \n';
            }

            //this.TaskletT = txt;
            this.TaskletsText = txt;

        }

    }


    export class Outlet extends Base {


        public OutletCode: string = 'N/A';
        public Name: string = 'N/A';
        public Address: string = 'N/A';
        public Contact: string = '';
        public Tel: string = '';
        public Remark2: string = '';
        public _owners: User[] = [];
        _dirty: boolean = false;

        static fromJson(json): Outlet {
            let outlet = new Outlet();

            outlet.OutletCode = (json.OutletCode || '').trim();
            outlet.Name = (json.Name || '').trim();
            outlet.Address = (json.Address || '').trim();
            outlet.Contact = (json.Contact || '').trim();
            outlet.Tel = (json.Tel || '').trim();
            outlet.Remark2 = (json.Remark2 || '').trim();

            return outlet;
        }

        static isOutletCode(code: string): boolean {
            return code && code.length == 7 && parseInt(code) > 0;
        }

        getKey(): string {
            return this.OutletCode;
        }

        onChange() {
            this._dirty = true;
        }

        public isCodeValid(): boolean {
            return this.OutletCode.length == 7;
        }

        public isNull() {
            return this.Name.startsWith('N/A');
        }

        public match(txt: string): boolean {

            if (Helper.isBlank(txt)) {
                return true;
            }

            txt = txt.toUpperCase();
            let name = this.Name.toUpperCase();

            return this.OutletCode.indexOf(txt) >= 0 || name.indexOf(txt) >= 0;

        }

    }

    export class Item extends Base {

        constructor(public ItemCode: string,
                    public Name: string,
                    public BaseUnit: string,
                    public BaseQty: number) {

            super();
        }

        static fromJson(json): Item {
            return new Item(json.ItemCode, json.Name, json.BaseUnit, json.BaseQty);
        }

        getKey(): string {
            return this.ItemCode;
        }

        public isNull() {
            return this.Name.startsWith('N/A');
        }

        public getDashCode(): string {
            return CvsHelper.dash(this.ItemCode, 4);
        }

    }

    export class ApproveMgr {


        public approves: Cache<Approve> = new Cache<Approve>();
        public _substituteMap: { [from: string]: string } = {};
        public _substituteReverseMap: { [by: string]: string } = {};
        public _missingTemplate: { [outletCode: string]: Template[] } = {};
        private _outletApprovesMap: { [outlet: string]: Approve[] } = {};
        private svr: DbService;


        constructor(svr: DbService) {
            this.svr = svr;
        }

        clearAll() {
            this.approves.clearAll();
            Helper.clearAll(this._outletApprovesMap);
            Helper.clearAll(this._substituteMap);
            Helper.clearAll(this._substituteReverseMap);
            Helper.clearAll(this._missingTemplate);

        }

        getApproves(outletCode): Approve[] {
            return this._outletApprovesMap[outletCode] || [];
        }

        public getApprove(outletCode: string, itemCode: string): Approve {
            return this.approves.getByKey(Approve.makeKey(outletCode, itemCode));
        }


        public getMissingInApprove(outletCode: string): Template[] {

            let res = this._missingTemplate[outletCode];
            if (!res) {

                let templates = this.svr.templateMgr.getByOutlet(outletCode) || [];
                res = [];

                for (const t of templates) {

                    if (!t.isActive() || !t.isEnabled(this.svr.config.getConfigMonth())) {
                        continue;  // skip non-active ones
                    }

                    let ap = this.getApprove(t.OutletCode, t.ItemCode);
                    if (!ap) {
                        res.push(t);
                        // console.info('pending : ' + t.OutletCode + ', ' + t.ItemCode);
                    }
                }

                this._missingTemplate[outletCode] = res;
            }

            return res;

        }

        getOutletCodes(): string[] {
            let outletCodes = Object.keys(this._outletApprovesMap);
            return outletCodes.sort();
        }

        public getSubstitutedBy(oldKey): Approve {

            let newKey = this._substituteReverseMap[oldKey];
            let res = null;
            if (!Helper.isBlank(newKey)) {
                let keys = newKey.split('_');
                res = this.approves.getByKey(Approve.makeKey(keys[0], keys[1]));
            }

            // res || console.warn('SubstitutedBy not found, old: ' + oldKey + ', newKey:' + newKey);

            return res;
        }

        public getSubstituted(newKey): Approve {
            let oldKey = this._substituteMap[newKey];
            let res = null;
            if (!Helper.isBlank(oldKey)) {
                let keys = oldKey.split('_');
                res = this.approves.getByKey(Approve.makeKey(keys[0], keys[1]));
            }

            res || console.warn('Substituted not found, old: ' + oldKey + ', newKey:' + newKey);
            return res;

        }

        markApproveSubsMap(approve): void {
            if (approve.isSubstitutionOther()) {
                let subNew = approve.getKey();
                let subOld = Approve.makeKey(approve.SubstituteOutletCode, approve.ItemCode);

                if (this._substituteMap[subNew] || this._substituteReverseMap[subOld]) {

                    console.warn(' substitution repeated !  new: ' + subNew + ', old: ' + subOld);

                }

                this._substituteMap[subNew] = subOld;
                this._substituteReverseMap[subOld] = subNew;

                let old = this.getApprove(approve.SubstituteOutletCode, approve.ItemCode);


                let msg = ' sub : ' + subNew + ' <-- ' + subOld +
                    ' | ' + this.svr.getItemName(approve.ItemCode) +
                    ' | ' + this.svr.getOutletName(approve.OutletCode) + ' <-- ' + this.svr.getOutletName(approve.SubstituteOutletCode) +
                    ' | ' + approve.toUnit(this.svr.unitTypeMgr) + ' <-- ' + old.toLastUnit(this.svr.unitTypeMgr) +
                    (this.isBaseUnitSameAsSubOther(approve) ? '' : ' diff unit !!!! ');

                console.info(msg);
            }
        }

        isBaseUnitSameAsSubOther(app: Approve): boolean {

            if (!app.isSubstitutionOther()) {
                return false;
            }

            let old = this.getApprove(app.SubstituteOutletCode, app.ItemCode);
            if (!old) {
                return false;
            }

            return (app.toUnit() == old.toLastUnit());
        }

        getSubOtherUnitText(app: Approve): string {

            let old = this.getSubOtherTarget(app);
            return app.toUnit(this.svr.unitTypeMgr) + ' / ' + (old ? old.toLastUnit(this.svr.unitTypeMgr) : 'N/A');
        }

        getSubOtherTarget(app: Approve): Approve {
            return this.getApprove(app.SubstituteOutletCode, app.ItemCode);
        }


        initApproves(jsons): void {

            this.clearAll();

            this.approves.init('approves', Approve.fromJson, jsons);


            for (const approve of this.approves.getAll()) {

                let outletCode = approve.OutletCode;
                if (!this._outletApprovesMap[outletCode]) {
                    this._outletApprovesMap[outletCode] = [];
                }
                this._outletApprovesMap[outletCode].push(approve);
                this.markApproveSubsMap(approve);

            }

            // sort the items inside store
            for (let key in this._outletApprovesMap) {
                if (this._outletApprovesMap.hasOwnProperty(key)) {
                    //console.log(key + " -> " + p[key]);
                    let approves = this._outletApprovesMap[key];

                    approves.sort((a, b) => {
                        if (a.ItemCode < b.ItemCode) return -1;
                        if (a.ItemCode > b.ItemCode) return 1;
                        return 0;
                    });

                }
            }


            // see if any substitute doubled
            for (let key in this._substituteMap) {


            }


            // console.info(' approves: ' + this._all.length + ', outletApproves: ' + Object.keys(this._outletApprovesMap).length);

        }


    }

    export class OutletStatus extends Base {

        public Id: number;
        public OutletCode: string;
        // public ItemCode: string;
        public Year: number;
        public Month: number;
        public Check1: number;
        public Check2: number;

        public Check1Date: string;
        public Check2Date: string;

        public _dirty = false;

        static make(svr: DbService, outletCode: string): OutletStatus {
            let oi = new OutletStatus();
            oi.OutletCode = outletCode;
            // oi.ItemCode = itemCode;
            oi.Year = svr.getConfigYear();
            oi.Month = svr.getConfigMonth();
            oi.Check1 = 0;
            oi.Check2 = 0;
            oi.Id = 0;
            oi._dirty = false;

            return oi;
        }

        static fromJson(json: any): OutletStatus {
            let item = new OutletStatus();
            item.OutletCode = json.OutletCode;
            // item.ItemCode = json.ItemCode;

            item.Id = json.Id;
            item.Year = json.Year;
            item.Month = json.Month;
            item.Check1 = json.Check1;
            item.Check2 = json.Check2;

            item.Check1Date = json.Check1Date;
            item.Check2Date = json.Check2Date;
            return item;
        }

        public getKey(): string {
            return this.OutletCode;
        }

        public onChange(): void {
            this._dirty = true;
        }

        public onCheck1(): void {
            this.Check1Date = Helper.getDateStr();
            this.onChange();
        }

        public onCheck2(): void {

            this.Check2Date = Helper.getDateStr();
            this.onChange();
        }

        public getCheck2Date(): string {
            let res = null;
            if (this.Check2) {
                res = this.Check2Date;

                if (Helper.isBlank(res)) {
                    res = ' ?? '
                }
            }

            return res;
        }

    }


    export class Approve extends Base {

        private static _collectMethodOptions = {
            '': '',
            "M": "M 已入數",
            "F": "F 再檢查",
            "N": "N 新商品",
            "S": "S 新替代",
            "W": "W 被替代",
            "X": "X 已刪除",
            "I": "I 忽略",
            'A': 'A 不匯入,代超市',
            'R': 'R 不匯入,代其他'
            // "B": "B 帶下",
        };
        public _needFieldCheck: boolean = false;
        public _dirty: boolean = false;
        public Id: number = -1;
        public Year: number = -1;
        public Month: number = -1;
        public OutletCode: string;
        public ItemCode: string;
        public Status: string;
        public CollectMethod: string;
        public SubstituteOutletCode: string;
        public SubstituteSubType: string;
        public ApprovePrice: number;
        public ApproveQty: number;
        public ApproveUnit: string;
        public LastPrice: number;
        public LastQty: number;
        public LastUnit: string;
        public RefYear: number;
        public RefMonth: number;
        public Description: string = 'N/A';
        UpdateAt: string = null;
        UpdateBy: number = null;
        _isPlusEnabled: boolean = false;
        // private _options = null;
        private _tasklets = null;

        constructor() {
            super()
        }

        public static makeKey(outlet: string, item: string): string {
            return outlet + '_' + item;
        }

        public static getCollectMethodOptions() {
            return this._collectMethodOptions;
        }

        static fromJson(json: any): Approve {
            return Approve.from(json);
        }

        // getOptions(svr: DbService) {
        //
        //     if (!this._options) {
        //
        //         let t = svr.getTemplateByCodes(this.OutletCode, this.ItemCode);
        //
        //         this._options = t ? t.getOptions() : {};
        //     }
        //     return this._options;
        // }

        // isSumTasks(svr) {
        //     return this.getOptions(svr)[Template.OPTION_SUM_TASKS];
        // }

        static from(json: any): Approve {
            let approve = new Approve();

            approve.Id = json.Id;
            approve.OutletCode = json.OutletCode;
            approve.ItemCode = json.ItemCode;
            approve.Status = json.Status;
            approve.CollectMethod = json.CollectMethod;
            approve.SubstituteOutletCode = json.SubstituteOutletCode;
            approve.SubstituteSubType = json.SubstituteSubType;
            approve.ApproveQty = json.ApproveQty;
            approve.ApprovePrice = json.ApprovePrice;
            approve.ApproveUnit = json.ApproveUnit;
            approve.LastPrice = json.LastPrice;
            approve.LastQty = json.LastQty;
            approve.LastUnit = json.LastUnit;
            approve.RefYear = json.RefYear;
            approve.RefMonth = json.RefMonth;
            approve.Description = json.Description;
            approve.Year = json.Year;
            approve.Month = json.Month;
            approve.UpdateBy = json.UpdateBy;

            if (approve.ApproveUnit == null) {
                approve.ApproveUnit = approve.LastUnit;
            }

            approve.UpdateAt = json.UpdateAt;


            return approve;

        }

        toUnit(um?: UnitTypeMgr): string {
            return this.ApproveQty + ' ' + (um ? um.getUnitName(this.ApproveUnit) : this.ApproveUnit)
        }

        toLastUnit(um?: UnitTypeMgr): string {
            return this.LastQty + ' ' + (um ? um.getUnitName(this.LastUnit) : this.LastUnit)
        }

        getKey(): string {
            //return this.OutletCode + '_' + this.ItemCode;
            return Approve.makeKey(this.OutletCode, this.ItemCode);
        }

        getTaskletsOf(svr: DbService, task: Task): Tasklet[] {
            let res = [];
            let t0: Tasklet = null;
            for (const tlet of task.getTasklets()) {

                res.push(tlet);
                if (!t0) {
                    t0 = tlet;
                }
            }

            // if (this.isSumTasks(svr) && t0) {
            //     let tlet = Tasklet.makeNew(-1, t0.Qty, t0.Unit);
            //     // let tlet = Tasklet.makeNew(0, null,null);
            //     tlet.Name = '  自動相加  : ';
            //
            //
            //     let t1 = res[1];
            //     //tlet.Price = t0.Price + t1 ? t1.Price : 0;
            //     tlet.Price = 123;
            //
            //     res.push(tlet);
            //
            //     console.info('t0 :' + JSON.stringify(t0));
            //     console.info('t0 :' + t0.Price);
            //     console.info('t2 :' + JSON.stringify(tlet));
            //     console.info('t2 :' + tlet.Price);
            //
            // }

            return res;
        }

        public isFieldCheck(): boolean {

            return this.CollectMethod === 'F';
        }

        public isApproved(): boolean {

            // if (this.OutletCode == '0779006') {
            //     console.info(' isApproved for 0779006 : isBlank: ' + Helper.isBlank(this.CollectMethod) + ', CollectMethod: ' + this.CollectMethod)
            // }

            // if(this.OutletCode == '0051029' && this.ItemCode == '01212104') {
            //     console.info('this.CollectMethod => "' + this.CollectMethod + '"');
            // }


            if (Helper.isBlank(this.CollectMethod) || this.CollectMethod == 'F' || this.CollectMethod == 'null') {
                return false;
            }

            if (!Approve.getCollectMethodOptions()[this.CollectMethod]) {
                return false;
            }

            if (this.CollectMethod == 'M') {
                return this.ApprovePrice > 0 && this.ApproveQty > 0 && this.ApproveUnit != null;
            }

            // Collection Method != 'F'/'M'
            return true;

        }

        public getPriceChangePct(um: UnitTypeMgr): string {

            let res = 'NA';
            if (this.ApprovePrice && this.ApproveQty && (this.ApproveUnit == this.LastUnit) && this.LastPrice > 0) {


                let newMulti = 1;
                let oldMulti = 1;

                if (um) {

                    if (um.isCompatible(this.ApproveUnit, this.LastUnit)) {
                        newMulti = um.getUnitMultiple(this.ApproveUnit);
                        oldMulti = um.getUnitMultiple(this.LastUnit);
                    }

                }

                let newPrice = this.ApprovePrice / (this.ApproveQty * newMulti);
                let oldPrice = this.LastPrice / (this.LastQty * oldMulti);

                let change = (newPrice - oldPrice) / oldPrice * 100;
                // let change = (this.ApprovePrice / this.ApproveQty - this.LastPrice / this.LastQty) / (this.LastPrice / this.LastQty) * 100;


                if (change == 0) {
                    res = '--'
                } else {
                    res = change.toFixed(2) + ' %';
                }
            }

            return res;

        }

        public onChange(): void {

            this._dirty = true;

            //
            if (this.CollectMethod !== 'S') {
                this.SubstituteSubType = '';
            } else {
                if (Helper.isBlank(this.SubstituteOutletCode)) {
                    this.SubstituteSubType = 'Y';
                }
            }
        }

        public getTasks(): Task[] {
            return Task.getTasksInOutletItem(this.OutletCode, this.ItemCode) || []
        }

        public takeAsRefPrice(ref: Approve): void {

            let oldRefYear = this.RefYear;
            let oldRefMonth = this.RefMonth;
            let oldPrice = this.LastPrice;

            this.RefYear = ref.Year;
            this.RefMonth = ref.Month;

            this.LastPrice = ref.ApprovePrice;
            this.LastQty = ref.ApproveQty;
            this.LastUnit = ref.ApproveUnit;

            this._dirty = true;

        }

        prepareSave() {

            if (Helper.isBlank(this.CollectMethod) && this.ApproveQty > 0 && this.ApproveQty > 0) {
                this.CollectMethod = "M"
            }

            if (Helper.isBlank(this.Description)) {
                let tasks = this.getTasks();
                if (tasks && tasks[0]) {
                    let task = tasks[0];
                    this.Description = Helper.tasklets2Text(task.getTasklets());
                }
            }

            if (['F', 'X', 'I'].indexOf(this.CollectMethod) >= 0) {
                if (Helper.isEmpty(this.ApprovePrice)) {
                    this.ApprovePrice = 0;
                }

                if (Helper.isEmpty(this.ApproveQty)) {
                    this.ApproveQty = 0;
                }
            }


        }

        isSubstitutionOther() {


            return (this.CollectMethod == 'S' && !Helper.isBlank(this.SubstituteOutletCode)) && (parseInt(this.SubstituteOutletCode) > 1);

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

        static fromJson(json): User {

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

    export class Task {

        public static STATUS_INIT = "INIT";
        public static STATUS_CHECKED_IN = 'CHECKED_IN';
        static _outletTasksMap: { [outletCode: string]: Task[] } = {};
        private static _all: Task[] = [];
        private static _itemTaskMap: { [itemCode: string]: Task } = {};
        private static outletTaskOwnersMap: { [outletCode: string]: User[] };
        private static outletItemTasksMap: { [key: string]: Task[] };
        _isShowRemark: boolean = false;
        _isShowTasklets: boolean = false;
        UpdateAt: string = null;
        private _tasklets: Tasklet[] = null;

        constructor(public Id: number,
                    public Year: number,
                    public Month: number,
                    public OwnerUserId: number,
                    public TaskletsJson: string,
                    public OutletCode: string,
                    public ItemCode: string,
                    public Status: string,
                    public Remark: string,
                    public _dirty: boolean,) {
        }

        public static fromJson(json): Task {
            let task = new Task(json.Id, json.Year, json.Month, json.OwnerUserId, json.TaskletsJson, json.OutletCode
                , json.ItemCode, json.Status, json.Remark, false);

            task.UpdateAt = json.UpdateAt;

            return task;
        }

        public static clearAll(): void {

            this._all = [];
            this._itemTaskMap = {};
            this._outletTasksMap = {};
            this.outletTaskOwnersMap = {};
            this.outletItemTasksMap = {};

        }

        public static getOutletCodesWithTask(): string[] {

            let outletCodes = Object.keys(this._outletTasksMap);
            outletCodes.sort((a, b) => {
                return a.localeCompare(b);
            });
            return outletCodes;

        }

        public static init(svr: DbService, jsons): void {

            this.clearAll();

            jsons = jsons || [];
            for (let i = 0; i < jsons.length; i++) {

                let json = jsons[i];
                let task: Task = this.fromJson(json);

                this._all.push(task);
                let itemCode = task.ItemCode;

                this._itemTaskMap[itemCode] = task;


                let outletCode = task.OutletCode;
                if (!this._outletTasksMap[outletCode]) {
                    this._outletTasksMap[outletCode] = [];
                }
                this._outletTasksMap[outletCode].push(task);


                if (!this.outletTaskOwnersMap[outletCode]) {
                    this.outletTaskOwnersMap[outletCode] = [];
                }

                //let user =  User.get(task.OwnerUserId);
                let user = svr.mgr.users.get(task.OwnerUserId);
                if (user) {
                    user.addOutletTaskCount(outletCode);

                    if (this.outletTaskOwnersMap[outletCode].indexOf(user) < 0) {
                        this.outletTaskOwnersMap[outletCode].push(user);
                    }
                }

                let key = this.makeOutletTaskKey(outletCode, itemCode);
                if (!this.outletItemTasksMap[key]) {
                    this.outletItemTasksMap[key] = [];
                }
                this.outletItemTasksMap[key].push(task);
            }

            // sort tasks by itemId

            for (let outletCode of Object.keys(this._outletTasksMap)) {
                let tasks = this._outletTasksMap[outletCode];

                let isShow = tasks.length <= 5;
                for (const task of tasks) {
                    task._isShowTasklets = isShow;
                }


                // sort owners by task count
                tasks.sort((u1, u2) => {
                    return u1.ItemCode.localeCompare(u2.ItemCode);
                    // return u1.ItemCode - u2.ItemCode;
                })
            }

            // sort task-owner by size
            for (let outletCode of Object.keys(this.outletTaskOwnersMap)) {
                let owners = this.outletTaskOwnersMap[outletCode];

                // sort owners by task count
                owners.sort((u1, u2) => {
                    //return u1.getOutletTaskCount(outletCode) - u2.getOutletTaskCount(outletCode);
                    return u2.getOutletTaskCount(outletCode) - u1.getOutletTaskCount(outletCode);
                })
            }

            // sort itemTasks by task-id
            for (const outletCode of Object.keys(this.outletItemTasksMap)) {
                let tasks = this.outletItemTasksMap[outletCode];
                tasks.sort((a, b) => {
                    return a.Id - b.Id;
                })
            }


            console.info(' tasks ' + this._all.length);
        }

        static getAll(): Task[] {
            return this._all;
        }

        static getTask(itemCode): Task {
            return this._itemTaskMap[itemCode];
        };

        static getTasksInOutletItem(outletCode, itemCode): Task[] {
            let key = this.makeOutletTaskKey(outletCode, itemCode);
            return this.outletItemTasksMap[key];
        };

        static makeOutletTaskKey(outletCode, itemCode): string {
            return outletCode + '_' + itemCode;
        }

        static getTasksInOutlet(outletCode: string): Task[] {
            return this._outletTasksMap[outletCode];
        }

        static getTaskOutletOwners(outletCode: string): User[] {
            let owners = this.outletTaskOwnersMap[outletCode];
            return owners || [];

        }

        static getTaskById(taskId: number): Task {

            for (let task of this._all) {

                if (task.Id == taskId) {
                    return task;
                }

            }
            return null;
        }

        public prepareSave(): void {
            // save _tasklets to json
            this.tasklet2Json();
        }

        public onChange(): void {
            this._dirty = true;
        }

        public toggleShowRemark() {

            if (!Helper.isBlank(this.Remark)) {
                this._isShowRemark = true
            } else {
                this._isShowRemark = !this._isShowRemark
            }
        }

        public getTasklets(): Tasklet[] {
            let that = this;
            if (!this._tasklets) {
                this._tasklets = Tasklet.fromJsons(null, JSON.parse(this.TaskletsJson));
            }
            return this._tasklets;
        };

        public getTaskletRemarks(): string {
            let res = '';
            let tlets = this.getTasklets();
            for (const tlet of tlets) {
                res += (tlet.Remark || '') + ' | ';
            }

            return res;
        }

        public isCheckedIn(): boolean {
            return (this.Status === Task.STATUS_CHECKED_IN) && !this._dirty;
        }

        public getTaskletById(id: number) {
            for (let tlet of this.getTasklets()) {
                if (tlet.Id == id) {
                    return tlet;
                }
            }
            return null;
        }

        public getAllPhotos(): FileX[] {

            let res: FileX[] = [];
            for (const tlet of this.getTasklets()) {
                res = res.concat(tlet.fileXs);
            }
            return res;
        }

        public getPhotoPending(): number {
            let res = 0;
            let tlets = this.getTasklets();
            for (const tlet of tlets) {
                res += tlet.getPhotoPending();
            }

            return res;
        }

        addTasklet() {

            let tlets = this.getTasklets();
            for (let tlet of tlets) {
                if (tlet.isNewAndEmpty()) {
                    let msg = '已經有新的 項目';
                    alert(msg);
                    return;
                }
            }

            let nextId = Helper.findMaxId(this.getTasklets()) + 1;


            let ref = tlets[0];
            let ref_qty = null;
            let ref_unit = null;
            if (ref) {
                ref_qty = ref.Qty;
                ref_unit = ref.Unit;
            }
            let tlet = Tasklet.makeNew(nextId, ref_qty, ref_unit);

            tlet.Name = '';


            this._tasklets.push(tlet);


        }

        isTaskDoneCollect() {
            let that = this;
            let tlets = this.getTasklets();
            let res = true;

            // if (this._dirty) {
            //     res = false;
            // }

            if (tlets && tlets.length > 0) {
                for (let i = 0; i < tlets.length; i++) {
                    let tlet: Tasklet = tlets[i];
                    res = res && tlet.isTaskletDone();
                }
            } else {
                res = false;
            }

            return res;
        }

        private tasklet2Json(): void {
            this.TaskletsJson = JSON.stringify(this.getTasklets())
        }
    }

    export class FileX {
        Id: number = 0;
        fileName: string = '';
        UpcCode: string = '';
        isNew: boolean = false;

        _isChecked: boolean = true;
        _isUpcExported: boolean = false;

        public static fromJson(json): FileX {

            let fileX = new FileX();
            fileX.Id = json.Id;
            fileX.fileName = json.fileName;
            fileX.UpcCode = json.UpcCode || '';
            fileX.UpcCode = fileX.UpcCode.trim();

            if (json.isNew) {
                fileX.isNew = json.isNew;
            }

            return fileX;
        }

        toJSON(): { [name: string]: any } {

            let json = {};
            let ignore = ['_isChecked', '_isUpcExported', '$$hashKey'];

            Object.getOwnPropertyNames(this).filter(name => ignore.indexOf(name) < 0).forEach(name => {
                json[name] = this[name];
            });

            return json;
        }

        isUploaded(): boolean {
            return this.Id > 0;
        }

        getColor(): string {

            if (this.Id <= 0) {
                return 'lightgray'
            }

            if (this.isNew) {
                return 'orange'
            } else {
                return 'darkgreen'
            }
        }

        isUpcExported(): boolean {
            return this._isUpcExported;
        }

        hasUpc(): boolean {
            return !Helper.isBlank(this.UpcCode)
        }

        clone(): FileX {

            let clone = new FileX();

            clone.Id = this.Id;
            clone.fileName = this.fileName;
            clone.UpcCode = this.UpcCode;

            return clone;
        }

        getUrl(svr: DbService, baseUrl: string): string {

            if (this.isUploaded()) {

                if (svr.isPhone() && svr.photoPackMgr.isExistInPhone(this.Id)) {
                    let url = 'file:///storage/emulated/0/Android/data/dsec.cpi/files/Download/' + this.Id + '.jpg';
                    console.info('loading cached photo: ' + url);
                    return url;
                }
                return baseUrl + 'file/' + this.Id;

            } else {
                //return 'photo://' + this.fileName;

                let url = 'file:///storage/emulated/0/Android/data/dsec.cpi/files/Pictures/' + this.fileName + '.jpg';
                console.info('loading captured tmp photo: ' + url);
                return url;
            }

        }

    }


    export class PhotoPackMgr {

        public isDownloading: boolean = false;
        numDownloadTried = 0;
        numDownloadLimit = 0;
        startTime = new Date();
        public isDownloadingTimer = null;
        private _packsInPhone: number[] = null;
        private _all_photo_needed: number[] = null;
        private _photo_missing: number[] = null;
        private _photo_obsolete: number[] = null;
        private svr: DbService = null;

        constructor(svr: DbService) {
            this.svr = svr;
        }

        public touchDownloading(): void {

            this.isDownloading = true;

            if (this.isDownloadingTimer) {

                this.svr.$timeout.cancel(this.isDownloadingTimer);
                console.info(' prev isDownloadingTimer  cancelled....');
            }

            // this._delayedSyncTask = this.$timeout(() => {
            this.isDownloadingTimer = this.svr.$timeout(() => {

                this.isDownloading = false;

                console.info('reset photo pack isDownloading: ' + this.isDownloading);
                this.svr.refreshView();


                if (this.getMissing().length == 0) {
                    console.info(' all downloaded, maybe delete obsolete.');

                    let msg = ' photoPack all downloaded ';

                    if (this.getObsolete().length > 500) {
                        msg += ', removing obsoletes: ' + this.getObsolete().length;

                        this.onDeleteObsolete();

                    } else {
                        let msg = ' photoPack all downloaded , skipping obsoletes: ' + this.getObsolete().length;
                        this.svr.doLogServerMsg(msg);
                    }
                }
            }, 10 * 1000);
        }

        public onDownloadOneAndOne(): void {

            let missing = this.getMissing();
            if (!this.svr.isPhone() || missing.length <= 0) {
                console.info('skipping download photo park in web....');
                return
            }

            this.isDownloading = true;

            if (this.numDownloadLimit <= 0) {

                this.numDownloadLimit = missing.length;
                this.numDownloadTried = 0;
                this.startTime = new Date();

                let msg = ', limit: ' + this.numDownloadLimit;
                this.svr.doLogServerMsg(this.getStats() + msg);
            }


            if (this.numDownloadTried >= this.numDownloadLimit) {

                let now = new Date();
                let eclipsed = Helper.timeDiffInSeconds(this.startTime, now);
                let msg = ', tried: ' + this.numDownloadTried + ', time: ' + +eclipsed + 's ';

                this.numDownloadTried = 0;
                this.numDownloadLimit = 0;

                this.svr.doLogServerMsg(this.getStats() + msg);

                return;

            }

            this.numDownloadTried++;
            this.touchDownloading();
            let url = this.svr.api.getBaseURL();

            let first = missing[0];
            NativeApp.downloadToPhotoPack(first);

            if (this.numDownloadTried % 10 == 0) {

                let now = new Date();
                let eclipsed = Helper.timeDiffInSeconds(this.startTime, now);

                let msg = 'photoPack tried ' + this.numDownloadTried + ', limit: ' + this.numDownloadLimit + ', time: ' + eclipsed + 's ';
                this.svr.doLogServerMsg(msg);
            }

        }


        public onDownloadAll(): void {

            // this.onDownloadOneAndOne();
            //
            // if (1) {
            //     return;
            // }

            this.isDownloading = true;

            let url = this.svr.api.getBaseURL();
            let missing = this.getMissing();

            if (missing.length > 100) {
                missing = missing.slice(0, 100);
            }


            let idsString = missing + '';


            if (this.svr.isPhone()) {
                NativeApp.downloadToPhotoPack(idsString);
                let msg = 'PhotoPackMgr.onDownloadAll # ' + +missing.length + ' : ' + idsString;
                this.svr.doLogServerMsg(msg);

            } else {
                console.info('skipping download photo park in web....');
                return
            }

            this.svr.doLogServerMsg(this.getStats());

        }

        public onRemoveAll(): void {
            let msg = 'Are you sure to delete all 圖片包 ?';

            if (confirm(msg)) {

                let msg = 'onRemoveAll 圖片包 # ' + this.getPacksInPhone().length;
                this.svr.doLogServerMsg(msg);

                NativeApp.doRemoveAllPhotoPacks();
                this.onUpdated();
            }

            return;
        }

        public onDeleteObsolete(): void {

            let obsolete = this.getObsolete();
            if (obsolete.length > 0) {

                this.svr.doLogServerMsg(" removing obsolete photoPack : " + obsolete.length);

                let ids = '' + obsolete;
                NativeApp.removeObsoletePhotoPack(ids);
                this.onUpdated();
                this.svr.doLogServerMsg(" done: " + this.getStats());
            } else {
                console.info(' no obsolete, skipped.');
            }
        }


        public getStats(): string {
            return "PhotoPacks, needed: " + this.getPhotosNeeded().length + ', inPhone: ' + this.getPacksInPhone().length
                + ', missing: ' + this.getMissing().length + ', obsolete: ' + this.getObsolete().length
        }


        public getPacksInPhone(): number[] {

            if (this._packsInPhone == null) {
                this._packsInPhone = [];
                let skipped = [];
                if (this.svr.isPhone()) {

                    let json = NativeApp.listPhotoPack();
                    console.info(' photo pack in phone: ' + json);

                    let ids = JSON.parse(json);
                    for (const idStr of ids) {
                        let id = parseInt(idStr);
                        if (id) {
                            this._packsInPhone.push(id);
                        } else {
                            skipped.push(idStr);
                        }
                    }
                }

                if (skipped.length > 0) {
                    let msg = 'photo pack contains other files: ' + skipped;
                    console.info(msg);
                    this.svr.doLogServerMsg(msg);
                }
            }

            return this._packsInPhone;
        }


        public getPhotosNeeded(): number[] {

            if (this._all_photo_needed == null) {
                this._all_photo_needed = [];

                let map = {};
                let tasks = Task.getAll();
                for (const task of tasks) {
                    for (const tlet of task.getTasklets()) {
                        for (const fileX of tlet.getFileXs()) {
                            if (fileX.isUploaded() && !fileX.isNew) {
                                // map[fileX.Id] = fileX.Id;

                                this._all_photo_needed.push(fileX.Id);
                            }
                        }
                    }
                }

            }

            return this._all_photo_needed;
        }

        public getObsolete(): number[] {

            if (this._photo_obsolete == null) {
                this._photo_obsolete = [];
                if (this.svr.isPhone()) {

                    let needed = this.getPhotosNeeded();
                    for (const p of this.getPacksInPhone()) {
                        if (needed.indexOf(p) < 0) {
                            this._photo_obsolete.push(p)
                        }
                    }
                }
            }
            return this._photo_obsolete;
        }

        public getMissing(): number[] {

            if (this._photo_missing == null) {
                this._photo_missing = [];

                if (this.svr.isPhone()) {
                    let photosNeeded = this.getPhotosNeeded();
                    for (const id of photosNeeded) {
                        if (!this.isExistInPhone(id)) {
                            this._photo_missing.push(id);
                        }
                    }
                }
            }
            return this._photo_missing;
        }


        isExistInPhone(id: number): boolean {

            let ids = this.getPacksInPhone();
            return ids.indexOf(id) >= 0;
        }


        onUpdated(): void {

            console.info('PhotoPackMgr onUpdated() !');

            this.clearAll();


            this.touchDownloading();
            this.svr.refreshView();


            // this.onDownloadOneAndOne();

        }

        clearAll(): void {
            this._all_photo_needed = null;
            this._packsInPhone = null;
            this._photo_missing = null;
            this._photo_obsolete = null;
        }

    }

    export class UpcMgr {
        private _all: Upc[] = [];
        private _codeMap: { [Code: string]: Upc } = {};

        private _fileXId2UpcCode: { [id: string]: string } = {};

        public hasUpcInFileX(id: number): boolean {
            return !Helper.isBlank(this._fileXId2UpcCode[id]);
        }

        public getUpcFromFileX(id: number): string {
            return this._fileXId2UpcCode[id];
        }

        public initUpcSuggestionFromFileX(): void {

        }

        public init(jsons, fileXJsons): void {
            let res = [];


            // =============== upcs ==========

            jsons = jsons || [];

            for (let i = 0; i < jsons.length; i++) {
                let upc = Upc.fromJson(jsons[i]);
                res.push(upc);

                this._codeMap[upc.Code] = upc;
            }

            this._all = res;

            // =============== fileX ==========
            fileXJsons = fileXJsons || [];

            let count = 0;
            for (let i = 0; i < fileXJsons.length; i++) {
                let fileX = FileX.fromJson(fileXJsons[i]);
                if (fileX.hasUpc()) {
                    this._fileXId2UpcCode[fileX.Id] = fileX.UpcCode;
                    count++;
                }


            }

            // console.info(' upc code from fileX total: ' + count);
            console.info(' upcs : ' + this._all.length + ',  upc code from fileX total: ' + count);

        }


        public getByCode(code: string): Upc {
            return this._codeMap[code];
        }

        public addUpc(upc: Upc) {
            this._all.push(upc);
            this._codeMap[upc.Code] = upc;
        }

        public getAll(): Upc[] {
            return this._all;
        }
    }


    export class Upc {
        public Id: number = 0;
        public Code: string;
        public ItemCode: string;
        public Unit: string;
        public Qty: number = 0;
        public Bundle: number = 1;

        public Manufacturer: string;
        public Origin: string;
        public Name: string;
        public Remark: string;

        public TemplateId: number;
        public TaskletIdx: number;
        public PhotoIds: string;
        public Status: number;

        public UpdateBy: number;
        public UpdateAt: string;

        _dirty: boolean = false;

        _photoIds: number[] = null;

        constructor() {
        }

        public static fromJson(json): Upc {

            let res = new Upc();
            res.ItemCode = json.ItemCode;
            res.Code = json.Code.trim();
            res.Name = json.Name;
            res.TemplateId = json.TemplateId;
            res.Id = json.Id;
            res.Manufacturer = json.Manufacturer;
            res.Qty = json.Qty;
            res.Bundle = json.Bundle;

            res.TemplateId = json.TemplateId;
            res.TaskletIdx = json.TaskletIdx;
            res.PhotoIds = json.PhotoIds;

            res.Status = json.Status;
            res.Unit = json.Unit;
            res.Remark = json.Remark;
            res.Origin = json.Origin;
            res.UpdateAt = json.UpdateAt;
            res.UpdateBy = json.UpdateBy;

            return res;
        }

        static make(code: string): Upc {
            let upc = new Upc();
            upc.Code = code.trim();
            upc.Name = '';
            return upc;
        }

        hasPhoto(id: number): boolean {
            return this.getPhotoIds().indexOf(id) >= 0;
        }

        addPhotoId(id: number): void {
            if (!this.hasPhoto(id)) {
                this._photoIds.push(id);
            }
        }

        prepareSave(): void {


            if (!(this._photoIds == null)) {
                this.PhotoIds = this._photoIds.join(', ');
            }
        }

        getPhotoIds(): number[] {

            if (this._photoIds == null) {
                this._photoIds = [];

                if (!Helper.isBlank(this.PhotoIds)) {
                    let splitted = this.PhotoIds.split(',');
                    for (let id of splitted) {
                        this._photoIds.push(parseInt(id));
                    }
                }
            }

            return this._photoIds;

        }

        toPackage(svr: DbService): string {

            return this.Bundle + 'x' + this.Qty + '/' + svr.unitTypeMgr.getUnitName(this.Unit)

        }

        onChange() {
            this._dirty = true;
        }

    }

    export class Tasklet {


        public isItemMissing: boolean = false;
        public Id: number = 0;

        public isNew: boolean = false;
        public isChecked: boolean = false;

        public fileXs: FileX[] = [];

        public Remark: string = '';


        _isShowRemark: boolean = true;

        constructor(public Name: string,
                    public Qty: number,
                    public Unit: string,
                    public Price: number,
                    public SpecialPrice: number,) {
        }

        public static fromJsons(svr: DbService, jsons): Tasklet[] {
            let res = [];

            for (let i = 0; i < jsons.length; i++) {
                res.push(Tasklet.fromJson(svr, i, jsons[i]));
            }

            return res;
        }

        public static makeNew(id: number, qty: number, unit: string): Tasklet {

            qty = qty || 100;
            unit = unit || '035';  // 035	個

            let tlet = Tasklet.fromJson(null, id, {
                Id: id
                , Name: '新收集'
                , Qty: qty
                , Unit: unit

            });
            tlet.isNew = true;

            return tlet;
        }

        public static fromJson(svr: DbService, idx: number, json): Tasklet {

            let tasklet = new Tasklet(json.Name, json.Qty, json.Unit, json.Price, json.SpecialPrice);

            tasklet.Remark = json.Remark;

            if (json.isItemMissing) {
                tasklet.isItemMissing = true;
            }

            if (json.isNew) {
                tasklet.isNew = true;
            }

            tasklet.Id = json.Id || (idx + 1);


            if (json.fileXs) {
                for (let fileXJson of json.fileXs) {
                    let fileX = FileX.fromJson(fileXJson);
                    tasklet.addFileX(fileX);

                    if (svr && svr.upcMgr.hasUpcInFileX(fileX.Id)) {

                        let code = svr.upcMgr.getUpcFromFileX(fileX.Id);
                        fileX.UpcCode = code;
                        fileX._isUpcExported = !!svr.upcMgr.getByCode(code);

                    } else {
                        fileX.UpcCode = '';
                    }
                }
            }

            tasklet.toggleShowRemark();

            return tasklet;
        }

        public toggleShowRemark() {

            if (!Helper.isBlank(this.Remark)) {
                this._isShowRemark = true
            } else {
                this._isShowRemark = !this._isShowRemark
            }
        }

        clone(): Tasklet {
            let t = new Tasklet(this.Name, this.Qty, this.Unit, this.Price, this.SpecialPrice);
            t.Id = this.Id;
            t.isItemMissing = this.isItemMissing;
            t.isNew = this.isNew;

            //t.Remark = this.Remark;
            // t.upcCode = this.upcCode;

            //t.fileXs = this.fileXs;
            for (let fileX of this.fileXs) {
                t.fileXs.push(fileX.clone());
            }
            return t;
        }

        public addNewFileX(filename: string): void {
            let fileX = new FileX();
            fileX.fileName = filename;
            fileX.isNew = true;

            return this.addFileX(fileX);

        }

        public getFileByName(filename: string): FileX {
            for (let f of this.fileXs) {

                console.info(' smkt file lookup : ' + f.fileName + ", fn: " + filename);

                if (f.fileName == filename || ((f.fileName + '.jpg') == filename)) {
                    return f;
                }
            }

            return null;
        }

        public getFileXs(): FileX[] {
            return this.fileXs;
        }

        public isTaskletDone(): boolean {

            if (this.isItemMissing) {
                return true;
            }

            let res = true;
            if (!(this.Price > 0)) {
                res = false;
            }
            if (!(this.Qty >= 0)) {
                res = false;
            }

            if (!(parseInt(this.Unit) >= 0)) {
                res = false;
            }

            return res;

        }

        public isNewAndEmpty(): boolean {

            return this.isNew
                && Helper.isBlank(this.Name)
                && Helper.isEmpty(this.Price)

        }

        public getPhotoPending(): number {
            let res = 0;
            for (const fx of this.fileXs) {
                res += (fx.isUploaded() ? 0 : 1);
            }
            return res;
        }

        private addFileX(f: FileX): void {

            this.fileXs.push(f);
        }
    }

    export class UnitTypeMgr {

        // 1	克-159	磅-116	公斤-019	斤-108	兩-337
        // 2	小時-493 	分鐘-507
        // 3	公升-027 	毫升-345

        public unit_weights = ['159', '116', '019', '108', '337'];
        public unit_times = ['493', '507'];
        public unit_volumes = ['027', '345'];

        public unitOptionMap = {};


        // 1公斤(019)=1000克(159)
        // 1斤(108)=605克(159)
        // 1磅(116)=454克(159)
        // 1兩(337)= 37.8125克(159)
        // 1克 (159) = 1克

        public x_weight_2_gram = {
            '019': 1000,
            108: 605,
            116: 454,
            337: 37.8125,
            159: 1
        };


        // 1公升(027)=1000毫升(345)
        //  1毫升(345)=1毫升(345)
        public x_vol_2_ml = {
            '027': 1000,
            345: 1,
        };

        constructor() {

            this.unitOptionMap = {

                // // 1	克-159	磅-116	公斤-019	斤-108	兩-337
                '159': {ids: this.unit_weights},
                '116': {ids: this.unit_weights},
                '019': {ids: this.unit_weights},
                '108': {ids: this.unit_weights},
                '337': {ids: this.unit_weights},

                // 2	小時-493 	分鐘-507
                '493': {ids: this.unit_times},
                '507': {ids: this.unit_times},

                // 3	公升-027 	毫升-345
                '027': {ids: this.unit_volumes},
                '345': {ids: this.unit_volumes},
            };
        }

        isWeight(code: string): boolean {
            return this.unit_weights.indexOf(code) >= 0
        }

        isVolume(code: string): boolean {
            return this.unit_volumes.indexOf(code) >= 0
        }

        getUnitMultiple(code: string): number {
            let res = 1;

            if (this.isWeight(code)) {
                res = this.x_weight_2_gram[code];

                if (!res) {
                    console.warn('error, weight multiple not found, code: ' + code);
                    res = 1;
                }
            }

            if (this.isVolume(code)) {
                res = this.x_vol_2_ml[code];

                if (!res) {
                    console.warn('error, volumne multiple not found, code: ' + code);
                    res = 1;
                }
            }

            return res;
        }


        // 1斤(108)=16兩(337)
        // 1公升(027)=1000毫升(345)

        isCompatible(unit1: string, unit2: string): boolean {

            if (unit1 == unit2) {
                return true;
            }

            // not the same, see if the are in same category (weight, vol,
            if (this.isWeight(unit1) && this.isWeight(unit2)) {
                return true;
            }

            if (this.isVolume(unit1) && this.isVolume(unit2)) {
                return true;
            }

            return false;
        }

        public getAllUnitTypes(): UnitType[] {
            return UnitType.getAll();
        };

        public getUnitName(code: string): string {
            let ut = UnitType.getByCode(code);
            let res = 'N/A';
            if (ut) {
                res = ut.Name;
            }

            return res;

        }

        public get(code): UnitType {
            return UnitType.getByCode(code);
        }

        public getByName(name): UnitType {
            return UnitType.getByName(name);
        }

        getUnitTypes(task: Task, tlet: Tasklet): UnitType[] {

            if (tlet === null || tlet === undefined) {

                return this.getAllUnitTypes();
            }

            let val = this.unitOptionMap[tlet.Unit];

            if (val) {
                if (!val.options) {
                    val.options = [];
                    for (let id of val.ids) {
                        val.options.push(UnitType.getByCode(id))
                    }
                }
                return val.options
            } else {
                let res = null;
                let ut = UnitType.getByCode(tlet.Unit);
                if (ut) {
                    res = [ut];
                } else {
                    res = this.getAllUnitTypes();
                }
                return res;
            }

        };


    }

    export class UnitType {

        private static _all: UnitType[] = [];
        private static _codeMap: { [id: string]: UnitType } = {};
        private static _nameMap: { [id: string]: UnitType } = {};


        constructor(public Name: string,
                    public Code: string,) {
        }

        static from(json): UnitType {
            return new UnitType(json.Name, json.Code);
        }

        static clearAll(): void {

            Helper.clearAll(this._all);
            Helper.clearAll(this._codeMap);
            Helper.clearAll(this._nameMap);

        }


        static init(jsons): void {

            this.clearAll();
            jsons = jsons || [];

            let data = '159:克;108:斤;310:單位;116:磅;345:毫升;337:兩;027:公升;019:公斤;329:安士;426:次;060:套;' +
                '035:個;078:對;493:小時;418:月;515:日;400:年;507:分鐘;477:打;640:錢;566:卷;183:盒;388:杯;574:票;' +
                '558:包;396:瓶;590:每隻;540:課程;124:立方公尺;205:平方呎;094:米;469:千瓦小時;';

            let items = data.split(';');

            for (const item of items) {

                let kv = item.split(':');
                // console.info(' unit item: ' + item + ' kv : ' + kv + ' k: ' + kv[0]);
                if (!Helper.isBlank(kv[0])) {
                    let ut = new UnitType(kv[1].trim(), kv[0].trim());
                    this._all.push(ut);
                    this._codeMap[ut.Code] = ut;
                    this._nameMap[ut.Name] = ut;
                }

            }

            console.info(' unitTypes: ' + this._all.length);
        }


        static getAll(): UnitType[] {
            return this._all;
        }

        static getByCode(code): UnitType {
            let res = this._codeMap[code];
            if (!res) {
                // console.info(' unit not found for code: ' + code);
                let ncode = (code == null || code == 'null') ? 'NA' : 'NA-' + code;
                res = new UnitType(ncode, ncode);
            }

            return res;

        }

        static getByName(name): UnitType {
            let res = this._nameMap[name];
            if (!res) {
                // console.info(' unit not found for name: ' + name);
                let nname = (name == null || name == 'null') ? 'NA' : 'NA-' + name;
                // let ncode = (code == null) ? 'NA' : 'NA-' + code;
                res = new UnitType(nname, nname);
            }

            return res;
        }

    }

    export class TaskStatus {

        public isLocked: boolean = true;
        public lastDate: string = null;
        public numTotal = 0;
        public numDone = 0;

        constructor(public outletCode) {

        }

        isAllDone(): boolean {
            return this.numDone >= this.numTotal
        }

    }

    // export class OutletApproveStatus {

    export class OutletApproveStatus {

        public numTasks = 0;
        public numTaskDone = 0; // of all users
        public numItemCollected = 0;
        public numApproved = 0;
        public numFieldCheck = 0;
        public numTotal = 0;
        public numPhotoPending = 0;
        public numPhotoNew = 0;
        public isCheckIn = false;
        public numTaskletMissing = 0;
        public isFieldCheckHasOtherOwner = true;
        public lastDate = "2000-01-01";
        public os: OutletStatus = null;
        public missingInApprove: Template[] = [];
        public collectionMethodMap = {};
        public userTaskStatusMap: { [id: number]: TaskStatus } = {};

        // public owners: User[] = null;

        constructor(public outletCode) {
        }

        static makeNull(): OutletApproveStatus {
            return new OutletApproveStatus('--');
        }

        public isPrimaryOwner(userId: number): boolean {


            let owners = this.getOwners();
            return owners[0].Id == userId;
        }

        public getColor(): string {

            if (this.isAllApproved()) {
                return 'green';
            }

            if (this.isFieldCheck()) {
                return 'orange'
            }

            if (this.isCheckIn) {
                return 'indianred'
            } else {
                return 'grey';
            }
        }

        public isPendingTask(): boolean {
            // return this.numItemCollected < this.numTotal && !this.isAllApproved() && !this.isNoOwner();
            return (this.numTaskDone < this.numTasks) && !this.isAllApproved() && !this.isNoOwner();
        }

        public isPendingApprove(): boolean {

            return this.isAllTaskDone() && !this.isPendingTask() && !this.isAllApproved() && !this.isFieldCheck();

        }

        public isAllApproved(): boolean {
            return this.numApproved >= this.numTotal;
        }

        public isAllTaskDone(): boolean {
            return this.numTaskDone >= this.numTasks;
        }

        public isAllCompleted(): boolean {
            return this.isAllApproved() && !(this.isCheck1Missing() || this.isCheck2Missing());
        }

        public isNoOwner(): boolean {
            let owners = this.getOwners();
            return owners == null || owners.length == 0;
        }

        public isFieldCheck(): boolean {


            return this.numFieldCheck > 0 && !this.isFieldCheckHasOtherOwner
                && !this.isPendingTask() && (this.numApproved + this.numFieldCheck >= this.numTotal);

            //return this.numFieldCheck > 0 && (this.numApproved + this.numFieldCheck == this.numTotal)

            // return this.numApproved < this.numTotal && ((this.numApproved + this.numFieldCheck) >= this.numTotal)
            //     && (  (this.numTaskDone + this.numFieldCheck) >= this.numTasks)
        }

        public isAllApprovedOrFieldCheck(): boolean {
            return (this.numApproved + this.numFieldCheck) >= this.numTotal && (this.numTaskDone < this.numTasks);
        }

        public isCheck1Missing(): boolean {
            return !this.isPendingTask() && !this.isPendingApprove() && !this.isFieldCheck() && this.os.Check1 != 1;
        }

        public isCheck2Missing(): boolean {

            return !this.isPendingTask() && !this.isPendingApprove() && !this.isFieldCheck() && !this.isCheck1Missing() && this.os.Check2 != 1;
        }

        public getOwners(svr?: DbService): User[] {

            return Task.getTaskOutletOwners(this.outletCode);
            //
            // if (this.owners == null) {
            //
            //     if(svr == null) {
            //         console.error(' owner not init, and svr is null');
            //     }
            //
            //     let res = [];
            //     for (const ownerId of Object.keys(this.userTaskStatusMap)) {
            //         res.push(svr.getUser(ownerId));
            //     }
            //
            //     res.sort((a: User, b: User) => {
            //
            //         let a1 = this.getTaskStatus(a.Id);
            //         let b1 = this.getTaskStatus(b.Id);
            //
            //         let diff = b1.numTotal - a1.numTotal;
            //         if (diff != 0) {
            //             return diff;
            //         } else {
            //             return b1.lastDate.localeCompare(a1.lastDate);
            //         }
            //
            //     });
            //
            //
            //     // if (res.length > 1) {
            //     //     console.info(' outlet: ' + this.outletCode + ', res users: ');
            //     //     for (const user of res) {
            //     //         console.info('user: ' + user.Name + ' , count: ' + this.getTaskStatus(user.Id).numTotal)
            //     //     }
            //     // }
            //
            //     this.owners = res;
            //
            //
            //     if (this.owners.length == 0) {
            //         this.isCheckIn = false;
            //     }
            //
            // }
            // return this.owners;
        }

        addTask(outletCode: string, task: Task) {
            this.addUserTask(task.OwnerUserId, outletCode, task);
        }

        getTaskStatus(uid: number): TaskStatus {
            return this.userTaskStatusMap[uid];
        }

        addApprove(approve: Approve) {
            if (!this.collectionMethodMap[approve.CollectMethod]) {
                this.collectionMethodMap[approve.CollectMethod] = 1;
            } else {
                this.collectionMethodMap[approve.CollectMethod]++;
            }


            if (approve.UpdateAt && approve.UpdateAt.length > 10) {
                let date = approve.UpdateAt.substr(0, 10);
                if (date.localeCompare(this.lastDate) > 0) {
                    this.lastDate = date;
                }
            }

            this.numTotal++;

        }

        toJSON(): { [name: string]: any } {

            let json = {};
            let ignore = ['db', 'owners', 'os', '$$hashKey'];


            // Object.getOwnPropertyNames(this).filter(name => ignore.indexOf(name) < 0).forEach(name => {
            //     json[name] = this[name];
            // });

            json['isPendingTask'] = this.isPendingTask();
            json['isPendingApprove'] = this.isPendingApprove();
            json['isFieldCheck'] = this.isFieldCheck();
            json['isCheck1Missing'] = this.isCheck1Missing();
            json['isCheck2Missing'] = this.isCheck2Missing();
            json['isAllCompleted'] = this.isAllCompleted();
            json['numTaskletMissing'] = this.numTaskletMissing;
            json['numFieldCheck'] = this.numFieldCheck;
            json['isFieldCheckHasOtherOwner'] = this.isFieldCheckHasOtherOwner;

            json['numTaskDone'] = this.numTaskDone;
            json['numTasks'] = this.numTasks;
            json['numApproved'] = this.numApproved;
            json['numTotal'] = this.numTotal;


            return json;
        }

        private addUserTask(userId: number, outletCode: string, task: Task) {


            let taskStatus = this.userTaskStatusMap[userId];
            if (!taskStatus) {
                this.userTaskStatusMap[userId] = new TaskStatus(outletCode);
                taskStatus = this.userTaskStatusMap[userId];
            }

            if (task.isTaskDoneCollect()) {
                taskStatus.numDone++
            }

            taskStatus.numTotal++;
            taskStatus.isLocked = taskStatus.isLocked && task.isCheckedIn();


            if (!taskStatus.lastDate && task.UpdateAt.length > 10) {
                taskStatus.lastDate = task.UpdateAt.substr(0, 10);
            }

        }

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
                this.svr.doSyncTasks();

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
            if (key.startsWith('_')) {
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

        public static contains(tlet: Tasklet, tlets: Tasklet[]): boolean {

            let target = tlet.Name.trim();

            for (let tlet2 of tlets) {
                if (target === tlet2.Name.trim()) {
                    if (tlet2.fileXs.length == tlet.fileXs.length) {

                        if (tlet2.fileXs.length > 0) {
                            return tlet2.fileXs[0].Id == tlet.fileXs[0].Id;
                        } else {
                            return true;
                        }
                    }
                }
            }

            return false;

        }

        public static findTaskletByName(name: string, tlets: Tasklet[]) {

            let target = name.trim();


            for (let tlet of tlets) {
                if (target === tlet.Name.trim()) {
                    return tlet;
                }
            }

            return null;

        }

        public static findMaxId(tlets: Tasklet[]): number {
            let max = 0;
            for (let i = 0; i < tlets.length; i++) {
                let tlet = tlets[i];

                if (tlet.Id > max) {
                    max = tlet.Id;
                }
            }

            return max;

        }


        public static upOne(tlets: Tasklet[], tlet: Tasklet): void {

            let idx = tlets.indexOf(tlet);
            if (idx <= 0) {
                return;
            }

            tlets.splice(idx, 1);
            tlets.splice(idx - 1, 0, tlet);

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

        public static tasklets2Text(tlets: Tasklet[]): string {

            tlets = tlets || [];

            // let sp = ';';
            let txt = '';

            for (let i = 0; i < tlets.length; i++) {
                txt += tlets[i].Name + ' \n';
            }

            return txt;
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


    export class DialogHelper {

        static makeUserAddEditor(svr: DbService) {

            let user = new User(-1, '', '', 'INSPECTOR', 'ACTIVE');


            let vm = {

                dirty: false

                , user: user
                , svr: svr
                , title: 'User Add : '

                , onChange: function () {

                    vm.dirty = false;
                    vm.dirty = this.user.isCodeValid() && !Helper.isBlank(this.user.Name);
                }

                , ok: function () {


                    let old = svr.getUser(vm.user.Id);


                    if (old && !old.isNull()) {
                        alert('User already exists: ' + old.Id + ', ' + old.Name);
                        return;
                    }


                    if (this.dirty && confirm('Are you sure to add outlet ' + vm.user.Id + ' ?')) {

                        return svr.doUpdateUser(vm.user).then((res) => {
                                svr.doLogServerMsg('user added: ' + vm.user.Id + ': ' + vm.user.Name);
                                svr.clearAllData();
                                svr.doRefreshData();
                            }
                        )
                    } else {
                        return Promise.resolve(null);
                    }

                }

            };

            let controller = function ($scope, $mdDialog) {

                console.info('inside OutletAddEditor controller.. ');

                $scope.svr = svr;
                $scope.vm = vm;

                $scope.cancel = function () {
                    $mdDialog.cancel()

                };

                $scope.ok = function () {

                    // @ts-ignore
                    vm.ok().then((data) => {
                            console.info('data: ' + JSON.stringify(data));
                            $mdDialog.cancel();
                            //return data;
                        }
                    );
                }
            };

            return controller;
        }

        static makeOutletAddEditor(svr: DbService) {

            let outlet = new Outlet();
            outlet.Name = '';
            outlet.OutletCode = '';
            outlet.Address = '';


            let vm = {

                dirty: false

                , outlet: outlet
                , svr: svr
                , title: 'Outlet Add : '

                , onChange: function () {

                    vm.dirty = false;
                    vm.dirty = this.outlet.isCodeValid() && !Helper.isBlank(this.outlet.Name);
                }

                , ok: function () {

                    if (!vm.outlet.isCodeValid()) {
                        alert('invalid outlet code: ' + this.outlet.OutletCode);
                        return;
                    }

                    let old = svr.getOutlet(vm.outlet.OutletCode);


                    if (old && !old.isNull()) {
                        alert('Outlet already exists: ' + old.OutletCode + ', ' + old.Name);
                        return;
                    }


                    if (this.dirty && confirm('Are you sure to add outlet ' + vm.outlet.OutletCode + ' ?')) {

                        return svr.doUpdateOutlet(vm.outlet).then((res) => {
                                svr.doLogServerMsg('outlet added: ' + vm.outlet.OutletCode + ': ' + vm.outlet.Name);
                                svr.clearAllData();
                                svr.doRefreshData();
                            }
                        )
                    } else {
                        return Promise.resolve(null);
                    }

                }

            };

            let controller = function ($scope, $mdDialog) {

                console.info('inside OutletAddEditor controller.. ');

                $scope.svr = svr;
                $scope.vm = vm;

                $scope.cancel = function () {
                    $mdDialog.cancel()

                };

                $scope.ok = function () {

                    // @ts-ignore
                    vm.ok().then((data) => {
                            console.info('data: ' + JSON.stringify(data));
                            $mdDialog.cancel();
                            //return data;
                        }
                    );
                }
            };

            return controller;
        }


        static makeUpcMergeEditor(svr: DbService, template: Template, tlet: Tasklet, upcCode: string) {


            if (!tlet || !upcCode) {
                console.error(' param error, tlet: ' + tlet + ', upc: ' + upcCode);
                return;
            } else {
                console.info('makeing upc merge editor , upc: ' + upcCode + ' tlet: ' + JSON.stringify(tlet));
            }

            upcCode = upcCode.trim();

            let upc = svr.upcMgr.getByCode(upcCode);

            let isNewUpc = false;
            if (upc == null) {
                upc = Upc.make(upcCode);
                isNewUpc = true;
            }

            let _dirty = false;


            let vm = {

                dirty: false,

                message: upc.toPackage(svr),

                upc: upc,
                tmpTasklet: tlet.clone(),

                svr: svr
                , title: 'UPC : ' + upcCode

                , onChange: function () {
                    vm.dirty = true;
                }

                , mergeTasklet2Upc() {

                    this.upc.Name = this.tmpTasklet.Name;
                    this.upc.Unit = this.tmpTasklet.Unit;
                    this.upc.ItemCode = template.ItemCode;
                    this.upc.Qty = this.tmpTasklet.Qty;
                    this.upc.TemplateId = template.Id;
                    this.upc.TaskletIdx = template.getTasklets().indexOf(tlet);

                    vm.message = this.upc.toPackage(svr);


                    let files = this.tmpTasklet.fileXs;
                    for (let f of files) {
                        this.upc.addPhotoId(f.Id);
                    }

                    vm.dirty = true;
                }

                , ok: function () {
                    if (this.dirty && confirm('Are you sure to update UPC ?')) {

                        return svr.doUpdateUpc(upc).then(
                            (res) => {
                                if (isNewUpc) {
                                    svr.upcMgr.addUpc(upc);

                                    // if (tlet.upcCode != upcCode) {
                                    //     tlet.upcCode = upcCode;
                                    //     template._dirty = true;
                                    //     svr.doUpdateTemplate(template).then(res => {
                                    //         svr.refreshView();
                                    //     });
                                    // }

                                }
                            }
                        )
                    } else {
                        return Promise.resolve(null);
                    }

                }

            };

            let controller = function ($scope, $mdDialog) {

                console.info('inside UpcMergeEditorController controller.. ');

                $scope.svr = svr;
                $scope.vm = vm;

                $scope.cancel = function () {
                    $mdDialog.cancel()

                };

                $scope.ok = function () {

                    // @ts-ignore
                    vm.ok().then((data) => {
                            console.info('data: ' + JSON.stringify(data));
                            $mdDialog.cancel();
                            //return data;
                        }
                    );
                }
            };

            return controller;


        }


        static makeTaskletsEditorController(svr, template, approve) {

            let tasks = [];

            if (!template && !approve) {
                console.error('both template and approve is null ?!!');
                return;
            }

            if (approve) {
                tasks = approve.getTasks();
            }

            if (!template) {

                let task1 = tasks[0];
                //template = svr.getTemplate(task1);
                template = svr.getTemplateByCodes(approve.OutletCode, approve.ItemCode);
            }


            let vm = {

                isMerge: (template && approve),
                dirty: false,
                tmpTasklets: [],
                template: template,
                approve: approve,
                svr: svr,
                title: ' N/A ',
                description: ''

                , refreshDescription: function () {

                    vm.dirty = true;

                    if (!this.isMerge) {
                        return;
                    }

                    let tlets = this.tmpTasklets;
                    let res = [];
                    for (let tlet of tlets) {
                        if (tlet.isChecked) {
                            res.push(tlet);
                        }
                    }

                    vm.description = Helper.tasklets2Text(res);


                }
                , onChange: function () {
                    vm.dirty = true;
                }

                , addNew: function () {

                    let e = Tasklet.makeNew(-1, vm.template.BaseQty, vm.template.BaseUnit);
                    e.isChecked = true;


                    vm.tmpTasklets.push(e);
                    vm.refreshDescription();
                    vm.dirty = true;
                }


                , ok: function () {

                    let numNew = 0;
                    let checked: Tasklet[] = [];


                    for (let tlet of vm.tmpTasklets) {
                        if (tlet.isChecked) {

                            checked.push(tlet);

                            let selectedFileXs = [];


                            for (let file of tlet.fileXs) {

                                if (file._isChecked) {
                                    selectedFileXs.push(file);
                                }

                            }

                            tlet.fileXs = selectedFileXs;

                            if (tlet.isNew) {
                                numNew++;
                            }
                        }
                    }
                    let msg = '新的文本將被使用，你確定嗎？';
                    if (numNew > 0) {
                        msg += '\n\n 和 ' + numNew + '個 新任務 將被添加到  計劃樣板. '
                    }

                    if (!confirm(msg)) {
                        return Promise.resolve([0, 0]);
                        // return;
                    }


                    // merge tasklet to template and save
                    vm.template.setTasklets(checked);
                    let approveUpdatePromise = Promise.resolve();
                    if (vm.approve) {
                        vm.approve.Description = vm.description;
                        vm.approve._dirty = true;
                        approveUpdatePromise = svr.doUpdateApprove(vm.approve);
                    }

                    return Promise.all([svr.doUpdateTemplate(vm.template), approveUpdatePromise])
                }

            };


            vm.title = svr.getOutletName(vm.template.OutletCode) + ' : ' + svr.getItemName(vm.template.ItemCode);
            vm.description = approve ? approve.Name : 'N/A';

            if (Helper.isBlank(vm.description)) {
                vm.description = Helper.tasklets2Text(vm.template.getTasklets());

            }


            // let template = svr.getTemplate(task1);
            let templateTasklets = vm.template.getTasklets();

            for (let t of templateTasklets) {

                let copy = t.clone();
                copy.isChecked = true;
                vm.tmpTasklets.push(copy);
                t.isChecked = true;
                copy.isNew = false;

            }


            for (let task of tasks) {

                let tlets = task.getTasklets();
                for (let tlet of tlets) {
                    // if not exist in template, add it as option to merge.
                    //if (!Helper.findTaskletByName(tlet.Name, vm.tmpTasklets)) {
                    if (!Helper.contains(tlet, vm.tmpTasklets)) {

                        let e = tlet.clone();
                        e.isChecked = false;
                        e.isNew = true;
                        e.isItemMissing = false;


                        vm.tmpTasklets.push(e);
                        // tasklets = tasklets.concat(task.getTasklets());
                    }
                }
            }


            let controller = function ($scope, $mdDialog) {
                console.info('inside TaskletsEditorController controller..');

                $scope.svr = svr;
                $scope.vm = vm;

                $scope.cancel = function () {
                    $mdDialog.cancel()

                };

                $scope.ok = function () {

                    // @ts-ignore
                    vm.ok().then((data) => {
                            console.info('count: ' + JSON.stringify(data));
                            $mdDialog.cancel();
                            //return data;
                        }
                    );

                }

            };

            return controller;
        }

    }


    // file maageer


    declare var Upload;

    export class FileMgr {

        // private evt;

        public data;
        _ng_uploader;
        _svr: DbService = null;
        isUploadedJustClicked = false;
        isUploadedJustClickedTimer = null;
        _numPicToBeUploaded = 0;
        _numPicUploaded = 0;
        _timeStart: Date = null;
        private _photo_tasklet_map: { [filename: string]: Tasklet } = {};

        constructor(svr: DbService, uploader,) {
            this._svr = svr;

            this._ng_uploader = uploader;
        }

        public onUploadAllPhotoClicked(numPics?: number): void {

            // user-activated upload 'onClick', otherwise, it's by timer.
            if (numPics > 0) {
                this._numPicToBeUploaded = numPics;
                this._numPicUploaded = 0;
                this._timeStart = new Date();
                console.info(' uploading pics: ' + numPics);
            } else {
                console.info(' timer-refresh pics: ' + numPics);
            }

            // let   3 < seconds  < 11
            let seconds = Math.max(numPics || 3, this._numPicToBeUploaded, 3);
            if (seconds > 10) {
                seconds = 10;
            }

            console.info(' waiting ' + seconds + 's ');

            this.isUploadedJustClicked = true;

            if (this.isUploadedJustClickedTimer) {
                this._svr.$timeout.cancel(this.isUploadedJustClickedTimer);

            }

            this.isUploadedJustClickedTimer = this._svr.$timeout(() => {

                this.isUploadedJustClicked = false;

                console.info('re-enable fileUploadBtn ');

                // sync all task since upload-photo id was updated and need sync
                let msg = this._numPicUploaded + ' photos uploaded. ';

                if (this._numPicUploaded >= this._numPicToBeUploaded) {

                    let timeEnd = new Date();

                    let timeEclipsed = 0;
                    let timeStr = ', time: N/A ';
                    if (timeEnd && this._timeStart) {
                        timeEclipsed = (timeEnd.getTime() - this._timeStart.getTime()) / 1000;

                        timeStr = ', time: ' + timeEclipsed + ' avg: ' + timeEclipsed / this._numPicUploaded;
                    }

                    msg += ', all done, now sync #' + this._svr.getAllDirtyTasks().length + timeStr;

                    this._svr.doSyncTasks();
                } else {
                    msg += ', ' + (this._numPicToBeUploaded - this._numPicUploaded) + ' more to go, waiting ... ' + seconds + 's';
                }
                this._svr.doLogServerMsg(msg);

            }, (seconds) * 1000);

            console.info('disable btn for ' + seconds + 's');
        }

        public uploadFile(task: Task, tlet: Tasklet, file) {

            if (!file) {
                console.info(' file empty, skipped');
                return;
            }

            // let url = this._svr.Api.makeUrl('/file/upload');
            let url = this._svr.Api.makeUrl('/file/upload/' + this._svr.getCurrUserId());

            let filename = this.makeFilename(task, tlet) + '-' + file.name;

            console.info('file-mgr upload: ' + filename + ', type: ' + file.type + ', size: ' + file.size);


            this.addTaskletPhoto(filename, tlet);

            this._svr.onUpdateTask(task);
            // task.onChange();

            // this._ng_uploader.upload()

            this._ng_uploader.upload({
                url: url,
                data: {
                    Id: '-1'
                    , file: file
                    , MetaJSON: '{test: meta, uploader: "web"}'
                    , ParamJSON: '{ test: param }'
                }
            }).then((res) => {


                let id = (res && res.data && res.data.Id) ? res.data.Id : -1;

                console.info(' upload file success, photo id : ' + id);
                if (id <= 0) {
                    console.warn('Error, return photo id : ' + res.data);
                }

                this.onFileUploaded(filename, id);

            }, (err) => {

                let t2 = err && err.statusText;

                let msg = 'failed to upload, err ' + t2 + JSON.stringify(err.data);
                // console.warn(msg);

                //let msg = 'failed to upload, err ' + JSON.stringify(err);
                // console.warn(msg);
                this._svr.UiError(msg);
            });

        }

        //
        // onSelectFile(evt: any) {
        //
        //     console.info('selected evt: ' + evt);
        //     this.evt = evt
        // }
        addTaskletPhoto(filename: string, tlet: MyApp.Tasklet) {

            tlet.addNewFileX(filename);
            this._photo_tasklet_map[filename] = tlet;


        }

        getTasklet(filename: string, removeAfter?: boolean): Tasklet {
            let res = this._photo_tasklet_map[filename];

            if (!res) {
                console.warn(' no tasklet found for filename: ' + filename)
            }

            if (removeAfter) {
                delete this._photo_tasklet_map[filename];
            }

            return res;
        }

        getTaskIdFromFilename(filename: string): any {

            let strs = filename.substr(5).split('_');
            return {taskId: parseInt(strs[0]), taskletId: parseInt(strs[1])};
        }

        onFileCancelled(filename: string): void {
            let fnMap = this.getTaskIdFromFilename(filename);

            let taskId = fnMap.taskId;
            let taskletId = fnMap.taskletId;

            let task, tlet, file;
            let isTaskUpdated = false;

            task = Task.getTaskById(taskId);
            tlet = task.getTaskletById(taskletId);

            if (task && tlet) {

                file = tlet.getFileByName(filename);
                if (file) {

                    let idx = tlet.fileXs.indexOf(file);
                    if (idx >= 0) {
                        tlet.fileXs.splice(idx, 1);
                        this._svr.onUpdateTask(task);

                    } else {
                        console.warn(' file found, but idx not found ?!  file: ' + JSON.stringify(file) + ', idx: ' + idx);
                    }
                    isTaskUpdated = true;

                    this._svr.refreshView();
                }
            }

            if (!isTaskUpdated) {
                console.warn('task not cancelled for uploaded file: ' + filename
                    + ' task: ' + task
                    + ' tlet: ' + tlet
                    + ' fileX: ' + file
                );
            }
        }

        onFileUploaded(filename: string, fileId: string): void {

            let fnMap = this.getTaskIdFromFilename(filename);
            let taskId = fnMap.taskId;
            let taskletId = fnMap.taskletId;
            let task, tlet, file;
            let isTaskUpdated = false;

            task = Task.getTaskById(taskId);
            if (task) {
                tlet = task.getTaskletById(taskletId);
            }

            this.onUploadAllPhotoClicked();
            this._numPicUploaded++;


            if (task && tlet) {

                file = tlet.getFileByName(filename);
                if (file) {
                    file.Id = parseInt(fileId);
                    task.onChange();
                    this._svr.onUpdateTask(task);
                    isTaskUpdated = true;

                    // no need sync task, since 'onUploadAllPhotoClicked()' will manage it after all photo uploaded.
                    let msg = 'onFileUploaded id:' + fileId + ', fn: ' + file.fileName + ', ' + task.OutletCode + ':' + task.ItemCode
                        + ' |' + tlet.Name;
                    console.info(msg);
                    this._svr.doLogServerMsg(msg);
                }
            }

            if (!isTaskUpdated) {

                let msg = '!!! onFileUploaded: task not updated for uploaded file: ' + filename
                    + ' id: ' + fileId
                    + ' task: ' + task
                    + ' tlet: ' + tlet
                    + ' fileX: ' + file;

                console.warn(msg);
                this._svr.doLogServerMsg(msg);
            }

            this._svr.refreshView();
        }

        public makeFilename(task: Task, tlet: Tasklet) {


            let res = 'smkt-9999_99_' + Math.floor(Math.random() * 100);

            if (task && tlet) {

                res = 'smkt-' + task.Id + '_' + tlet.Id + '_' + tlet.fileXs.length;
            }

            return res;
        }


        public tryMapFileNameToId(filename: string): void {

            console.info('FileX trying to map fileName: ' + filename);

            this._svr.doGetFileXByFileName(filename).then(res => {

                let msg = 'tryMapFileNameToId....';
                let data = res.data;
                if (data && data.FileX) {
                    let json = data.FileX;
                    let f: FileX = FileX.fromJson(json);

                    this.onFileUploaded(filename, f.Id + '');

                    msg = 'tryMapFileNameToId success, fn: ' + filename + ' --> id: ' + f.Id;
                } else {
                    msg = 'tryMapFileNameToId failed , fn: ' + filename + ', res: ' + JSON.stringify(data);
                }

                console.info(msg);
                this._svr.doLogServerMsg(msg);


            })

        }
    }


    export class Country {

        static NULL = new Country('NA', "--");

        public code2;
        public name;

        constructor(code, name) {
            this.code2 = code;
            this.name = name;
        }

        public static fromJson(json: any): Country {
            let country = new Country(json.code, json.name);
            // country.code2 = json.code;
            // country.name = json.name;
            return country
        }
    }

    export class Mgr {


        public users: Cache<User> = new Cache<User>();
        public items: Cache<Item> = new Cache<Item>();
        public outlets: Cache<Outlet> = new Cache<Outlet>();
        public outletStatuses: Cache<OutletStatus> = new Cache<OutletStatus>();
        public _outlets: Cache<Outlet> = new Cache<Outlet>();
        private _inspectors: User[] = null;
        private _all_inspectors: User[] = null;
        private _svr: DbService;

        constructor(svr: DbService) {
            this._svr = svr;
        }


        onShowTemplateImageIds(): void {

            let lastId = 17134;
            let ids = [];
            let outlets = this._svr.templateMgr.getOutletCodes();
            for (const outlet of outlets) {

                let templates = this._svr.templateMgr.getByOutlet(outlet);
                for (const template of templates) {
                    for (const tlet of template.getTasklets()) {
                        for (const fileX of tlet.getFileXs()) {

                            if (fileX.Id > lastId) {
                                ids.push(fileX.Id);
                            }
                        }
                    }
                }
            }

            console.info('fileXs #' + ids.length);
            console.info('fileXs ids: ' + JSON.stringify(ids));

        }


        public getStatus(outletCode
                             : string
        ):
            OutletStatus {

            let key = outletCode;
            let oi = this.outletStatuses.getByKey(key);
            if (!oi) {
                oi = OutletStatus.make(this._svr, outletCode);
                this.outletStatuses.add(oi);
            }

            return oi;
        }


        public clearAll(): void {

            this.users.clearAll();
            this.items.clearAll();
            this.outlets.clearAll();
            this.outletStatuses.clearAll();
        }

        public initOutletStatus(jsons): void {
            this.outletStatuses.init('outletStatuses', OutletStatus.fromJson, jsons);
        }


        public initUsers(jsons):
            void {
            this.users.init('users', User.fromJson, jsons);
            this._inspectors = null;
            this._all_inspectors = null;
            this.users.doSort();
        }


        public initItems(jsons): void {
            this.items.init('items', Item.fromJson, jsons)
        }

        public initOutlets(outletJsons, outletOwnersJsons): void {


            this.outlets.init(Outlet.name, Outlet.fromJson, outletJsons);

            this.outlets.doSort();

            outletOwnersJsons = outletOwnersJsons || [];

            let mgr = this;
            for (const oo of outletOwnersJsons) {
                let outlet = mgr.outlets.getByKey(oo.OutletCode);
                let owner = mgr.users.get(oo.UserId);

                if (!outlet || !owner) {
                    let msg = 'outletOwner has no match ';
                    if (!outlet) {
                        msg += ', outlet: ' + oo.OutletCode;
                    }
                    if (!owner) {
                        msg += ', owner: ' + oo.UserId + ', outlet: ' + oo.OutletCode;
                    }
                    console.error(msg);
                } else {
                    outlet._owners.push(owner);
                }
            }
        }


        public getOutlet(code: string): Outlet {
            return this.outlets.getByKey(code);
        }


        public getItem(code: string): Item {
            return this.items.getByKey(code);
        }

        getAllInspectors(): User[] {
            if (this._all_inspectors == null) {
                this._all_inspectors = [];
                let all = this.users.getAll();
                for (const user of all) {
                    if (user.isInspector()) {
                        this._all_inspectors.push(user);
                    }
                }

                this._all_inspectors.sort((a, b) => {
                    return a.Id - b.Id
                })
            }
            return this._all_inspectors;

        }

        getInspectors(): User[] {
            if (this._inspectors == null) {
                this._inspectors = [];
                let all = this.users.getAll();
                for (const user of all) {
                    if (user.isInspector() && user.isActive()) {
                        this._inspectors.push(user);
                    }
                }
            }
            return this._inspectors;
        }


    }


    declare var COUNTRY_DATA;

    export class DataMgr {

        _all_country: Country[] = null;
        _country_code2_map: { [code2: string]: Country } = {};

        public getAllCountry(): Country[] {

            if (!this._all_country) {
                this._all_country = [];

                for (let cd of COUNTRY_DATA) {
                    let c = Country.fromJson(cd);
                    this._all_country.push(c);

                    this._country_code2_map[c.code2] = c;

                }

                console.info(' country: ' + this._all_country.length)
            }
            return this._all_country;
        }

        public getCountry(code2: string): Country {

            if (!this._all_country) {
                this.getAllCountry();
            }

            return this._country_code2_map[code2];
        }

    }


    export class TmpStore {

        public static TAG: string = 'TmpStore';
        PIN_KEY = 'smkt-outlet-pin-';
        private _svr: DbService = null;
        private storage = window.localStorage;
        private _all: Task[] = null;
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

        public removeAll(): void {

            if (!this._svr.getCurrUser().isAdmin()) {
                let msg = 'only for testing, skipped !!';
                alert(msg);
                return;

            } else {

                // let tasks = this.getAll();
                // for (const task of tasks) {
                //     this.clearById(task.Id);
                // }
            }
        }


        public clearById(id: number) {
            let key = this.makeKeyByTaskId(id);

            console.info(TmpStore.TAG + ' clearing id key: ' + key);
            this.storage.removeItem(key);

            this.listUpdated();
        }

        public doUploadAll(): void {

            // sync all memory dirty-tasks first;
            this._svr.doSyncTasks().then((res) => {

                this.listUpdated();

                // then, sync all local-tmp tasks
                let tmpTasks = this.getAll();

                if (tmpTasks.length > 0) {
                    this._svr.doSyncTasks(tmpTasks).then(() => {

                            // need to refresh data from server, since tmpStore (local-storage) has latest data uploaded, and sync from server
                            // to match newly updated data.
                            this._svr.doRefreshData()
                        }
                    );
                } else {
                    this._svr.refreshView();
                }

                let msg = TmpStore.TAG + ' doUploadAll : ' + tmpTasks.length + ', tmp: ' + this.getAll().length;
                console.info(msg);
                this._svr.doLogServerMsg(msg);
            });


        }


        public hasPending(): boolean {
            return this.getAll().length > 0;
        }

        public getAll(): Task[] {

            if (this._all == null) {

                let year = this._svr.config.getConfigYear();
                let month = this._svr.config.getConfigMonth();

                let prefix = 'smkt-task-' + year + '-' + month + '-';

                let keys = Object.keys(this.storage);
                let res: Task[] = [];
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

        public save(task: Task) {

            let tag = this.makeKey(task);

            task.onChange();
            task.prepareSave();
            this.storage.setItem(tag, JSON.stringify(task));

            this.listUpdated();

            console.info(TmpStore.TAG + ' saved : ' + task.Id + ', $: ' + task.getTasklets()[0].Price);
        }


        public getByKey(key: string): Task {
            let jsonStr = this.storage.getItem(key);

            let res: Task = null;
            if (jsonStr) {
                let json = JSON.parse(jsonStr);
                res = Task.fromJson(json);
                // console.info(TmpStore.TAG + ' unpacking: ' + jsonStr );
                // console.info(TmpStore.TAG + ' unpacked: ' + JSON.stringify(res) );
                res._dirty = true;

                let tlet0 = res.getTasklets()[0];
                console.info(TmpStore.TAG + ' load id: ' + res.Id + ', $: ' + tlet0 ? tlet0.Price : 'N/A');

            } else {
                let msg = TmpStore.TAG + ' task not found on local-storage for key' + key;
                console.info(msg);

                this._svr.doLogServerMsg(msg);
            }

            return res;

        }

        public getByTaskId(id: number): Task {

            let tag = this.makeKeyByTaskId(id);
            return this.getByKey(tag);
        }

        public makeKeyByTaskId(taskId: number): string {
            // sample : smkt-2019-1-xxxx  , where xxx is task.id
            return 'smkt-task-' + this._svr.config.getConfigYear() + '-' + this._svr.config.getConfigMonth() + '-' + taskId

        }

        public makeKey(t: Task): string {
            return this.makeKeyByTaskId(t.Id)
        }
    }

    export class ParseResult {

        skipped: string[] = [];
        failed: string[] = [];
        duplicates: any [] = [];
        msg: string = null;
        parsed: any[] = [];

        public clear() {
            this.parsed = [];
            this.failed = [];
            this.skipped = [];
        }

        public copyDups(): void {
            this.parsed.push.apply(this.parsed, this.duplicates);
        }
    }

    export class ImportUtil {

        public static parseOutlet(svr: DbService, code: string): Outlet {

            let res = null;

            if (code && code.length > 1) {

                code = code.replace('-', '');

                //res = Outlet.get(code);
                res = svr.mgr.outlets.getByKey(code);

                if (res && res.isNull()) {
                    res = null;
                }

                if (!res) {
                    console.info(' outlet code not found: ' + code);
                }

            }

            return res;

        }

        public static parseItem(svr: DbService, code: string): Item {

            let res: Item = null;

            if (code && code.length > 1) {

                code = code.replace('-', '');

                // res = Item.get(code);
                res = svr.mgr.getItem(code);

                if (res && res.isNull()) {
                    res = null;
                }

            }

            return res;

        }

        public static parseUnit(code: string): UnitType {

            let res: UnitType = null;
            if (code && code.length === 3) {
                res = UnitType.getByCode(code);
            } else {
                res = UnitType.getByName(code);
            }

            return res;

        }

        //
        public static parseTaskName(str): string {

            let res = '';

            res = str || '';

            res = res.replace(/\^/g, '\n');
            // res = res.replace(';', '');
            // res = res.replace('$', '');
            // res = res.replace(/_/g, '');


            res = res.trim();

            if (res.startsWith('1]')) {
                res.replace('1]', '')
            }
            if (res.startsWith('2]')) {
                res.replace('2]', '')
            }


            return res;


        }


        public static onParseTemplate(svr: DbService, txt: string): ParseResult {

            // excel formula
            // =SUBSTITUTE(N3,CHAR(13) & CHAR(10),"| ")
            // =SUBSTITUTE(SUBSTITUTE(M2,CHAR(13),""),CHAR(10),"")

            let res = new ParseResult();

            let templates: Template[] = [];

            if (txt === null || txt === undefined) {
                let msg = 'no data to import';
                console.warn(msg);
                txt = '';
                alert(msg);
                return;
            }

            let lines = txt.split('\n');
            let warnings = [];


            for (let i = 0, len = lines.length; i < len; i++) {

                let line = lines[i];

                if (Helper.isBlank(line)) {
                    continue;
                }

                let tokens = line.split('\t');

                //週期, 商品編號	,商品名稱,商戶編號, 商戶名稱	收集單位			基期單位			商品摘要	地址


                //let cycle = parseInt((tokens[0] || '').trim());   //  週期
                let cycle = (tokens[0] || '').trim();   //  週期
                let itemCode = (tokens[1] || '').trim();

                if (Helper.isBlank(itemCode)) {
                    res.failed.push('failed itemCode: ' + itemCode + line);
                    continue;
                }

                // if (cycle < 1 || cycle > 3) {
                //     res.failed.push('error cycle:' + cycle + line);
                //     continue;
                // }

                let outletCode = (tokens[3] || '').trim();

                let taskQty = parseInt((tokens[5] || '').trim());
                let unit = (tokens[7] || '').trim();
                let baseQty = taskQty;
                let base_unit = unit;
                let tasksTxt = (tokens[8] || '').trim();


                let item = ImportUtil.parseItem(svr, itemCode);
                let outlet = ImportUtil.parseOutlet(svr, outletCode);
                let baseUnit = ImportUtil.parseUnit(base_unit);
                let taskUnit = ImportUtil.parseUnit(unit);

                if ('(每週)' == cycle) {
                    res.skipped.push(line);
                    continue;
                }

                if (!item || !outlet || !baseQty || !taskQty || !baseUnit || !taskUnit) {

                    res.failed.push(line);
                    console.info('item: ' + item + ', outlet: ' + outlet + ', baseQty' + baseQty + ', taskQty: ' + taskQty + ', baseUnit: ' + baseUnit + ', taskUnit: ' + taskUnit)

                    if (!outlet) {
                        console.error(' Outlet code not found: ' + outletCode);
                    }

                    if (!item) {
                        console.error(' Item code not found: ' + itemCode);
                    }

                    continue;
                }

                let old = svr.getTemplateByCodes(outlet.OutletCode, item.ItemCode);

                // let template = old;
                let template = Template.make(outlet.OutletCode, item.ItemCode, baseQty, baseUnit.Code);

                template.clearAllMonth();
                template.initMonthFromCycleTxt(cycle);
                template._cycle = cycle + '';

                // tasksTxt= tasksTxt.replace(';', '|');
                tasksTxt = tasksTxt.replace(/\|/g, '\n');

                let taskTxts: string[] = tasksTxt.split(';');
                let tlets: Tasklet[] = [];
                let lastName = null;
                for (let txt of taskTxts) {

                    txt = txt.trim();

                    if (!Helper.isBlank(txt)) {

                        let name = ImportUtil.parseTaskName(txt);
                        let tlet = Tasklet.makeNew(0, taskQty, taskUnit.Code);

                        if (Helper.isBlank(name)) {
                            tlet.Name = item.Name;
                        } else {
                            tlet.Name = name;
                        }

                        if (!lastName) {
                            lastName = tlet.Name;
                        }


                        tlets.push(tlet)
                    }
                }

                if (tlets.length == 0) {


                    // create default task

                    let tlet = Tasklet.makeNew(0, taskQty, taskUnit.Code);
                    tlet.Name = item.Name;
                    tlets.push(tlet);

                    // res.failed.push('failed to parse tasklets: ' + taskTxts);
                    // continue;

                }

                template.setTasklets(tlets);


                if (old) {
                    console.info(' template exists : ' + old.makeKey());
                    res.duplicates.push(template);

                } else {
                    res.parsed.push(template);
                }
            }

            console.info(' parsed : ' + res.parsed.length + ', skipped: ' + res.skipped.length
                + ', failed: ' + res.failed.length + ', dups: ' + res.duplicates.length);

            return res;
        }


        public static onParseApprove(svr: DbService, txt: string): ParseResult {

            let res = new ParseResult();

            let templates: Approve[] = [];

            if (txt === null || txt === undefined) {
                let msg = 'no data to import';
                console.warn(msg);
                txt = '';
                alert(msg);
                return;
            }

            let lines = txt.split('\n');
            let warnings = [];


            for (let i = 0, len = lines.length; i < len; i++) {

                let line = lines[i];

                if (Helper.isBlank(line)) {
                    continue;
                }

                let tokens = line.split('\t');

                //週期, 商品編號	,商品名稱,商戶編號, 商戶名稱	收集單位			基期單位			商品摘要	地址


                let itemCode = (tokens[0] || '').trim();

                if (Helper.isBlank(itemCode)) {
                    res.failed.push('failed itemCode: ' + itemCode + line);
                    continue;
                }

                let outletCode = (tokens[1] || '').trim();

                let taskQty = parseInt((tokens[2] || '').trim());
                let unit = (tokens[4] || '').trim();
                let baseQty = taskQty;
                let base_unit = unit;
                let lastPrice = (tokens[5] || '').trim();


                let item = ImportUtil.parseItem(svr, itemCode);
                let outlet = ImportUtil.parseOutlet(svr, outletCode);
                let baseUnit = ImportUtil.parseUnit(base_unit);
                let taskUnit = ImportUtil.parseUnit(unit);

                if (!item || !outlet || !baseQty || !baseUnit || !taskUnit) {

                    res.failed.push(line);
                    console.error('item: ' + item + ', outlet: ' + outlet + ', baseQty' + baseQty + ', taskQty: ' + taskQty + ', baseUnit: ' + baseUnit + ', taskUnit: ' + taskUnit)

                    if (!outlet) {
                        console.error(' Outlet code not found: ' + outletCode);
                    }

                    if (!item) {
                        console.error(' Item code not found: ' + itemCode);
                    }

                    continue;
                }

                let old = svr.approveMgr.getApprove(outlet.OutletCode, item.ItemCode);
                if (!old) {
                    let msg = '' + outlet.OutletCode + ':' + item.ItemCode + ' not found, skipped!';
                    console.info(msg);
                    res.failed.push(msg);
                    continue;
                }


                if (old.LastPrice > 0) {
                    res.skipped.push(old.getKey());
                    // console.error(' old has ref price already:' + old.getKey());

                    // continue;
                    if (old.LastPrice != Number(lastPrice)) {

                        console.info('old has ref price already: Price diff: ' + old.LastPrice + ' -> ' + lastPrice);
                    } else {
                        continue;
                    }


                }

                old.RefYear = 2019;
                old.RefMonth = 12;
                old.LastPrice = Number(lastPrice);
                old.LastQty = baseQty;
                old.LastUnit = baseUnit.Code;

                lastPrice = lastPrice.replace(/\|/g, '\n');

                res.parsed.push(old);
            }

            console.info(' parsed : ' + res.parsed.length + ', skipped: ' + res.skipped.length
                + ', failed: ' + res.failed.length + ', dups: ' + res.duplicates.length);

            return res;
        }

        // passed = array of  '[Outlet, User]'
        public static parseOutletUser(svr: DbService, txt: string): ParseResult {

            let res = new ParseResult();


            if (txt === null || txt === undefined) {

                res.msg = 'no data to import';
                console.warn(res.msg);

                return res;
            }

            let lines = txt.split('\n');

            let warnings = [];

            for (let i = 0, len = lines.length; i < len; i++) {
                // if (i == 0) {  // skip header
                //     continue;
                // }

                let line = lines[i];

                if (Helper.isBlank(line)) {
                    continue;
                }

                let tokens = line.split('\t');

                //let token = tokens[j];
                let idx = 0;

                let outletCode = tokens[idx++] || '';
                outletCode = outletCode.replace('-', '');

                let o = svr.getOutlet(outletCode);

                if (!o || o.isNull()) {
                    res.failed.push(line + ' | outlet not found: ' + outletCode);
                    continue;

                }


                let matchedUser = null;

                for (let j = 1; j < tokens.length; j++) {
                    let userIdStr = tokens[j];


                    let userId = parseInt(userIdStr);
                    if (userId > 0 && userIdStr.length < 5) {

                        if (userId == 50) {
                            userId = 40;
                        }
                        if (userId == 11) {
                            userId = 66;
                        }

                        let u = svr.getUser(userId);
                        if (u.isInspector()) {
                            matchedUser = u;
                            break;
                        }
                    } else {
                        continue;
                    }
                }

                if (!matchedUser) {
                    res.failed.push(line);
                    continue;
                }

                if (o._owners.length > 0 && (o._owners.indexOf(matchedUser) >= 0)) {
                    res.duplicates.push(o);
                    continue;
                }

                // has match
                res.parsed.push([o, matchedUser]);
            }

            console.info('failed: ' + res.failed.length + ', dups: ' + res.duplicates.length + ', parsed: ' + res.parsed.length);

            return res;
        }


        static parseOutlets(svr: DbService, txt: string, isUseComma?: boolean): ParseResult {
            let res = new ParseResult();

            // let templates: Template[] = [];

            if (txt === null || txt === undefined) {
                let msg = 'no data to import';
                console.warn(msg);
                txt = '';
                alert('msg');
                return;
            }

            let lines = txt.split('\n');
            let warnings = [];

            let sp = '\t';
            if (isUseComma) {
                sp = ','
            }

            let isCreateOutletMode: boolean = true;

            console.info('parse using sp: "' + sp + '"');


            for (let i = 0, len = lines.length; i < len; i++) {
                let line = lines[i];

                let tokens = line.split(sp);

                // let i =0 ;
                // 編號	商戶	地址

                let outletCode = (tokens[0] || '').trim();
                let name = (tokens[1] || '').trim();
                let address = (tokens[2] || '').trim();
                let contact = (tokens[3] || '').trim();
                let tel = (tokens[4] || '').trim();


                if (!Outlet.isOutletCode(outletCode)) {

                    console.info('skipping non outlet code: ' + outletCode);
                    continue;
                }


                let old = ImportUtil.parseOutlet(svr, outletCode);

                let outlet;

                if (isCreateOutletMode) {
                    if (old) {
                        console.info(' skipping outlet: ' + outletCode);
                        res.duplicates.push(old);
                    } else {
                        // old doesn't existing, creating new;

                        outlet = new Outlet();
                        outlet.OutletCode = outletCode;
                        outlet.Name = name;
                    }
                } else {

                    if (!old) {
                        // update existing only
                        console.info(' skipping outlet: ' + outlet);
                        res.failed.push(outlet);
                    } else {
                        outlet = old;
                    }
                }

                if (outlet) {
                    outlet.Address = address;
                    outlet.Contact = contact;
                    outlet.Tel = tel;
                    outlet._dirty = true;
                    res.parsed.push(outlet);
                }
            }

            console.info(' parsed outlets: ' + res.parsed.length + ', failed: ' + res.failed.length + ', duplicates: ' + res.duplicates.length);
            return res;
        }
    }


    export class RefPriceMgr {

        public refPrices: Cache<Approve> = new Cache<Approve>();
        public num_curr_approve: number = -1;
        public num_last_price: number = -1;
        public num_no_match: number = 0;
        public num_match: number = 0;
        public num_need_update: number = 0;
        public need_updates = [];
        private svr: DbService = null;

        constructor(svr: DbService) {
            this.svr = svr;
        }

        clearAll() {
            this.refPrices.clearAll();
            this.need_updates = [];
            this.num_curr_approve = -1;
            this.num_last_price = 0;
            this.num_no_match = 0;
            this.num_match = 0;
            this.num_need_update = 0;
        }

        public init() {
            if (this.num_last_price < 0) {
                this.refresh();
            }
        }

        refresh() {

            this.clearAll();

            let svr = this.svr;
            let config = svr.config;

            svr.api.httpGetLastPrices(config.getConfigYear(), config.getConfigMonth()).then(res => {

                this.refPrices.init('ref-prices', Approve.fromJson, res.data.lastPrices);


                let allLastPrice = this.refPrices.getAll();

                let allCurrPrice = svr.getAllApproves();

                this.num_last_price = allLastPrice.length;
                this.num_curr_approve = allCurrPrice.length;

                for (const approve of allCurrPrice) {

                    let ref = this.refPrices.getByKey(approve.getKey());

                    if (ref) {

                        if (approve.RefYear != ref.Year || approve.RefMonth != ref.Month) {
                            // this.num_need_update++;
                            let r = [approve, ref];
                            this.need_updates.push(r);
                        } else {
                            this.num_match++;
                            if (this.num_match == 1) {
                                console.info('match: ' + approve);
                            }
                        }
                    } else {
                        this.num_no_match++;
                    }
                }

                this.num_need_update = this.need_updates.length;

                console.info('RefPrice: num_last: ' + this.num_last_price + ', num_ap: ' + this.num_curr_approve +
                    ', num_update: ' + this.num_need_update + ', no_match: ' + this.num_no_match + ', match: ' + this.num_match);


                if (this.num_need_update > 10) {
                    this.need_updates = this.need_updates.slice(0, 10);
                }

                this.svr.refreshView();
            });
        }


    }

    export class Group {

        outletCode: string = null;


        idMap: {} = null;

        getData(name: string): string[] {

            if (this.idMap == null) {
                this.idMap = {};

                let data = GROUP_DATA;

                let codes = [];
                for (const str of data) {
                    if (Helper.isBlank(str)) {
                        continue;
                    }

                    let split = str.split(':');
                    let id = split[0];
                    let code = split[1];

                    if (!this.idMap[id]) {
                        this.idMap[id] = [];
                    }
                    this.idMap[id].push(code);
                }

                let keys = Object.keys(this.idMap);
                for (const key of keys) {
                    console.info(' group ' + key + ' # ' + this.idMap[key].length);
                }
            }

            return this.idMap[name];
        }

        getIds(): string [] {
            this.getData(null);
            return Object.keys(this.idMap);
        }

    }

    export class GroupMgr {

        group_0612004 = null;


        get(outletCode: string): Group {
            if (outletCode == '0612004') {
                if (!this.group_0612004) {
                    this.group_0612004 = new Group();

                }
                return this.group_0612004;
            } else {
                return null;
            }
        }
    }

    export class Tmp extends Base {

        public static mkModel(): ModelGen {
            let str = 'Rating| RefYear:int; Code:str;  Nickname:str; Remark:str;  Appearance:int; PresentationSkill:int; SelfIntroduction:int; DrawQuestion:int;' +
                ' RolePlay:int; TeacherOpinion:int; Rejected:int; Att1:int; Att2:int; Att3:int; Att4:int; Att5:int; Att6:int; jasPhoto:int; hasId:int; hasCert:int; student_idNumber:str;';

            let str2 = 'Student| Ficha_No : str; Name:str; Name_P:str; Gender:str; Tel_Home :str; Edu_School :str ; Edu_Major : str; ApplyPostInFo:str ; LanguageInfo:str; ' +
                'FichaExperience:str; DsecExperience :str;Training_Class :str';


            let str3 = 'Option| Name:str; StockTicker:str; DateBought:str; DateExp: str;  Premium:int; NumContract:int; NumShareExposed; P_C:str; ';

            return ModelGen.from(str2);
        }

        getKey(): string {
            return null;
        }
    }

    export class Option extends Base {

        static str = 'Option| Name:str; StockTicker:str; DateBought:str; DateExp: str;  Premium:int; NumContract:int; NumShareExposed; P_C:str; ';


        // js --
        public Id: number = -1;
        public Status: number = 0;
        public Remark: string = '';
        public UpdateBy: number = 0;
        public UpdateAt: Date;
        public Name: string = '';
        public StockTicker: string = '';
        public DateBought: string = '';
        public DateExp: string = '';
        public Premium: number = 0;
        public NumContract: number = 0;
        public NumShareExposed: number = 0;
        public P_C: string = '';
        public _dirty: boolean = true;

        static fromJson(json): Option {
            let e = new Option();
            e._dirty = false;
            e.Id = json.Id;
            e.Status = json.Status;
            e.Remark = json.Remark;
            e.UpdateBy = json.UpdateBy;
            e.UpdateAt = json.UpdateAt;
            e.Name = json.Name;
            e.StockTicker = json.StockTicker;
            e.DateBought = json.DateBought;
            e.DateExp = json.DateExp;
            e.Premium = json.Premium;
            e.NumContract = json.NumContract;
            e.NumShareExposed = json.NumShareExposed;
            e.P_C = json.P_C;
            return e;
        }

        static parseRaw(svr: DbService, txt: string): ParseResult {

            let res = new ParseResult();

            let options: Option[] = [];

            if (txt === null || txt === undefined) {
                let msg = 'no data to import';
                console.warn(msg);
                txt = '';
                alert(msg);
                return;
            }

            let lines = txt.split('\n');
            let warnings = [];

            for (let i = 0, len = lines.length; i < len; i++) {

                let line = lines[i];

                if (Helper.isBlank(line)) {
                    continue;
                }


                let obj = Option.fromCSV(line);
                if (obj) {
                    res.parsed.push(obj);
                }

            }

            return res;
        }

        // 代碼	名稱	方向	訂單價格	訂單數量	交易狀態	已成交@均價	落盤時間	訂單類型	期限	盤前競價	觸發價	沽空	成交數量	成交價格	成交金額	對手經紀	落盤時間	備註
        static fromCSV(line): Option {

            let res: Option = null;

            let txts = line.split('\t');

            // 代碼
            let sym = txts[0];  // ALB201127C240000.HK
            let name = txts[1]; // 阿里 201127 240.00 購

            // 方向
            let direction = txts[2];


            // 已成交@均價
            let executed = txts[6];

            // 落盤時間
            let datetime = txts[7];

            // 成交數量
            let numExecuted = txts[13];
            let priceExecuted = txts[14];
            let amtExecuted = txts[15];


            // check if it's option and got executed
            let num = parseInt(numExecuted);
            let isOption = numExecuted.indexOf('張') >= 0;

            if (num && isOption) {

                res = new Option();
                res.Name = name.substr(0, 4) + name.substr(name.lastIndexOf(' '));
                res.DateBought = datetime;

                // ALB201127C240000.HK
                res.DateExp = '20' + sym.substr(3, 6);

                res.NumContract = num;

                // ALB201127C240000.HK
                res.P_C = sym.substr(8, 1);
                if (!(res.P_C == 'P' || res.P_C == 'C')) {
                    console.warn(' P_C ' + res.P_C);
                }

                res.Premium = parseInt(priceExecuted);
                res.NumShareExposed = parseInt(amtExecuted) / res.Premium / Math.abs(res.NumContract);

                if (direction == '沽空') {
                    res.NumContract = -res.NumContract;
                } else {
                    console.warn(' option not shorted, maybe mis-parse: direction : ' + direction)
                }

                // ALB201127P215000.HK
            } else {
                if (sym.length > 16) {
                    console.warn(' maybe mis-parse!  line: ' + line);
                }

            }


            return res;

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


        public init(name: string, maker, jsons) {

            // let res = new Cache<T>();
            this.clearAll();
            jsons = jsons || [];

            for (let i = 0; i < jsons.length; i++) {
                let json = jsons[i];

                //let e: T =   T.fromJson2(json);
                let e: T = maker(json);
                this.add(e);
            }
            console.info(' ' + name + ' :' + this._all.length);
        }
    }

    export class ApproveStatusesHolder {
        statuses: OutletApproveStatus[];
        numTotal: number;
        numDone: number;
        numPendingTask: number;
        numPendingApprove: number;
        numFieldCheck: number;
        numMissingInApprove: number;
        numCheck1Missing: number;
        numCheck2Missing: number;
        numTaskletMissing: number;

    }

    //
    // export class RefPrice extends Base {
    //     public RefYear: number;
    //     public RefMonth: number;
    //
    //     public OutletCode: string;
    //     public ItemCode: string;
    //     public LastPrice: number;
    //     public LastQty: number;
    //     public LastUnit: string;
    //
    //     public static sp: string = '-';
    //
    //     public static mkModel(): ModelGen {
    //         let str = 'RefPrice| RefYear:int; RefMonth:int; OutletCode:str;  ItemCode:str;   LastPrice:int; LastQty:int; LastUnit:str ;';
    //         return ModelGen.from(str);
    //     }
    //
    //     public static fromJson(json): RefPrice {
    //         let res = new RefPrice();
    //         res.RefYear = json.Year;
    //         res.RefMonth = json.Month;
    //         res.OutletCode = json.OutletCode;
    //         res.ItemCode = json.ItemCode;
    //         res.LastPrice = json.ApprovePrice;
    //         res.LastQty = json.ApproveQty;
    //         res.LastUnit = json.ApproveQty;
    //
    //         return res;
    //     }
    //
    //
    //     getKey(): string {
    //         let sp = RefPrice.sp;
    //         return this.RefYear + sp + this.RefMonth + sp + this.OutletCode + this.ItemCode;
    //     }
    //
    // }
    //
    export class RefPriceX extends Base {

        public OutletCode: string;
        public ItemCode: string;

        public Year: number;
        public Month: number;

        public Qty: number;
        public Unit: string;
        public Price: number;
        public CollectMethod: string;

        public RefYear: number;
        public RefMonth: number;
        public RefQty: number;
        public RefUnit: string;
        public RefPrice: number;
        public RefCollectMethod: string;

        static fromJson(json: any): RefPriceX {
            let e = new RefPriceX();
            e.OutletCode = json.OutletCode;
            e.ItemCode = json.ItemCode;

            e.Year = json.Year;
            e.Month = json.Month;

            e.Qty = json.Qty;
            e.Unit = json.Unit;
            e.Price = json.Price;
            e.CollectMethod = json.CollectMethod;

            e.RefYear = json.RefYear;
            e.RefMonth = json.RefMonth;

            e.RefQty = json.RefQty;
            e.RefUnit = json.RefUnit;
            e.RefPrice = json.RefPrice;
            e.RefCollectMethod = json.RefCollectMethod;

            return e;
        }

        getKey(): string {
            return this.OutletCode + '_' + this.ItemCode;
        }

        getQtyUnit(un: UnitTypeMgr): string {
            return ' /(' + this.Qty + ' ' + un.get(this.Unit).Name + ')';
        }

        getRefQtyUnit(un: UnitTypeMgr): string {
            return ' /(' + this.RefQty + ' ' + un.get(this.RefUnit).Name + ')';
        }

        getQty(): string {
            let res = this.Qty ? this.Qty : '--';

            if ((this.RefQty != this.Qty) && (this.RefQty && this.Qty)) {
                res += ' (上次: ' + this.RefQty + ')'
            }

            return res + '';
        }

        getUnit(un: UnitTypeMgr): string {

            let res = un.getUnitName(this.Unit);

            if ((this.RefUnit != this.Unit) && (this.RefUnit && this.Unit)) {
                res += ' (上次: ' + un.getUnitName(this.RefUnit) + ')'
            }

            return res;
        }

        getPriceChange(un: UnitTypeMgr): string {

            let res = '--';


            if (this.RefPrice && this.Price && (this.CollectMethod != 'I') && (this.CollectMethod != 'F')) {

                if (un.isCompatible(this.Unit, this.RefUnit)) {

                    let newMultiple = un.getUnitMultiple(this.Unit);
                    let oldMultiple = un.getUnitMultiple(this.RefUnit);


                    // (this.ApprovePrice / this.ApproveQty - this.LastPrice / this.LastQty) / (this.LastPrice / this.LastQty)

                    // same unit, good

                    let newp = (this.Price) / (this.Qty * newMultiple);
                    let oldp = (this.RefPrice) / (this.RefQty * oldMultiple);

                    res = ((newp - oldp) / oldp * 100).toFixed(2);
                } else {
                    res = ' 舊單位: ' + un.getUnitName(this.RefUnit);   // ' 變動 -- '
                }

            }

            return res;

        }

    }

    export class RefPriceFallback extends Base {

        public OutletCode: string;
        public ItemCode: string;

        public Qty: number;
        public Unit: string;
        public Price: number;

        static fromJson(json: any): RefPriceFallback {
            let e = new RefPriceFallback();
            e.OutletCode = json.OutletCode;
            e.ItemCode = json.ItemCode;


            e.Qty = json.Qty;
            e.Unit = json.Unit;
            e.Price = json.Price;

            return e;
        }

        getKey(): string {
            return this.OutletCode + '_' + this.ItemCode;
        }
    }
}
