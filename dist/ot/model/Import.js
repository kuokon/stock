var MyApp;
(function (MyApp) {
    var Import = /** @class */ (function () {
        function Import() {
        }
        Import.parseRaw = function (svr, txt, isHK) {
            if (isHK === void 0) { isHK = true; }
            var res = new MyApp.ParseResult();
            console.info('isHK: ' + isHK);
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
                var obj = Import.parseLine(svr, line, isHK);
                if (obj) {
                    res.parsed.push(obj);
                }
                else {
                    res.skipped.push(line);
                }
            }
            return res;
        };
        // HK 代碼	名稱	方向	成交數量	成交價格	成交金額	對手經紀	成交時間
        // US 代碼	名f稱	方向	成交數量	成交價格	成交金額	成交時間
        Import.parseLine = function (svr, line, isHK) {
            if (isHK === void 0) { isHK = true; }
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
            var idx = isHK ? 7 : 6;
            var datetime = (txts[idx] || '').trim();
            // check if it's option and got executed
            var num = parseInt(numExecuted);
            var isOption = numExecuted.indexOf('張') >= 0;
            if (num && isOption) {
                // sym = 'ALB201127C240000.HK'
                // sym = 'FUTU210702P167500'
                res = new MyApp.Option();
                res.Name = name.substr(0, name.indexOf(' ')); //+ name.substr(name.lastIndexOf(' '));
                res.DateBought = datetime;
                // ALB201127C240000.HK
                var idx_base = isHK ? 3 : 4;
                res.DateExp = '20' + sym.substr(idx_base, 2) + '-' + sym.substr(idx_base + 2, 2) + '-' + sym.substr(idx_base + 4, 2);
                res.P_C = sym.substr(idx_base + 6, 1);
                res.Strike = parseFloat(sym.substr(idx_base + 7, 3));
                res.NumContract = num;
                if (!(res.P_C == 'P' || res.P_C == 'C')) {
                    console.warn(' P_C ' + res.P_C);
                }
                res.Premium = parseFloat(priceExecuted.replace(',', ''));
                var amtCost = parseFloat(amtExecuted.replace(',', ''));
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