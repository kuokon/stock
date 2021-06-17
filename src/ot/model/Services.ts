declare var moment;

module MyApp {


    declare let NativeApp: {
        takePhoto, listFiles, uploadAllFiles, setFileUploadURL, doRefreshZip, toast, doDisplayAndShutdown, listPhotoPack, doRemoveAllPhotoPacks
    };

    export class DbService {


        // photo_id = 0;

        public config: Config = null;

        public helper: Helper = Helper;

        public refPriceMgr: RefPriceMgr;

        public tmpStore: TmpStore;
        public api: ApiService = null;
        public networkMgr: NetworkMgr = null;

        public $localStorage = window.localStorage;


        public static $inject = ['ApiService', '$q', '$http',
            '$mdDialog',
            '$mdToast', '$mdSidenav', '$location',
            '$anchorScroll', '$timeout', '$route', 'Upload'];


        constructor(public Api: ApiService, private $q: ng.IQService,
                    public $http: ng.IHttpService,
                    public $mdDialog: ng.material.IDialogService,
                    private $mdToast: ng.material.IToastService,
                    private $mdSidenav: ng.material.ISidenavService,
                    public $location,
                    public $anchorScroll,
                    public $timeout,
                    public $route,
                    public Upload) {

            this.Api.svr = this;
            this.api = Api;

            this.config = new Config(this, window.localStorage);

        }



        // === helper functions



        getVersion(): number {
            return this.config.version;
        }

        isDataLoaded(): boolean {
            return this.config.loaded;
        }

        alert(msg: string): void {
            alert(msg);
        }


        clearAllData(): void {

            console.info('clearing all data');


            this.config.loaded = false;

        };

        isPhotoEnabled(): boolean {

            return (this.hasNative() && !Helper.isEmpty(NativeApp.takePhoto)) || this.isDev();

        }

        isPhone(): boolean {
            return this.config.isPhone;
        }


        hasNative(): boolean {

            try {
                return !Helper.isEmpty(NativeApp)
            } catch (e) {

                return false;
            }

            // return !Helper.isEmpty(NativeApp);
        }

        getConfigMonth(): number {
            return this.config.getConfigMonth();
        };

        getNumImageWaitingUpload(): number {
            return this.getAllImageFileWaitingForUpload().length;
            // return this._numPhotoWaitingUpload;
        }

        // getNumImageWaitingUploadBak(): number {
        //     return this._numPhotoWaitingUpload;
        // }

        getConfigYear(): number {
            return this.config.getConfigYear();

        };

        onModeGen(txt):ModelGen {

            return ModelGen.from(txt);
        }

        setConfigYearMonth(year, month, force?: boolean): void {

            let updated = this.config.setConfigYearMonth(year, month, force);
            if (updated) {

                this.UiInfo("Date updated to " + year + "/" + month);
                this.clearAllData();
                // this.doRefreshData();
            }
        };


        goTo(tag: string, hash ?: string): void {

            // console.info('goTo : ' + tag + ', hash: ' + hash);

            if (tag && tag.startsWith('..')) {
                let path = this.$location.path();
                let idx = path.lastIndexOf('/');
                tag = path.substr(0, idx);

                console.info(' go prev: ' + path + ' --> ' + tag);
            }


            this.$location.path(tag);

            if (hash) {
                this.$location.hash(hash);
            } else {

                this.$location.hash('');
                window.scrollTo(0, 0);
            }

            this.$mdSidenav('left').close();

        }

        onVersionClicked(): void {
            this.goTo('/task/test');
        }

        onInitNative(ver: string) {
            this.config.onInitNative(ver);
            // this.onRefreshPhotoUploadCount();
        }


        onRefreshPhotoUploadCount(): void {
            // this._numPhotoWaitingUpload = this.getAllImageFileWaitingForUpload().length;

            let url = this.$location.path();
            this.refreshView();

            // if( url.startsWith('/task/my')) {
            //     this.refreshView();
            // }

        }


        refreshView(noAnchor?: boolean): void {


            // console.error('refreshing view....');
            console.info('refreshing view....');
            this.$route.reload();

            if (!noAnchor) {
                this.$timeout(() => {
                    this.$anchorScroll();
                })
            } else {
                window.scrollTo(0, 0);
                console.info('skip anchor');
            }

        }

        onUpdateVersion(): void {

            if (this.isPhone()) {
                if (confirm('你確定 更新 吗？？')) {
                    NativeApp.doRefreshZip();
                }
            } else {
                alert('Please press "Shift-F5" to upgrade!');
            }
        }

        onShutdownNativePhoneApp(): void {

            NativeApp.doDisplayAndShutdown();
        }


        getAllImageFileWaitingForUpload(): string[] {

            if (this.isPhone()) {

                let json = NativeApp.listFiles();

                console.info('all image files json : ' + json);
                let files = JSON.parse(json);

                return files
            } else {

                // console.error('getAllImageFileWaitingForUpload...');
                // console.info('not in phone, return empty list for waiting files');

                return [];
            }
        }

        isNeedUpdate(): boolean {
            return Meta.isNeedUpdate(this.config.version)
                && !this.isPhoneClientNeedUpdate();   // if phone client needs update, then skip software update, since we want native client updated first.
        }

        isPhoneClientNeedUpdate(): boolean {
            return this.isPhone() && Meta.isNativeClientNeedUpdate(this.config.phoneNativeClientVersion);
        }


        dumpData(dd): void {

            if (dd) {
                console.info('dump data : ' + JSON.stringify(dd));
            } else {
                console.info('dump all : ' + JSON.stringify(this.config.version));
            }

            console.info('path: ' + this.$location.path());


        };

        dumpDataToFile(dd): void {

            if (!dd) {
                dd = this.config;
            }

            let str = JSON.stringify(dd);
            let blob = new Blob([str], {type: "text/plain;charset=utf-8"});

            //saveAs(blob, "data.json");
            console.info('data: ' + str)
        };


        doRefreshData() {

            this.clearAllData();
            // this.doGetInfo();

        }


        UiInfo(msg, t = 3000): void {


            this.$mdToast.show(
                this.$mdToast.simple()
                    .textContent(msg)
                    .position('top right')
                    .hideDelay(t).parent(document.getElementById('toast-container'))
            );


            console.info(msg);
            //Util.UiInfo(msg, t);
        };

        UiError(msg, t = 3000): void {


            //Util.UiError(msg, t);

            this.$mdToast.show(
                this.$mdToast.simple()
                    .textContent(msg)
                    .position('top right')
                    .hideDelay(t).parent(document.getElementById('toast-container'))
            );

            console.warn(msg);
        };




        isDev(): boolean {
            return this.config.isDev;
        }



    }


    export class ApiService {

        public static $inject = ['$q', '$rootScope', '$http', '$mdToast'];
        _baseURL: string = null;
        public svr: DbService = null;

        _networkErrorCount: number = 1;
        _networkErrorTime: Date = null;

        constructor(
            private $q: ng.IQService,
            public $rootScope: ng.IRootScopeService,
            public $http: ng.IHttpService,
            private $mdToast: ng.material.IToastService) {

            let self = this;

        }

        getBaseURL(): string {

            if (this._baseURL == null) {
                this._baseURL = 'https://abc///';

                if (this.isDev() && (!this.svr.isPhone())) {



                    // this._baseURL = '/CPIApi/api/smkt/';

                }

                console.info(" isDev: " + this.isDev() + ",  configured baseURL: " + this._baseURL);
            }
            return this._baseURL;
        }


        isDev(): boolean {

            return this.svr.isDev();

        }


        makeUrl(path: string): string {

            return this.getBaseURL() + path;
        }

        httpGetPlanInfo(year): ng.IPromise<any> {

            const url = this.makeUrl('plan/' + year);

            return this.makeHttpGet(url);
        }

        httpInitTaskForMonth(userId, year, month): ng.IPromise<any> {

            const url = this.makeUrl('task/init/' + userId + '/' + year + '/' + month);

            return this.makeHttpPut(url, null, null);

        }


        httpGetInfo(userId, year, month): ng.IPromise<any> {

            const url = this.makeUrl('info/' + userId + '/' + year + "/" + month);

            // return this.$http.get(url);

            return this.$http.get(url)
                .then(response => response.data)
                .catch(reason => {
                    return this.handleError(reason);

                });
        }

        UiError(msg, t = 3000): void {
            //Util.UiError(msg, t);

            this.$mdToast.show(
                this.$mdToast.simple()
                    .textContent(msg)
                    .position('top right')
                    .hideDelay(t).parent(document.getElementById('toast-container'))
            );

            console.warn(msg);
        };


        handleError(res: any): ng.IPromise<any> {


            let msg = 'Error: ' + (res.status || ' |') + ' ' + (res.statusText || ' |') + ' ' + (res.message || ' |');
            let isNetworkError: boolean = false;

            console.info('http error detail: ' + JSON.stringify(res));

            if (res && res.status == -1) {
                msg = '  沒有網絡 !!! ';
                isNetworkError = true;

            }

            if (res && (res.status == 401 || res.status == 403)) {

                // 403 Forbidden, handle session expired...

                console.warn('setting auth header to null!');
                this.$http.defaults.headers.common['Authorization'] = null;

                let msg = " 已過期，需要再次登錄 ! ";
                alert(msg);
                this.svr.goTo('/user');

                this.UiError(msg);
                //return;
            }
            if (res.data && res.data.UiMsg) {
                //msg += "<br> " +
                msg = res.data.UiMsg + ' | ' + msg;
            }


            if (res.data && res.data.DebugMsg) {
                console.info('http debug: ' + res.data.DebugMsg);
            }

            if (isNetworkError) {

                this.svr.networkMgr.onNetworkError();
                // this.UiError(msg, 3000);

            } else {
                this.UiError(msg, 2000);
            }

            return this.$q.reject(msg);

        }

        handleResponse(res: any): ng.IPromise<any> {
            if (res && res.status === 200) {

                let data = res.data;
                if (data.UiMsg) {
                    let msg = data.UiMsg;
                    this.$mdToast.show(
                        this.$mdToast.simple()
                            .textContent(msg)
                            .position('top right')
                            .hideDelay(3000)
                    );
                }

                if (data.DebugMsg) {
                    console.info('http debug: ' + data.DebugMsg);
                }

                this.svr.networkMgr.onNetworkOk();
                return this.$q.resolve(res);

            } else {
                return this.handleError(res);
            }
        }

        httpGetUsers() {

            const url = this.makeUrl('user');
            return this.makeHttpGet(url);

        }

        makeHttpGet(url: string): ng.IPromise<any> {

            return this.$http.get(url)
                .then((res) => {
                    return this.handleResponse(res);
                })
                .catch(reason => {
                    return this.handleError(reason);

                })
        }

        makeHttpDelete(url: string, config: {}): ng.IPromise<any> {
            return this.$http.delete(url, config).then((res) => {

                return this.handleResponse(res);
            }).catch(reason => {
                return this.handleError(reason);

            });


        }


        makeHttpDummy(): ng.IPromise<any> {
            return this.$q.resolve();
        }


        makeHttpPost(url: string, data: any, config: any): ng.IPromise<any> {
            return this.$http.post(url, data, config)
                .then((res) => {
                    return this.handleResponse(res);
                })
                .catch(reason => {
                    return this.handleError(reason);

                })

        }


        makeHttpPut(url: string, data: any, config: any) {
            return this.$http.put(url, data, config)
                .then((res) => {
                    return this.handleResponse(res);
                })
                .catch(reason => {
                    return this.handleError(reason);

                })

        }




    }


// native

}