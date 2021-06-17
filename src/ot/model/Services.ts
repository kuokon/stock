declare var moment;

module MyApp {


    declare let NativeApp: {
        takePhoto, listFiles, uploadAllFiles, setFileUploadURL, doRefreshZip, toast, doDisplayAndShutdown, listPhotoPack, doRemoveAllPhotoPacks
    };

    export class DbService {


        // photo_id = 0;

        public config: Config = null;
        public unitTypeMgr: UnitTypeMgr = new UnitTypeMgr();

        public fileMgr: FileMgr;
        public reportMgr: ReportMgr;
        public approveMgr: ApproveMgr;
        public upcMgr: UpcMgr;
        public templateMgr: TemplateMgr;
        public dataMgr: DataMgr;
        public mgr: Mgr;
        public photoPackMgr: PhotoPackMgr;
        public groupMgr: GroupMgr;

        public helper: Helper = Helper;

        public refPriceMgr: RefPriceMgr;

        public tmpStore: TmpStore;
        public api: ApiService = null;
        public networkMgr: NetworkMgr = null;
        public infoletMgr: InfoletMgr;

        public approveStatusesHolder: ApproveStatusesHolder = null;


        public filters = {statusFilter: 2};
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

            this.fileMgr = new FileMgr(this, Upload);
            this.reportMgr = new ReportMgr(this);
            this.config = new Config(this, window.localStorage);
            this.approveMgr = new ApproveMgr(this);
            this.upcMgr = new UpcMgr();
            this.templateMgr = new TemplateMgr();
            this.dataMgr = new DataMgr();
            this.mgr = new Mgr(this);
            this.tmpStore = new TmpStore(this);
            this.refPriceMgr = new RefPriceMgr(this);
            this.networkMgr = new NetworkMgr(this, $timeout);
            this.photoPackMgr = new PhotoPackMgr(this);
            this.groupMgr = new GroupMgr();
            this.infoletMgr = new InfoletMgr(this);

            // this._numPhotoWaitingUpload = this.getAllImageFileWaitingForUpload().length;
        }


        public upOne(tlets: Tasklet[], tlet: Tasklet): void {
            Helper.upOne(tlets, tlet);
        }


        searchItems(txt): Item[] {

            let res = [];
            let items = this.getAllItems();

            for (let i = 0; i < items.length; i++) {
                let item = items[i];

                if (item.ItemCode.indexOf(txt) >= 0 || item.Name.indexOf(txt) >= 0) {
                    res.push(item);
                }
            }

            return res;
        }

        searchOutlets(txt): Outlet[] {

            let res = [];
            let items = this.getAllOutlets();

            for (let i = 0; i < items.length; i++) {
                let item = items[i];

                if (item.OutletCode.indexOf(txt) >= 0 || item.Name.indexOf(txt) >= 0) {
                    res.push(item);
                }
            }

            return res;

        }

        addTemplate(outlet: Outlet, item: Item, baseQty, baseUnit) {

            let template = this.getTemplateByCodes(outlet.OutletCode, item.ItemCode);
            if (template) {

                let msg = '不能添加，已經存在 !';
                this.UiError(msg);

                alert(msg);
                return

            } else {

                let template = Template.make(outlet.OutletCode, item.ItemCode, baseQty, baseUnit);

                this.doUpdateTemplate(template).then(res => {

                    this.doGetInfo();
                    let msg = 'new template added: ' + template.OutletCode + ':' + template.ItemCode + '| ' + this.getOutletName(template.OutletCode) + ':' + this.getItemName(template.ItemCode);
                    this.doLogServerMsg(msg);
                });

            }


        }


        // === helper functions

        autoFill(): void {

            if (this.config.isConfigDateSameAsActual() || this.config.getConfigYear() >= 2018) {
                alert('in actual year/month, auto-fill disabled !!');
                return
            }

            if (!confirm('are you sure to auto-fill?')) {
                return;
            }


            if (this.config.loaded || !this.config.loaded) {
                // no matter what, skip auto-fill...
                return;
            }

            let that = this;
            let tasks = this.getMyTasks();
            for (let i = 0; i < tasks.length; i++) {
                let task = tasks[i];
                let idx = i + 3;
                let tasklets = task.getTasklets();

                for (let j = 0; j < tasklets.length; j++) {
                    let tlet = tasklets[j];
                    idx = idx * idx;
                    tlet.Price = parseFloat(((idx * 7 % 100) / 8).toFixed(1)) + 1;
                    tlet.Qty = (idx * 3 % 5) + 1;

                    //tlet.Unit = that.getAllUnitTypes()[idx % 20].Code;
                }

                task._dirty = true;
            }
        };

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

            Task.clearAll();
            this.templateMgr.clearAll();
            this.mgr.clearAll();
            UnitType.clearAll();
            // this.outletMgr.clearAll();
            this.tmpStore.listUpdated();

            this.refPriceMgr.clearAll();

            this.approveStatusesHolder = null;
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

        onVersionClicked(): void {
            this.goTo('/task/test');
        }

        onFileUploaded(filename: string, fileId: string) {

            console.info('svr : onFileUploaded : ' + filename + ' id: ' + fileId);


            this.fileMgr.onFileUploaded(filename, fileId);

            // don't refresh here, since user edit page will scroll to top-of-page....
            // this.onRefreshPhotoUploadCount();

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

        onTakePhoto(task: Task, tlet: Tasklet): void {

            //let fileName = 'smkt_11110_10_10';
            //let filename = 'smkt-1111_11_' + Math.floor(Math.random() * 100);

            let filename = this.fileMgr.makeFilename(task, tlet);


            if (this.isPhone()) {
                this.fileMgr.addTaskletPhoto(filename, tlet);
                // task.onChange();
                this.onUpdateTask(task);

                NativeApp.takePhoto(filename);

            } else {

                let msg = " logic error, native takePhoto called...";
                this.doLogServerMsg(msg);
                alert(msg);
                // console.warn()

            }


        }

        onUndoSubstitute(approve): void {

            let othApprove = this.approveMgr.getSubstituted(approve.getKey());
            let template = this.templateMgr.get(othApprove.OutletCode, othApprove.ItemCode);

            let msg = '你確定要取消替換嗎？ \n  ' + approve.SubstituteOutletCode + ' 樣板/審批 會回復 !';

            if (confirm(msg)) {

                approve.CollectMethod = '';
                approve.onChange();


                let othApprove = this.approveMgr.getSubstituted(approve.getKey());
                let template = this.templateMgr.get(othApprove.OutletCode, othApprove.ItemCode);

                if (othApprove) {

                    othApprove.CollectMethod = '';
                    othApprove.onChange();

                    if (!template.isActive()) {
                        template.Status = 1;
                        template.onChange();
                    }
                }

                let msg = '商品 undo 替代,  ' + approve.OutletCode + ':' + approve.ItemCode + '| ' + this.getOutletName(approve.OutletCode) + this.getItemName(approve.ItemCode);

                this.doLogServerMsg(msg);

                this.doUpdateApprove(approve).then(res => {

                    this.doUpdateApprove(othApprove);
                    this.doUpdateTemplate(template);
                    this.refreshView();

                });

            }

        }

        onUpdateVersion(): void {

            if (this.isDataUploadNeeded()) {
                alert('請先保存數據');
                return;
            }

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


        doUploadAllPhotos(): void {

            let dirties = this.getAllDirtyTasks();

            if (dirties.length > 0) {
                this.doSyncTasks().then(res => {

                        this.refreshView();

                        let num = this.getAllDirtyTasks().length;
                        if (num == 0) {
                            this.doUploadAllPhotos();
                        }
                    }
                );
                return;
            } else {

                if (this.tmpStore.hasPending()) {
                    let msg = '仍然 有 價格 未上傳，先上傳價格。';
                    alert(msg);
                    this.goToTmpStore();

                    return;
                }
            }


            console.info('JS prepare to call NativeApp.uploadAllFiles()');

            let names = this.getAllImageFileWaitingForUpload();
            if (names.length == 0) {
                this.doTryMatchAllFileXs();
            }

            this.fileMgr.onUploadAllPhotoClicked(names.length);

            let msg = 'uploadPhotos: ' + this.config.getUserInfo() + ' #' + names.length;
            this.doLogServerMsg(msg);


            if (this.isPhone()) {
                NativeApp.uploadAllFiles();

            }

            this.$timeout(() => {
                this.refreshView();
            }, 1000);

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


        getTask(itemCode): Task {

            return Task.getTask(itemCode);
            // return this.smktDb.taskMap[itemCode];
        };


        getTasksInOutlet(outletCode): Task[] {
            return Task.getTasksInOutlet(outletCode);

        };

        getTasksInOutletItem(outletCode, itemCode): Task[] {
            return Task.getTasksInOutletItem(outletCode, itemCode);
        };


        getApproveStatus(outletCode: string): OutletApproveStatus {
            let holder = this.getApproveStatusesHolder();
            for (const status of holder.statuses) {
                if (status.outletCode == outletCode) {
                    return status;
                }
            }

            console.warn(' outlet status not found , code: ' + outletCode);
            return null;

        }

        getApproveStatusesHolder(): ApproveStatusesHolder {

            if (this.approveStatusesHolder == null) {

                let statuses = this.getApproveStatuses();


                let numDone = statuses.filter(e => e.isAllCompleted()).length;

                let numPendingTask = statuses.filter(e => e.isPendingTask()).length;
                let numPendingApprove = statuses.filter(e => e.isPendingApprove()).length;
                let numFieldCheck = statuses.filter(e => e.isFieldCheck()).length;
                let numMissingInApprove = statuses.filter(e => e.missingInApprove.length > 0).length;
                let numTotal = statuses.length;
                let numCheck1Missing = statuses.filter(e => e.isCheck1Missing()).length;
                let numCheck2Missing = statuses.filter(e => e.isCheck2Missing()).length;
                let numTaskletMissing = statuses.filter(e => e.numTaskletMissing > 0).length;


                this.approveStatusesHolder = {
                    statuses: statuses
                    , numTotal: numTotal
                    , numDone: numDone
                    , numPendingTask: numPendingTask
                    , numPendingApprove: numPendingApprove
                    , numFieldCheck: numFieldCheck
                    , numMissingInApprove: numMissingInApprove
                    , numCheck1Missing: numCheck1Missing
                    , numCheck2Missing: numCheck2Missing
                    , numTaskletMissing: numTaskletMissing
                };

                console.info(' ApproveStatusesHolder, total: ' + this.approveStatusesHolder.numTotal)

            }

            return this.approveStatusesHolder

        }

        getApproveStatuses(): OutletApproveStatus[] {

            let someNotDone = [];
            let allDoneButNotCheckedIn = [];
            let allDoneAndCheckedIn = [];
            let res: OutletApproveStatus[] = [];

            let outletCodes = this.approveMgr.getOutletCodes();

            for (const outletCode of outletCodes) {

                let approves = this.approveMgr.getApproves(outletCode);


                let status = new OutletApproveStatus(outletCode);
                // status.numTotal = approves.length;

                status.isCheckIn = true;

                let approveTaskDoneMap = {};
                let taskCheckInMap = {};

                for (const approve of approves) {

                    let tasks = approve.getTasks();
                    let isAllTaskDone = true;

                    for (let task of tasks) {

                        status.addTask(outletCode, task);

                        status.numTasks++;

                        if (task.isTaskDoneCollect()) {
                            approveTaskDoneMap[task.ItemCode] = true;
                            status.numTaskDone++;
                        }

                        if (task.isCheckedIn()) {
                            taskCheckInMap[task.ItemCode] = true;
                        }

                        status.isCheckIn = status.isCheckIn && task.isCheckedIn();

                        let photos = task.getAllPhotos();
                        for (const photo of photos) {
                            if (photo.isNew) {
                                if (!photo.isUploaded()) {
                                    status.numPhotoPending++;
                                }
                                status.numPhotoNew++;
                            }
                        }


                        if (task.getTasklets().length == 0) {
                            status.numTaskletMissing++;

                        }
                    }

                    status.numItemCollected = Object.keys(approveTaskDoneMap).length;


                    if (approve.isApproved()) {
                        status.numApproved++;
                    }


                    if (approve.isFieldCheck()) {
                        status.numFieldCheck++;


                        let tasks = this.getTasksInOutletItem(approve.OutletCode, approve.ItemCode);


                        if (tasks && tasks.length == 1) {

                            let ownerId = tasks[0].OwnerUserId;
                            let owners = Task.getTaskOutletOwners(status.outletCode);
                            if (owners && owners.length > 0) {


                                // check if primary owner:
                                if (owners[0].Id == ownerId) {
                                    status.isFieldCheckHasOtherOwner = false;
                                }
                            }


                            // console.info(approve.OutletCode + ':' + approve.ItemCode + ', tasks: ' + tasks.length);

                        }

                    }

                    let template = this.getTemplateByCodes(approve.OutletCode, approve.ItemCode);
                    if (template.getTasklets().length == 0) {
                        status.numTaskletMissing++;
                    }


                    status.addApprove(approve);


                    // status.getOwners(this); // init owners
                    //
                    // if (status.owners.length == 0) {
                    //     status.isCheckIn = false;
                    // }


                }

                // status.isCheckIn = Object.keys(approveTaskDoneMap).length >= status.numTotal;

                status.missingInApprove = this.approveMgr.getMissingInApprove(outletCode);
                status.os = this.mgr.getStatus(status.outletCode);
                status.getOwners(this);

                // if(!status.isFieldCheckHasOtherOwner) {
                //     // need to double check is Field-check owner is primary, need to do this here (after 'status.getOwners(...)' since we need to init the primary-owner first
                //     // and double check here
                //
                //     let approves = this.approveMgr.getApproves(outletCode);
                //     for (const approve of approves) {
                //         if(approve.isFieldCheck()) {
                //
                //         }
                //     }
                // }

                res.push(status);
            }

            //
            let total = 0;
            for (const re of res) {

                let count = 0;
                total++;


                re.isPendingTask() ? count++ : '';
                re.isPendingApprove() ? count++ : '';
                re.isFieldCheck() ? count++ : '';
                re.isAllCompleted() ? count++ : '';
                re.isCheck1Missing() ? count++ : '';
                re.isCheck2Missing() ? count++ : '';

                if (count != 1) {
                    console.error(' approve status true count: ' + count + ', outlet: ' + re.outletCode);
                    console.info(' re: ' + JSON.stringify(re));
                }


            }
            console.info('approve status total: ' + total);

            //

            return res;

        }

        getTaskStatusHolder() {

            let someNotDone = [];
            let allDoneButNotCheckedIn = [];
            let allDoneAndCheckedIn = [];

            let outletCodes = Task.getOutletCodesWithTask();
            let pins = this.tmpStore.getAllPin();


            for (let outletCode of outletCodes) {

                let tasks = Task.getTasksInOutlet(outletCode);
                let count = tasks.length;
                let done = 0;
                let isCheckedIn = true;
                for (let task of tasks) {
                    if (task.isTaskDoneCollect()) {
                        isCheckedIn = (isCheckedIn) && task.isCheckedIn();
                        done++;
                    }
                }

                let status = new TaskStatus(outletCode);
                status.numTotal = count;
                status.numDone = done;

                let allDone = (count === done);
                if (!allDone) {
                    someNotDone.push(status);
                } else if (isCheckedIn) {
                    allDoneAndCheckedIn.push(status)
                } else {
                    allDoneButNotCheckedIn.push(status);
                }
            }

            someNotDone.sort((a: TaskStatus, b: TaskStatus) => {

                let aHasPin = pins.indexOf(a.outletCode) >= 0;
                let bHasPin = pins.indexOf(b.outletCode) >= 0;

                if (aHasPin && bHasPin || (!aHasPin && !bHasPin)) {
                    return a.outletCode.localeCompare(b.outletCode);
                } else {

                    return aHasPin ? -1 : 1;

                }
            });

            return {

                someNotDone: someNotDone
                , allDoneAndCheckedIn: allDoneAndCheckedIn
                , allDoneButNotCheckedIn: allDoneButNotCheckedIn
            }

        }


        // getOutletTaskMap(): {} {
        //     return Task._outletTasksMap;
        // };


        getAllItems(): Item[] {
            return this.mgr.items.getAll();
            // return Item.getAll();

        }

        getAllOutlets(): Outlet[] {
            return this.mgr.outlets.getAll();
            // return Outlet.getAll();

        }


        getApproveOutletCodes(): string[] {

            return this.approveMgr.getOutletCodes();

            // return Approve.getOutletCodes();
        }

        getTemplateOutletOwners(outletCode): User[] {

            let outlet = this.getOutlet(outletCode);
            let res = null;
            if (outlet) {
                res = outlet._owners;
            }
            return res;
        };

        getTaskOutletOwners(outletCode): User[] {

            return Task.getTaskOutletOwners(outletCode);
        };


        onCheckInOutlet(outletCode: string) {


            let u = this.getCurrUser();

            if (!u.isInspector()) {

                alert('Error, only Inspector can 鎖定 !  user: ' + u);
                return;
            }


            let tasks = Task.getTasksInOutlet(outletCode);
            let pending = 0;
            let numPhotos = this.getNumImageWaitingUpload();
            let taskDirty = false;
            let outletTxt = '  ' + outletCode + ':' + this.getOutletName(outletCode);

            for (const task of tasks) {

                pending += task.getPhotoPending();
                taskDirty = taskDirty || task._dirty;

                if (pending > 0) {

                    let msg = '';

                    if (numPhotos == 0) {
                        this.doTryMatchAllFileXs();
                        msg = 'Warn: 照片已上傳，但 內容 未 同步，請重試 #' + pending;

                    } else {
                        msg = '請在 鎖定商戶 之前 上傳所有照片 ';
                    }

                    alert(msg);
                    console.info(msg + outletTxt);
                    this.doLogServerMsg(msg + outletTxt);
                    return;
                }

                // if (task._dirty) {
                //
                //     let msg = ' 請先上傳 價格 後, 再鎖定 ! ';
                //     this.doLogServerMsg(msg + outletTxt);
                //     alert(msg);
                //
                //     return;
                // }

            }


            let msg = this.getOutletName(outletCode) + '\n\n  鎖定 後無法修改，您確定嗎？ ';
            if (confirm(msg)) {

                // let tasks = Task.getTasksInOutlet(outletCode);
                for (let task of tasks) {
                    if (task.OwnerUserId != u.Id) {
                        let msg = 'task : ' + task.Id +
                            ', owner: ' + task.OwnerUserId + ' (' + this.mgr.users.get(task.OwnerUserId).Name
                            + ', trying to checkin user: ' + u.Id;

                        console.warn(msg);
                        alert(msg);
                        return;
                    }

                    task.Status = Task.STATUS_CHECKED_IN;
                    this.onUpdateTask(task);
                }

                let that = this;

                this.doSyncTasks(tasks, true).finally(() => {

                    console.info(' *** finally  refresh view !!!');
                    that.refreshView();
                    this.tmpStore.listUpdated();

                    let msg = 'lock: ' + this.getCurrUser().Name + ' ' + this.config.getTimeInfo() + ' #' + tasks.length
                        + ', tmp: ' + this.tmpStore.getAll().length
                        + ' |' + outletCode + '|' + this.getOutletName(outletCode);
                    this.doLogServerMsg(msg);

                });

            }

        }

        isTestUser(): boolean {
            let res = false;

            let user = this.getCurrUser();
            res = user ? user.Role === 'test' : false;
            return res;
        };


        getTemplateByCodes(OutletCode, ItemCode): Template {
            return this.templateMgr.getByKey(OutletCode + '_' + ItemCode);
        };


        getTemplate(task): Template {
            return this.templateMgr.getByKey(task.OutletCode + '_' + task.ItemCode);
        };


        getTemplateOutlets(): { [outletCode: string]: Template[] } {
            return this.templateMgr.getTemplateOutlets();
        };

        getTemplateOfOutlet(outletCode): Template[] {
            return this.templateMgr.getByOutlet(outletCode);
        };


        doGetUsers() {
            return this.Api.httpGetUsers().then(res => {

                    let data = res.data;
                    this.mgr.initUsers(data.SmktUsers);
                    Meta.init(data.SmktMetas);
                }
            );
        }


        getSearchedTasks(txt): Task[] {

            function isBlankString(str) {
                return (!str || /^\s*$/.test(str));
            }

            let res = [];

            if (isBlankString(txt)) {
                return res;
            }

            let tasks = this.getMyTasks();
            for (let i = 0; i < tasks.length; i++) {
                let task = tasks[i];
                let itemName = this.getItemName(task.ItemCode);
                if (itemName.indexOf(txt) >= 0) {
                    res.push(task);

                    break;
                }
                let lets = task.getTasklets();
                for (let j = 0; j < lets.length; j++) {
                    let tlet = lets[j];
                    if (tlet.Name.indexOf(txt) >= 0) {
                        res.push(task);
                        break;
                    }
                }
            }

            console.info('searching for ' + txt + ',  got # ' + res.length);
            return res;
        };


        processData(res): void {

            console.info('processing data....');

            if (!res) {
                this.config.loaded = false;
                console.info('data is null!!! ....');
                return;
            }

            Meta.init(res.SmktMetas);
            UnitType.init(res.unitTypes);

            this.mgr.initUsers(res.SmktUsers);
            this.mgr.initOutlets(res.outlets, res.outletUsers);
            this.mgr.initItems(res.items);
            this.mgr.initOutletStatus(res.outletStatuses);

            this.upcMgr.init(res.upcs, res.fileXs);
            this.templateMgr.init(this, res.templates);

            this.approveMgr.initApproves(res.approves);
            // Approve.init(res.approves);


            Task.init(this, res.tasks);

            this.photoPackMgr.clearAll();
            this.approveStatusesHolder = null;

            this.config.ItemCodeTerm = parseInt(res.ItemCodeTerm);

            console.info(this.photoPackMgr.getStats());
            console.info('ItemCodeTerm: ' + this.config.ItemCodeTerm);

            this.refreshView();

        };

        getDataStatus(): string {
            return this.$localStorage.data_status;
        };

        setDataStatus(status): void {

            console.debug('data-status: ' + status);
            this.$localStorage.data_status = status;
        };


        doRefreshData() {

            this.clearAllData();
            this.doGetInfo();

        }


        doGetInfo(): ng.IPromise<any> {

            if (this.config.loaded) {
                // console.info('info cached.');
                return
            }

            if (!this.isUserLoggedIn()) {
                console.info('user not login yet, skip getting data.');
                return;
            }

            let that = this;
            let userId = this.getCurrUser().Id;
            let year = this.getConfigYear();
            let month = this.getConfigMonth();


            this.config.loaded = true;
            let start = new Date();

            let res = this.Api.httpGetInfo(userId, year, month).then(res => {

                    let e1 = new Date();
                    // console.info('got info data : ');
                    this.processData(res);

                    let e2 = new Date();

                    let t0 = e1.getTime() - start.getTime();
                    let t1 = e2.getTime() - e1.getTime();

                    let procTime = res.ProcessTime || -10;

                    console.info('time info,  grab-data-time: ' + t0 + ', process time: ' + t1 + ', total: ' + (t0 + t1) + ', server proc: ' + procTime);
                    //let timeStr = (t0/1000).toFixed(2) + 's, ' + (t1/1000).toFixed(2) + 's ';

                    this.logMetaInfo(t0 / 1000, t1 / 1000, procTime / 1000);


                }, err => {

                    console.info(' error getting info ...');
                    this.config.loaded = false;

                }
            );

            if (!this.isPhone() && this.getCurrUser().isInspector()) {
                alert('  停 !!!    請 確保您已從電話 登出！')
            }

            return res;
        };

        public logMetaInfo(svrNetTime, cpuTime, dbTime): void {

            let svr = this;
            let user = svr.getCurrUser();

            // skip admin/operator to prevent clustering of logs.
            //if( !this.isPhone() || this.isDev()) {
            // if (user.isAdmin() || svr.isDev()) {
            if (user.isAdmin()) {
                return;
            }

            let isVersionMatch = svr.config.isVersionMatch();
            let versionTxt = '( ver-' + svr.getVersion() + '-' + (svr.isPhone() ? svr.config.getNativeClientVersion() : '**') + ')';


            let msg: string = 'refresh: '
                + svr.config.getUserInfo() + ', v' + svr.getVersion()
                + (isVersionMatch ? '' : versionTxt)

                + (svr.getNumImageWaitingUpload() ? ', img: ' + svr.getNumImageWaitingUpload() : '')
                + (svr.tmpStore.getAll().length ? ', tmp: ' + svr.tmpStore.getAll().length : '')
                + (svr.tmpStore.getAllPin().length ? ', pins: ' + svr.tmpStore.getAllPin().length : '')
                + (svr.photoPackMgr.getPacksInPhone().length ? ', pack: ' + svr.photoPackMgr.getPacksInPhone().length : '')
                + ', time: ' + svrNetTime.toFixed(2) + 's| cpu: ' + cpuTime.toFixed(2) + 's | db: ' + dbTime.toFixed(2)
                + (svr.config.isConfigDateSameAsActual() ? '' : (' (' + svr.getConfigYear() + '-' + svr.getConfigMonth() + ')'))
                + ((!svr.isPhone() && user.isInspector()) ? ' (web!)' : '')

            ;

            svr.doLogServerMsg(msg);
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


        getOutlet(outletCode): Outlet {
            return this.mgr.getOutlet(outletCode);
        };

        getOutletName(code): string {
            let outlet = this.mgr.getOutlet(code);
            return outlet ? outlet.Name : 'NA-' + code;
        };


        getItemName(code): string {
            let item = this.mgr.items.getByKey(code);
            return item ? item.Name : 'NA-' + code;
        };


        // getOutletApproveStatus(outletCode): OutletApproveStatus {
        //     let status = new OutletApproveStatus(outletCode);
        //
        //     let approves = this.getApprovesInOutlet(outletCode);
        //     for (let approve of approves) {
        //         status.addApprove(approve);
        //
        //         let tasks = approve.getTasks();
        //         for (const task of tasks) {
        //             status.addTask(outletCode, task);
        //         }
        //
        //     }
        //
        //     return status
        // }


        getUsers(): User[] {
            return this.mgr.users.getAll();
        };

        getInspectors(): User[] {
            return this.mgr.getInspectors();
        };

        getUser(id): User {
            return this.mgr.users.get(id);
        };

        getUserName(userId): string {
            let user = this.mgr.users.get(userId);
            return user ? user.Name : 'NA-' + userId;
        };

        doLogin(user: User, passwd: string): ng.IPromise<any> {

            // somehow the string passed through HTTP will not recognize string (but number ok),
            // need to wrap the string with single code in order to work. (and number still work)

            passwd = "'" + passwd + "'";

            return this.Api.httpPostLogin(user, passwd).then(json => {

                let user = new User(json.Id, json.Name, json.Name_E, json.Role, json.Status);
                //this.setCurrUser(user);


                return json;
            });
        };

        //
        // setCurrUser(user, passwd): void {
        //     let db = this.config;
        //     db.currUser = user;
        //
        //     // let basicAuth =  user ?  'Basic ' +  window.btoa( encodeURIComponent( user.Name) + ':' + passwd) : null;
        //     let basicAuth = user ? 'Basic ' + window.btoa(user.Id + ':' + passwd) : null;
        //     this.Api.$http.defaults.headers.common['Authorization'] = basicAuth;
        //
        //     this.$localStorage.smktUser = user;
        //     this.$localStorage.smktUserBasicAuth = basicAuth;
        //
        //     console.info("set curr user: " + JSON.stringify(user));
        //
        //     if (user != null) {
        //         this.UiInfo("登錄為: " + user.Name);
        //     }
        // };

        getCurrUserId(): number {

            return this.getCurrUser().Id;
        };


        enableTestInPhone() {

            if (!(this.getCurrUserId() >= 0 && this.getCurrUserId() <= 9)) {
                alert(' not authorized for testing....');
                return;
            }

            // if (this.isDataUploadNeeded() &&  !( this.getCurrUserId() ==39)) {
            //     let msg = 'upload data first..';
            //     alert(msg);
            //     return;
            // }


            this.setConfigYearMonth(2017, 11, true);

            this.config.isDev = true;
            // this.Api._baseURL = null;

            this.clearAllData();


            this.tmpStore.listUpdated();
            if (this.tmpStore.getAll().length > 0) {
                this.goToTmpStore();
            } else {

                this.doRefreshData();
                this.goTo('/task')
            }
        }


        resetTestInPhone() {


            this.setConfigYearMonth(null, null, true);

            this.config.isDev = false;
            this.Api._baseURL = null;

            this.clearAllData();


            this.tmpStore.listUpdated();
            if (this.tmpStore.getAll().length > 0) {
                this.goToTmpStore();
            } else {

                this.doRefreshData();
                this.goTo('/task')
            }
        }


        getCurrUser(): User {

            let db = this.config;
            if (db.currUser == null) {

                //db.currUser = new User(-1, "Test, "INSPECTOR");
                if (this.mgr.users.getAll().length == 0) {
                    return User.makeNullUser();
                }

                let userKey = Config.APP_ID + '-user';
                let authKey = Config.APP_ID + '-basic-auth';

                if (this.$localStorage[userKey] && this.$localStorage[authKey]) {
                    let old = this.$localStorage[userKey];
                    //db.currUser = new User(old.Id, old.Name);
                    db.currUser = this.mgr.users.getByKey(old);
                    if (!db.currUser) {
                        console.warn('failed curr user: ' + old);

                    }

                    this.Api.$http.defaults.headers.common['Authorization'] = this.$localStorage[authKey];
                    console.info('pick user from local-storage: user: + ' + db.currUser.Name + ", auth: " + this.$localStorage[authKey]);

                } else {
                    //db.currUser = new User(-1, "Test");
                    this.Api.$http.defaults.headers.common['Authorization'] = null
                }
            }

            if (!db.currUser) {
                return User.makeNullUser();
            }

            return db.currUser;

        };

        // getCurrUser(): User {
        //
        //     let db = this.config;
        //     if (db.currUser == null) {
        //
        //         //db.currUser = new User(-1, "Test", "INSPECTOR");
        //
        //
        //         // if ( (!this.config.isPhone) && this.$localStorage.smktUser && this.$localStorage.smktUserBasicAuth) {
        //         if (this.$localStorage.smktUser && this.$localStorage.smktUserBasicAuth) {
        //             let old = this.$localStorage.smktUser;
        //             db.currUser = new User(old.Id, old.Name, old.Name_E, old.Role, old.Status);
        //
        //             this.Api.$http.defaults.headers.common['Authorization'] = this.$localStorage.smktUserBasicAuth;
        //
        //
        //             console.info('pick user from local-storage: user: + ' + db.currUser.Name + ", auth: " + this.$localStorage.smktUserBasicAuth);
        //
        //         } else {
        //             db.currUser = new User(-1, "Test", "Test-E", "INSPECTOR", '');
        //             this.Api.$http.defaults.headers.common['Authorization'] = null
        //         }
        //     }
        //     return db.currUser;
        //
        // };


        isUserLoggedIn(): boolean {
            let u = this.getCurrUser();
            return u !== null && u.Id >= 0;

        };

        isMissingInApprove(template: Template): boolean {

            if (!template.isActive() || !template.isEnabled(this.config.getConfigMonth())) {
                return false
            }

            // if it's not current month, ignore it
            if (!this.config.isConfigDateSameAsActual()) {
                return false;
            }

            return this.approveMgr.getApprove(template.OutletCode, template.ItemCode) == null;
        }

        isDataUploadNeeded(): boolean {


            let files: string[] = this.getAllImageFileWaitingForUpload();

            if (files != null && files.length > 0) {
                return true;
            }

            if (this.tmpStore.getAll().length > 0) {
                return true;
            }

            let myTasks = this.getMyTasks();

            for (let i = 0; i < myTasks.length; i++) {
                let t = myTasks[i];
                if (t._dirty) {
                    return true;
                }
            }

            return false;

        };

        onExitWithoutLogoff(): void {

            if (this.getAllDirtyTasks().length > 0) {
                alert(' 請先上傳數據.');
                return;
            } else {

                let msg = 'exit: ' + this.getCurrUser().Name + ', ' + this.config.getTimeDuration() + (this.config.isPhone ? '' : ' (web!)');
                this.doLogServerMsg(msg).then(r => {
                    NativeApp.doDisplayAndShutdown();
                });

            }

        }


        doLogout(): boolean {

            if (this.getCurrUser().isInspector()) {
                if (this.isDataUploadNeeded()) {

                    let msg = '無法登出, 請先上傳數據 !';
                    this.UiInfo(msg);

                    alert(msg);

                    let data = this.config;

                    data.numTryLogout++;
                    if (data.numTryLogout >= 10) {
                        data.numTryLogout = 0;
                        if (confirm('你要 刪除數據 並 登出 嗎？')) {

                            let msg = 'forced delete and logout!!!';
                            this.doLogServerMsg(msg);
                            this.doDiscardAllLocal();
                        }
                    }

                    console.info('num try: ' + data.numTryLogout);

                    return false;
                } else {
                    // this.setIsCheckedOut(false);
                    //this.setConfigYearMonth(null, null);
                }
            }

            let msg = 'logout: ' + this.getCurrUser().Name + ', ' + this.config.getTimeDuration() + (this.config.isPhone ? '' : ' (web!)');

            this.doLogServerMsg(msg).then(res => {

                    this.config.setCurrUser(null, null);
                    if (this.isPhone()) {


                        this.resetTestInPhone();

                        // delay the native-app shutdown so that JS vm has time to clean up
                        this.$timeout(() => {
                            NativeApp.doDisplayAndShutdown();

                        }, 1000) // 1 second

                    }

                }
            );


            this.config.setCurrUser(null, null);
            this.$location.path('user');
            return true;
        };

        doForceLogout(): void {

            if (!confirm('Are you sure to Force Logout?')) {
                return;
            }

            let msg = 'force logout: ' + this.getCurrUser().Name + ', ' + this.config.getTimeDuration();

            this.doLogServerMsg(msg).then(res => {

                    this.config.setCurrUser(null, null);
                    if (this.isPhone()) {

                        // delay the native-app shutdown so that JS vm has time to clean up
                        this.$timeout(() => {
                            NativeApp.doDisplayAndShutdown();

                        }, 1000) // 1 second

                    }

                }
            );

            this.config.setCurrUser(null, null);
            this.$location.path('user');
        }

        isDev(): boolean {
            return this.config.isDev;
        }


        showData(): void {
            console.info('smktDb: ' + JSON.stringify(this.config));

        };

        getMyTasks(): Task[] {

            return Task.getAll();

        };

        getAllApproves() {
            return this.approveMgr.approves.getAll();
            // return Approve.getAll();
        };


        getAllDirtyTasks(): Task[] {
            let dirties: Task[] = [];
            let myTasks = this.getMyTasks();
            for (let i = 0; i < myTasks.length; i++) {
                let t = myTasks[i];
                if (t._dirty) {
                    dirties.push(t);
                }
            }
            return dirties;
        };


        onUpdateTask(task: Task): void {

            task._dirty = true;
            // task.prepareSave(); called inside save
            this.tmpStore.save(task);

        }


        // doUpdateTask(task: Task): ng.IPromise<any> {
        //
        //     if (!task || !task._dirty) {
        //         return this.$q.reject('task null or not dirty.. : ' + task);
        //     }
        //
        //     task.prepareSave();
        //
        //     return this.Api.httpSyncTasks(this.getCurrUserId(), [task]).then((res) => {
        //
        //         task._dirty = false;
        //         this.tmpStore.clearById(task.Id);
        //
        //     }).catch((err) => {
        //         console.info(' updated task failed ! ' + task.Id + ', putting tmp local-storage');
        //         this.tmpStore.save(task);
        //         return this.$q.reject(err);
        //     });
        //
        // }


        doTryMatchAllFileXs(): void {

            let names = this.getAllImageFileWaitingForUpload();
            if (this.isPhone() && names.length > 0) {
                alert('Please upload all image files first....');
                return;
            }

            let count = 0;
            for (const task of this.getMyTasks()) {
                for (const tlet of task.getTasklets()) {
                    for (const fx of tlet.getFileXs()) {
                        if (!fx.isUploaded()) {
                            this.fileMgr.tryMapFileNameToId(fx.fileName);
                            count++;
                        }
                    }
                }
            }

            let msg = ' doTryMatchAllFileXs fixed # ' + count;
            console.info(msg);
            if (count > 0) {
                this.doLogServerMsg(msg);
            }
        }


        maybeSyncTasks(): void {

            // skip delayed task sync, only manual sync from now on....

            return;

            // if (this.getAllDirtyTasks().length > 0) {
            //     // this.saveTaskToTmp();
            //
            //     this.networkMgr.onDelayedSyncTasks();
            // }
        }

        // saveTaskToTmp() : void {
        //     let  dirties = this.getAllDirtyTasks();
        //     for (const task of dirties) {
        //         this.tmpStore.save(task);
        //     }
        // }


        doSyncTasks(tasks?: Task[], isLock?: boolean): ng.IPromise<any> {

            let userId = this.getCurrUser().Id;

            let dirties = tasks;
            let isFromTmp = false;
            isLock = !!(isLock);  // undefined to boolean

            if (!dirties) {
                dirties = this.getAllDirtyTasks();
            } else {
                isFromTmp = !isLock;
            }

            let that = this;

            if (dirties.length > 0) {

                console.info('sync tasks... # ' + dirties.length);

                for (let i = 0; i < dirties.length; i++) {
                    let task: Task = dirties[i];
                    task.prepareSave();
                }



                return this.Api.httpSyncTasks(userId, dirties).then(res => {

                    let ids: [] = res.data.IDs;
                    let updatedButNotFoundIds = [];
                    let idCleared: [] = [];
                    console.info('updated IDs: ' + JSON.stringify(ids));
                    for (const id of ids) {

                        //this.getTask
                        let task = Task.getTaskById(id);
                        if (!task) {
                            updatedButNotFoundIds.push(id);

                        } else {
                            task._dirty = false;
                            // that.tmpStore.clearById(task.Id);
                        }

                        that.tmpStore.clearById(id);
                        idCleared.push(id);
                    }


                    if (ids.length == 0) {
                        let first = dirties[0];
                        let msg = 'error, ids == 0, dirties: ' + dirties.length + ', 1st: ' + first.Id + ' | ' + first;
                        this.doLogServerMsg(msg);
                    }

                    that.tmpStore.listUpdated();

                    let msg = ' ' + ids.length + ', tmp: ' + that.tmpStore.getAll().length + ', tmp cleared #' + idCleared.length + ': ' + idCleared;

                    if (updatedButNotFoundIds.length > 0) {

                        let prefix =
                            ' Update others id : ' + JSON.stringify(updatedButNotFoundIds) + ': ';
                        msg = prefix + msg;

                        console.warn(msg);
                        this.doLogServerMsg(msg);

                    } else {

                        // let msg = ' ' + ids.length + ', tmp: ' + that.tmpStore.getAll().length + ', tmp cleared #' + idCleared.length + ': ' + idCleared;

                        if (dirties.length == 1) {
                            let task = dirties[0];
                            let msg2 = ', ' + task.OutletCode + ':' + task.ItemCode + '| ' + this.getOutletName(task.OutletCode) + ':' + this.getItemName(task.ItemCode);
                            msg += msg2;
                        }


                        let prefix = ' Sync tasks: ';
                        if (isLock) {
                            prefix = ' Lock tasks: ';
                        } else if (isFromTmp) {
                            prefix = ' Recover TmpStore:';
                        }

                        msg = prefix + msg;
                        console.info(msg);
                        this.doLogServerMsg(msg);


                    }

                    // update infolets
                    this.infoletMgr.doUploadAll();


                }).catch((err) => {


                    let msg = 'isFromTmp:' + isFromTmp + ', updated task failed # ' + dirties.length + ', err:' + JSON.stringify(err);

                    console.info(msg);
                    this.doLogServerMsg(msg);

                    return this.$q.reject(err);
                });
            } else {

                if (this.config.isPhone) {
                    let msg = 'sync: both tmp or dirties are empty, skipped !';
                    this.doLogServerMsg(msg);
                }
                return this.$q.resolve();
            }
        };

        doUpdateApproveRefPrice(ap: Approve): ng.IPromise<any> {

            let userId = this.getCurrUser().Id;

            return this.api.httpUpdateApproveRefPrice(userId, ap).then(res => {
                ap._dirty = false;


                let msg = 'update RefPrice ' + ap.OutletCode + ':' + ap.ItemCode + ': ' + ap.RefYear + '-' + ap.RefMonth + ' $' + ap.LastPrice;
                this.doLogServerMsg(msg);

            });
        }

        doTestUpdateAll(): void {

            if (!(this.config.getConfigYear() < 2018 && ((this.getCurrUser().Id == 6)))) {
                alert(' doTestUpdateAll not allowed !! ');
                return;
            }

            let tasks = this.getMyTasks();
            let i = 1;
            for (const task of tasks) {
                let tlets = task.getTasklets();

                for (const tlet of tlets) {
                    tlet.Price = i++;
                }

                this.onUpdateTask(task);
            }
        }

        doUpdateApprove(approve: Approve): ng.IPromise<any> {

            if (!approve._dirty) {
                return this.$q.resolve();
            }

            approve.prepareSave();


            let userId = this.getCurrUserId();

            // let isNeedRefresh = false;
            // check if it's substitution
            if (approve.isSubstitutionOther()) {

                let otherSubOutletCode = approve.SubstituteOutletCode;
                let otherSubed = this.approveMgr.approves.getByKey(Approve.makeKey(approve.SubstituteOutletCode, approve.ItemCode));

                this.approveMgr.markApproveSubsMap(approve);

                if (approve.OutletCode == approve.SubstituteOutletCode) {

                    alert('替代/ 被替代 商品 不能相同!');
                    approve.CollectMethod = '';
                } else if (!otherSubed) {

                    alert('被替代 商品 不存在 ... outlet: ' + approve.SubstituteOutletCode + ', item:' + approve.ItemCode);
                    approve.CollectMethod = '';

                } else {

                    if (otherSubed.CollectMethod != 'W') {

                        let outletName = this.getOutletName(otherSubed.OutletCode);
                        let itemName = this.getItemName(otherSubed.ItemCode);
                        let msg = '你確定要 將 \n ' + outletName + ':' + itemName + '\n    改成 被替代 W \n' +
                            '  和 停用　計劃樣本　內該商品　 嗎? ';

                        if (confirm(msg)) {
                            otherSubed.CollectMethod = 'W';
                            otherSubed.onChange();
                            this.Api.httpApprove(userId, otherSubed).then(res => {
                                otherSubed._dirty = false
                            });

                            let template = this.templateMgr.get(otherSubed.OutletCode, otherSubed.ItemCode);
                            if (template && template.isActive()) {


                                template.Status = 0;
                                template.onChange();

                                this.Api.httpSaveTemplate(userId, template).then(res => template._dirty = false);
                                let msg = '商品 被替代 , 停用 樣本 ' + otherSubed.OutletCode + ':' + otherSubed.ItemCode + '| ' + outletName + ':' + itemName;
                                this.doLogServerMsg(msg);
                            }
                        }
                    }
                }
            }


            // check if it's delete 'X'

            if (approve.CollectMethod == 'X') {
                let t = this.templateMgr.get(approve.OutletCode, approve.ItemCode);
                if (t.isActive()) {

                    let outletName = this.getOutletName(t.OutletCode);
                    let itemName = this.getItemName(t.ItemCode);
                    let msg = '你確定要 將 \n ' + outletName + ':' + itemName + '　計劃樣本 停用 嗎? ';
                    if (confirm(msg)) {

                        t.Status = 0;
                        t.onChange();

                        this.Api.httpSaveTemplate(userId, t).then(res => t._dirty = false);
                        let msg = '商品 (CollectMethod == X)  樣本被停用: ' + t.OutletCode + ':' + t.ItemCode + '| ' + outletName + ':' + itemName;
                        this.doLogServerMsg(msg);
                    }
                }
            }

            return this.Api.httpApprove(userId, approve).then(res => {

                let data = res.data;
                approve.Status = data.approve.Status;
                approve._dirty = false;

                if (approve.isSubstitutionOther()) {
                    this.refreshView()
                }


                // clear status and rebuild..
                this.approveStatusesHolder = null;
            });

        };

        doRemoveOwner(u, outletCode) {
            let that = this;
            let name = u.Name;
            let shopName = this.getOutletName(outletCode);
            if (confirm('Remove inspector ' + name + ' @ ' + shopName)) {

                return this.Api.httpRemoveOwner(u.Id, outletCode).then(data => {
                    if (data) {
                        let outlet: Outlet = that.getOutlet(outletCode);
                        let owners = outlet._owners;
                        let idx = owners.indexOf(u);
                        if (idx > -1) {
                            owners.splice(idx, 1);
                            that.UiInfo('Owner :' + name + ' removed');
                        } else {
                            that.UiError('Owner :' + name + ' cannot be removed');
                        }
                    } else {
                        console.info('data : ' + data);
                    }
                });
            }
            // return this.$q.resolve();
        };

        doAddOwner(u, outletCode): ng.IPromise<any> {
            let that = this;

            if (u.isInspector()) {
                return this.Api.httpAddOwner(u.Id,
                    outletCode).then(res => {
                    let owners = that.getTemplateOutletOwners(outletCode);
                    owners.push(u);
                })
            } else {
                let msg = 'Cannot add user: ' + u;
                that.UiError(msg);

                return this.$q.reject(msg);
            }
        }
        ;


        doAddTasksForUser(newOwner, year, month, outletCode, itemCodes): void {

            let that = this;
            let countTxt = itemCodes == null ? 'All' : itemCodes.length;

            if (!newOwner.isInspector()) {
                this.UiError('only Inspector can be assign to task');
            } else {
                let currUserId = this.getCurrUser().Id;
                let targetUserId = newOwner.Id;
                this.Api.httpAddTasksForUser(currUserId,
                    year, month, targetUserId, outletCode, itemCodes).then(res => {
                });
            }
        }


        doUpdateTemplate(template: Template): ng.IPromise<any> {

            let msg = 'update template: ' + template.OutletCode + ':' + template.ItemCode
                + ' | ' + this.getOutletName(template.OutletCode) + ':' + this.getItemName(template.ItemCode);



            template.prepareSave();

            let diff = template.getDiff();
            console.info('template diff: '+ diff);

            this.doLogServerMsg(msg);

            return this.Api.httpSaveTemplate(this.getCurrUser().Id, template).then((data) => {
                template._dirty = false;

            });
        }

        doDiscardAllLocal() {
            if (!confirm('are you sure to discard all changes??')) {
                return;
            }

            this.clearAllData();
        }        ;


        doText2Tasklet(template, moveAll) {
            let that = this;

            function moveOne(template) {

                template.text2Tasklet();
            }


            if (moveAll) {
                this.UiInfo('moving all');
                let all = this.getAllTemplates();
                for (let i = 0; i < all.length; i++) {
                    moveOne(all[i])
                }

            } else {
                moveOne(template);
            }

        }
        ;

        encodeTasklet(tlet) {
            let res = tlet.Name + ' [@' + tlet.Qty + '/' + this.unitTypeMgr.getUnitName(tlet.Unit) + ']';
            return res;
        }
        ;

        decodeTasklet(str) {
            let name = 'N/A';
            let qty = 0;
            let unit = '0';

            let idx = str.indexOf('[@');
            if (idx > 0) {
                name = str.substr(0, idx);

                let subNode = str.substr(idx + 2, str.length - (idx + 2) - 1);   // remove leading '@['  and ending ']'
                let idxQty = subNode.indexOf('/');
                qty = parseInt(subNode.substr(0, idxQty));
                let unitName = subNode.substr(idxQty + 1, subNode.length - (idxQty + 1));
                let ut = UnitType.getByName(unitName);
                unit = ut.Code;
                //unit = this.getUnitByName(unitName);
            }

            return {Name: name, Qty: qty, Unit: unit};

        }
        ;


        //
        // doTasklet2Text  (template, moveAll) {
        //     let that = this;
        //
        //     function moveOne(template) {
        //
        //         let tlets = that.getTemplateTasklets(template);
        //         let sp = ';';
        //         let txt = '';
        //
        //         for (let i = 0; i < tlets.length; i++) {
        //             txt += tlets[i].Name + '; \n';
        //         }
        //         template.TaskletsText = txt;
        //         template._dirty = true;
        //     }
        //
        //
        //     if (moveAll) {
        //
        //         this.UiInfo('moving all');
        //
        //         let all = this.doGetTemplates();
        //         for (let i = 0; i < all.length; i++) {
        //             moveOne(all[i])
        //         }
        //
        //     } else {
        //         moveOne(template);
        //     }
        //
        // };

        saveAllTemplates() {

            if (!this.getCurrUser().isAdmin()) {
                this.UiInfo('Only for Admin');

            }

            // if (true) {
            //     this.UiInfo('Disabled for now');
            //     return;
            // }

            let all = this.templateMgr.templates.getAll();
            for (let i = 0; i < all.length; i++) {
                this.doUpdateTemplate(all[i]);
                console.info(' updated : ' + all[i].Id);
            }

        }
        ;

        getStatusName(status) {

            let statusMap = {
                INIT: "待辦"
                , CHECKED_OUT: "已下載"
                , CHECKED_IN: "已收集"
                , APPROVED: "已審批"
                //, DONE: "已完成"
                , TOTAL: '總數'
                , CPI_READY: '已完成'
            };

            return statusMap[status] || status;
        }
        ;


        trySelectTasklet(approve, tlet) {


            if (tlet.Price && tlet.Qty && tlet.Unit) {

                let init_val = 0;

                if (approve._isPlusEnabled) {
                    init_val = approve.ApprovePrice || 0;
                }


                //approve.ApprovePrice = init_val + parseFloat((tlet.Price % 10000).toFixed(2));
                approve.ApprovePrice = init_val + parseFloat((tlet.Price).toFixed(4));
                approve.ApproveQty = tlet.Qty;
                approve.ApproveUnit = tlet.Unit;
                approve._dirty = true;

                return true
            } else {
                return false;
            }

        }
        ;


        doAutoSelectAll(approves: Approve[]) {

            let db = this;

            angular.forEach(approves, function (ap: Approve) {

                if (ap.isApproved() || !Helper.isBlank(ap.CollectMethod)) {
                    return;
                }

                let tasks = ap.getTasks();
                for (let i = 0; i < tasks.length; i++) {
                    let task = tasks[i];

                    let tasklets = task.getTasklets();
                    for (let j = 0; j < tasklets.length; j++) {
                        let tlet = tasklets[j];

                        if (db.trySelectTasklet(ap, tlet)) {
                            break;
                        }
                    }
                }
            });
        }
        ;

        doAdminApproveAll(approves) {

            let db = this;

            if (!this.getCurrUser().isAdmin()) {
                alert('only Admin can do this.');
                return;
            }


            if (confirm('Are you sure you want to Approve all in this store?')) {

                if (!approves || approves.length === 0) {
                    approves = db.getAllApproves();
                }

                this.autoFill();
                this.doAutoSelectAll(approves);


                angular.forEach(approves, function (ap) {
                    db.doUpdateApprove(ap);
                })
            }
        }
        ;


        getTaskStatusName(task) {
            return this.getStatusName(task.Status);
        }
        ;

        getMyTasksNumTotal() {
            let tasks = this.getMyTasks();
            return tasks.length;
        }
        ;

        getMyTasksNumDone() {

            let count = 0;
            let tasks = this.getMyTasks();
            for (let i = 0; i < tasks.length; i++) {
                let t = tasks[i];
                if (t.isTaskDoneCollect()) {
                    count++;
                }

            }
            return count;

        }
        ;


        toggleSideNav(): void {
            this.$mdSidenav('left').toggle();
        }

        goToTemplate(outletCode: string, itemCode: string): void {

            let url = '/template/' + outletCode;

            this.$location.path(url);
            this.$location.hash(itemCode);
        }

        getPageHash(): string {
            return this.$location.hash();
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

        goToTask(outletCode: string, itemCode: string): void {

            let url = '/task/simple/' + outletCode;

            this.$location.path(url);

            // disabled hash since the sorting of task-list changed (finished went to bottom of page)
            if (itemCode) {
                this.$location.hash(itemCode);
            }

            console.info('goToTask item: ' + itemCode);
        }

        goToTmpStore(): void {
            this.goTo('/task/localstorage');
        }

        goToMyTaskPage(): void {
            this.goTo('/task/my');

        }

        goToSimple(outletCode: string): void {
            this.goTo('/task/simple/' + outletCode);
        }

        goToPhotoPack(): void {
            this.goTo('/task/photopack');
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

            this.$mdSidenav('left').close();

        }


        getAllTemplates(): Template[] {
            return this.templateMgr.templates.getAll();
        }

        getActiveTemplates(): Template[] {

            let res = [];
            let all: Template[] = this.getAllTemplates();
            for (let i = 0; i < all.length; i++) {
                let t = all[i];
                if (t.Status == 1) {
                    res.push(t)
                }

            }

            return res;
        }


        downloadFile() {

            let url = this.Api.makeUrl('file/1');
            this.$http.get(url);

        }

        doSelectFileForUpload(task: Task, tlet: Tasklet, file) {


            this.fileMgr.uploadFile(task, tlet, file);
        }

        showPhotoById(id: number) {

            let file = FileX.fromJson({});
            file.Id = id;

            this.showPhoto(file);
        }

        showPhoto(file: FileX) {

            // this.$mdDialog.alert()

            let baseDir = this.Api.getBaseURL();

            let fullUrl = file.getUrl(this, baseDir);


            console.info('image url: ' + fullUrl);

            let vm = {
                // baseDir: this.Api.getBaseURL(),
                // file: file,

                photoURL: fullUrl
            };


            let controller = function ($scope, $mdDialog) {
                console.info('inside showPhoto controller.. file: ' + JSON.stringify(file));

                $scope.svr = this.vr;
                $scope.vm = vm;

                $scope.cancel = function () {
                    $mdDialog.cancel()

                };

                $scope.ok = function () {
                    $mdDialog.cancel();
                }

            };


            this.$mdDialog.show({
                templateUrl: "./src/view/part/photo.html",
                // @ts-ignore
                multiple: true,
                clickOutsideToClose: true,
                // targetEvent: ev,
                controller: controller,
            })


        }

        doUpdateUpc(upc: Upc) {

            upc.prepareSave();

            return this.Api.httpUpdateUpc(this.getCurrUserId(), upc).then((data) => {
                upc._dirty = false;
            });

        }

        doUpdateOutletStatus(oi: OutletStatus) {
            // oi.prepareSave();

            return this.Api.httpUpdateOutletStatus(this.getCurrUserId(), oi).then((data) => {

                oi._dirty = false;

                let msg = '檢: ' + oi.Check1 + ':' + oi.Check2 + ' | ' + this.getOutletName(oi.OutletCode);
                this.doLogServerMsg(msg);
            });
        }

        doUpdateUser(u: User) {
            return this.Api.httpUpdateUser(this.getCurrUserId(), u).then((data) => {
                u._dirty = false;
            });
        }

        doUpdateOutlet(oi: Outlet) {
            return this.Api.httpUpdateOutlet(this.getCurrUserId(), oi).then((data) => {
                oi._dirty = false;
            });
        }


        doImportTemplateToApprove(templates: Template[]) {
            // Approve.from()
            let year = this.getConfigYear();
            let month = this.getConfigMonth();
            let userId = this.getCurrUserId();

            let promises = [];
            for (const template of templates) {

                promises.push(this.Api.httpAddApproveByTemplate(userId, year, month, template));
            }


            return this.$q.all(promises).then(res => {

                let msg = 'do import template to approve, year: ' + year + ', month: ' + month + ', templates: ' + templates.length;

                let codeNames = '';
                for (const t of templates) {
                    codeNames += ',' + t.OutletCode + ':' + t.ItemCode + '| ' + this.getOutletName(t.OutletCode) + ':' + this.getItemName(t.ItemCode);
                }
                msg += codeNames;
                this.doLogServerMsg(msg);

                this.clearAllData();
                this.doGetInfo();


            });
        }

        doLogServerMsg(msg: string): ng.IPromise<any> {

            console.info(msg);

            return this.Api.httpLog(this.getCurrUserId(), msg);
        }

        doTestError(): void {
            console.info('do test error ....');

            let obj = null;
            // console.info(' should not reach: ' + obj.msg);

            let msg = "abc: 'prop', line :458 ";
            this.doLogServerMsg(msg);
        }

        doGetFileXByFileName(filename: string): ng.IPromise<any> {

            let idx = filename.indexOf('.');
            if (idx > 0) {
                filename = filename.substr(0, idx);
                console.info('shortened file name to : ' + filename);
            }

            return this.Api.httpGetFileXByFileName(filename);
        }

        onClearAllOwners(): ng.IPromise<any> {

            if (confirm('Are you sure to clear all owners?')) {

                let msg = 'Clearing all owners!';
                this.doLogServerMsg(msg);

                return this.api.doClearAllOwners();
            } else {
                return this.$q.reject('Cancelled');
            }
        }

        // {year}/{month}
        doGetInfoletTaskStats() : ng.IPromise<any> {

            this.config.getConfigYear();
            return this.Api.httpGettInfolets(Infolet.TYPE_TASK_STATS, -1, -1,this.config.getConfigYear(), this.config.getConfigMonth() )

        }


        // ================ test ==============

        onTestOk(): void {

            this.Api.httpPostTestOk().then(res => {
                console.info(' onTestNormal().then()  called. ');
            }).catch(reason => {
                console.info(' onTestNormal().catch()  called. ');
                return this.$q.reject(reason);
            }).finally(() => {
                console.info(' onTestNormal().finally()  called. ');
            })
        }

        onTest1Fail(): ng.IPromise<any> {
            return this.Api.httpPostTestFail().then(res => {
                console.info(' onTest1Fail().then()  called. ');
            }).catch(reason => {
                console.info(' onTest1Fail().catch()  called.  reason : ' + JSON.stringify(reason));
                return this.$q.reject(reason);

            }).finally(() => {
                console.info(' onTest1Fail().finally()  called. ');
            })

        }

        onTest12Fail(): ng.IPromise<any> {
            return this.onTest1Fail().then(res => {
                console.info(' onTest12Fail().then()  called. ');
            }).catch(reason => {
                console.info(' onTest12Fail().catch()  called.  reason: ' + JSON.stringify(reason));
                return this.$q.reject(reason);
            }).finally(() => {
                console.info(' onTest12Fail().finally()  called. ');
            })

        }



        // ================ admin ============
        // ====================== generic do ======================
        doBackupAll() {
            let res = this.Api.httpPostBackupAll().then(res => {

                let msg = 'backupAll res: ' + JSON.stringify(res);
                console.info(msg);
                this.doLogServerMsg(msg);
            });
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
                this._baseURL = 'https://www.dsec.gov.mo/CPIApi/api/smkt/';

                if (this.isDev() && (!this.svr.isPhone())) {

                    // this._baseURL = 'http://localhost:5001/CPIApi/api/smkt/';
                    // this._baseURL = 'http://pc16062:5001/CPIApi/api/smkt/';


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


        httpRemoveOwner(userId: number, outletCode: string): ng.IPromise<any> {

            const url = this.makeUrl('template/owner/' + userId + '/' + outletCode);
            return this.makeHttpDelete(url, null);

        }


        httpAddOwner(userId: number, outletCode: string): ng.IPromise<any> {
            const url = this.makeUrl('template/owner/' + userId + '/' + outletCode);
            return this.makeHttpPut(url, null, null);

        }

        httpSaveTemplate(userId: number, template: Template) {


            let url = this.makeUrl('template/' + userId);

            if (this.svr.config.ItemCodeTerm == 0 && this.svr.getConfigMonth() <= 10 && this.svr.getConfigYear() <= 2019) {
                url = this.makeUrl('template/updateOldTerm0/' + userId);
                console.info('updating old term0 template ! : ' + template.Id + ' ' + template.OutletCode + ':' + template.ItemCode);
            }

            return this.makeHttpPost(url, template, null);

        }

        httpDeleteTasksFor(userId: number, targetYear: number, targetMonth: number) {
            let url = this.makeUrl('task/' + userId + "/" + targetYear + "/" + targetMonth);
            return this.makeHttpDelete(url, null);
        }

        httpApprove(userId: number, approve: Approve) {
            let url = this.makeUrl('task/approve/' + userId);
            return this.makeHttpPost(url, approve, null);
        }

        httpUpdateApproveRefPrice(userId: number, approve: Approve) {
            let url = this.makeUrl('approve/refprice/' + userId);
            return this.makeHttpPost(url, approve, null);
        }


        // httpCheckOut(userId: number, year: number, month: number) {
        //     let url = this.makeUrl('task/my/checkout/' + userId + '/' + year + '/' + month);
        //     return this.makeHttpPost(url, null, null);
        //
        // }

        httpSyncTasks(userId: number, dirties: Task[]): ng.IPromise<any> {


            if (this.svr.networkMgr.isTimeToRetry()) {

                let url = this.makeUrl('task/my/sync/' + userId);
                return this.makeHttpPost(url, dirties, null);
            } else {

                let msg = ' !isTimeToRetry, skipping sync for now.... ';
                console.info(msg);
                return this.$q.reject(msg);
            }
        }

        // httpCheckIn(userId: number, myTasks: Task[]) {
        //     let url = this.makeUrl('task/my/checkin/' + userId);
        //     return this.makeHttpPost(url, myTasks, null);
        //
        // }

        httpFreezeAndCalc(userId: number, year: number, month: number): ng.IPromise<any> {
            let url = this.makeUrl('plan/freeze/' + userId + "/" + year + "/" + month);
            return this.makeHttpPost(url, null, null);

        }

        httpAddTasksForUser(userId: number, year: number, month: number, targetUserId: number, outletCode: string, itemCodes: string[]) {

            let isOldTerm0 = this.svr.config.ItemCodeTerm == 0;
            let url = this.makeUrl('task/add/' + userId + "/" + year + "/" + month + "/" + targetUserId + '/' + outletCode);

            if (isOldTerm0) {
                url = this.makeUrl('task/oldterm0/add/' + userId + "/" + year + "/" + month + "/" + targetUserId + '/' + outletCode);

                let msg = 'addTasks : ' + url;
                console.info(msg);
                this.svr.doLogServerMsg(msg);

            }
            return this.makeHttpPut(url, itemCodes, null);
        }

        httpPostLogin(user: User, passwd: string): ng.IPromise<any> {
            let url = this.makeUrl('user/login/' + user.Id);
            return this.makeHttpPost(url, passwd, null);
        }

        httpPostLogout(user: User): ng.IPromise<any> {
            let url = this.makeUrl('user/logout/' + user.Id);
            return this.makeHttpPost(url, null, null);
        }


        httpUpdateUpc(userId: number, upc: Upc): ng.IPromise<any> {
            let url = this.makeUrl('upc/' + userId);
            return this.makeHttpPost(url, upc, null);
        }

        httpUpdateOutletStatus(userId: number, oi: OutletStatus): ng.IPromise<any> {
            let url = this.makeUrl('task/outletStatus/' + userId);
            return this.makeHttpPost(url, oi, null);
        }


        httpUpdateUser(userId: number, u: User): ng.IPromise<any> {
            let url = this.makeUrl('misc/user/update/' + userId);
            return this.makeHttpPost(url, u, null);
        }

        httpUpdateOutlet(userId: number, oi: Outlet): ng.IPromise<any> {
            let url = this.makeUrl('misc/outlet/update/' + userId);
            return this.makeHttpPost(url, oi, null);
        }


        httpAddApproveByTemplate(userId: number, year: number, month: number, template: Template): ng.IPromise<any> {
            let url = this.makeUrl('task/approve/import/templates/' + userId + '/' + year + '/' + month);
            return this.makeHttpPut(url, template, null);
        }

        httpLog(userId: number, msg: string): ng.IPromise<any> {
            let url = this.makeUrl('misc/log/' + userId);

            // msg = msg.replace("'", "`");
            msg = msg.replace(/\'/g, '`');
            let quotedMsg = "'" + msg + "'";
            return this.makeHttpPut(url, quotedMsg, null);
        }


        httpGetFileXByFileName(filename: string): ng.IPromise<any> {
            let url = this.makeUrl('file/lookupByFileName/' + filename);
            return this.makeHttpGet(url);
        }

        httpGetLastPrices(year: number, month: number): ng.IPromise<any> {
            let url = this.makeUrl('info/lastprice/' + year + "/" + month);
            return this.makeHttpGet(url);
        }


        doClearAllOwners(): ng.IPromise<any> {
            //httpClearAllOwners(userId: number): ng.IPromise<any> {
            let userId = this.svr.getCurrUserId();
            let url = this.makeUrl('template/owner/clearAll/' + userId);
            return this.makeHttpDelete(url, null);
        }


        httpPostTestOk(): ng.IPromise<any> {
            let url = this.makeUrl('test/ok');
            return this.makeHttpPost(url, null, null);
        }

        httpPostTestFail(): ng.IPromise<any> {
            let url = this.makeUrl('test/fail');
            return this.makeHttpPost(url, null, null);
        }

        httpGetPriceCompare(): ng.IPromise<any> {
            let year = this.svr.getConfigYear();
            let month = this.svr.getConfigMonth();

            let url = this.makeUrl('report/compare_last_price/' + year + '/' + month);
            return this.makeHttpGet(url);
        }

        httpPostInfolets(userId: number, infolets: Infolet[]): ng.IPromise<any> {
            let url = this.makeUrl('misc/infolet/sync/' + userId);
            return this.makeHttpPost(url, infolets, null);
        }

        //[Route("misc/infolet/{type}/{linkId}/{by}/{year}/{month}")]
        httpGettInfolets(type: number, linkId: number, by: number, year: number, month: number): ng.IPromise<any> {
            let url = this.makeUrl('misc/infolet/' + type + '/' + linkId + '/' + by + '/' + year + '/' + month );
            return this.makeHttpGet(url);
        }


        // =======   admin ========
        httpGetLogs(by: number, max: number, host: string): ng.IPromise<any> {

            let last = 'misc/log/' + by;
            let url = this.makeUrl(last);
            if (!Helper.isBlank(host)) {

                url = host + last;

            }

            console.info(' getting logs from : ' + url);
            return this.makeHttpGet(url);
        }


        httpPostBackupAll(): ng.IPromise<any> {

            let url = this.makeUrl('misc/backupAll');
            return this.makeHttpPost(url, null, null);
        }


    }


// native

}