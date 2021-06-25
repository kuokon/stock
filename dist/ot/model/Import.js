var MyApp;
(function (MyApp) {
    var Import = /** @class */ (function () {
        function Import() {
        }
        Import.parseRaw = function (svr, txt, isHK) {
            if (isHK === void 0) { isHK = true; }
            var res = new MyApp.ParseResult();
            var options = [];
            if (txt === null || txt === undefined) {
                var msg = 'no data to import';
                console.warn(msg);
                txt = '';
                alert(msg);
                return;
            }
            var lines = txt.split('\n');
            var warnings = [];
            console.info(' parsing lines: ' + lines.length);
            for (var i = 0, len = lines.length; i < len; i++) {
                var line = lines[i];
                if (MyApp.Helper.isBlank(line)) {
                    continue;
                }
                var obj = isHK ? Import.parseHKCSV(svr, line) : Import.parseUScsv(line);
                if (obj) {
                    res.parsed.push(obj);
                }
                else {
                    res.skipped.push(line);
                }
            }
            return res;
        };
        Import.parseUScsv = function (line) {
            // 方向	代碼	名稱	訂單價格	訂單數量	交易狀態	已成交	落盤時間	訂單類型	期限	盤前盤後	觸發價	沽空
            var res = null;
            var txts = line.split('\t');
            // 方向
            var direction = txts[0] || '';
            // 代碼
            var sym = txts[1] || ''; // ALB201127C240000.HK
            var name = txts[2] || ''; // 阿里 201127 240.00 購
            // 交易狀態
            var status = txts[5] || '';
            // 落盤時間
            var datetime = txts[7] || '';
            // 訂單價格
            var unitPrice = txts[3] || '';
            // 訂單數量 / 成交數量
            var numExecuted = txts[4] || '';
            var isOption = numExecuted.indexOf('張') >= 0;
            var isSkipped = status == '已撤單';
            if (isSkipped) {
                return res;
            }
            var num = parseInt(numExecuted);
            if (num && isOption) {
                // sym = 'ALB201127C240000.HK'
                res = new MyApp.Option();
                res.Name = name.substr(0, 2); //+ name.substr(name.lastIndexOf(' '));
                res.DateBought = datetime;
                // sym = 'FUTU210625P146000'
                res.Strike = parseFloat(sym.substr(11, 3));
                // sym = 'FUTU210625P146000'
                var idx = 4;
                res.DateExp = '20' + sym.substr(idx, 2) + '-' + sym.substr(idx + 2, 2) + '-' + sym.substr(idx + 4, 2);
                res.NumContract = num;
                //sym = 'FUTU210625P146000'
                res.P_C = sym.substr(idx + 6, 1);
                if (!(res.P_C == 'P' || res.P_C == 'C')) {
                    console.warn(' P_C ' + res.P_C);
                }
                res.Premium = parseFloat(unitPrice.replace(',', ''));
                // res.NumShareExposed  =  res.NumContract * 100;
                // res.AmtCost = res.NumShareExposed * res.Premium;
                //res.AmtCost = parseFloat(amtExecuted.replace(',', ''));
                //res.NumShareExposed = Math.round( res.AmtCost / res.Premium / Math.abs(res.NumContract) );
                //
                // if(res.NumShareExposed < 0) {
                //     console.warn('#shares : exe ' + parseInt(amtExecuted) + ', premium: ' + res.Premium + ', num' + Math.abs(res.NumContract) )
                // }
                if (!(direction == '沽空' || direction == '買入')) {
                    console.warn(' option not buy/sell  direction : ' + direction);
                }
                if (direction == '沽空') {
                    res.NumContract = -res.NumContract;
                }
                // ALB201127P215000.HK
            }
            else {
                if (sym.length > 16) {
                    console.warn(' maybe mis-parse!  line: ' + line);
                }
            }
            return res;
        };
        // 代碼	名稱	方向	訂單價格	訂單數量	交易狀態	已成交@均價	落盤時間	訂單類型	期限	盤前競價	觸發價	沽空	成交數量	成交價格	成交金額	對手經紀	落盤時間	備註
        // 代碼	名稱	方向	成交數量	成交價格	成交金額	對手經紀	成交時間
        Import.parseHKCSV = function (svr, line) {
            var res = null;
            var txts = line.split('\t');
            // 代碼
            var sym = (txts[0] || '').trim(); // ALB201127C240000.HK
            var name = (txts[1] || '').trim(); // 阿里 201127 240.00 購
            // 方向
            var direction = (txts[2] || '').trim();
            // 成交數量
            var numExecuted = (txts[3] || '').trim();
            var priceExecuted = (txts[4] || '').trim();
            var amtExecuted = (txts[5] || '').trim();
            // 成交時間
            var datetime = (txts[7] || '').trim();
            // check if it's option and got executed
            var num = parseInt(numExecuted);
            var isOption = numExecuted.indexOf('張') >= 0;
            // let isSkipped = status == '已撤單';
            //
            // if (isSkipped) {
            //     return res;
            // }
            if (num && isOption) {
                // sym = 'ALB201127C240000.HK'
                res = new MyApp.Option();
                res.Name = name.substr(0, 2); //+ name.substr(name.lastIndexOf(' '));
                res.DateBought = datetime;
                // ALB201127C240000.HK
                res.Strike = parseFloat(sym.substr(10, 3));
                // ALB201127C240000.HK
                res.DateExp = '20' + sym.substr(3, 2) + '-' + sym.substr(5, 2) + '-' + sym.substr(7, 2);
                res.NumContract = num;
                // ALB201127C240000.HK
                res.P_C = sym.substr(9, 1);
                if (!(res.P_C == 'P' || res.P_C == 'C')) {
                    console.warn(' P_C ' + res.P_C);
                }
                res.Premium = parseFloat(priceExecuted.replace(',', ''));
                var amtCost = parseFloat(amtExecuted.replace(',', ''));
                //res.NumShareExposed = Math.round( amtCost / res.Premium / Math.abs(res.NumContract) );
                var stock = svr.mgr.stocks.getByKey(res.getStockSymbol());
                res._stock = stock;
                var calcCost = res.Premium * res.getNumShares();
                if (amtCost != (calcCost)) {
                    console.warn('something fishy about ! amtCost: ' + amtCost + ', calc: ' + calcCost);
                }
                if (!(direction == '沽空' || direction == '買入')) {
                    console.warn(' option not buy/sell  direction : ' + direction);
                }
                if (direction == '沽空') {
                    res.NumContract = -res.NumContract;
                }
                res.PriceAtBought = stock.Price;
                // ALB201127P215000.HK
            }
            else {
                if (sym.length > 16) {
                    console.warn(' maybe mis-parse!  line: ' + line);
                }
            }
            return res;
        };
        return Import;
    }());
    MyApp.Import = Import;
})(MyApp || (MyApp = {}));
//# sourceMappingURL=Import.js.map