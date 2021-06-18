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
    var ParseResult = /** @class */ (function () {
        function ParseResult() {
            this.skipped = [];
            this.failed = [];
            this.duplicates = [];
            this.msg = null;
            this.parsed = [];
        }
        ParseResult.prototype.clear = function () {
            this.parsed = [];
            this.failed = [];
            this.skipped = [];
        };
        ParseResult.prototype.copyDups = function () {
            this.parsed.push.apply(this.parsed, this.duplicates);
        };
        return ParseResult;
    }());
    MyApp.ParseResult = ParseResult;
    var ImportUtil = /** @class */ (function () {
        function ImportUtil() {
        }
        ImportUtil.onParseTemplate = function (svr, txt) {
            return MyApp.Option.parseRaw(svr, txt);
        };
        return ImportUtil;
    }());
    MyApp.ImportUtil = ImportUtil;
    //
    // export class Log extends Base {
    //
    //     Log: string;
    //
    //     UpdateBy: number;
    //     UpdateAt : Date = Helper.getLocalTime();
    //
    //
    //     static fromJson( json): Log {
    //
    //         let res = new Log();
    //
    //         res.Id = json.Id;
    //         res.Name = json.log;
    //         res.Log = json.log;
    //         res.UpdateAt = new Date(json.UpdateAt);
    //         res.UpdateBy = json.UpdateBy;
    //
    //         return res;
    //     }
    //
    //     match(filter:string) : boolean {
    //         let str =  this.UpdateBy + this.Log;
    //
    //         return str.indexOf(filter) >=0;
    //     }
    // }
    var Infolet = /** @class */ (function (_super) {
        __extends(Infolet, _super);
        function Infolet() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.Type = 0;
            _this.Status = 0;
            //public UpdateAt: Date = new Date();
            //public UpdateAt  = moment();
            _this.UpdateAt = MyApp.Helper.getLocalTime();
            return _this;
        }
        // linkId => taskId
        Infolet.makeTaskCount = function (linkId, by, numTotal, numDone) {
            if (by === void 0) { by = 0; }
            var r = new Infolet();
            r.Type = Infolet.TYPE_TASK_STATS;
            r.LinkId = linkId;
            r.UpdateBy = by;
            var data = { NumTotal: numTotal, NumDone: numDone };
            r.Data = JSON.stringify(data);
            return r;
        };
        Infolet.makeTime = function (linkId, by) {
            if (by === void 0) { by = 0; }
            var r = new Infolet();
            r.Type = Infolet.TYPE_TIME;
            r.LinkId = linkId;
            r.UpdateBy = by;
            return r;
        };
        Infolet.makeVR = function (linkId, by) {
            if (by === void 0) { by = 0; }
            var r = new Infolet();
            r.Type = Infolet.TYPE_VR;
            r.LinkId = linkId;
            return r;
        };
        Infolet.fromJson = function (json) {
            var res = new Infolet();
            res.Id = json.Id;
            res.LinkId = json.LinkId;
            res.Type = json.Type;
            res.Remark = json.Remark;
            res.Data = json.Data;
            res.Status = json.Status;
            res.UpdateAt = json.UpdateAt;
            res.UpdateBy = json.UpdateBy;
            return res;
        };
        Infolet.prototype.toJson = function () {
            return JSON.stringify(this, MyApp.Helper.json_replacer);
        };
        Infolet.prototype.makeTmpDbKey = function () {
            return MyApp.Config.APP_ID + '-infolet-' + this.Id;
        };
        Infolet.TYPE_NA = 0;
        Infolet.TYPE_TIME = 1;
        Infolet.TYPE_VR = 2;
        Infolet.TYPE_GPS = 3;
        Infolet.TYPE_TASK_STATS = 5;
        return Infolet;
    }(MyApp.Base));
    MyApp.Infolet = Infolet;
    var InfoletMgr = /** @class */ (function () {
        function InfoletMgr(svr) {
            this.TAG = InfoletMgr.TAG;
            this._svr = null;
            this.storage = window.localStorage;
            this._infolet_all = null;
            this._maxId = 100;
            this._svr = svr;
        }
        InfoletMgr.prototype.listUpdated = function () {
            this._infolet_all = null;
        };
        InfoletMgr.prototype.clearAll = function () {
            this._infolet_all = null;
        };
        InfoletMgr.prototype.clearById = function (id) {
            var key = this.makeKeyById(id);
            console.info(this.TAG + ' clearing id key: ' + key);
            this.storage.removeItem(key);
            this.listUpdated();
        };
        InfoletMgr.prototype.hasPending = function () {
            return this.getAll().length > 0;
        };
        InfoletMgr.prototype.makePrefix = function () {
            return MyApp.Config.APP_ID + '-infolet-';
        };
        InfoletMgr.prototype.getAll = function () {
            if (this._infolet_all == null) {
                var prefix = this.makePrefix();
                var keys = Object.keys(this.storage);
                var res = [];
                var skipped = [];
                for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                    var key = keys_1[_i];
                    if (key.startsWith(prefix)) {
                        var task = this.getByKey(key);
                        if (task) {
                            res.push(task);
                            this._maxId = Math.max(task.Id, this._maxId);
                        }
                    }
                    else {
                        // console.info(this.TAG + ' skipped key: ' + key);
                        skipped.push(key);
                    }
                }
                this._infolet_all = res;
                console.info(this.TAG + ' skipped keys: ' + JSON.stringify(skipped));
                console.info(this.TAG + ' found  infolets: ' + this._infolet_all.length + ', maxId: ' + this._maxId);
            }
            return this._infolet_all;
        };
        InfoletMgr.prototype.add = function (item) {
            if (item.Id > 0) {
                var msg = 'infolet already in store? id: ' + item.Id;
                console.warn(msg);
                // this._svr.doLogServerMsg(msg);
            }
            item.Id = this._maxId++;
            var key = this.makeKey(item);
            this.storage.setItem(key, item.toJson());
            this.listUpdated();
            console.info(this.TAG + ' saved : ' + item.Id);
        };
        InfoletMgr.prototype.getByKey = function (key) {
            var jsonStr = this.storage.getItem(key);
            var res = null;
            if (jsonStr) {
                var json = JSON.parse(jsonStr);
                res = Infolet.fromJson(json);
                console.info(this.TAG + ' load id: ' + res.Id);
            }
            else {
                var msg = this.TAG + ' infolet not found on local-storage for key' + key;
                console.info(msg);
                // this._svr.doLogServerMsg(msg);
            }
            return res;
        };
        InfoletMgr.prototype.getById = function (id) {
            var tag = this.makeKeyById(id);
            return this.getByKey(tag);
        };
        InfoletMgr.prototype.makeKeyById = function (infoletId) {
            return this.makePrefix() + infoletId;
        };
        InfoletMgr.prototype.makeKey = function (t) {
            return this.makeKeyById(t.Id);
        };
        InfoletMgr.prototype.removeAll = function () {
            var items = this.getAll();
            for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
                var e = items_1[_i];
                this.clearById(e.Id);
            }
            this.listUpdated();
        };
        InfoletMgr.TAG = 'InfoletMgr';
        return InfoletMgr;
    }());
    MyApp.InfoletMgr = InfoletMgr;
    var Util = /** @class */ (function () {
        function Util() {
        }
        Util.isEmpty = function (obj) {
            return obj === undefined || obj === null;
        };
        Util.isBlank = function (obj) {
            return obj === undefined || obj === null || obj.trim() === '';
        };
        Util.clearAll = function (obj) {
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
        Util.dateTime2date = function (datetime) {
            if (this.isBlank(datetime)) {
                return datetime;
            }
            return datetime.substr(0, 10);
        };
        // compare date1, date2,   return -1, 0, 1  as  date1 - date 2
        Util.compareDate = function (date1, date2) {
            if (MyApp.Helper.isBlank(date1)) {
                return -1;
            }
            if (MyApp.Helper.isBlank(date2)) {
                return 1;
            }
            // date format '2018-01-01
            var d1 = this.dateTime2date(date1).replace('-', '').replace('-', '');
            var d2 = this.dateTime2date(date2).replace('-', '').replace('-', '');
            return parseInt(d1) - parseInt(d2);
        };
        return Util;
    }());
    MyApp.Util = Util;
    var Attr = /** @class */ (function () {
        function Attr() {
        }
        Attr.make = function (name, type, num) {
            var r = new Attr();
            r.name = name.trim();
            r.type = type;
            r.type_num = num > 0 ? num : 30;
            return r;
        };
        Attr.prototype.toSql = function () {
            var str = '';
            switch (this.type) {
                case ModelGen.TYPE_NUM: {
                    str = 'INT default 0';
                    if (this.name == 'Id') {
                        str = 'INT NOT NULL IDENTITY';
                    }
                    break;
                }
                case ModelGen.TYPE_STR: {
                    str = 'varchar(' + this.type_num + ')';
                    break;
                }
                case ModelGen.TYPE_DATE: {
                    str = 'DATETIME DEFAULT getdate()';
                    break;
                }
                default:
                    str = ' ?? type: ' + this.type;
            }
            return ', ' + this.name + ' ' + str;
        };
        Attr.prototype.toJS = function () {
            var str = '';
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
                case ModelGen.TYPE_DATE: {
                    str = 'Date';
                    break;
                }
                default:
                    str = ' ?? type: ' + this.type;
            }
            return 'public ' + this.name + ': ' + str + ';';
        };
        Attr.prototype.toCSharp = function () {
            var str = '';
            switch (this.type) {
                case ModelGen.TYPE_NUM: {
                    str = ' int ';
                    break;
                }
                case ModelGen.TYPE_STR: {
                    str = ' string ';
                    break;
                }
                case ModelGen.TYPE_DATE: {
                    str = ' DateTime ';
                    break;
                }
                default:
                    str = ' ?? type: ' + this.type;
            }
            return 'public ' + str + ' ' + this.name + ' { get; set; }';
        };
        return Attr;
    }());
    MyApp.Attr = Attr;
    var ModelGen = /** @class */ (function () {
        function ModelGen() {
            this.clazz = 'MyModel';
            this.attrs = [];
            this.add('Id', 'num', -1);
            this.add('Status', 'num');
            this.add('Remark', 'str', 50);
            this.add('UpdateBy', 'num');
            this.add('UpdateAt', 'date');
        }
        ModelGen.prototype.add = function (name, type, strLen) {
            var t = ModelGen.TYPE_NUM;
            type = type || 'int';
            if (type.indexOf('date') >= 0) {
                t = ModelGen.TYPE_DATE;
            }
            else if (type.indexOf('str') >= 0) {
                t = ModelGen.TYPE_STR;
            }
            var firstChar = name[0];
            var upper = firstChar.toUpperCase() + name.substr(1);
            if (upper != name) {
                console.warn(' Model use upper-case for 1st char name: ' + name);
            }
            this.attrs.push(Attr.make(upper, t, strLen));
        };
        ModelGen.prototype.toAll = function () {
            var sp = '\n';
            return ""
                + sp + sp + this.toCSharp()
                + sp + sp + this.toSQL()
                + sp + sp + this.toJS();
        };
        ModelGen.prototype.toSQL = function () {
            var res = [];
            res.push('-- SQL --');
            // res.push('Id INT NOT NULL IDENTITY');
            for (var _i = 0, _a = this.attrs; _i < _a.length; _i++) {
                var attr = _a[_i];
                res.push(attr.toSql());
            }
            // res.push(', UpdateBy INT default 0');
            // res.push(', UpdateAt DATETIME DEFAULT getdate()');
            return res.join('\n');
        };
        ModelGen.prototype.toCSharp = function () {
            var res = [];
            res.push('// CSharp --');
            res.push(' [Table("' + this.clazz + ' ", Schema = "ot")]');
            res.push(' public class ' + this.clazz);
            res.push(' { ');
            for (var _i = 0, _a = this.attrs; _i < _a.length; _i++) {
                var attr = _a[_i];
                res.push(attr.toCSharp());
            }
            res.push('} \n } \n\n');
            res.push(' // CSharp clone ');
            for (var _b = 0, _c = this.attrs; _b < _c.length; _b++) {
                var attr = _c[_b];
                if (attr.name == 'Id') {
                    continue;
                }
                else if (attr.name == 'UpdateBy') {
                    res.push('    orig.' + attr.name + ' = byUserId;');
                }
                else if (attr.name == 'UpdateAt') {
                    res.push('    orig.' + attr.name + ' = DateTime.Now ;');
                }
                else {
                    res.push('    orig.' + attr.name + ' = update.' + attr.name + ';');
                }
            }
            return res.join('\n');
        };
        ModelGen.prototype.toJS = function () {
            var res = [];
            res.push('// js --');
            for (var _i = 0, _a = this.attrs; _i < _a.length; _i++) {
                var attr = _a[_i];
                res.push(attr.toJS());
            }
            res.push(' public _dirty:boolean = true;');
            res.push('');
            res.push('static fromJson(json) :  ' + this.clazz + ' {');
            res.push('    let e = new ' + this.clazz + '() ; ');
            res.push('    e._dirty = false ;');
            for (var _b = 0, _c = this.attrs; _b < _c.length; _b++) {
                var attr = _c[_b];
                res.push('    e.' + attr.name + ' = json.' + attr.name + '; ');
            }
            res.push('       return e;  } ');
            return res.join('\n');
        };
        ModelGen.from = function (str) {
            var res = new ModelGen();
            var name = '';
            var idx = str.indexOf('|');
            var className = 'NA';
            if (idx > 0) {
                className = str.substr(0, idx).trim();
                str = str.substr(idx + 1);
            }
            var fields = str.split(';');
            var fieldLine = null;
            try {
                for (var _i = 0, fields_1 = fields; _i < fields_1.length; _i++) {
                    fieldLine = fields_1[_i];
                    if (MyApp.Helper.isBlank(fieldLine)) {
                        continue;
                    }
                    var f = fieldLine.split(':');
                    res.add(f[0], f[1]);
                }
            }
            catch (e) {
                console.error(e);
                console.info(' fields: "' + fieldLine + '", str: ' + str);
                return;
            }
            res.clazz = className;
            return res;
        };
        ModelGen.TYPE_NUM = 1;
        ModelGen.TYPE_STR = 2;
        ModelGen.TYPE_DATE = 3;
        return ModelGen;
    }());
    MyApp.ModelGen = ModelGen;
})(MyApp || (MyApp = {}));
//# sourceMappingURL=Utils.js.map