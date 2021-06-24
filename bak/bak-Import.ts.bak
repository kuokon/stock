module MyApp {


    export class ImportBak {

        static parseRaw(svr: DbService, txt: string, isHK=true): ParseResult {

            let res = new ParseResult();

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


                let obj = isHK ?  Import.parseHKCSV(line) : Import.parseUScsv(line);

                if (obj) {
                    res.parsed.push(obj);
                } else {
                    res.skipped.push(line);
                }

            }

            return res;
        }

        static parseUScsv(line) : Option {
            // 方向	代碼	名稱	訂單價格	訂單數量	交易狀態	已成交	落盤時間	訂單類型	期限	盤前盤後	觸發價	沽空
            let res: Option=null;

            let txts = line.split('\t');


            // 方向
            let direction = txts[0] || '';

            // 代碼
            let sym = txts[1] || '';  // ALB201127C240000.HK
            let name = txts[2] || ''; // 阿里 201127 240.00 購

            // 交易狀態
            let status = txts[5] || '';

            // 落盤時間
            let datetime = txts[7] || '';

            // 訂單價格
            let unitPrice =  txts[3] || '';

            // 訂單數量 / 成交數量
            let numExecuted = txts[4] || '';

            let isOption = numExecuted.indexOf('張') >= 0;
            let isSkipped = status == '已撤單';

            if (isSkipped) {
                return res;
            }

            let num = parseInt(numExecuted);

            if (num && isOption) {

                // sym = 'ALB201127C240000.HK'

                res = new Option();
                res.Name = name.substr(0, 2);//+ name.substr(name.lastIndexOf(' '));
                res.DateBought = datetime;


                // sym = 'FUTU210625P146000'
                res.Strike = parseFloat(sym.substr(11, 3));

                // sym = 'FUTU210625P146000'
                let idx = 4;
                res.DateExp = '20' + sym.substr(idx, 2) + '-' + sym.substr(idx+2, 2) + '-' + sym.substr(idx+4, 2);

                res.NumContract = num;

                //sym = 'FUTU210625P146000'
                res.P_C = sym.substr(idx+6, 1);
                if (!(res.P_C == 'P' || res.P_C == 'C')) {
                    console.warn(' P_C ' + res.P_C);
                }

                res.Premium = parseFloat(unitPrice.replace(',', ''));
                res.NumShareExposed  =  res.NumContract * 100;
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


            }else {
                if (sym.length > 16) {
                    console.warn(' maybe mis-parse!  line: ' + line);
                }

            }

            return res;

        }


        // 代碼	名稱	方向	訂單價格	訂單數量	交易狀態	已成交@均價	落盤時間	訂單類型	期限	盤前競價	觸發價	沽空	成交數量	成交價格	成交金額	對手經紀	落盤時間	備註
        // 代碼	名稱	方向	成交數量	成交價格	成交金額	對手經紀	成交時間

        static parseHKCSV(line): Option {

            let res: Option = null;

            let txts = line.split('\t');

            // 代碼
            let sym = txts[0] || '';  // ALB201127C240000.HK
            let name = txts[1] || ''; // 阿里 201127 240.00 購

            // 方向
            let direction = txts[2] || '';




            // 交易狀態
            let status = txts[5] || '';

            // 已成交@均價
            let executed = txts[6] || '';

            // 落盤時間
            let datetime = txts[7] || '';

            // 成交數量
            let numExecuted = txts[13] || '';
            let priceExecuted = txts[14] || '';
            let amtExecuted = txts[15] || '';


            // check if it's option and got executed
            let num = parseInt(numExecuted);
            let isOption = numExecuted.indexOf('張') >= 0;
            let isSkipped = status == '已撤單';

            if (isSkipped) {
                return res;
            }


            if (num && isOption) {

                // sym = 'ALB201127C240000.HK'
                res = new Option();
                res.Name = name.substr(0, 2) ;//+ name.substr(name.lastIndexOf(' '));
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

                let amtCost = parseFloat(amtExecuted.replace(',', ''));
                res.NumShareExposed = Math.round( amtCost / res.Premium / Math.abs(res.NumContract) );

                let stock =  res.getStock();
                if(stock.OptionMultiple != res.NumShareExposed) {
                    console.warn(' numShare not equal! NumShareExposed : ' + res.NumShareExposed + '\n ' + line);
                }

                if(amtCost != (res.NumShareExposed*res.Premium)) {
                    console.warn('something fishy about ! ');
                }


                if(res.NumShareExposed < 0) {
                    console.warn('#shares : exe ' + parseInt(amtExecuted) + ', premium: ' + res.Premium + ', num' + Math.abs(res.NumContract) )
                }




                if (!(direction == '沽空' || direction == '買入')) {
                    console.warn(' option not buy/sell  direction : ' + direction);

                }

                if (direction == '沽空') {
                    res.NumContract = -res.NumContract;
                }

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
