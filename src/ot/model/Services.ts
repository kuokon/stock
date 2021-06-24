declare var moment;

module MyApp {


    declare let NativeApp: {
        takePhoto, listFiles, uploadAllFiles, setFileUploadURL, doRefreshZip, toast, doDisplayAndShutdown, listPhotoPack, doRemoveAllPhotoPacks
    };

    export class DbService {


        // photo_id = 0;


        public config: Config = null;
        public mgr: Mgr;
        public helper: Helper = Helper;
        public tmpStore: TmpStore;

        public networkMgr: NetworkMgr = null;
        public $localStorage = window.localStorage;

        public static $inject = ['$q', '$rootScope', '$http', '$mdToast', '$mdSidenav', '$location', '$anchorScroll', '$route', '$timeout'];
        constructor(private $q: ng.IQService,
                    private $rootScope: ng.IRootScopeService,
                    public $http: ng.IHttpService,
                    private $mdToast: ng.material.IToastService,
                    private $mdSidenav: ng.material.ISidenavService,
                    private $location,
                    private $anchorScroll,
                    public $route,
                    public $timeout
        ) {

            this.config = new Config(this, window.localStorage);
            this.mgr = new Mgr(this);
            this.mgr.initKV();

        }


        // === helper functions

        public getMonthOptions(): number[] {
            return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        }

        public getYearOptions(): number[] {
            return [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022]
        }

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

        onModeGen(txt): ModelGen {

            return ModelGen.from(txt);
        }


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

            // this.$mdSidenav('left').close();

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


// native

}