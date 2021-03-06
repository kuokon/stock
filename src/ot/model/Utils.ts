
module MyApp {

    export interface NV {
        name: string,
        value: string,
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



    export class Infolet extends Base {

        static TYPE_NA = 0;
        static TYPE_TIME = 1;
        static TYPE_VR = 2;
        static TYPE_GPS = 3;

        static TYPE_TASK_STATS = 5;


        public Type: number = 0;
        public Status: number = 0;


        public Remark: string;
        public Data: string;

        public LinkId: number;

        public UpdateBy: number;
        //public UpdateAt: Date = new Date();
        //public UpdateAt  = moment();
        public UpdateAt = Helper.getLocalTime();


        // linkId => taskId
        public static makeTaskCount(linkId: number, by: number = 0, numTotal:number, numDone:number ): Infolet {

            let r = new Infolet();
            r.Type = Infolet.TYPE_TASK_STATS;
            r.LinkId = linkId;
            r.UpdateBy = by;

            let data = { NumTotal : numTotal, NumDone : numDone};
            r.Data = JSON.stringify(data);

            return r;
        }

        public static makeTime(linkId: number, by: number = 0): Infolet {

            let r = new Infolet();
            r.Type = Infolet.TYPE_TIME;
            r.LinkId = linkId;
            r.UpdateBy = by;

            return r;
        }

        public static makeVR(linkId: number, by: number = 0): Infolet {

            let r = new Infolet();
            r.Type = Infolet.TYPE_VR;

            r.LinkId = linkId;

            return r;
        }

        static fromJson(json): Infolet {

            let res = new Infolet();

            res.Id = json.Id;
            res.LinkId = json.LinkId;
            res.Type = json.Type;
            res.Remark = json.Remark;
            res.Data = json.Data;
            res.Status = json.Status;
            res.UpdateAt = json.UpdateAt;
            res.UpdateBy = json.UpdateBy;

            return res;
        }

        toJson(): string {
            return JSON.stringify(this, Helper.json_replacer);
        }

        public makeTmpDbKey(): string {
            return MyApp.Config.APP_ID + '-infolet-' + this.Id
        }

    }

    export class InfoletMgr {

        public static TAG: string = 'InfoletMgr';
        public TAG = InfoletMgr.TAG;
        private _svr: DbService = null;
        private storage = window.localStorage;
        private _infolet_all: Infolet[] = null;

        private _maxId = 100;

        constructor(svr: DbService) {
            this._svr = svr;
        }

        public listUpdated(): void {
            this._infolet_all = null;
        }

        public clearAll(): void {
            this._infolet_all = null;
        }

        public clearById(id: number) {
            let key = this.makeKeyById(id);

            console.info(this.TAG + ' clearing id key: ' + key);
            this.storage.removeItem(key);

            this.listUpdated();
        }


        public hasPending(): boolean {
            return this.getAll().length > 0;
        }

        makePrefix(): string {
            return MyApp.Config.APP_ID + '-infolet-';
        }

        public getAll(): Infolet[] {

            if (this._infolet_all == null) {


                let prefix = this.makePrefix();

                let keys = Object.keys(this.storage);
                let res: Infolet[] = [];
                let skipped = [];

                for (const key of keys) {
                    if (key.startsWith(prefix)) {
                        let task = this.getByKey(key);
                        if (task) {

                            res.push(task);
                            this._maxId = Math.max(task.Id, this._maxId);

                        }
                    } else {
                        // console.info(this.TAG + ' skipped key: ' + key);
                        skipped.push(key);

                    }
                }

                this._infolet_all = res;
                console.info(this.TAG + ' skipped keys: ' + JSON.stringify(skipped));
                console.info(this.TAG + ' found  infolets: ' + this._infolet_all.length + ', maxId: ' + this._maxId);
            }

            return this._infolet_all;

        }

        public add(item: Infolet) {

            if (item.Id > 0) {
                let msg = 'infolet already in store? id: ' + item.Id;
                console.warn(msg);
                // this._svr.doLogServerMsg(msg);
            }

            item.Id = this._maxId++;

            let key = this.makeKey(item);
            this.storage.setItem(key, item.toJson());
            this.listUpdated();

            console.info(this.TAG + ' saved : ' + item.Id);
        }

        public getByKey(key: string): Infolet {
            let jsonStr = this.storage.getItem(key);

            let res: Infolet = null;
            if (jsonStr) {
                let json = JSON.parse(jsonStr);
                res = Infolet.fromJson( json);


                console.info(this.TAG + ' load id: ' + res.Id);

            } else {
                let msg = this.TAG + ' infolet not found on local-storage for key' + key;
                console.info(msg);

                // this._svr.doLogServerMsg(msg);
            }

            return res;

        }

        public getById(id: number): Infolet {

            let tag = this.makeKeyById(id);
            return this.getByKey(tag);
        }

        public makeKeyById(infoletId: number): string {

            return this.makePrefix() + infoletId
        }

        public makeKey(t: Infolet): string {
            return this.makeKeyById(t.Id)
        }

        private removeAll(): void {

            let items = this.getAll();
            for (const e of items) {
                this.clearById(e.Id);
            }

            this.listUpdated();
        }

    }


    export class Util {


        public static isEmpty(obj): boolean {
            return obj === undefined || obj === null;
        }

        public static isBlank(obj): boolean {
            return obj === undefined || obj === null || obj.trim() === '';
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
    }


    export class Attr {
        name: string;
        type: number;
        type_num: number;
        typeName : string;


        isNum() : boolean {
            return this.type == ModelGen.TYPE_NUM;
        }

        isStr() : boolean {
            return this.type == ModelGen.TYPE_STR;
        }


        public static make(name: string, type: number, num: number, typeName:string): Attr {
            let r = new Attr();
            r.name = name.trim();
            r.type = type;
            r.type_num = num > 0 ? num : 30;
            r.typeName = typeName;
            return r;
        }


        static sql_2_cSharp_type_map = {
            float : 'double'
            , int : 'int'
            , decimal : 'decimal'
            , bigint : 'int64'
            , bit : 'boolean'
            , smallint : 'Int16'
            , tinyint: 'byte'
        };



        toSql(): string {

            let str = '';

            switch (this.type) {
                case ModelGen.TYPE_NUM: {

                    str = 'INT default 0';
                    if (this.name == 'Id') {
                        str = 'INT NOT NULL IDENTITY'
                    }
                    break;
                }
                case ModelGen.TYPE_STR: {
                    str = 'varchar(' + this.type_num + ')';
                    break;
                }
                case ModelGen.TYPE_DATE : {
                    str = 'DATETIME DEFAULT getdate()';
                    break;
                }
                default:
                    str = ' ?? type: ' + this.type

            }

            return ', ' + this.name + ' ' + str;
        }

        toJS(): string {

            let str = '';
            switch (this.type) {
                case ModelGen.TYPE_NUM: {
                    str = 'number = 0';
                    if (this.name == 'Id') {
                        str = 'number = -1';
                    }
                    break;
                }
                case ModelGen.TYPE_STR: {
                    str = "string = ''";
                    break;
                }
                case ModelGen.TYPE_DATE : {
                    str = 'Date';
                    break;
                }
                default:
                    str = ' ?? type: ' + this.type

            }

            return 'public ' + this.name + ': ' + str + ';';
        }

        toCSharp(): string {

            let typeName:string = Attr.sql_2_cSharp_type_map[this.typeName] || this.typeName;


            let str = '';
            switch (this.type) {
                case ModelGen.TYPE_NUM: {

                    let isInt = (typeName.toUpperCase() == 'INT');
                    str =  typeName +  (isInt ? '' : '? ');

                    break;
                }
                case ModelGen.TYPE_STR: {
                    str = ' string ';
                    break;
                }
                case ModelGen.TYPE_DATE : {
                    str = ' DateTime ';
                    break;
                }
                default:
                    str = ' ?? type: ' + this.type

            }

            return 'public ' + str + ' ' + this.name + ' { get; set; }';
        }

    }

    export class ModelGen {

        public static TYPE_NUM = 1;
        public static TYPE_STR = 2;
        public static TYPE_DATE = 3;



        public clazz = 'MyModel';

        attrs: Attr[] = [];

        constructor() {
            this.add('Id', 'int', -1);

            this.add('Status', 'int');
            this.add('Remark', 'str', 50);
            this.add('UpdateBy', 'int');
            this.add('UpdateAt', 'date');
        }

        public add(name: string, type: string, strLen?: number) {

            let t = ModelGen.TYPE_NUM;
            type = type || 'int';

            if (type.indexOf('date') >= 0) {
                t = ModelGen.TYPE_DATE
            } else if (type.indexOf('str') >= 0) {
                t = ModelGen.TYPE_STR;
            }

            let firstChar = name[0];
            let upper = firstChar.toUpperCase() + name.substr(1);

            if (upper != name) {
                console.warn(' Model use upper-case for 1st char name: ' + name);
            }

            this.attrs.push(Attr.make(upper, t, strLen, type));
        }


        toAll(): string {
            let sp = '\n';
            return ""

                + sp + sp + this.toCSharp()
                + sp + sp + this.toSQL()
                + sp + sp + this.toJS()
        }


        toSQL(): string {

            let res = [];

            res.push('-- SQL --');

            // res.push('Id INT NOT NULL IDENTITY');
            for (const attr of this.attrs) {
                res.push(attr.toSql())
            }

            // res.push(', UpdateBy INT default 0');
            // res.push(', UpdateAt DATETIME DEFAULT getdate()');


            return res.join('\n');

        }

        toCSharp(): string {
            let res = [];


            res.push('  // CSharp --');
            res.push(' [Table("' + this.clazz + ' ", Schema = "dbo")]');
            res.push(' public class ' + this.clazz);
            res.push(' { ');

            for (const attr of this.attrs) {
                res.push(attr.toCSharp())
            }
            res.push('} \n } \n\n');


            res.push(' // CSharp clone ');
            for (const attr of this.attrs) {

                if (attr.name == 'Id') {
                    continue;
                } else if (attr.name == 'UpdateBy') {
                    res.push('    orig.' + attr.name + ' = byUserId;');
                } else if (attr.name == 'UpdateAt') {
                    res.push('    orig.' + attr.name + ' = DateTime.Now ;');
                } else {
                    res.push('    orig.' + attr.name + ' = update.' + attr.name + ';');
                }

            }

            return res.join('\n');
        }

        toJS(): string {
            let res = [];


            res.push('// js --');

            for (const attr of this.attrs) {
                res.push(attr.toJS())
            }

            res.push(' public _dirty:boolean = true;');

            res.push('');

            res.push('static fromJson(json) :  ' + this.clazz + ' {');
            res.push('static fromJson(svr:DbService, json) :  ' + this.clazz + ' {');
            res.push('    let e = new ' + this.clazz + '() ; ');
            res.push('    e._dirty = false ;');
            for (const attr of this.attrs) {

                if(attr.isStr()) {
                    res.push('    e.' + attr.name + ' = (json.' + attr.name + ' || \'\').trim() ; ');
                } else {
                    res.push('    e.' + attr.name + ' = json.' + attr.name + ' ||  0 ; ');
                }
            }

            res.push('       return e;  } ');


            return res.join('\n');
        }

        static from(str: string): ModelGen {


            let res = new ModelGen();

            let name = '';
            let idx = str.indexOf('|');
            let className = 'NA';

            if (idx > 0) {
                className = str.substr(0, idx).trim();
                str = str.substr(idx + 1);
            }

            let fields = str.split(';');
            let fieldLine = null;
            try {
                for (fieldLine of fields) {

                    if (Helper.isBlank(fieldLine)) {
                        continue;
                    }
                    let f = fieldLine.split(':');
                    res.add(f[0], f[1]);
                }
            } catch (e) {
                console.error(e);
                console.info(' fields: "' + fieldLine + '", str: ' + str);
                return;
            }

            res.clazz = className;

            return res;
        }
    }



}