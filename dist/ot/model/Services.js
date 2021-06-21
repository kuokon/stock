var MyApp;
(function (MyApp) {
    var DbService = /** @class */ (function () {
        function DbService($q, $rootScope, $http, $mdToast, $mdSidenav, $location, $anchorScroll, $route, $timeout) {
            this.$q = $q;
            this.$rootScope = $rootScope;
            this.$http = $http;
            this.$mdToast = $mdToast;
            this.$mdSidenav = $mdSidenav;
            this.$location = $location;
            this.$anchorScroll = $anchorScroll;
            this.$route = $route;
            this.$timeout = $timeout;
            // photo_id = 0;
            this.config = null;
            this.helper = MyApp.Helper;
            this.networkMgr = null;
            this.$localStorage = window.localStorage;
            this.config = new MyApp.Config(this, window.localStorage);
            this.mgr = new MyApp.Mgr(this);
            this.mgr.initKV();
        }
        // === helper functions
        DbService.prototype.getVersion = function () {
            return this.config.version;
        };
        DbService.prototype.isDataLoaded = function () {
            return this.config.loaded;
        };
        DbService.prototype.alert = function (msg) {
            alert(msg);
        };
        DbService.prototype.clearAllData = function () {
            console.info('clearing all data');
            this.config.loaded = false;
        };
        ;
        DbService.prototype.isPhotoEnabled = function () {
            return (this.hasNative() && !MyApp.Helper.isEmpty(NativeApp.takePhoto)) || this.isDev();
        };
        DbService.prototype.isPhone = function () {
            return this.config.isPhone;
        };
        DbService.prototype.hasNative = function () {
            try {
                return !MyApp.Helper.isEmpty(NativeApp);
            }
            catch (e) {
                return false;
            }
            // return !Helper.isEmpty(NativeApp);
        };
        DbService.prototype.getConfigMonth = function () {
            return this.config.getConfigMonth();
        };
        ;
        DbService.prototype.getNumImageWaitingUpload = function () {
            return this.getAllImageFileWaitingForUpload().length;
            // return this._numPhotoWaitingUpload;
        };
        // getNumImageWaitingUploadBak(): number {
        //     return this._numPhotoWaitingUpload;
        // }
        DbService.prototype.getConfigYear = function () {
            return this.config.getConfigYear();
        };
        ;
        DbService.prototype.onModeGen = function (txt) {
            return MyApp.ModelGen.from(txt);
        };
        DbService.prototype.goTo = function (tag, hash) {
            // console.info('goTo : ' + tag + ', hash: ' + hash);
            if (tag && tag.startsWith('..')) {
                var path = this.$location.path();
                var idx = path.lastIndexOf('/');
                tag = path.substr(0, idx);
                console.info(' go prev: ' + path + ' --> ' + tag);
            }
            this.$location.path(tag);
            if (hash) {
                this.$location.hash(hash);
            }
            else {
                this.$location.hash('');
                window.scrollTo(0, 0);
            }
            // this.$mdSidenav('left').close();
        };
        DbService.prototype.onVersionClicked = function () {
            this.goTo('/task/test');
        };
        DbService.prototype.onInitNative = function (ver) {
            this.config.onInitNative(ver);
            // this.onRefreshPhotoUploadCount();
        };
        DbService.prototype.onRefreshPhotoUploadCount = function () {
            // this._numPhotoWaitingUpload = this.getAllImageFileWaitingForUpload().length;
            var url = this.$location.path();
            this.refreshView();
            // if( url.startsWith('/task/my')) {
            //     this.refreshView();
            // }
        };
        DbService.prototype.refreshView = function (noAnchor) {
            var _this = this;
            // console.error('refreshing view....');
            console.info('refreshing view....');
            this.$route.reload();
            if (!noAnchor) {
                this.$timeout(function () {
                    _this.$anchorScroll();
                });
            }
            else {
                window.scrollTo(0, 0);
                console.info('skip anchor');
            }
        };
        DbService.prototype.onUpdateVersion = function () {
            if (this.isPhone()) {
                if (confirm('你確定 更新 吗？？')) {
                    NativeApp.doRefreshZip();
                }
            }
            else {
                alert('Please press "Shift-F5" to upgrade!');
            }
        };
        DbService.prototype.onShutdownNativePhoneApp = function () {
            NativeApp.doDisplayAndShutdown();
        };
        DbService.prototype.getAllImageFileWaitingForUpload = function () {
            if (this.isPhone()) {
                var json = NativeApp.listFiles();
                console.info('all image files json : ' + json);
                var files = JSON.parse(json);
                return files;
            }
            else {
                // console.error('getAllImageFileWaitingForUpload...');
                // console.info('not in phone, return empty list for waiting files');
                return [];
            }
        };
        DbService.prototype.isNeedUpdate = function () {
            return MyApp.Meta.isNeedUpdate(this.config.version)
                && !this.isPhoneClientNeedUpdate(); // if phone client needs update, then skip software update, since we want native client updated first.
        };
        DbService.prototype.isPhoneClientNeedUpdate = function () {
            return this.isPhone() && MyApp.Meta.isNativeClientNeedUpdate(this.config.phoneNativeClientVersion);
        };
        DbService.prototype.dumpData = function (dd) {
            if (dd) {
                console.info('dump data : ' + JSON.stringify(dd));
            }
            else {
                console.info('dump all : ' + JSON.stringify(this.config.version));
            }
            console.info('path: ' + this.$location.path());
        };
        ;
        DbService.prototype.dumpDataToFile = function (dd) {
            if (!dd) {
                dd = this.config;
            }
            var str = JSON.stringify(dd);
            var blob = new Blob([str], { type: "text/plain;charset=utf-8" });
            //saveAs(blob, "data.json");
            console.info('data: ' + str);
        };
        ;
        DbService.prototype.doRefreshData = function () {
            this.clearAllData();
            // this.doGetInfo();
        };
        DbService.prototype.UiInfo = function (msg, t) {
            if (t === void 0) { t = 3000; }
            this.$mdToast.show(this.$mdToast.simple()
                .textContent(msg)
                .position('top right')
                .hideDelay(t).parent(document.getElementById('toast-container')));
            console.info(msg);
            //Util.UiInfo(msg, t);
        };
        ;
        DbService.prototype.UiError = function (msg, t) {
            //Util.UiError(msg, t);
            if (t === void 0) { t = 3000; }
            this.$mdToast.show(this.$mdToast.simple()
                .textContent(msg)
                .position('top right')
                .hideDelay(t).parent(document.getElementById('toast-container')));
            console.warn(msg);
        };
        ;
        DbService.prototype.isDev = function () {
            return this.config.isDev;
        };
        DbService.$inject = ['$q', '$rootScope', '$http', '$mdToast', '$mdSidenav', '$location', '$anchorScroll', '$route', '$timeout'];
        return DbService;
    }());
    MyApp.DbService = DbService;
    // native
})(MyApp || (MyApp = {}));
//# sourceMappingURL=Services.js.map