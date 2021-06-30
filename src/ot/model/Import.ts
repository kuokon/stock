module MyApp {


    export class Import {

        static parseRaw(svr: DbService, txt: string, isHK=true): ParseResult {

            let res = new ParseResult();

            console.info('isHK: ' + isHK)

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

            console.info(' parsing lines: ' + lines.length);

            for (let i = 0, len = lines.length; i < len; i++) {

                let line = lines[i];

                if (Helper.isBlank(line)) {
                    continue;
                }
                let obj = Import.parseLine(svr, line, isHK);

                if (obj) {
                    res.parsed.push(obj);
                } else {
                    res.skipped.push(line);
                }

            }

            return res;
        }


        // HK 代碼	名稱	方向	成交數量	成交價格	成交金額	對手經紀	成交時間
        // US 代碼	名f稱	方向	成交數量	成交價格	成交金額	成交時間
        static parseLine(svr:  DbService, line, isHK=true): Option {

            let res: Option = null;

            let txts = line.split('\t');

            // 代碼
            let sym = (txts[0] || '').trim();  // ALB201127C240000.HK
            let name = (txts[1] || '').trim(); // 阿里 201127 240.00 購

            // 方向
            let direction = (txts[2] || '').trim();

            // 成交數量
            let numExecuted = (txts[3] || '').trim();
            let priceExecuted =  (txts[4] || '').trim();
            let amtExecuted = (txts[5] || '').trim();

            // 成交時間
            let idx = isHK ? 7 : 6;
            let datetime =  (txts[idx] || '').trim();


            // check if it's option and got executed
            let num = parseInt(numExecuted);
            let isOption = numExecuted.indexOf('張') >= 0;



            if (num && isOption) {

                // sym = 'ALB201127C240000.HK'
                // sym = 'FUTU210702P167500'
                res = new Option();
                res.Name = name.substr(0, name.indexOf(' '));//+ name.substr(name.lastIndexOf(' '));
                res.DateBought = datetime;

                // ALB201127C240000.HK
                let idx_base = isHK ? 3 : 4;
                res.DateExp = '20' + sym.substr(idx_base, 2) + '-' + sym.substr(idx_base+2, 2) + '-' + sym.substr(idx_base+4, 2);
                res.P_C = sym.substr(idx_base+6, 1);
                res.Strike = parseFloat(sym.substr(idx_base+7, 3));
                res.NumContract = num;


                if (!(res.P_C == 'P' || res.P_C == 'C')) {
                    console.warn(' P_C ' + res.P_C);
                }

                res.Premium = parseFloat(priceExecuted.replace(',', ''));
                let amtCost = parseFloat(amtExecuted.replace(',', ''));

                let stock = svr.mgr.stocks.getByKey(res.getStockSymbol());
                res._stock = stock;

                let calcCost = res.Premium * res.getNumShares();
                if(amtCost != (calcCost)) {
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
            } else {
                if (sym.length > 16) {
                    console.warn(' maybe mis-parse!  line: ' + line);
                }

            }


            return res;

        }


    }
}
