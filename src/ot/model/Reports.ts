// declare var Document: any;
declare var docx: any;
// declare var Document: any;
declare var Media: any;

declare var Paragraph: any;
declare var Packer: any;
declare var TextRun: any;

declare var header_image: any;
declare var Table: any;
declare var WidthType: any;
declare var PageMargin: any;
declare var saveAs: any;

module MyApp {


    export class ReportMgr {

        svr: DbService;

        constructor(svr: DbService) {
            this.svr = svr;
        }

        public makePhotoIdReport() {


            let templateMap: {};
            let yearMap: { [year_month: string]: any };
            let idMap: { [photoId: number]: number } = {}; // photoId/count map

        }

        public makeRefPriceXReport() {

            let refPrices: Cache<RefPriceX> = new Cache<RefPriceX>();
            let refPriceFallbacks: Cache<RefPriceFallback> = new Cache<RefPriceFallback>();

            this.svr.Api.httpGetPriceCompare().then(res => {


                refPrices.init(RefPriceX.name, RefPriceX.fromJson, res.data.RefPrice);
                refPriceFallbacks.init(RefPriceFallback.name, RefPriceFallback.fromJson, res.data.RefFallback);
                refPrices.doSort((a: RefPriceX, b: RefPriceX) => {

                    // return a.ItemCode.localeCompare(b.ItemCode);

                    return (a.ItemCode + a.OutletCode).localeCompare(b.ItemCode + b.OutletCode);

                });

                let fbs = refPriceFallbacks.getAll();
                for (const fb of fbs) {

                    let rp = refPrices.getByKey(fb.getKey());


                    rp.RefPrice = fb.Price;
                    rp.RefQty = fb.Qty;
                    rp.RefUnit = fb.Unit;
                    rp.RefMonth = 0;
                    rp.RefYear = 0;
                    rp.CollectMethod = '**'
                }

                // fbs = fbs.sort((a, b) => {
                //
                //     return a.ItemCode.localeCompare(b.ItemCode);
                //
                //     //return  (a.ItemCode + a.OutletCode).localeCompare(b.ItemCode + b.OutletCode);
                //    // if(a.ItemCode != b.ItemCode) {
                //    //     return a.ItemCode.localeCompare(b.ItemCode);
                //    // } else  {
                //    //     return a.OutletCode.localeCompare(b.OutletCode);
                //    // }
                // });


                // 街碼,
                let col_header = '商品編號,商品或服務,商戶編號,商戶名稱,商品說明,地址,Qty ,單位編號,單位,  上月(次) 價格, $ 本月價格,變動率(%),類型, 對比月份\n';

                let sp = ',';
                let sb = [];
                let svr = this.svr;


                function makeLine(rp: RefPriceX): string {

                    // let owners = svr.getTemplateOutletOwners(o.OutletCode);
                    // let ownerName = (owners && owners[0]) ? owners[0].Name : null;
                    let o = svr.getOutlet(rp.OutletCode);
                    let itemName = svr.getItemName(rp.ItemCode);
                    let ap = svr.approveMgr.getApprove(rp.OutletCode, rp.ItemCode);
                    let ref = rp.RefYear ? rp.RefYear + '-' + rp.RefMonth + '-' + rp.RefCollectMethod : '--';


                    return CvsHelper.dash(rp.ItemCode, 4) + sp + (CvsHelper.cleanTxt(itemName))
                        + sp + CvsHelper.dash(rp.OutletCode, 4)
                        + sp + CvsHelper.valueOrNA(CvsHelper.cleanTxt(o.Name))
                        + sp + CvsHelper.cleanTxt(ap.Description)
                        + sp + CvsHelper.cleanTxt(o.Address)
                        + sp + CvsHelper.valueOrNA(rp.getQty())
                        + sp + CvsHelper.valueOrNA(rp.Unit)
                        + sp + CvsHelper.valueOrNA(rp.getUnit(svr.unitTypeMgr))
                        + sp + CvsHelper.valueOrNA(rp.RefPrice)
                        + sp + CvsHelper.valueOrNA(rp.Price)
                        + sp + CvsHelper.valueOrNA(rp.getPriceChange(svr.unitTypeMgr))
                        + sp + CvsHelper.valueOrNA(rp.CollectMethod)
                        + sp + CvsHelper.valueOrNA(ref)
                        + '\n';
                }


                sb.push(col_header);

                let refxs = refPrices.getAll();
                for (const refx of refxs) {
                    sb.push(makeLine(refx));
                }

                let str = sb.join('');
                let blob = new Blob([str], {type: "text/plain;charset=utf-8"});
                let month = svr.getConfigMonth();
                let year = svr.getConfigYear();
                let fileName = 'smkt-' + year + '-' + month + '-V06P.xls';
                saveAs(blob, fileName);


                let msg = 'report : ' + fileName;
                this.svr.doLogServerMsg(msg);

            });
        }


        public makeOutletAssignmentReport() {

            let sp = ',';
            let sb = [];
            let svr = this.svr;

            let col_header = '商品編號, 商戶 , 地址, 聯絡人, Tel,  調查員,  內部 備註 \n';

            let outlets = this.svr.getAllOutlets();


            function makeLine(o: Outlet): string {

                let owners = svr.getTemplateOutletOwners(o.OutletCode);
                let ownerName = (owners && owners[0]) ? owners[0].Name : null;


                return CvsHelper.dash(o.OutletCode, 4)
                    + sp + (CvsHelper.cleanTxt(o.Name))
                    + sp + CvsHelper.valueOrNA(CvsHelper.cleanTxt(o.Address))
                    + sp + CvsHelper.valueOrNA(CvsHelper.cleanTxt(o.Contact))
                    + sp + CvsHelper.valueOrNA(o.Tel)
                    + sp + CvsHelper.valueOrNA(ownerName)
                    + sp + CvsHelper.valueOrNA(CvsHelper.cleanTxt(o.Remark2))
                    + '\n';

            }

            sb.push(col_header);
            for (const outlet of outlets) {
                sb.push(makeLine(outlet));
            }

            let str = sb.join('');
            let blob = new Blob([str], {type: "text/plain;charset=utf-8"});
            let month = svr.getConfigMonth();
            let year = svr.getConfigYear();
            let fileName = 'smkt-' + year + '-' + month + '-assignment.xls';


            saveAs(blob, fileName);


            let msg = 'report : ' + fileName;
            this.svr.doLogServerMsg(msg);

        }

        public makePV11_12() {


            let sp = ',';
            let sb = [];
            let svr = this.svr;
            let col_header = '商品編號, 名稱 , 商戶編號, 名稱,  數量, 單位, \n';


            let templates = svr.getAllTemplates();
            let notActives = templates.filter((e) => {
                return !e.isActive();
            });
            let news = templates.filter((e) => {
                return e.getIsAddedRecently();
            });

            let empties = templates.filter((e) => {
                return e.isActive() && e.getTasklets().length === 0;
            });

            function makeLine(ap: Template): string {

                return CvsHelper.dash(ap.OutletCode, 4)
                    + sp + CvsHelper.cleanTxt(svr.getOutletName(ap.OutletCode))
                    + sp + CvsHelper.dash(ap.ItemCode, 4)
                    + sp + CvsHelper.cleanTxt(svr.getItemName(ap.ItemCode))
                    + sp + CvsHelper.valueOrNA(ap.BaseQty)
                    + sp + CvsHelper.valueOrNA('(' + ap.BaseUnit + ') ' + svr.unitTypeMgr.getUnitName(ap.BaseUnit))
                    + '\n';

            }


            sb.push('\n\n *** 新增商品 *** \n');
            sb.push(col_header);
            for (const ap of news) {
                sb.push(makeLine(ap));
            }


            sb.push('\n\n *** 空白 商品 *** \n');
            sb.push(col_header);
            for (const ap of empties) {
                sb.push(makeLine(ap));
            }

            sb.push('\n\n *** 刪除商品或服務 *** \n');
            sb.push(col_header);
            for (const ap of notActives) {
                sb.push(makeLine(ap));
            }

            let str = sb.join('');
            let blob = new Blob([str], {type: "text/plain;charset=utf-8"});
            let month = svr.getConfigMonth();
            let year = svr.getConfigYear();

            let fileName = 'smkt-' + year + '-' + month + '-PV11_12.xls';

            saveAs(blob, fileName);

            let msg = 'report : ' + fileName;
            this.svr.doLogServerMsg(msg);

        }


        public makePV01() {
            let sp = ',';
            let sb = [];
            let svr = this.svr;
            let col_header = '商戶編號, 名稱 , 商品編號, 名稱,  數量, 單位, 本月 價格,類型 \n';
            let sub_col_header = '商戶編號, 名稱 , 商品編號, 名稱,  數量, 單位, 本月 價格,類型, 被替代 商戶, 名稱, 替代  \n';


            let allApproves = svr.getAllApproves();
            let olds = allApproves.filter((ap) => {
                return ap.CollectMethod == 'I'
            });
            let subs = allApproves.filter((ap) => {
                return ap.CollectMethod == 'S'
            });

            let Ws = allApproves.filter((ap) => {
                return ap.CollectMethod == 'S'
            });

            let news = allApproves.filter((ap) => {
                return ap.CollectMethod == 'N'
            });
            let dels = allApproves.filter((ap) => {
                return ap.CollectMethod == 'X'
            });

            let As = allApproves.filter((ap) => {
                return ap.CollectMethod == 'A'
            });

            let Rs = allApproves.filter((ap) => {
                return ap.CollectMethod == 'R'
            });


            function makeLine(ap: Approve): string {

                let subsExtra = '';

                if (ap.CollectMethod == 'S') {
                    subsExtra =
                        CvsHelper.valueOrNA(CvsHelper.dash(ap.SubstituteOutletCode, 4))
                        + sp + (ap.SubstituteOutletCode ? svr.getOutletName(ap.SubstituteOutletCode) : '')
                        + sp + CvsHelper.valueOrNA(ap.SubstituteSubType);
                }


                // sb.push('商戶編號, 商戶名稱, 編號, 姓名, 收集數目, 完成數目,完成日期, 審批總數, M, F, I, S, X, N,日期 \n');
                return CvsHelper.dash(ap.OutletCode, 4)
                    + sp + CvsHelper.cleanTxt(svr.getOutletName(ap.OutletCode))

                    + sp + CvsHelper.dash(ap.ItemCode, 4)
                    + sp + CvsHelper.cleanTxt(svr.getItemName(ap.ItemCode))
                    + sp + CvsHelper.valueOrNA(ap.ApproveQty)

                    + sp + CvsHelper.valueOrNA('(' + ap.ApproveUnit + ') ' + svr.unitTypeMgr.getUnitName(ap.ApproveUnit))
                    + sp + CvsHelper.valueOrNA(ap.ApprovePrice)
                    + sp + CvsHelper.valueOrNA(ap.CollectMethod)

                    + sp + subsExtra


                    + '\n';

            }

            sb.push('\n\n *** 仍用 I 舊數 商品或服務 *** \n');
            sb.push(col_header);
            for (const ap of olds) {
                sb.push(makeLine(ap));
            }

            sb.push('\n\n *** 商戶 S 替代 檢查表 *** \n');
            // 被替代
            sb.push(sub_col_header);
            for (const ap of subs) {
                sb.push(makeLine(ap));
            }

            sb.push('\n\n *** 商戶 W 被替代 檢查表 *** \n');
            // 被替代
            sb.push(sub_col_header);
            for (const ap of Ws) {
                sb.push(makeLine(ap));
            }


            sb.push('\n\n *** 商戶 N 新增 商品檢查表 *** \n');
            sb.push(col_header);
            for (const ap of news) {
                sb.push(makeLine(ap));
            }

            sb.push('\n\n *** 商戶 X 刪除 商品檢查表 *** \n');
            sb.push(col_header);
            for (const ap of dels) {
                sb.push(makeLine(ap));
            }


            sb.push('\n\n *** 商戶 A 不匯入 代超市 商品檢查表 *** \n');
            sb.push(col_header);
            for (const ap of As) {
                sb.push(makeLine(ap));
            }

            sb.push('\n\n *** 商戶 R 不匯入 代其他 商品檢查表 *** \n');
            sb.push(col_header);
            for (const ap of Rs) {
                sb.push(makeLine(ap));
            }


            let str = sb.join('');
            let blob = new Blob([str], {type: "text/plain;charset=utf-8"});
            let month = svr.getConfigMonth();
            let year = svr.getConfigYear();


            let fileName = 'smkt-' + year + '-' + month + '-PV01.xls';
            saveAs(blob, fileName);

            let msg = 'report : ' + fileName;
            this.svr.doLogServerMsg(msg);

        }


        public makeP01() {

            let sp = ',';
            let sb = [];

            let svr = this.svr;

            sb.push('調查員, 編號, 商品編號, 商品名稱 , 商品摘要, 商戶編號, 商戶名稱, 數量, 單位,單位, 本月 價格,原價, 類型,  調查員 備註 \n');

            let user = svr.getUser(null);

            //let map = svr.getApproveOutletsMap();
            let itemCode;
            let outletCode;


            for (let outletCode of svr.getApproveOutletCodes()) {

                let line = '';
                let approves: Approve[] = svr.approveMgr.getApproves(outletCode);
                let itemDesc = 'N/A';
                let remark = 'N/A';
                let description = '--';

                for (let i = 0; i < approves.length; i++) {

                    let approve = approves[i];

                    //description = CvsHelper.cleanTxt(approve.Description);
                    itemCode = CvsHelper.dash(approve.ItemCode, 4);
                    outletCode = CvsHelper.dash(approve.OutletCode, 4);

                    let tasks = approve.getTasks();
                    for (let j = 0; j < tasks.length; j++) {
                        let task = tasks[j];

                        user = svr.getUser(task.OwnerUserId);

                        remark = CvsHelper.cleanTxt(task.getTaskletRemarks());

                        let tasklets = task.getTasklets();
                        for (let k = 0; k < tasklets.length; k++) {

                            let tlet: Tasklet = tasklets[k];
                            let description = CvsHelper.cleanTxt(tlet.Name);

                            if (approve.OutletCode == '0655011' && approve.ItemCode == '09112101') {
                                console.info(' desc: ' + description);
                            }

                            line = user.Name + sp + user.Id + sp + itemCode
                                + sp + CvsHelper.cleanTxt(svr.getItemName(approve.ItemCode))
                                + sp + description
                                + sp + outletCode + sp + svr.getOutletName(approve.OutletCode)
                                + sp + CvsHelper.valueOrNA(tlet.Qty)
                                + sp + CvsHelper.valueOrNA(tlet.Unit)
                                + sp + svr.unitTypeMgr.getUnitName(tlet.Unit)
                                + sp + CvsHelper.valueOrNA(tlet.Price)
                                + sp + CvsHelper.valueOrNA(tlet.SpecialPrice)
                                + sp + CvsHelper.valueOrNA(approve.CollectMethod)
                                + sp + CvsHelper.valueOrNA(remark) + '\n';

                            sb.push(line);
                        }
                    }
                }
            }

            let str = sb.join('');
            let blob = new Blob([str], {type: "text/plain;charset=utf-8"});
            let month = svr.getConfigMonth();
            let year = svr.getConfigYear();
            let fileName = 'smkt-P01-' + year + '-' + month + '.xls';

            saveAs(blob, fileName);

            let msg = 'report : ' + fileName;
            this.svr.doLogServerMsg(msg);

        }


        public makePT04() {


            let sp = ',';
            let sb = [];
            let skipped = [];
            let svr = this.svr;
            sb.push('商品編號, 商品名稱 , 商品摘要, 商戶編號, 商戶名稱, 數量, 單位,單位 \n');

            let ts = svr.getAllTemplates();
            for (const t of ts) {


                let description = '--';

                let isActive = t.isActive();

                if (isActive) {
                    description = t.TaskletsText || '';
                    description = description.replace(/,/g, ' ').replace(/\n/g, ' ');
                } else {
                    description = '-- NA --';
                }

                let qty = t.BaseQty;
                let unit = t.BaseUnit;

                let tlet0 = t.getTasklets()[0];
                if (tlet0) {
                    qty = tlet0.Qty;
                    unit = tlet0.Unit;
                }


                let line = CvsHelper.dash(t.ItemCode, 4)
                    + sp + CvsHelper.cleanTxt(svr.getItemName(t.ItemCode))
                    + sp + CvsHelper.cleanTxt(description)
                    + sp + CvsHelper.dash(t.OutletCode, 4)
                    + sp + CvsHelper.cleanTxt(svr.getOutletName(t.OutletCode))
                    + sp + CvsHelper.valueOrNA(qty) + sp + CvsHelper.valueOrNA(unit)
                    + sp + svr.unitTypeMgr.getUnitName(unit)
                    + '\n';

                if (isActive) {
                    sb.push(line)
                } else {
                    skipped.push(line);
                }
            }

            let str = sb.join('');


            let blob = new Blob([str], {type: "text/plain;charset=utf-8"});


            let month = svr.getConfigMonth();
            let year = svr.getConfigYear();
            let fileName = 'smkt-PT04-' + year + '-' + month + '.xls';

            saveAs(blob, fileName);

            let msg = 'report : ' + fileName;
            this.svr.doLogServerMsg(msg);


        }


        public makePT01() {


            let sp = ',';
            let sb = [];
            let svr = this.svr;
            sb.push('調查員, 編號, 商品編號, 商品名稱 , 商品摘要, 商戶編號, 商戶名稱, 數量, 單位,單位, 本月 收集價格, 類型, 調查員 備註 \n');

            let user = svr.getUser(null);
            //let map = svr.getApproveOutletsMap();
            let outletCodes = svr.getApproveOutletCodes();
            let itemCode;
            let outletCode;


            let valueOrNA = CvsHelper.valueOrNA;
            let dash = CvsHelper.dash;


            for (let outletCode of outletCodes) {

                let line = '';
                let approves: Approve[] = svr.approveMgr.getApproves(outletCode);
                let itemDesc = 'N/A';
                let remark = 'N/A';
                let description = '--';

                for (let i = 0; i < approves.length; i++) {
                    let approve = approves[i];

                    let tasks = approve.getTasks();
                    if (tasks && tasks[0]) {
                        let task = tasks[0];
                        user = svr.getUser(task.OwnerUserId);
                        // remark = task.Remark || '--';

                        remark = task.getTaskletRemarks();
                    }

                    description = approve.Description || '';
                    description = description.replace(/,/g, ' ').replace(/\n/g, ' ');
                    remark = remark.replace(/,/g, ' ').replace(/\n/g, ' ');
                    itemCode = dash(approve.ItemCode, 4);
                    let dashedCode = dash(approve.OutletCode, 4);

                    line = user.Name + sp + user.Id + sp + itemCode
                        + sp + CvsHelper.cleanTxt(svr.getItemName(approve.ItemCode))
                        + sp + CvsHelper.cleanTxt(description)
                        + sp + dashedCode
                        + sp + CvsHelper.cleanTxt(svr.getOutletName(approve.OutletCode))
                        + sp + valueOrNA(approve.ApproveQty) + sp + valueOrNA(approve.ApproveUnit) + sp +
                        svr.unitTypeMgr.getUnitName(approve.ApproveUnit)
                        + sp + valueOrNA(approve.ApprovePrice) + sp + valueOrNA(approve.CollectMethod) + sp + valueOrNA(remark) + '\n';

                    sb.push(line);
                }

            }


            let str = sb.join('');
            let blob = new Blob([str], {type: "text/plain;charset=utf-8"});


            let month = svr.getConfigMonth();
            let year = svr.getConfigYear();
            let fileName = 'smkt-PT01-' + year + '-' + month + '.xls';

            saveAs(blob, fileName);

            let msg = 'report : ' + fileName;
            this.svr.doLogServerMsg(msg);

        }

        makeP3TaskStats() {
            let sp = ',';
            let sb = [];
            let svr = this.svr;

            let infolets: Cache<Infolet> = new Cache<Infolet>();

            // 收集日期	收集時間	 編號	 姓名	商戶編號	 商戶名稱	地址	 收集數目	 完成數目

            //sb.push('id, linkId, updateBy, time \n');
            sb.push('ID, 收集日期, 收集時間,  編號,  姓名, 商戶編號,  商戶名稱, 地址,  收集數目,  完成數目\n');
            svr.doGetInfoletTaskStats().then(res => {

                let user = svr.getUser(null);

                infolets.init(Infolet.name, Infolet.fromJson, res.data.infolets);

                let all = infolets.getAll();
                all = all.sort((a, b) => {

                    if (a.UpdateBy == b.UpdateBy) {

                        return ((a.UpdateAt + '').localeCompare(b.UpdateAt + ''));

                    } else {
                        return a.UpdateBy - b.UpdateBy;
                    }

                });

                let lastOutlet = '';
                let lastNumDone = -1;

                for (const il of all) {

                    let task = Task.getTaskById(il.LinkId);

                    if (!task) {

                        console.warn('task not found, id: ' + il.LinkId);
                        // sb.push( il + '\n') ;
                        continue;
                    }

                    let outlet = svr.mgr.outlets.getByKey(task.OutletCode);
                    let user = svr.mgr.users.get(il.UpdateBy);
                    let obj = JSON.parse(il.Data);
                    let date = new Date(il.UpdateAt);

                    if (outlet.OutletCode == lastOutlet && obj.NumDone == lastNumDone) {
                        continue;
                    }

                    lastOutlet = outlet.OutletCode;
                    lastNumDone = obj.NumDone;


                    let line = il.Id
                        + sp + Helper.showDate(date)
                        + sp + Helper.showTime(date)

                        //+ sp + il.LinkId + '(' + CvsHelper.cleanTxt(outlet.Name) + ')'

                        + sp + user.Id
                        + sp + user.Name
                        + sp + CvsHelper.dash(outlet.OutletCode)
                        + sp + CvsHelper.cleanTxt(outlet.Name)
                        + sp + CvsHelper.cleanTxt(outlet.Address)
                        + sp + obj.NumTotal
                        + sp + obj.NumDone
                        + '\n';

                    sb.push(line)

                }


                let str = sb.join('');
                let blob = new Blob([str], {type: "text/plain;charset=utf-8"});
                let month = svr.getConfigMonth();
                let year = svr.getConfigYear();


                let fileName = 'smkt-P3-' + year + '-' + month + '-Assignment.xls';
                saveAs(blob, fileName);


                let msg = 'report : ' + fileName;
                this.svr.doLogServerMsg(msg);
            });

        }

        // p3-' + year + '-' + month + '-複檢分配表.xls
        makeP3() {

            let sp = ',';
            let sb = [];
            let svr = this.svr;

            // 調查員, 編號, 商品編號, 商品名稱 , 商品摘要, "原調查員編號"

            sb.push('商戶編號, 商戶名稱, 編號, 原調查員, 編號, 審核員, 複查數目, 日期 \n');

            let user = svr.getUser(null);

            //let map = svr.getApproveOutletsMap();
            let itemCode;
            let outletCode;


            for (let outletCode of svr.getApproveOutletCodes()) {

                let line = '';
                let approves: Approve[] = svr.approveMgr.getApproves(outletCode);
                let itemDesc = 'N/A';
                let remark = 'N/A';
                let description = '--';
                let latestRecheckDate = null;

                let owners = Task.getTaskOutletOwners(outletCode);


                let u1: User = this.svr.mgr.users.get(9999);
                let u2: User = null;

                if (owners && owners.length > 0) {
                    u1 = owners[0];
                }

                if (owners && owners.length > 1) {
                    u2 = owners[1];

                    if (!u2) {
                        console.info('u2 null??');
                    } else {

                        // has u2 now

                        let tasks = Task.getTasksInOutlet(outletCode);
                        for (let task of tasks) {
                            if (task.OwnerUserId == u2.Id) {
                                if (Helper.compareDate(latestRecheckDate, task.UpdateAt) < 0) {
                                    latestRecheckDate = task.UpdateAt;
                                }
                            }
                        }
                    }
                }


                latestRecheckDate = Helper.dateTime2date(latestRecheckDate);

                u1 = u1 || User.fromJson("");
                u2 = u2 || User.fromJson("");

                // sb.push('商戶編號, 商戶名稱, , 原調查員, , 審核員, 複查數目,日期 \n');
                line = CvsHelper.dash(outletCode, 4)
                    + sp + CvsHelper.cleanTxt(svr.getOutletName(outletCode))
                    + sp + CvsHelper.valueOrNA(u1.Id)
                    + sp + CvsHelper.cleanTxt(u1.Name)
                    + sp + CvsHelper.valueOrNA(u2 && u2.Id)
                    + sp + CvsHelper.valueOrNA(u2 && u2.Name)
                    + sp + CvsHelper.valueOrNA(u2 && u2.getOutletTaskCount(outletCode))
                    + sp + CvsHelper.valueOrNA(latestRecheckDate)
                    + '\n';

                sb.push(line);
                // }
            }

            let str = sb.join('');
            let blob = new Blob([str], {type: "text/plain;charset=utf-8"});
            let month = svr.getConfigMonth();
            let year = svr.getConfigYear();
            let fileName = 'smkt-P3-' + year + '-' + month + '-複檢分配表.xls';

            saveAs(blob, fileName);

            let msg = 'report : ' + fileName;
            this.svr.doLogServerMsg(msg);

        }


        // p2-' + year + '-' + month + '-工作進度表.xls
        makeP2() {

            let sp = ',';
            let sb = [];
            let svr = this.svr;


            // sb.push(', , , 外勤收集, , ,, , 內部審批, , , , , , \n');
            sb.push('商戶編號, 商戶名稱, 編號, 姓名, 收集數目, 完成數目,完成日期, 審批總數, M, F, I, S,W, X, N, A, R,日期, 檢2日期, 內部留言 \n');

            //let map = svr.getApproveOutletsMap();
            // let outletCode;

            let statuses: OutletApproveStatus[] = svr.getApproveStatuses();
            for (const status of statuses) {

                let o = svr.mgr.getOutlet(status.outletCode);
                let os = svr.mgr.getStatus(status.outletCode);


                //for (const uid of Object.keys(status.userTaskStatusMap)) {
                let owners = status.getOwners(svr);
                if (owners.length == 0) {
                    owners.push(User.makeNullUser());
                    console.warn(' adding null-owner to outlet: ' + status.outletCode);
                }

                for (const user of owners) {

                    //let count = status.userMap[uid];
                    // let user = svr.getUser(uid);
                    let uid = user.Id;

                    let taskStatus: TaskStatus = status.getTaskStatus(uid) || new TaskStatus(status.outletCode);

                    let lockDate = taskStatus.lastDate;

                    // sb.push('商戶編號, 商戶名稱, 編號, 姓名, 收集數目, 完成數目,完成日期, 審批總數, M, F, I, S, X, N,日期 \n');
                    let line = CvsHelper.dash(o.OutletCode, 4)
                        + sp + CvsHelper.cleanTxt(o.Name)
                        + sp + CvsHelper.valueOrNA(user.Id)
                        + sp + CvsHelper.cleanTxt(user.Name)
                        + sp + CvsHelper.valueOrNA(taskStatus.numTotal)
                        + sp + CvsHelper.valueOrNA(taskStatus.numDone)
                        + sp + CvsHelper.valueOrNA(taskStatus.isLocked ? taskStatus.lastDate : null)
                        + sp + CvsHelper.valueOrNA(status.numTotal)
                        // + sp + CvsHelper.valueOrNA(status.numApproved)
                        + sp + CvsHelper.valueOrNA(status.collectionMethodMap['M'])
                        + sp + CvsHelper.valueOrNA(status.collectionMethodMap['F'])
                        + sp + CvsHelper.valueOrNA(status.collectionMethodMap['I'])
                        + sp + CvsHelper.valueOrNA(status.collectionMethodMap['S'])
                        + sp + CvsHelper.valueOrNA(status.collectionMethodMap['W'])
                        + sp + CvsHelper.valueOrNA(status.collectionMethodMap['X'])
                        + sp + CvsHelper.valueOrNA(status.collectionMethodMap['N'])
                        + sp + CvsHelper.valueOrNA(status.collectionMethodMap['A'])
                        + sp + CvsHelper.valueOrNA(status.collectionMethodMap['R'])
                        + sp + CvsHelper.valueOrNA(status.isAllApproved() ? status.lastDate : null)
                        + sp + CvsHelper.valueOrNA(os.getCheck2Date())
                        + sp + CvsHelper.valueOrNA(o.Remark2)
                        + '\n';

                    sb.push(line);
                }

                // if(!owners || !owners.length) {
                //     let line =
                //
                // }

            }


            let str = sb.join('');
            let blob = new Blob([str], {type: "text/plain;charset=utf-8"});
            let month = svr.getConfigMonth();
            let year = svr.getConfigYear();


            let fileName = 'smkt-P2-' + year + '-' + month + '-工作進度表.xls';

            saveAs(blob, fileName);

            let msg = 'report : ' + fileName + ', outlets: # ' + statuses.length;
            this.svr.doLogServerMsg(msg);

        }

        //The international default letter size is ISO 216 A4 (210x297mm ~ 8.3×11.7in) and expressed as this:
        // // pageSize: with and height in 20th of a point
        // <w:pgSz w:w="11906" w:h="16838"/>

        // https://docx.js.org/#/examples
        makeDoc(svr: DbService, ts: Template[], month: number, numSelected = 0): void {


            ts = ts || svr.getTemplateOfOutlet('0051102');


            ts = ts.filter(t => {

                if (numSelected > 0) {
                    return t._isSelected
                } else {
                    return t.isEnabled(month) && t.isActive();
                }
            });

            if (!(ts && ts.length)) {
                alert(' nothing to print for month : ' + month);
                return;
            }

            let t = ts[0];
            let outlet = svr.mgr.getOutlet(t.OutletCode);
            let item = svr.mgr.getItem(t.ItemCode);

            let fn = '紙板-' + month + '月-' + t.OutletCode + '.docx';


            let newLineTabs = function (numTab: number, msg = '') {
                let tab = msg + '\t';
                for (let i = 0; i < numTab; i++) {
                    if (i > 10) {
                        continue
                    }
                    tab += '\t';
                }
                return new TextRun(tab).break()
            };


            let newPara = function () {
                return new Paragraph().style('myStyle')
            };


            // @ts-ignore
            const doc = new Document(undefined, {
                top: 100,
                right: 1000,
                bottom: 100,
                left: 1000,
                title: 'My Doc'
            });

            // @ts-ignore
            doc.Styles.createParagraphStyle("myStyle", "My Style")
                .quickFormat()
                .basedOn("Normal").size(12 * 2);

            let makeOneItemDescription = function (p: any, name: string, idx): number {

                name = name || '';
                if (Helper.isBlank(name)) {
                    return 0;
                }
                let lineExt = 0;
                let lines = name.split('\n');
                for (let line of lines) {
                    line = line.trim();
                    p.addRun(new TextRun('   ' + line).break());

                    lineExt += Math.floor(line.length / 25);
                    // lineExt++;

                }

                // if(lines.length <= 6 && idx <= 2) {
                //   p.addRun(new TextRun('').break());
                // }

                console.info('len: ' + lines.length + ', extra: ' + lineExt + ' : ' + name);

                return lines.length + lineExt;
                // return lines.length + 1;
            };

            let makeOneRow = function (table: any, t: Template, rowNum: number, numLineSoFar: number): number {
                let colIdx = 0;
                let rowIdx = ((rowNum - 1) % 4) + 1;


                let outlet = svr.mgr.getOutlet(t.OutletCode);
                let item = svr.mgr.getItem(t.ItemCode);


                // console.info('row: ' + rowNum + ', soFar: ' + numLineSoFar);


                table.getCell(rowNum, colIdx++)
                    .addContent(newPara().addRun(new TextRun(' ' + item.ItemCode + ' ').bold()).center()
                        .addRun(newLineTabs(2)));

                let p = newPara().addRun(new TextRun('' + item.Name).bold()).addRun(new TextRun(' '));

                const tlets = t.getTasklets();
                let itemLines = 0;
                const MIN_LINES = 7;


                for (let i = 0; i < tlets.length; i++) {
                    itemLines += makeOneItemDescription(p, tlets[i] ? tlets[i].Name : '', rowIdx);

                }

                numLineSoFar += itemLines;

                // padding remaining lines;
                for (let i = itemLines; i < MIN_LINES; i++) {
                    // check if it's too long already
                    //if (numLineSoFar < (rowIdx * MIN_LINES) && !(numLineSoFar >= (4 * MIN_LINES - 1))) {
                    if (numLineSoFar <= (rowIdx * MIN_LINES)) {
                        p.addRun(new TextRun('').break());
                        console.info(' rowNum: ' + rowNum + ', rowIdx: ' + rowIdx + ', soFar: ' + numLineSoFar);
                        numLineSoFar++;
                    } else {
                        console.info('skipped blank line, rowNum: ' + rowNum + ', rowIdx: ' + rowIdx + ', soFar: ' + numLineSoFar);
                        break;
                    }
                }

                let baseQty = t.BaseQty;
                let unit = svr.unitTypeMgr.get(t.BaseUnit);

                if (tlets && tlets[0]) {
                    let tlet = tlets[0];
                    baseQty = tlet.Qty;
                    unit = svr.unitTypeMgr.get(tlet.Unit);
                }


                table.getCell(rowNum, colIdx++).addContent(p);
                table.getCell(rowNum, colIdx++).addContent(newPara().addRun(new TextRun(baseQty).break()).center().addRun(newLineTabs(0)));
                table.getCell(rowNum, colIdx++).addContent(newPara().addRun(new TextRun(unit.Name).break()).center()
                    .addRun(new TextRun(unit.Code).break()).center().addRun(newLineTabs(0)));

                //table.getCell(rowNum, colIdx++).addContent(newPara().addRun(new TextRun(' ').tab()));
                table.getCell(rowNum, colIdx++).addContent(newPara().addRun(newLineTabs(2, ''))); // price space
                return numLineSoFar;
            };

            let makeOnePage = function (doc, o: Outlet, ts: Template[]) {

                // @ts-ignore
                let p = doc.createParagraph().style('myStyle');
                p.addImage(Media.addImage(doc, header_image, 1350 / 2, 194 / 2));

                let d = svr.config.getPaperReportDate();
                let timeInfo = d.getFullYear() + '-' + (d.getMonth() + 1);

                let l1 = "商戶編號 \t: " + CvsHelper.dash(outlet.OutletCode, 4) + '\t\t\t\t\t\t\t\t\t  期間 : ' + timeInfo;
                let l2 = '商戶名稱 \t: ' + outlet.Name;
                let l3 = '地址 \t\t: ' + outlet.Address;
                let l4 = '聯絡人　　\t: ' + (outlet.Contact || '') + ' Tel:' + outlet.Tel;

                p.addRun(new TextRun(l1));
                p.addRun(new TextRun(l2).break());
                p.addRun(new TextRun(l3).break());
                p.addRun(new TextRun(l4).break());
                p.addRun(new TextRun('').break());

                // @ts-ignore
                let table = doc.createTable(1 + ts.length, 5);
                table.setWidth(4535);


                let colIdx = 0;
                let cell0 = table.getCell(0, colIdx++);
                let cell1 = table.getCell(0, colIdx++);
                let cell2 = table.getCell(0, colIdx++);
                let cell3 = table.getCell(0, colIdx++);
                let cell4 = table.getCell(0, colIdx++);

                cell0.addContent(newPara().addRun(new TextRun('商品編號').bold()).addRun(newLineTabs(1)).center());
                cell1.addContent(newPara().addRun(new TextRun('商品名稱及說明').bold()).addRun(newLineTabs(1)).center());
                cell2.addContent(newPara().addRun(new TextRun('數量').bold()).center());
                cell3.addContent(newPara().addRun(new TextRun('單位').bold()).center());
                cell4.addContent(newPara().addRun(new TextRun('價格 (澳門元)').bold()).center());


                cell0.properties.setWidth("14%", WidthType.PCT);
                cell1.properties.setWidth("52%", WidthType.PCT);
                cell2.properties.setWidth("8%", WidthType.PCT);
                cell3.properties.setWidth("8%", WidthType.PCT);
                cell4.properties.setWidth("18%", WidthType.PCT);
                // cell0.


                let rowIdx = 1;
                let lineTotalSoFar: number = 0;
                let count = 0;
                for (const t of ts) {
                    lineTotalSoFar = makeOneRow(table, t, rowIdx++, lineTotalSoFar);
                }
            };

            let idx = 0;
            let tmp = [];
            for (let i = 0; i < ts.length; i++) {

                tmp.push(ts[i]);
                idx++;
                let isLast = (i + 1 == ts.length);
                if (idx == 4 || isLast) {

                    makeOnePage(doc, outlet, tmp);

                    if (!isLast) {
                        doc.createParagraph().pageBreak();
                    }

                    tmp = [];
                    idx = 0;
                }
            }


            //let p4 = doc.Footer.createParagraph().style('myStyle');
            let p4 = doc.Footer.createParagraph().style('myStyle');
            p4.addRun(new TextRun("備註： \t\t 1 – 暫時缺貨 \t\t 2 – 季節性缺貨 \t\t 3 – 長期缺貨 \t\t 4 – 其他原因").size(18));
            p4.addRun(new TextRun("調查日期 __________________ \t\t 調查員 ____________________ \t\t 編號 ________ ").break().break());
            p4.addRun(new TextRun("統計暨普查局 – 0416.b      \t\t\t\t\t\t\t\t\t\t\t\t\t A4 – 2020/12").break().size(18));


            const packer = new Packer();

            packer.toBlob(doc).then(blob => {
                saveAs(blob, fn);
                console.log("Document created successfully");

                let msg = 'paper : ' + fn + ' | ' + outlet.Name;
                this.svr.doLogServerMsg(msg);

            });
        }
    }
}

