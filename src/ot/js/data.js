// HAS to be 'var' (not 'let'), since android-webview need it for 'strict' mode !!
var _svr = null;

function getSvr() {

    if (!_svr) {
        _svr = angular.element(document.body).injector().get("DbService");
        console.info('_svr: ' + _svr);
    }


    return _svr;
}

function onGoto() {
    getSvr().jsApi.webGoto();
}


function onNext() {

    getSvr().jsApi.webNext();
}

function onPrev() {

    getSvr().jsApi.webPrev();
}

function onForward() {

    getSvr().jsApi.webForward();
}

// lang == {'zh','jp', 'kr', 'en'}
function onLanguage(lang) {

    getSvr().jsApi.webLanguage(lang);
}

function onImport(json) {

    getSvr().jsApi.webImport(json);
}

function onFont(size) {


    var oldFontSize = document.getElementById('body').style.fontSize;
    var newFontSize = size + 'px';
    document.getElementById('body').style.fontSize = newFontSize;

    console.info('font change from ' + oldFontSize + ' --> ' + newFontSize);
    //getSvr().native.webFont(size);
}


// ================  maybe phone-js call
CAPI = {
    get: function (name) {
        console.info(' CAPI call  get !!!  name: ' + name);
    },

    getInputVal: function (name) {

        console.info(' CAPI call  get !!!   name: ' + name);
        return "";
    },

    set: function (name, value) {

        console.info(' CAPI call  set !!!  name: ' + name + ', val: ' + value);
        getSvr().jsApi.webSet(name, value);


    },

    add: function (name, value) {
        console.info(' CAPI call  add !!!  name: ' + name + ', val: ' + value);
    }
    ,
    remove: function (name, value) {
        console.info(' CAPI call  remove !!!   name: ' + name + ', val: ' + value);
    }
};

// =========

var CURRENCY_JSON = [
    //{ID: "0", NAME: "N/A", RATE: "1.00000"},
    {value: "1", name: "澳門元 MOP", rate: "1.00000"},
    {value: "2", name: "港元 HKD", rate: "1.03300"},
    {value: "3", name: "人民幣 CNY", rate: "1.15010"},
    {value: "4", name: "美元 USD", rate: "7.98986"},
    {value: "5", name: "歐元 EUR", rate: "8.37072"},
    {value: "11", name: "加拿大元 CAD", rate: "5.94798"},
    {value: "7", name: "新台幣 TWD", rate: "0.24739"},
    {value: "6", name: "日圓 JPY", rate: "0.06808"},
    {value: "14", name: "韓圓 KRW", rate: "0.00660"},
    {value: "10", name: "新加坡元 SGD", rate: "5.51431"},
    {value: "8", name: "馬來西亞元 MYR", rate: "1.78018"},
    {value: "9", name: "泰國銖 THB", rate: "0.22292"},
    {value: "15", name: "菲律賓披索 PHP", rate: "0.16058"},
    {value: "16", name: "英鎊 GBP", rate: "9.82515"},
    {value: "17", name: "瑞士法郎 CHF", rate: "7.81854"},
    {value: "12", name: "澳洲元 AUD", rate: "5.75482"},
    {value: "18", name: "紐西蘭元 NZD", rate: "5.55627"},
    {value: "13", name: "印度盧比 INR", rate: "0.11725"},
    {value: "19", name: "印尼盾 IDR", rate: "0.00059"}
];


var HOTELS_JSON = [
    {value: "1", name: "新濠鋒", name_en: "Altira", avg_rate: "1981"}
    , {value: "105", name: "悅榕莊", name_en: "Banyan Tree", avg_rate: "3403"}
    , {value: "121", name: "百老匯酒店", name_en: "Broadway Hotel", avg_rate: "925"}
    , {value: "112", name: "金沙城康萊德", name_en: "Corad Macau", avg_rate: "2491"}
    , {value: "88", name: "頤居(前皇冠)", name_en: "Nuwa (k.f.a. Crown Tower)", avg_rate: "2772"}
    , {value: "125", name: "皇冠假日酒店", name_en: "Crowne Plaza Macau", avg_rate: "1242"}
    , {value: "94", name: "萬利", name_en: "Encore", avg_rate: "2033"}
    , {value: "2", name: "四季", name_en: "Four Seasons", avg_rate: "3650"}
    , {value: "107", name: "銀河酒店", name_en: "Galaxy Hotel", avg_rate: "2007"}
    , {value: "17", name: "鷺環海天度假酒店", name_en: "Grand Coloane Beach Resort", avg_rate: "1034"}
    , {value: "91", name: "君悅", name_en: "Grand Hyatt", avg_rate: "2047"}
    , {value: "8", name: "金麗華", name_en: "Grand Lapa ", avg_rate: "1309"}
    , {value: "3", name: "新葡京", name_en: "Grand Lisboa", avg_rate: "2188"}
    , {value: "120", name: "JW萬豪", name_en: "JW Marriott Hotel", avg_rate: "1983"}
    , {value: "89", name: "凱旋門", name_en: "L' Arc New World", avg_rate: "2070"}
    , {value: "6", name: "新東方置地", name_en: "New Orient Landmark", avg_rate: "1116"}
    , {value: "128", name: "勵宮酒店", name_en: "Legend Place", avg_rate: "1320"}
    , {value: "129", name: "羅斯福", name_en: "Roosevelt", avg_rate: "1173"}
    , {value: "7", name: "葡京", name_en: "Lisboa", avg_rate: "1107"}
    , {value: "95", name: "文華東方", name_en: "Manadarin Oriental", avg_rate: "2616"}
    , {value: "9", name: "美高梅", name_en: "Mgm", avg_rate: "2470"}
    , {value: "106", name: "大倉酒店", name_en: "Okura Hotel", avg_rate: "1563"}
    , {value: "38", name: "麗景灣", name_en: "Regency", avg_rate: "961"}
    , {value: "11", name: "濠璟", name_en: "Riviera Hotel", avg_rate: "1604"}
    , {value: "12", name: "皇都", name_en: "Royal", avg_rate: "1191"}
    , {value: "40", name: "金沙", name_en: "Sands", avg_rate: "1744"}
    , {value: "111", name: "金沙城喜來登", name_en: "Sheraton Macau", avg_rate: "1348"}
    , {value: "14", name: "十六浦", name_en: "Sofitel", avg_rate: "1238"}
    , {value: "18", name: "永利", name_en: "Wynn", avg_rate: "2062"}
    , {value: "124", name: "金沙城瑞吉酒店", name_en: "St. Regis Macao", avg_rate: "3296"}
    , {value: "15", name: "星際", name_en: "Star World", avg_rate: "1919"}
    , {value: "119", name: "麗思卡爾頓酒店", name_en: "The Ritz-Carlton", avg_rate: "4103"}
    , {value: "16", name: "威尼斯人", name_en: "Venetian", avg_rate: "1845"}
    , {value: "126", name: "永利皇宮", name_en: "Wynn Palace", avg_rate: "1874"}
    , {value: "122", name: "雅詩閣", name_en: "Ascott", avg_rate: "1208"}
    , {value: "21", name: "竹灣", name_en: "Coloane", avg_rate: "872"}
    , {value: "22", name: "金皇冠中國大酒店", name_en: "Golden Crown China", avg_rate: "860"}
    , {value: "23", name: "金龍", name_en: "Golden Dragon", avg_rate: "999"}
    , {value: "24", name: "君怡", name_en: "Grandview", avg_rate: "926"}
    , {value: "117", name: "勵庭海景", name_en: "Harbourview Hotel", avg_rate: "1058"}
    , {value: "5", name: "迎尚(前Hard Rock)", name_en: "The Countdown (k.f.a. Hard Rock)", avg_rate: "1841"}
    , {value: "25", name: "假日", name_en: "Holiday Inn", avg_rate: "972"}
    , {value: "113", name: "金沙城假日", name_en: "Holiday Inn Macau, Sands Cotai", avg_rate: "1768"}
    , {value: "27", name: "皇庭海景", name_en: "Marina", avg_rate: "1183"}
    , {value: "28", name: "維景", name_en: "Metropark", avg_rate: "1036"}
    , {value: "29", name: "總統", name_en: "Presidente", avg_rate: "1064"}
    , {value: "26", name: "利澳", name_en: "Rio", avg_rate: "1001"}
    , {value: "19", name: "富豪", name_en: "Beverly Plaza", avg_rate: "923"}
    , {value: "123", name: "新濠影滙", name_en: "Studio City", avg_rate: "1517"}
    , {value: "30", name: "駿龍", name_en: "Grand Dragon", avg_rate: "728"}
    , {value: "20", name: "皇家金堡", name_en: "Casa Real", avg_rate: "932"}
    , {value: "31", name: "財神", name_en: "Fortuna", avg_rate: "973"}
    , {value: "32", name: "富華", name_en: "Fu Hua", avg_rate: "758"}
    , {value: "33", name: "英皇", name_en: "Grand Emperor ", avg_rate: "2057"}
    , {value: "116", name: "港灣", name_en: "Grand Habour", avg_rate: "600"}
    , {value: "34", name: "東望洋", name_en: "Guia", avg_rate: "837"}
    , {value: "42", name: "盛世(前格蘭)", name_en: "Inn (f.k.a. Taipa)", avg_rate: "869"}
    , {value: "90", name: "萬龍(前蘭桂坊)", name_en: "Million Dragon (f.k.a. Lan Kwai Fung)", avg_rate: "1494"}
    , {value: "35", name: "京都", name_en: "Metropole", avg_rate: "829"}
    , {value: "37", name: "帝濠", name_en: "New World Emperor", avg_rate: "813"}
    , {value: "39", name: "箂斯", name_en: "Rocks", avg_rate: "1085"}
    , {value: "41", name: "新麗華", name_en: "Sintra", avg_rate: "814"}
    , {value: "127", name: "澳門巴黎人", name_en: "The Parisian", avg_rate: "1429"}
    , {value: "43", name: "維多利亞", name_en: "Victoria ", avg_rate: "480"}
    , {value: "44", name: "華都", name_en: "Waldo", avg_rate: "1091"}
    , {value: "130", name: "御龍", name_en: "Royal Dragon Hotel", avg_rate: "1000"}
    , {value: "96", name: "望廈賓館", name_en: "Pousada Mong Ha", avg_rate: "894"}
    , {value: "46", name: "東亞", name_en: "East Asia", avg_rate: "698"}
    , {value: "55", name: "家逸(前南天)", name_en: "Happy Family (f.k.a. Nam Tin)", avg_rate: "645"}
    , {value: "47", name: "假期", name_en: "Holiday", avg_rate: "467"}
    , {value: "48", name: "康泰", name_en: "Hong Thai", avg_rate: "350"}
    , {value: "49", name: "濠江", name_en: "Hou Kong", avg_rate: "468"}
    , {value: "50", name: "回力", name_en: "JAI ALAI", avg_rate: "900"}
    , {value: "115", name: "京悅", name_en: "Keng Iut", avg_rate: "300"}
    , {value: "51", name: "高華", name_en: "Kou Va", avg_rate: "400"}
    , {value: "52", name: "英京", name_en: "London", avg_rate: "684"}
    , {value: "53", name: "萬事發", name_en: "Macau Masters", avg_rate: "609"}
    , {value: "54", name: "文華", name_en: "Man Va", avg_rate: "616"}
    , {value: "114", name: "澳萊大三元", name_en: "Ole Tai Sam Un", avg_rate: "684"}
    , {value: "56", name: "藝舍(前新新)", name_en: "S Hotel", avg_rate: "871"}
    , {value: "65", name: "五步廊十六浦(前富麗)", name_en: "5Footway Inn Proj. Ponte 16 (k.f.a. Fu Lai)", avg_rate: "792"}
    , {value: "118", name: "亞洲精品旅館", name_en: "Asia Boutique Inn", avg_rate: "622"}
    , {value: "62", name: "晶晶", name_en: "Cheng Cheng", avg_rate: "300"}
    , {value: "63", name: "高士德", name_en: "Costa ", avg_rate: "466"}
    , {value: "57", name: "富都賓館", name_en: "Florida (Fu Do)", avg_rate: "350"}
    , {value: "64", name: "蓬萊", name_en: "Fong Loi", avg_rate: "280"}
    , {value: "58", name: "富城賓館", name_en: "Forson", avg_rate: "622"}
    , {value: "66", name: "海運", name_en: "Hoi Van", avg_rate: "320"}
    , {value: "67", name: "豪華", name_en: "Hou Va", avg_rate: "749"}
    , {value: "68", name: "玉珠", name_en: "Iok Chu", avg_rate: "450"}
    , {value: "59", name: "金灣賓館", name_en: "Jin Wan", avg_rate: "500"}
    , {value: "69", name: "嘉明", name_en: "Ka Meng", avg_rate: "350"}
    , {value: "70", name: "嘉華", name_en: "Ka Va ", avg_rate: "400"}
    , {value: "71", name: "新金門", name_en: "Kam Mung", avg_rate: "350"}
    , {value: "60", name: "遇蓮客棧", name_en: "Lotus", avg_rate: "280"}
    , {value: "73", name: "曼谷", name_en: "Man Kok ", avg_rate: "290"}
    , {value: "74", name: "明明", name_en: "Meng Meng", avg_rate: "490"}
    , {value: "75", name: "南龍", name_en: "Nam Long", avg_rate: "450"}
    , {value: "77", name: "新華", name_en: "San Va", avg_rate: "220"}
    , {value: "79", name: "大來", name_en: "Tai Loi", avg_rate: "520"}
    , {value: "80", name: "天麗", name_en: "Tin Lai", avg_rate: "460"}
    , {value: "81", name: "天天", name_en: "Tin Tin", avg_rate: "400"}
    , {value: "82", name: "東方", name_en: "Tong Fong", avg_rate: "200"}
    , {value: "83", name: "東京", name_en: "Tong Keng", avg_rate: "385"}
    , {value: "110", name: "鎮興賓館", name_en: "Townswell", avg_rate: "520"}
    , {value: "61", name: "大利迎賓館", name_en: "Universal", avg_rate: "480"}
    , {value: "84", name: "榮華", name_en: "Veng Va", avg_rate: "520"}
    , {value: "85", name: "和平", name_en: "Vo Peng", avg_rate: "250"}
    , {value: "76", name: "華發", name_en: "Wa Fa", avg_rate: "400"}
    , {value: "87", name: "威利", name_en: "Wai Lei", avg_rate: "121"}
    , {value: "72", name: "澳門之家(前群興)", name_en: "Your Home Is Macau (k.f.a. Kuan Heng)", avg_rate: "350"}
    , {value: "131", name: "戀愛七號旅館", name_en: "Love Lane Seven Inn", avg_rate: "900"}
    , {value: "132", name: "卡爾", name_en: "Caravel Hotel", avg_rate: "700"}
    , {value: "133", name: "新東方商務賓館南座", name_en: "San Tung Fong Commercial Inn, South Wing", avg_rate: "700"}
    , {value: "134", name: "美獅美高梅", name_en: "MGM Cotai", avg_rate: "1400"}
    , {value: "135", name: "怡富", name_en: "I Fu", avg_rate: "520"}
    , {value: "136", name: "摩珀斯", name_en: "Morpheus", avg_rate: "520"}

    , {value: "137", name: "十三酒店", name_en: "The 13", avg_rate: "3288"}
    , {value: "138", name: "悦子公寓", name_en: "YUE ZI", avg_rate: "1378"}
    , {value: "139", name: "多米精品", name_en: "DORMY BOUTIQUE HOSTEL", avg_rate: "400"}
    , {value: "140", name: "家億", name_en: "Billion Family Inn", avg_rate: "700"}
    , {value: "141", name: "錦江之星", name_en: "Jin Jiang Inn", avg_rate: "590"}
    , {value: "142", name: "家圓賓館", name_en: "Perfect Family Inn", avg_rate: "852"}
    , {value: "143", name: "五洋酒店", name_en: "HOTEL CINCO OCEANOS", avg_rate: "610"}
    , {value: "999", name: "不清楚", name_en: "Not sure", avg_rate: "0"}
];


// ============= q4_1_x ============

var COUNTRY_NONE = {value: "0", name: "沒有", name_en: "No", name_jp: "いいえ", name_kr: "아니오"};
var COUNTRY_RETURN = {
    value: "0", name: "返回常居地/澳門", name_en: "Return to Place of Residence / Macao",
    name_jp: "常住地/マカオへ戻る", name_kr: "상주지/마카오로 돌아가기"
};

var COUNTRY_HK = {value: "38000", name: "香港", name_en: "Hong Kong", name_jp: "香港", name_kr: "홍콩"};
var COUNTRY_TW = {value: "85001", name: "台灣", name_en: "Taiwan", name_jp: "台湾", name_kr: "대만"};
var COUNTRY_ZhuHai = {value: "34472", name: "珠海", name_en: "Zhuhai", name_jp: "珠海", name_kr: "주해"};
var COUNTRY_GuangDong = {value: "34461", name: "廣東省", name_en: "Guangdong Province", name_jp: "広東省", name_kr: "광동성"};
var COUNTRY_CH_Oth = {value: "30000", name: "中國其他", name_en: "Other Places in China", name_jp: "中国その他", name_kr: "중국"};

var Q1_REGION_JSON = [
    {value: "91102", name: "韓國", name_en: "Republic of Korea", name_jp: "韓国", name_kr: "한국"},
    {value: "80006", name: "日本", name_en: "Japan", name_jp: "日本", name_kr: "일본"},
    {value: "70006", name: "菲律賓", name_en: "Philippines", name_jp: "フィリピン", name_kr: "필리핀"},
    {value: "70007", name: "新加坡", name_en: "Singapore", name_jp: "シンガポール", name_kr: "싱가포르"},
    {value: "70003", name: "柬埔寨", name_en: "Cambodia", name_jp: "", name_kr: ""},
    {value: "70005", name: "馬來西亞", name_en: "Malaysia", name_jp: "マレーシア", name_kr: "말레이시아"},
    {value: "95014", name: "印度", name_en: "India", name_jp: "インド", name_kr: "인도"},

    {value: "71117", name: "印度尼西亞", name_en: "Indonesia", name_jp: "インドネシア", name_kr: "인도네시아"},


    {value: "70009", name: "泰國", name_en: "Thailand", name_jp: "タイ", name_kr: "태국"},
    {value: "70008", name: "越南", name_en: "Vietnam", name_jp: "ベトナム", name_kr: "베트남"},

    {value: "20048", name: "美國", name_en: "United States", name_jp: "アメリカ", name_kr: "미국"},
    {value: "20010", name: "加拿大", name_en: "Canada", name_jp: "カナダ", name_kr: "캐나다"},
    {value: "40017", name: "法國", name_en: "France", name_jp: "フランス", name_kr: "프랑스"},
    {value: "40104", name: "英國", name_en: "United Kingdom", name_jp: "イギリス", name_kr: "영국"},
    {value: "40019", name: "德國", name_en: "Germany", name_jp: "ドイツ", name_kr: "독일"},
    {value: "75019", name: "澳洲", name_en: "Australia", name_jp: "アストラリア", name_kr: "오세아니아"},
    {value: "75004", name: "紐西蘭", name_en: "New Zealand", name_jp: "ニュージーランド", name_kr: "뉴질랜드"},
    {value: "99999", name: "其他", name_en: "Others", name_jp: "その他", name_kr: "기타"}
];

var Q1_CHINA_REGION_JSON = [
    , {name: "其他國家", value: '999999'}
    , {name: "北京", value: '31200'}
    , {name: "天津", value: '31210'}
    , {name: "上海", value: '31220'}
    , {name: "重慶", value: '31230'}
    , {name: "福建省", value: '31351'}
    , {name: "湖南省", value: '31371'}
    , {name: "浙江省", value: '31341'}
    , {name: "湖北省", value: '31361'}
    , {name: "安徽省", value: '31331'}
    , {name: "河南省", value: '31261'}
    , {name: "江蘇省", value: '31311'}
    , {name: "河北省", value: '31241'}
    , {name: "貴州省", value: '31421'}
    , {name: "海南省", value: '31411'}
    , {name: "四川省", value: '35401'}
    , {name: "雲南省", value: '35701'}
    , {name: "青海省", value: '31471'}
    , {name: "廣西省", value: '31381'}
    , {name: "甘肅省", value: '31461'}
    , {name: "江西省", value: '31391'}
    , {name: "遼寧省", value: '31271'}
    , {name: "山東省", value: '31321'}
    , {name: "吉林省", value: '31281'}
    , {name: "山西省", value: '31251'}
    , {name: "黑龍江省", value: '31291'}
    , {name: "陝西省", value: '31451'}
    , {name: "西藏", value: '31440'}
    , {name: "新疆", value: '31491'}
    , {name: "內蒙古", value: '31301'}
    , {name: "寧夏", value: '31480'}
];


// =================== region-city ===========
//var cityInfoExtra = [
var REGION_INFO_JSON = [
    {value: '85001', tag: 'tw', name: '台灣', name_en: "Taiwan", prefix: 850},
    {value: '71117', tag: 'id', name: '印度尼西亞', name_en: "Indonesia", prefix: 711},
    {value: '80006', tag: 'jp', name: '日本', name_en: "Japan", prefix: 800},
    {value: '91102', tag: 'sk', name: '韓國', name_en: "Republic of Korea", prefix: 911, exclude: 91101},

    {value: '91600', tag: 'sa', name: '沙特阿拉伯', name_en: "Saudi Arabia", prefix: 916},

    // {value:'', tag: 'ae', name: '阿拉伯聯合酋長國', prefix: 917},
    {value: '95014', tag: 'in', name: '印度', name_en: "India", prefix: 950, exclude: 9500},
    {value: '31241', tag: 'cn1', name: '河北省', prefix: 3124},
    {value: '31251', tag: 'cn2', name: '山西省', prefix: 3125},
    {value: '31261', tag: 'cn3', name: '河南省', prefix: 3126},
    {value: '31271', tag: 'cn4', name: '遼寧省', prefix: 3127},
    {value: '31281', tag: 'cn5', name: '吉林省', prefix: 3128},
    {value: '31291', tag: 'cn6', name: '黑龍江省', prefix: 3129},
    {value: '31301', tag: 'cn7', name: '內蒙古', prefix: 3130},
    {value: '31311', tag: 'cn8', name: '江蘇省', prefix: 3131},
    {value: '31321', tag: 'cn9', name: '山東省', prefix: 3132},
    {value: '31331', tag: 'cn10', name: '安徽省', prefix: 3133},
    {value: '31341', tag: 'cn11', name: '浙江省', prefix: 3134},
    {value: '31351', tag: 'cn12', name: '福建省', prefix: 3135},
    {value: '31361', tag: 'cn13', name: '湖北省', prefix: 3136},
    {value: '31371', tag: 'cn14', name: '湖南省', prefix: 3137},
    {value: '31381', tag: 'cn15', name: '廣西省', prefix: 3138},
    {value: '31391', tag: 'cn16', name: '江西省', prefix: 3139},
    {value: '31411', tag: 'cn17', name: '海南省', prefix: 3141},
    {value: '31421', tag: 'cn18', name: '貴州省', prefix: 3142},
    {value: '31451', tag: 'cn19', name: '陝西省', prefix: 3145},
    {value: '31461', tag: 'cn20', name: '甘肅省', prefix: 3146},
    {value: '31471', tag: 'cn21', name: '青海省', prefix: 3147},
    {value: '31491', tag: 'cn22', name: '新疆', prefix: 3149},
    {value: '34461', tag: 'cn23', name: '廣東省', prefix: 344},
    {value: '35401', tag: 'cn24', name: '四川省', prefix: 354},
    {value: '35701', tag: 'cn25', name: '雲南省', prefix: 357},
    {value: '31440', tag: 'cn26', name: '西藏', prefix: 3144}
];

var CITY_JSON = [
    {value: "20010", name: "加拿大", name_en: "Canada"},
    {value: "20048", name: "美國", name_en: "United States"},
    {value: "31200", name: "北京", name_en: "Beijing"},
    {value: "31210", name: "天津", name_en: "Tianjin"},
    {value: "31220", name: "上海", name_en: "Shanghai"},
    {value: "31230", name: "重慶", name_en: "Chongqing"},
    {value: "31241", name: "邯鄲", name_en: "Handan"},
    // {value: "31242", name: "滿州", name_en: "Manzhou"},
    {value: "31243", name: "秦皇島", name_en: "Qinhuangdao"},
    {value: "31244", name: "石家莊", name_en: "Shijiazhuang"},

    {value: "31245", name: "保定市", name_en: ""},

    {value: "31249", name: "其他河北省地區", name_en: "Others Hebei Province"},
    {value: "31251", name: "長治", name_en: "Changzhi "},
    {value: "31252", name: "大同", name_en: "Datong "},
    {value: "31253", name: "太原", name_en: "Taiyuan"},
    {value: "31254", name: "運城", name_en: "Yuncheng"},
    {value: "31259", name: "其他山西省地區", name_en: "Other Shanxi Province"},
    {value: "31262", name: "洛陽", name_en: "Luoyang"},
    {value: "31263", name: "南陽", name_en: "Nanyang"},
    {value: "31264", name: "鄭州", name_en: "Zhengzhou"},
    {value: "31269", name: "其他河南省地區", name_en: "Other Henan Province"},
    {value: "31271", name: "大連", name_en: "Dalian"},
    {value: "31272", name: "丹東", name_en: "Dandong"},
    {value: "31273", name: "沈陽", name_en: "Shenyang"},
    // {value: "31274", name: "銀州", name_en: "Yinzhou"},
    {value: "31279", name: "其他遼寧省地區", name_en: "Other Liaoning Province"},
    {value: "31281", name: "長春", name_en: "Changchun"},
    {value: "31282", name: "延吉", name_en: "Yanji "},
    {value: "31289", name: "其他吉林省地區", name_en: "Other Jilin Province"},
    {value: "31291", name: "哈爾濱", name_en: "Haerbin"},
    {value: "31292", name: "黑河", name_en: "Heihe "},
    {value: "31293", name: "佳木斯", name_en: "Jiamusi"},
    {value: "31294", name: "漠河縣", name_en: "Mohe County"},
    {value: "31295", name: "牡丹江", name_en: "Mudanjiang"},
    {value: "31296", name: "齊齊哈爾", name_en: "Qiqihar"},
    {value: "31299", name: "其他黑龍江省地區", name_en: "Other Heilongjiang Province"},
    {value: "31301", name: "包頭", name_en: "Baotou "},
    {value: "31302", name: "赤峰", name_en: "Chifeng"},
    {value: "31303", name: "呼倫貝爾", name_en: "Hailar"},
    {value: "31304", name: "呼和浩特", name_en: "Hohhot"},
    {value: "31305", name: "錫林浩特", name_en: "Xilinhot "},
    {value: "31309", name: "其他內蒙古地區", name_en: "Other Inner Mongolia  "},
    {value: "31311", name: "蘇州", name_en: ""},
    {value: "31312", name: "常州", name_en: "Changzhou"},
    {value: "31313", name: "連雲港", name_en: "Lianyungang"},
    {value: "31314", name: "南京", name_en: "Nanjing"},
    {value: "31315", name: "南通", name_en: "Nantong "},
    // {value: "31316", name: "通寧", name_en: "Tongning "},
    {value: "31317", name: "無錫", name_en: "Wuxi"},
    {value: "31318", name: "徐州", name_en: "Xuzhou "},
    {value: "31319", name: "其他江蘇省地區", name_en: "Other Jiangsu Province"},
    {value: "31321", name: "東營", name_en: "Dongying "},
    {value: "31322", name: "濟南", name_en: "Jinan"},
    {value: "31323", name: "臨沂", name_en: "Linyi "},
    {value: "31324", name: "青島", name_en: "Qingdao"},
    {value: "31325", name: "濰坊", name_en: "Weifang"},
    {value: "31326", name: "威海", name_en: "Weihai"},
    {value: "31327", name: "煙台", name_en: "Yantai"},
    {value: "31329", name: "其他山東省地區", name_en: "Other Shandong Province"},
    {value: "31331", name: "安慶", name_en: "Anqing"},
    {value: "31332", name: "阜陽", name_en: "Fuyang "},
    {value: "31333", name: "合肥", name_en: "Hefei"},
    {value: "31334", name: "黃山", name_en: ""},
    {value: "31339", name: "其他安徽省地區", name_en: "Other Anhui Province"},
    {value: "31341", name: "杭州", name_en: "Hangzhou"},
    {value: "31342", name: "台州", name_en: ""},
    {value: "31343", name: "寧波", name_en: "Ningbo"},
    {value: "31344", name: "溫州", name_en: "Wenzhou"},
    {value: "31345", name: "金華", name_en: "Yiwu"},
    {value: "31346", name: "舟山", name_en: "Zhoushan"},
    {value: "31349", name: "其他浙江省地區", name_en: "Other Zhejiang Province"},
    {value: "31351", name: "福州", name_en: "Fuzhou"},
    {value: "31352", name: "泉州", name_en: ""},
    {value: "31353", name: "龍巖", name_en: "Longyan"},
    {value: "31354", name: "南平", name_en: "Wuyishan"},
    {value: "31355", name: "廈門", name_en: "Xiamen"},
    {value: "31359", name: "其他福建省地區", name_en: "Other Fujian Province"},
    {value: "31361", name: "恩施土家族苗族自治州", name_en: ""},
    {value: "31362", name: "武漢", name_en: "Wuhan"},
    {value: "31363", name: "襄陽", name_en: ""},
    {value: "31364", name: "宜昌", name_en: "Yichang"},
    {value: "31369", name: "其他湖北省地區", name_en: "Other Hubei Province"},
    {value: "31371", name: "常德", name_en: "Changde"},
    {value: "31372", name: "長沙", name_en: "Changsha"},
    {value: "31373", name: "郴州", name_en: ""},
    {value: "31374", name: "懷化", name_en: "Huaihua "},
    {value: "31379", name: "其他湖南省地區", name_en: "Other Hunan Province "},
    {value: "31381", name: "桂林", name_en: "Guilin"},
    {value: "31382", name: "柳州", name_en: "Liuzhou"},
    {value: "31383", name: "南寧", name_en: "Nanning"},
    {value: "31384", name: "梧州", name_en: "Wuzhou"},
    {value: "31385", name: "北海", name_en: "Beihai"},
    {value: "31389", name: "其他廣西省地區", name_en: "Other Guangxi Province"},
    {value: "31391", name: "贛州", name_en: "Ganzhou"},
    {value: "31392", name: "吉安", name_en: "Ji'an "},
    {value: "31393", name: "景德鎮", name_en: "Jingdezhen"},
    //{value: "31394", name: "江南春曉", name_en: "Jiang Nan Chun Xiao"},
    {value: "31395", name: "九江", name_en: "Jiujiang"},
    {value: "31396", name: "江南春曉", name_en: "Jiang Nan Chun Xiao"},

    {value: "31397", name: "蘆溪", name_en: "Luxi"},
    {value: "31398", name: "南昌", name_en: "Nanchang"},
    {value: "31399", name: "其他江西省地區", name_en: "Other Jiangxi Province"},
    {value: "31411", name: "海囗", name_en: "Haikou"},
    {value: "31412", name: "三亞", name_en: "Sanya"},
    {value: "31419", name: "其他海南省地區", name_en: "Other Hainan Province"},
    // {value: "31421", name: "黎平", name_en: "Liping"},
    {value: "31422", name: "銅仁", name_en: "Tongren"},
    // {value: "31423", name: "興義", name_en: "Xingyi"},
    {value: "31424", name: "貴陽", name_en: ""},
    {value: "31425", name: "遵義", name_en: ""},
    {value: "31426", name: "畢節", name_en: ""},


    {value: "31429", name: "其他貴州省地區", name_en: "Other Guizhou Province"},

    //{value: "31440", name: "西藏", name_en: "Tibet", IS_SKIP: true},

    {value: "31441", name: "拉薩", name_en: "Lhasa "},
    {value: "31449", name: "其他西藏自活區地區", name_en: "Tibet Autonomous Region "},
    {value: "31451", name: "安康", name_en: "Ankang"},
    {value: "31452", name: "漢中", name_en: "Hanzhong"},
    {value: "31453", name: "西安", name_en: "Xi'an"},
    {value: "31454", name: "延安", name_en: "Yan'an"},
    {value: "31455", name: "榆林", name_en: "Yulin "},

    {value: "31459", name: "其他陝西省地區", name_en: "Other Shanxi Province"},
    {value: "31461", name: "酒泉", name_en: ""},
    {value: "31462", name: "嘉峪關", name_en: "Jiayuguan"},
    {value: "31463", name: "蘭州", name_en: "Lanzhou"},
    {value: "31464", name: "慶陽", name_en: "Qingyang"},

    {value: "31469", name: "其他甘肅省地區", name_en: "Other Gansu Province"},
    // {value: "31471", name: "格爾木", name_en: "Golmud "},
    {value: "31472", name: "西寧", name_en: "Xining"},

    {value: "31479", name: "其他青海省地區", name_en: "Other Qinghai Province"},

    {value: "31480", name: "寧夏回族自治區", name_en: "Ningxia"},

    {value: "31491", name: "阿克蘇", name_en: "Aksu"},
    {value: "31492", name: "阿勒泰", name_en: "Altay"},
    {value: "31493", name: "和田", name_en: "Khotan"},
    {value: "31494", name: "伊犁哈萨克自治州", name_en: ""},
    {value: "31495", name: "喀什", name_en: "Kashgar"},
    // {value: "31496", name: "庫爾勒", name_en: "Korla "},
    {value: "31497", name: "巴音郭楞蒙古自治州"},
    {value: "31498", name: "烏魯木齊", name_en: "Ürümqi "},

    {value: "31499", name: "其他新疆地區", name_en: "Other Xinjiang"},

    {value: "34463", name: "廣州", name_en: "Guangzhou"},
    {value: "34472", name: "珠海", name_en: "Zhuhai"},
    {value: "34471", name: "中山", name_en: "Zhongshan"},
    {value: "34468", name: "深圳", name_en: "Shenzhen"},
    {value: "34470", name: "湛江", name_en: "Zhanjiang"},
    {value: "34466", name: "汕頭", name_en: "Shantou"},
    {value: "34464", name: "虎門", name_en: "Humen"},
    {value: "34465", name: "梅縣", name_en: "Meixian"},
    //{value: "34469", name: "延慶", name_en: "Yanqing"},
    {value: "34462", name: "東昇", name_en: "Dongsheng"},
    {value: "34467", name: "蛇口", name_en: "Shekou"},

    //{value: "34461", name: "廣東省", name_en: "Guangdong Province", CITY_name: '潮陽', CITY_name_en: ''},
    {value: "34461", name: "潮陽", name_en: ''},
    {value: "34473", name: "灣仔", name_en: "Wanchai"},

    {value: "34474", name: "佛山", name_en: " "},
    {value: "34475", name: "東莞", name_en: " "},
    {value: "34476", name: "惠州", name_en: " "},
    {value: "34477", name: "江門", name_en: " "},
    {value: "34478", name: "肇慶", name_en: " "},
    {value: "34479", name: "清遠", name_en: " "},
    {value: "34480", name: "韶關", name_en: " "},
    {value: "34481", name: "河源", name_en: " "},
    {value: "34482", name: "梅州", name_en: " "},
    {value: "34483", name: "潮州", name_en: " "},
    {value: "34484", name: "雲浮", name_en: " "},
    {value: "34485", name: "汕尾", name_en: " "},
    {value: "34486", name: "揭陽", name_en: " "},
    {value: "34487", name: "茂名", name_en: " "},
    {value: "34488", name: "陽江", name_en: " "},


    {value: "34499", name: "其他廣東省地區", name_en: "Other Guangdong Province"},


    {value: "35401", name: "成都", name_en: "Chengdu"},
    {value: "35402", name: "達州", name_en: ""},
    {value: "35406", name: "瀘州", name_en: "Luzhou"},
    {value: "35407", name: "綿陽", name_en: "Mianyang"},
    {value: "35408", name: "南充", name_en: "Nanchong "},
    {value: "35409", name: "攀枝花", name_en: "Panzhihua"},
    // {value: "35410", name: "松潘", name_en: "Songpan "},
    // {value: "35411", name: "萬縣", name_en: "Wanyuan"},
    {value: "35412", name: "涼山彝族自治州", name_en: ""},
    {value: "35413", name: "宜賓", name_en: "Yibin"},
    // {value: "35414", name: "錦江"},
    {value: "35499", name: "其他四川省地區", name_en: "Other Sichuan Province"},

    {value: "35701", name: "保山", name_en: "Baoshan"},
    {value: "35702", name: "大理白族自治州", name_en: ""},
    {value: "35703", name: "迪慶藏族自治州", name_en: "Dêqên Tibetan Autonomous Prefecture"},
    {value: "35704", name: "西雙版納傣族自治州", name_en: ""},

    {value: "35705", name: "昆明", name_en: "Kunming"},
    {value: "35706", name: "麗江市", name_en: "Lijiang city"},
    {value: "35707", name: "臨滄", name_en: "Lincang"},

    {value: "35708", name: "普洱", name_en: ""},
    {value: "35709", name: "文山壯族苗族自治州", name_en: ""},

    {value: "35710", name: "昭通", name_en: "Zhaotong"},
    {value: "35719", name: "其他雲南省地區", name_en: "Other Yunnan Province"},
    {value: "38000", name: "香港", name_en: "Hong Kong"},
    {value: "40017", name: "法國", name_en: "France"},
    {value: "40019", name: "德國", name_en: "Germany"},
    {value: "40104", name: "英國", name_en: "United Kingdom"},
    {value: "70003", name: "柬埔寨", name_en: "Cambodia"},
    {value: "70005", name: "馬來西亞", name_en: "Malaysia"},
    {value: "70006", name: "菲律賓", name_en: "Philippines"},
    {value: "70007", name: "新加坡", name_en: "Singapore"},
    {value: "70008", name: "越南", name_en: "Viet Nam"},
    {value: "70009", name: "泰國", name_en: "Thailand"},

    //{value: "71117", name: "印度尼西亞", name_en: "Indonesia", CITY_name: '耶加達', CITY_name_en: 'Jakarta'},
    {value: "71117", name: "耶加達", name_en: "Jakarta"},

    {value: "71117", name: "雅加達", name_en: "Jakarta"},
    {value: "71124", name: "納閩巴霍", name_en: "Labuan Bajo"},
    {value: "71125", name: "朗古爾", name_en: "Langgur"},
    {value: "71128", name: "瑪琅", name_en: "Malang"},
    {value: "71133", name: "棉蘭", name_en: "Medan"},
    {value: "71134", name: "馬老奇", name_en: "Merauke"},
    {value: "71135", name: "納比雷", name_en: "Nabire"},
    {value: "71136", name: "巴塘", name_en: "Padang"},
    {value: "71146", name: "三寶瓏", name_en: "Semarang"},
    {value: "71199", name: "其他印度尼西亞地區", name_en: "Others, Indonesia"},

    {value: "75004", name: "紐西蘭", name_en: "New Zealand"},
    {value: "75019", name: "澳洲", name_en: "Australia"},

    {value: "80051", name: "東京", name_en: "Tokyo"},
    {value: "80039", name: "大阪", name_en: "Osaka"},
    {value: "80030", name: "名古屋", name_en: "Nagoya"},

    //{value: "80006", name: "日本", name_en: "Japan", CITY_name: '福岡縣', CITY_name_en: 'Fukuoka'},

    {value: "80006", name: "福岡縣", name_en: "Fukuoka"},
    {value: "80007", name: "福島縣", name_en: "Fukushima"},
    {value: "80009", name: "函館", name_en: "Hakodate"},
    {value: "80011", name: "廣島縣", name_en: "Hiroshima"},
    {value: "80015", name: "鹿兒島縣", name_en: "Kagoshima"},
    {value: "80016", name: "北九州市", name_en: "Kita Kyushu"},
    {value: "80018", name: "小松市", name_en: "Kita Kyushu"},
    {value: "80022", name: "松山市", name_en: "Matsuyama"},
    //{value: "80026", name: "宮古島", name_en: "Miyako Jima"},
    {value: "80027", name: "宮崎縣", name_en: "Miyazaki"},
    {value: "80029", name: "長崎縣", name_en: "Nagasaki"},
    {value: "80044", name: "札幌", name_en: "Sapporo"},
    {value: "80045", name: "仙台市", name_en: "Sendai"},
    {value: "80099", name: "其他日本地區", name_en: "Others, Japan"},

    //{value: "85001", name: "台灣", name_en: "Taiwan", IS_SKIP: true},

    {value: "85001", name: "嘉義", name_en: "Chiayi"},
    {value: "85003", name: "花蓮", name_en: "Hualien"},
    {value: "85012", name: "台北市", name_en: "Taipei"},
    {value: "85010", name: "台中市", name_en: "Taichung"},
    {value: "85004", name: "高雄市", name_en: "Kaohsiung"},
    {value: "85011", name: "台南市", name_en: "Tainan"},
    {value: "85013", name: "台東市", name_en: "Taitung"},
    {value: "85002", name: "恆春鎮", name_en: "Hengchun"},
    {value: "85005", name: "金門縣", name_en: "Kinmen"},
    {value: "85006", name: "澎湖", name_en: "Penghu"},
    {value: "85007", name: "馬祖", name_en: "Matsu"},
    {value: "85008", name: "南竿鄉", name_en: "Nangan"},
    {value: "85009", name: "屏東市", name_en: "Pingtung"},


    // {value: "85010", name: "台中", name_en: "Taichung"},
    // {value: "85011", name: "台南", name_en: "Tainan"},
    // {value: "85012", name: "台北", name_en: "Taipei"},
    // {value: "85013", name: "台東", name_en: "Taitung"},
    {value: "85014", name: "新北", name_en: "New Taipei City"},
    {value: "85099", name: "其他台灣", name_en: "Other Taiwan"},


    {value: "91111", name: "首爾", name_en: "Seoul"},


    // 91101	朝鮮	Dem People's Rep of Korea	n/a
    // {value: "91102", name: "韓國", name_en: "Korea, Republic of", CITY_name: '釜山', CITY_name_en: 'Busan'},
    {value: "91102", name: "釜山", name_en: "Busan"},
    {value: "91103", name: "清州", name_en: "Cheongju"},
    {value: "91104", name: "大邱", name_en: "Daegu"},
    {value: "91105", name: "群山", name_en: "Gunsan"},
    {value: "91107", name: "濟州", name_en: "Jeju"},
    {value: "91109", name: "務安", name_en: "Muan"},
    {value: "91111", name: "首爾", name_en: "Seoul"},

    // {value: "91103", name: "清州市", name_en: "Cheongju"},
    // {value: "91104", name: "大邱廣域市", name_en: "Daegu"},
    // {value: "91105", name: "郡山市", name_en: "Gunsan"},
    // {value: "91107", name: "濟洲", name_en: "Jeju"},
    // {value: "91109", name: "務安郡", name_en: "Muan"},

    {value: "91199", name: "其他韓國地區", name_en: "Others, Rep. of Korea"},


    // 91600	沙特亞拉伯
    {value: "91601", name: "艾卜哈", name_en: "Abha"},
    {value: "91602", name: "哈薩", name_en: "Alahsa"},
    {value: "91606", name: "達曼", name_en: "Dammam"},
    {value: "91607", name: "杜瓦達米", name_en: "Dawadmi"},
    {value: "91609", name: "古拉亞特", name_en: "Qurayyat"},
    {value: "91610", name: "哈巴廷", name_en: "Hafr", name_en: "Al-Batin"},
    {value: "91612", name: "吉贊", name_en: "Jazan"},
    {value: "91616", name: "馬迪納", name_en: "Medina"},
    {value: "91622", name: "塔布克", name_en: "Tabuk"},
    {value: "91624", name: "圖賴夫", name_en: "Turaif"},
    {value: "91699", name: "其他沙特亞拉伯地區", name_en: "Others,Saudi Arabia"},

    // 91700	亞拉伯聯合酋長國
    {value: "91701", name: "阿布扎比", name_en: "Abu", name_en: "Dhabi"},
    {value: "91702", name: "阿爾艾茵", name_en: "Al", name_en: "Ain"},
    {value: "91703", name: "富吉拉", name_en: "Al-Fujairah"},
    {value: "91704", name: "杜拜", name_en: "Dubai"},
    {value: "91706", name: "拉斯海瑪", name_en: "Ras", name_en: "Al", name_en: "Khaimah"},
    {value: "91707", name: "沙加", name_en: "Sharjah"},
    {value: "91799", name: "其他亞拉伯聯合酋長國地區", name_en: "Others, UAE"},


    {value: "95014", name: "阿默達巴德", name_en: "Ahmedabad"},
    {value: "95021", name: "貝爾高姆", name_en: "Belgaum"},
    {value: "95022", name: "巴夫那加爾", name_en: "Bhavnagar"},
    {value: "95026", name: "昌迪加爾", name_en: "Chandigarh"},
    {value: "95027", name: "清奈", name_en: "Chennai"},
    {value: "95030", name: "德里", name_en: "Delhi"},
    {value: "95031", name: "達蘭薩拉", name_en: "Dharamsala"},
    {value: "95033", name: "迪馬普爾", name_en: "Dimapur"},
    {value: "95047", name: "賈姆訥格爾", name_en: "Jamnagar"},
    {value: "95048", name: "賈姆謝德布爾", name_en: "Jamshedpur"},
    {value: "95063", name: "馬杜賴", name_en: "Madurai"},
    {value: "95064", name: "門格洛爾", name_en: "Mangalore"},
    {value: "95065", name: "孟買", name_en: "Mumbai"},
    {value: "95070", name: "博爾本德爾", name_en: "Porbandar"},
    {value: "95071", name: "布萊爾港", name_en: "Port blair"},
    {value: "95099", name: "其他印度地區", name_en: "Others, India"},


    // from auto
    {value: "20001", name: "安提加及巴布達", name_en: "Antigua and Barbuda"},
    {value: "20002", name: "阿根廷", name_en: "Argentina"},
    {value: "20003", name: "巴哈馬", name_en: "Bahamas"},
    {value: "20004", name: "巴巴多斯", name_en: "Barbados"},
    {value: "20005", name: "百慕達", name_en: "Bermuda"},
    {value: "20006", name: "玻利維亞", name_en: "Bolivia"},
    {value: "20007", name: "巴西", name_en: "Brasil"},
    {value: "20008", name: "伯利茲", name_en: "Belize"},
    {value: "20009", name: "英屬處女群島", name_en: "British Virgin Islands"},
    {value: "20010", name: "加拿大", name_en: "Canada"},
    {value: "20011", name: "開曼群島", name_en: "Cayman Islands"},
    {value: "20012", name: "智利", name_en: "Chile"},
    {value: "20013", name: "哥倫比亞", name_en: "Colombia"},
    {value: "20014", name: "哥斯達尼加", name_en: "Costa Rica"},
    {value: "20015", name: "古巴", name_en: "Cuba"},
    {value: "20016", name: "多米尼加島", name_en: "Dominica"},
    {value: "20017", name: "多米尼加共和國", name_en: "Dominican Republic"},
    {value: "20018", name: "厄瓜多爾", name_en: "Ecuador"},
    {value: "20019", name: "薩爾瓦多", name_en: "El Salvador"},
    {value: "20020", name: "法蘭克福群島", name_en: "Falkland Islands (Malvinas)"},
    {value: "20021", name: "法屬圭亞那", name_en: "French Guiana"},
    {value: "20022", name: "格陵蘭", name_en: "GreenLand"},
    {value: "20023", name: "格林納達", name_en: "Grenada"},
    {value: "20024", name: "瓜德羅普島", name_en: "Guadeloupe"},
    {value: "20025", name: "危地馬拉", name_en: "Guatemala"},
    {value: "20026", name: "圭亞那", name_en: "Guyana"},
    {value: "20027", name: "海地", name_en: "Haiti"},
    {value: "20028", name: "洪都拉斯共和國", name_en: "Honduras"},
    {value: "20029", name: "牙買加", name_en: "Jamaica"},
    {value: "20030", name: "馬提尼克", name_en: "Martinique"},
    {value: "20031", name: "墨西哥", name_en: "Mexico"},
    {value: "20032", name: "蒙塞拉特", name_en: "Montserrat"},
    {value: "20033", name: "荷屬安的列斯", name_en: "Netherlands Antilles"},
    {value: "20034", name: "阿魯巴島", name_en: "Aruba"},
    {value: "20035", name: "尼加拉瓜", name_en: "Nicaraagua"},
    {value: "20036", name: "巴拿馬", name_en: "Panama"},
    {value: "20037", name: "巴拉圭", name_en: "Paraguary"},
    {value: "20038", name: "秘魯", name_en: "Peru"},
    {value: "20039", name: "波多黎各", name_en: "Pureto Rico"},
    {value: "20040", name: "聖基茨和尼維斯", name_en: "Saint Kitts and Nevis"},
    {value: "20041", name: "安圭拉", name_en: "Anguilla"},
    {value: "20042", name: "聖盧西亞島", name_en: "Saint Lucia"},
    {value: "20043", name: "聖彼德及密克隆島", name_en: "St. Pierre and Miquelon"},
    {value: "20044", name: "聖文森特島及格林納丁斯群島", name_en: "Saint Vincent and The Grenadines"},
    {value: "20045", name: "蘇里南", name_en: "Suriname"},
    {value: "20046", name: "千里達及托巴哥", name_en: "Trinidad and Tobago"},
    {value: "20047", name: "等克斯和凱科斯群島", name_en: "Turks and Caicos Islands"},
    {value: "20048", name: "美國", name_en: "United States"},
    {value: "20049", name: "美屬處女群島", name_en: "United States Virgin Islands"},
    {value: "20050", name: "烏拉圭", name_en: "Uruguay"},
    {value: "20051", name: "委內瑞拉", name_en: "Venezuela"},
    {value: "24999", name: "其他美洲國家/地區", name_en: "Other Countries/Region in Americas"},

    {value: "40001", name: "阿爾巴尼亞", name_en: "Albania"},
    {value: "40002", name: "安道耳", name_en: "Andorra"},
    {value: "40003", name: "阿塞拜彊", name_en: "Azerbaijan"},
    {value: "40004", name: "奧地利", name_en: "Austria"},
    {value: "40005", name: "亞美尼亞", name_en: "Armenia"},
    {value: "40006", name: "比利時", name_en: "Belgium"},
    {value: "40007", name: "波斯尼亞及黑塞哥維那", name_en: "Bosnia & Herzegovina"},
    {value: "40008", name: "保加利亞", name_en: "Bulgaria"},
    {value: "40009", name: "白俄羅斯", name_en: "Belarus"},
    {value: "40010", name: "克羅地亞", name_en: "Croatia"},
    {value: "40011", name: "塞浦路斯", name_en: "Cyprus"},
    {value: "40012", name: "捷克", name_en: "Czech Republic"},
    {value: "40013", name: "丹麥", name_en: "Denmark"},
    {value: "40014", name: "愛沙尼亞", name_en: "Estonia"},
    {value: "40015", name: "菲萊爾群島", name_en: "Faeroe Islands"},
    {value: "40016", name: "芬蘭", name_en: "Finland"},
    {value: "40017", name: "法國", name_en: "France"},
    {value: "40018", name: "格魯吉亞", name_en: "Georgia"},
    {value: "40019", name: "德國", name_en: "Germany"},
    {value: "40020", name: "直布羅陀", name_en: "Gibraltar"},
    {value: "40021", name: "希臘", name_en: "Greece"},
    {value: "40022", name: "教廷(位於梵蒂岡)", name_en: "Holy See"},
    {value: "40023", name: "匈牙利", name_en: "Hungary"},
    {value: "40024", name: "冰島", name_en: "Iceland"},
    {value: "40025", name: "愛爾蘭", name_en: "Ireland"},
    {value: "40026", name: "以色列", name_en: "Israel"},
    {value: "40027", name: "意大利", name_en: "Italy"},
    {value: "40028", name: "哈薩克", name_en: "Kazakhstan"},
    {value: "40029", name: "吉爾吉斯", name_en: "Kyrgyzstan"},
    {value: "40030", name: "拉脫維亞", name_en: "Latvia"},
    {value: "40031", name: "列支敦士登", name_en: "Liechtenstein"},
    {value: "40032", name: "立陶宛", name_en: "Lithuania"},
    {value: "40033", name: "盧森堡", name_en: "Luxembourg"},
    {value: "40034", name: "馬爾他", name_en: "Malta"},
    {value: "40035", name: "摩納哥", name_en: "Monaco"},
    {value: "40036", name: "摩爾多瓦", name_en: "Republic of Moldova"},
    {value: "40037", name: "荷蘭", name_en: "Netherlands"},
    {value: "40038", name: "挪威", name_en: "Norway"},
    {value: "40039", name: "波蘭", name_en: "Poland"},
    {value: "40040", name: "葡萄牙", name_en: "Portugal"},
    {value: "40041", name: "羅馬尼亞", name_en: "Romania"},
    {value: "40092", name: "聖馬力諾", name_en: "San Marino"},
    {value: "40093", name: "斯洛伐克", name_en: "Slovakia"},
    {value: "40094", name: "斯洛文尼亞", name_en: "Slovenia"},
    {value: "40095", name: "西班牙", name_en: "Spain"},
    {value: "40096", name: "冷岸群島及揚馬延島", name_en: "Svalbard and Jan Mayen Islands"},
    {value: "40097", name: "瑞典", name_en: "Sweden"},
    {value: "40098", name: "瑞士", name_en: "Switzerland"},
    {value: "40099", name: "塔吉克", name_en: "Tajikistan"},
    {value: "40100", name: "土耳其", name_en: "Turkey"},
    {value: "40101", name: "土耳曼", name_en: "Turkmenistan"},
    {value: "40102", name: "烏克蘭", name_en: "Ukraine"},
    {value: "40103", name: "馬其頓", name_en: "The Former Yugoslav Republic of Macedonia"},
    {value: "40104", name: "英國", name_en: "United Kingdom"},
    {value: "40105", name: "海峽群島", name_en: "Channel Islands"},
    {value: "40106", name: "馬恩島", name_en: "Isle of Man"},
    {value: "40107", name: "烏茲別克", name_en: "Uzbekistan"},
    {value: "40108", name: "南斯拉夫", name_en: "Yugoslavia"},
    {value: "40111", name: "塞爾維亞", name_en: "Republic of Serbia"},
    // {value: "42000", name: "俄羅斯"},
    {value: "42021", name: "莫斯科", name_en: "Russia / Moscow"},
    {value: "42099", name: "其他俄羅斯地區", name_en: "Others, Russia"},
    {value: "44999", name: "其他歐洲國家 / 地區", name_en: "Other Countries / Region in Europe"},


    {value: "70001", name: "文萊", name_en: "Brunei Darussalam"},
    {value: "70002", name: "緬甸", name_en: "Myanmar (Burma)"},
    {value: "70003", name: "柬埔寨", name_en: "Cambodia"},
    {value: "70004", name: "寮國", name_en: "Lao People's Dem Republic"},
    {value: "70005", name: "馬來西亞", name_en: "Malaysia"},
    {value: "70006", name: "菲律賓", name_en: "Philippines"},
    {value: "70007", name: "新加坡", name_en: "Singapore"},
    {value: "70008", name: "越南", name_en: "Viet Nam"},
    {value: "70009", name: "泰國", name_en: "Thailand"},
    {value: "70010", name: "帝汶", name_en: "Timor"},


    {value: "90001", name: "阿爾及利亞", name_en: "Algeria"},
    {value: "90002", name: "安哥拉", name_en: "Angola"},
    {value: "90003", name: "博茨瓦納", name_en: "Botswana"},
    {value: "90004", name: "印度洋地區(英屬地區)", name_en: "British Indian Ocean Territory"},
    {value: "90005", name: "貝隆", name_en: "Burundi "},
    {value: "90006", name: "喀麥隆", name_en: "Cameroon"},
    {value: "90007", name: "彿得角群島", name_en: "Cape Verde"},
    {value: "90008", name: "中非共和國", name_en: "Central African Republic"},
    {value: "90009", name: "乍得", name_en: "Chad"},
    {value: "90010", name: "科摩羅群島", name_en: "Comoros"},
    {value: "90011", name: "剛果", name_en: "Democratic Republic of the Congo"},
    {value: "90012", name: "貝寧", name_en: "Benin"},
    {value: "90013", name: "赤道幾內亞", name_en: "Equatorial Guinea"},
    {value: "90014", name: "埃塞俄比亞", name_en: "Ethiopia (Ethiopia & Eritrea)"},
    {value: "90015", name: "吉布提", name_en: "Djibouti"},
    {value: "90016", name: "加蓬", name_en: "Gabon"},
    {value: "90017", name: "岡比亞", name_en: "Gambia"},
    {value: "90018", name: "迦納", name_en: "Ghana"},
    {value: "90019", name: "幾內亞", name_en: "Guinea"},
    {value: "90020", name: "象加海岸", name_en: "Cote D'ivoire"},
    {value: "90021", name: "肯亞", name_en: "Kenya"},
    {value: "90022", name: "萊索托", name_en: "Lesotho"},
    {value: "90023", name: "利比利亞", name_en: "Liberia"},
    {value: "90024", name: "馬達加斯加", name_en: "Madagascar"},
    {value: "90025", name: "馬拉威", name_en: "Malawi"},
    {value: "90026", name: "馬利", name_en: "Mali"},
    {value: "90027", name: "毛里塔尼亞", name_en: "Mauritania"},
    {value: "90028", name: "毛里求斯", name_en: "Mauritius"},
    {value: "90029", name: "摩洛哥", name_en: "Morocco"},
    {value: "90030", name: "莫三鼻級", name_en: "Mozambique"},
    {value: "90031", name: "納米比亞", name_en: "Namibia"},
    {value: "90032", name: "尼日爾", name_en: "Niger"},
    {value: "90033", name: "尼日利亞", name_en: "Nigeria"},
    {value: "90034", name: "幾內亞比治", name_en: "Guinea-Bissau"},
    {value: "90035", name: "留尼汪島", name_en: "Reunion"},
    {value: "90036", name: "盧安達", name_en: "Rwanda"},
    {value: "90037", name: "聖赫勒拿", name_en: "Saint Helena"},
    {value: "90038", name: "聖美多和魯林西比", name_en: "Sao Tome & Principe"},
    {value: "90039", name: "塞內加爾", name_en: "Senegal"},
    {value: "90040", name: "塞舌耳群島", name_en: "Seychelles"},
    {value: "90041", name: "塞拉里昴", name_en: "Sierra Leone"},
    {value: "90042", name: "索馬利亞", name_en: "Somalia"},
    {value: "90043", name: "南非共和國", name_en: "South Africa"},
    {value: "90044", name: "津巴布韋", name_en: "Zimbabwe"},
    {value: "90045", name: "蘇丹", name_en: "Sudan"},
    {value: "90046", name: "斯威士蘭", name_en: "Swaziland"},
    {value: "90047", name: "多哥", name_en: "Togo"},
    {value: "90048", name: "突尼西亞", name_en: "Tunisia"},
    {value: "90049", name: "烏干達", name_en: "Uganda"},
    {value: "90050", name: "坦桑尼亞", name_en: "United Republic of Tanzania"},
    {value: "90051", name: "桑比亞", name_en: "Zambia"},
    {value: "90099", name: "其他非洲國家 / 地區", name_en: "Other Countries / Region in Africa"},


    {value: "75001", name: "瑙魯", name_en: "Nauru"},
    {value: "75002", name: "新喀里多尼亞島", name_en: "New Caledonia"},
    {value: "75003", name: "亞努亞圖", name_en: "Vanuatu"},
    {value: "75004", name: "紐西蘭", name_en: "New Zealand"},
    {value: "75005", name: "紐埃島", name_en: "Niue"},
    {value: "75006", name: "諾福克島", name_en: "Norfolk Island"},
    {value: "75007", name: "馬里安納群島北部", name_en: "Northern Mariana Islands"},
    {
        value: "75008",
        name: "密克羅尼西亞聯邦",
        name_en: "Micronesia, Federated States of (Kosrae State, Pohnpei State, Truk State & Yap State)"
    },
    {value: "75009", name: "馬紹爾群島", name_en: "Marshall Islands"},
    {value: "75010", name: "帛琉島", name_en: "Palau"},
    {value: "75011", name: "巴布亞新幾內亞", name_en: "Papua New Quinea"},
    {value: "75012", name: "托克勞群島", name_en: "Tokelau"},
    {value: "75013", name: "湯加", name_en: "Tonga"},
    {value: "75014", name: "圖瓦盧", name_en: "Tuvalu"},
    {value: "75015", name: "威特島", name_en: "Wake Island"},
    {value: "75016", name: "瓦利斯和富士那群島", name_en: "Wallis and Futuna Islands"},
    {value: "75017", name: "薩摩亞群島", name_en: "Samoa"},
    {value: "75018", name: "美屬薩摩亞群島", name_en: "American Samoa / Pago-Pago"},
    {value: "75019", name: "澳洲", name_en: "Australia"},
    {value: "75020", name: "所羅門島", name_en: "Solomon Islands"},
    {value: "75021", name: "聖誕島", name_en: "Christmas Island (Australia)"},
    {value: "75022", name: "可可群島", name_en: "Cocos (Keeling) Islands"},
    {value: "75023", name: "科克群島", name_en: "Cook Islands"},
    {value: "75024", name: "斐濟群島", name_en: "Fiji"},
    {value: "75025", name: "法屬波利尼西亞", name_en: "French Polynesia"},
    {value: "75026", name: "基里巴斯", name_en: "Kiribati"},
    {value: "75027", name: "關島", name_en: "Guam"},
    {value: "75028", name: "莊士敦島", name_en: "Johnston Island"},
    {value: "75029", name: "中途島", name_en: "Midway Islands"},
    {value: "75030", name: "其他太平洋國家 / 地區", name_en: "Other Countries / Region in Pacific"},
    {value: "75050", name: "美屬薩摩亞群島", name_en: "American Samoa / Others, American Samao"},

    {value: "91300", name: "皮特凱恩島", name_en: "Pitcairn"},
    {value: "91401", name: "巴林島", name_en: "Bahrain"},
    {value: "91402", name: "巴勒斯坦", name_en: "Palestine"},
    {value: "91403", name: "伊拉克", name_en: "Iraq"},
    {value: "91404", name: "約旦", name_en: "Jordan"},
    {value: "91405", name: "科威特", name_en: "Kuwait"},
    {value: "91406", name: "黎巴嫩", name_en: "Lebanon"},
    {value: "91407", name: "利比亞", name_en: "Libyan Arab Jamahiriya"},
    {value: "91408", name: "阿曼", name_en: "Omen"},
    {value: "91409", name: "敘利亞", name_en: "Syrian Arab Republic"},
    {value: "91410", name: "埃及", name_en: "Egypt"},
    {value: "91411", name: "也門", name_en: "Yemen"},
    {value: "91499", name: "其他中東國家 / 地區", name_en: "Other Countries / Region in Middle Asia"},
    {value: "91501", name: "卡塔爾", name_en: "Qatar"},
    {value: "91101", name: "朝鮮", name_en: "Korea, Dem People's Rep of Korea"},
    {value: "91200", name: "蒙古", name_en: "Mongolia"},
    {value: "95001", name: "阿富汗", name_en: "Afghanistan"},
    {value: "95002", name: "孟加拉", name_en: "Bangladesh"},
    {value: "95003", name: "不丹", name_en: "Bhutan"},
    {value: "95004", name: "斯里蘭卡", name_en: "Sri Lanka"},
    {value: "95006", name: "伊朗", name_en: "Iran, Islamic Republic of"},
    {value: "95007", name: "馬爾代夫", name_en: "Maldives"},
    {value: "95008", name: "尼泊爾", name_en: "Nepal"},
    {value: "95009", name: "巴基斯坦", name_en: "Pakistan"},
    {value: "95199", name: "其他亞洲國家 / 地區", name_en: "Other Countries / Region in Asia"}

];

var PRODUCTS_JSON = [
    {value:"0204", name: "頸巾、手套、皮帶、襪子 、帽"},
    {value:"0301", name: "香煙"},
    {value:"0302", name: "雪茄"},
    {value:"0349", name: "其他煙(需說明)"},
    {value:"0351", name: "拔蘭地、威士忌"},
    {value:"0352", name: "中國烈酒、茅台"},
    {value:"0353", name: "其他烈酒（餐前酒、蛇酒、補酒）"},
    {value:"0354", name: "香檳、葡萄汽酒"},
    {value:"0355", name: "紅酒白酒"},
    {value:"0356", name: "其他酒（清酒、米酒、水果酒）"},
    {value:"0357", name: "啤酒"},
    {value:"0399", name: "其他酒(需說明)"},
    {value:"0602", name: "中藥、中成藥"},
    {value:"0603", name: "西藥"},
    {value: "0604", name: "奶粉（1歲或以下嬰兒食用)", rank: "2"},
    {value:"0605", name: "保健品、營養補給品(魚肝油, 藍莓酵素等)"},
    // {value:"0803", name: "上網卡"},
    {value:"0804", name: "傳真機"},
    {value:"0805", name: "家居用電話"},
    {value:"0839", name: "其他通訊產品(需說明)"},
    {value:"0841", name: "電鬚刨"},
    {value:"0842", name: "電風筒"},
    {value:"0843", name: "電牙刷"},
    {value:"0844", name: "雪櫃、冷藏櫃"},
    {value:"0845", name: "洗衣機、乾衣機"},
    {value:"0846", name: "乾衣機"},
    {value:"0847", name: "電煮食爐"},
    {value:"0848", name: "電飯煲"},
    {value:"0849", name: "微波爐"},
    {value:"0850", name: "電焗爐"},
    {value:"0851", name: "冷氣機"},
    {value:"0852", name: "抽濕機"},
    {value:"0853", name: "電暖爐"},
    {value:"0854", name: "按摩椅"},
    {value:"0855", name: "按摩器"},
    {value:"0856", name: "吸塵機"},
    {value:"0857", name: "電熱水爐"},
    {value:"0858", name: "咖啡壺"},
    {value:"0859", name: "搾汁機、攪拌機"},
    {value:"0860", name: "多士爐"},
    {value:"0861", name: "電熱板"},
    {value:"0862", name: "電熨斗、電熨板"},
    {value:"0863", name: "電水煲、電水壺"},
    {value:"0864", name: "電風扇"},
    {value:"0865", name: "電氈"},
    {value:"0866", name: "電磁爐"},
    {value:"0867", name: "飲水機"},
    {value:"0868", name: "空氣清新機"},
    {value:"0869", name: "美容儀"},
    {value:"0870", name: "香薰加濕器(小型)"},
    {value:"0899", name: "其他家庭電器"},
    // {value:"0901", name: "CRT電視"},
    {value:"0902", name: "Plasma電視"},
    {value:"0903", name: "LCD電視"},
    {value:"0904", name: "錄影機、硬碟錄影機、數碼影碟機"},
    {value:"0905", name: "投影機"},
    {value:"0906", name: "其他影視設備"},
    {value:"0907", name: "高清解碼器(機頂盒)"},
    {value:"0908", name: "音響、迷你音響組合"},
    {value:"0909", name: "汽車音響組合"},
    {value:"0910", name: "擴音器、音響調諧器"},
    {value:"0911", name: "揚聲器（喇叭）"},
    {value:"0912", name: "鐳射唱盤"},
    {value:"0913", name: "手提收音錄音機"},
    {value:"0914", name: "收音機鬧鐘"},
    {value:"0915", name: "多媒體播放器 (MP3/MP4)"},
    {value:"0916", name: "手提迷你鐳射唱機、耳筒鐳射唱機"},
    {value:"0917", name: "咪"},
    {value:"0918", name: "耳筒"},
    {value:"0919", name: "其他音響設備"},
    {value:"0920", name: "菲林相機"},
    {value:"0921", name: "數碼相機及攝錄機"},
    {value:"0923", name: "其他攝錄設備(充電器)"},
    {value:"0924", name: "鏡頭"},
    {value:"0925", name: "閃光燈"},
    {value:"0926", name: "其他攝影及攝錄設備配件（腳架）"},
    {value:"0927", name: "光學儀器（望遠鏡、放大鏡）"},
    {value:"0928", name: "錄影帶"},
    {value:"0929", name: "菲林"},
    {value:"0930", name: "電子相簿"},
    {value:"0959", name: "其他影音器材(需說明)"},
    {value:"0961", name: "桌面電腦"},
    {value:"0962", name: "手提電腦(包括ipad等平板電腦)"},
    {value:"0963", name: "打印機(包括多合一打印機)"},
    {value:"0964", name: "顯示器"},
    {value:"0965", name: "硬磁盤"},
    {value:"0966", name: "掃描器"},
    {value:"0967", name: "光碟燒錄機"},
    {value:"0968", name: "應用軟件"},
    {value:"0969", name: "顯示器過濾屏"},
    {value:"0970", name: "其他電腦及周邊設備(滑鼠、讀咭器、讀卡機)"},
    {value:"0971", name: "儲存咭 (SD卡)"},
    {value:"0972", name: "快閃記憶體 (USB)"},
    {value:"0973", name: "鐳射光碟 (CDR/CDRW)"},
    {value:"0974", name: "數碼影音光碟 (DVDR/DVDRW)"},
    {value:"0999", name: "其他電腦及周邊設備(需說明)"},
    {value:"1011", name: "餅乾"},
    {value:"1012", name: "月餅"},
    {value:"1013", name: "中式飽點、糕餅 (糉、年榚、油條等)"},
    {value:"1016", name: "鹹魚"},
    {value:"1018", name: "貴價乾海味：乾鮑、魚翅、響螺片、花膠、乾瑤柱、燕窩等"},
    {value:"1019", name: "平價乾海味：蝦乾、魚乾、魷魚乾、魚乾、淡菜等"},
    {value:"1020", name: "罐裝魚（沙甸魚、豆豉鯪魚）"},
    {value:"1021", name: "罐裝海產（田螺、煙蠔、鮑貝、鮑魚等）"},
    {value:"1022", name: "海產製品(紫菜)"},
    {value:"1023", name: "芝士"},
    {value:"1024", name: "花生醬、果醬、牛油類"},
    {value:"1025", name: "生果"},
    {value:"1026", name: "乾果、涼果"},
    {value:"1028", name: "包裝或罐裝果仁、花生、瓜子、開心果、腰果"},
    {value:"1029", name: "朱古力"},
    {value:"1030", name: "糖果、軟糖、香口膠、香口珠"},
    {value:"1031", name: "中式糖果、賀年糖果"},
    {value:"1032", name: "啫哩、大菜榚、木糠布甸"},
    {value:"1033", name: "雪糕、雪條、甜筒"},
    {value:"1034", name: "雪糕蛋糕"},
    {value: "1035", name: "嬰兒食品，奶粉(1歲以上嬰兒食用奶粉)", rank: "1"},
    {value:"1036", name: "薯片、薯條、蝦片、蝦條"},
    {value:"1037", name: "魷魚絲、魷魚片"},
    {value:"1039", name: "零食:百寶粥、甘大滋、芝士圈、香腸"},
    {value:"1042", name: "龜苓膏"},
    {value:"1043", name: "即食燕窩"},
    {value:"1044", name: "食用油"},
    {value:"1045", name: "蜜糖"},
    {value:"1047", name: "粉麵、意粉、通心粉、即食麵"},
    {value:"1049", name: "麵包、西餅、蛋糕、批及餡餅"},
    {value:"1051", name: "燒臘、臘肉、臘味"},
    {value:"1052", name: "小食(紅豆餅、茶葉蛋、印尼小食、炒栗子）"},
    {value:"1079", name: "其他食物(需說明)"},
    {value:"1081", name: "鮮奶、紙包奶、朱古力奶及其他奶類(成人奶粉)"},
    {value:"1082", name: "咖啡豆、咖啡粉、即溶咖啡粉"},
    {value:"1083", name: "紙包或罐裝飲品"},
    {value:"1084", name: "茶葉、茶包、減肥茶"},
    {value:"1085", name: "紙包或罐樽裝茶類飲品（檸檬茶、菊花茶、綠茶）"},
    {value:"1086", name: "即沖飲品（阿華田、好立克）"},
    {value:"1087", name: "礦泉水、蒸餾水"},
    {value:"1088", name: "有汽汽水（梳打水、湯力、薑啤）"},
    {value:"1089", name: "新鮮果汁、蔬菜汁、果汁先生"},
    {value:"1090", name: "提神飲品（葡萄適、寶礦力、力保健、紅牛）"},
    {value:"1099", name: "其他飲品(需說明)"},
    {value:"1101", name: "羽毛球"},
    {value:"1102", name: "羽毛球拍"},
    {value:"1103", name: "網球"},
    {value:"1104", name: "網球拍"},
    {value:"1105", name: "壁球"},
    {value:"1106", name: "壁球拍"},
    {value:"1107", name: "高爾夫球"},
    {value:"1108", name: "高爾夫球桿"},
    {value:"1109", name: "高爾夫球桿套"},
    {value:"1110", name: "其他球類(足球、籃球)"},
    {value:"1111", name: "其他球拍"},
    {value:"1112", name: "健身儀器"},
    {value:"1113", name: "垂釣用具（魚竿、魚簍、魚網、魚餌）"},
    {value:"1114", name: "沙灘用品（飛碟、橡皮艇）"},
    {value:"1149", name: "其他運動用品(需說明)"},
    {value:"1151", name: "牙刷"},
    {value:"1152", name: "牙膏"},
    {value:"1153", name: "其他牙齒護理用品（假牙清潔片、牙線）"},
    {value:"1154", name: "鬚刨及剃刀、鬚刨刀片"},
    {value:"1155", name: "髮梳、髮擦、髮夾、捲筒"},
    {value:"1156", name: "個人量重器（磅）"},
    {value: "1157", name: "香皂、沐浴液", rank: "3"},
    {value: "1158", name: "洗髮水及護髮素、焗油", rank: "4"},
    {value:"1159", name: "爽身粉"},
    {value:"1160", name: "剃鬚膏"},
    {value:"1161", name: "其他盥洗用品(滴露、潄口水)"},
    {value:"1162", name: "廁紙、紙巾、面紙、濕紙巾"},
    {value:"1163", name: "衛生巾"},
    {value:"1164", name: "紙尿片"},
    {value:"1165", name: "棉花棒、浴室海棉"},
    {value:"1166", name: "浴巾、面巾、毛巾"},
    {value:"1167", name: "止汗用品"},
    {value: "1199", name: "其他個人護理用品(需說明)", rank: "5"},
    {value:"1201", name: "掛牆鐘、座檯鐘、鬧鐘"},
    {value:"1202", name: "其他鐘錶（秒錶、袋錶）"},
    {value:"1204", name: "地氈"},
    {value:"1205", name: "枕頭"},
    {value:"1206", name: "被、氈、羽絨被、棉胎"},
    {value:"1207", name: "其他床上用品(被套、枕頭套、床笠、床單)"},
    {value:"1208", name: "座椅軟墊 (咕臣)"},
    {value:"1209", name: "梳化套"},
    {value:"1210", name: "手提煮食爐"},
    {value:"1211", name: "濾水器"},
    {value:"1212", name: "杯、碟、碗"},
    {value:"1213", name: "茶具（套）"},
    {value:"1214", name: "水晶擺設、銀器擺設"},
    {value:"1215", name: "玻璃、陶瓷擺設、裝飾品(花瓶)"},
    {value:"1216", name: "其他玻璃、陶瓷製品"},
    {value:"1217", name: "匙羹、餐刀、叉"},
    {value:"1218", name: "其他餐具（筷子、膠碟）"},
    {value:"1219", name: "水煲"},
    {value:"1220", name: "真空煲"},
    {value:"1221", name: "保暖瓶、熱水瓶"},
    {value:"1222", name: "其他家居容器-厠紙筒、生果盤、煙灰盅、雜物箱"},
    {value:"1223", name: "套裝廚具"},
    {value:"1225", name: "電芯、電池"},
    {value:"1226", name: "手電筒"},
    {value:"1227", name: "其他雜項物品(門鐘、視音頻線、鎖)"},
    {value:"1228", name: "清潔用品(洗衣粉、擦亮劑、柔順劑)"},
    {value:"1259", name: "其他家居用品(需說明)"},
    // {value:"1261", name: "計數機"},
    // {value:"1262", name: "個人數碼助理 / 袋裝電腦 (PDA/PPC)"},
    // {value:"1263", name: "電子字典/辭典"},
    // {value:"1299", name: "其他文儀用品(需說明)"},
    {value:"1301", name: "隱形眼鏡清潔劑"},
    {value:"1302", name: "其他旅行用品及袋(手推車)"},
    {value:"1303", name: "嬰兒手推車"},
    {value:"1304", name: "汽車之嬰兒座位"},
    {value:"1305", name: "其他嬰兒用物品(奶嘴)"},
    {value:"1306", name: "太陽眼鏡"},
    {value:"1307", name: "雨傘"},
    {value:"1308", name: "煙斗"},
    {value:"1309", name: "打火機"},
    {value:"1310", name: "掛畫、掃描"},
    {value:"1311", name: "雕刻、雕塑品"},
    {value:"1312", name: "其他家居陳設品、相架、風鈴、拜神石座"},
    {value:"1313", name: "蠟燭"},
    {value:"1314", name: "退熱冰墊、退熱貼"},
    {value:"1315", name: "暖水袋、暖包"},
    {value:"1316", name: "藥水膠布、脫苦海"},
    {value:"1317", name: "矯正視力眼鏡（近視、遠視、老花）"},
    {value:"1318", name: "隱形眼鏡"},
    {value:"1319", name: "樂器"},
    {value:"1320", name: "撲克牌"},
    {value:"1321", name: "棋子"},
    {value:"1322", name: "手提電子遊戲機 (PSP、NDSL)"},
    {value:"1323", name: "接駁電視遊戲機（wii、play-station）"},
    {value:"1324", name: "電子遊戲機盒帶"},
    {value:"1325", name: "遊戲光碟"},
    {value: "1326", name: "玩具", rank: "6"},
    {value:"1327", name: "節日裝飾品 ( 響鈴)"},
    {value:"1328", name: "汽車用品"},
    {value:"1329", name: "其他消閒品及用具 ( 相簿、遊戲機膠套、音樂盒)"},
    {value:"1330", name: "游泳鏡"},
    // {value:"1331", name: "本地中文報"},
    // {value:"1332", name: "其他非本地報章"},
    // {value:"1333", name: "葡文報"},
    {value:"1334", name: "漫畫"},
    // {value:"1335", name: "雜誌（時裝、汽車、室內設計、電腦）"},
    // {value:"1336", name: "英文週刊（時代週刊）"},
    {value:"1337", name: "其他圖書"},
    {value:"1338", name: "含資料之鐳射唱碟(CD)"},
    {value:"1339", name: "含資料之影音光碟(DVD/VCD)"},
    {value:"1340", name: "其他含資料或影像之錄製媒體"},
    {value:"1341", name: "郵票及集郵品(名信片)"},
    {value:"1342", name: "其他集郵用品（郵票簿、郵票目錄）"},
    {value:"1343", name: "文具"},
    {value:"1344", name: "仿首飾"},
    {value:"1345", name: "口包/口罩"},
    {value:"1347", name: "個人數碼助理 / 袋裝電腦 (PDA/PPC)"},
    {value:"1348", name: "電子字典/辭典"},
    {value:"1349", name: "計數機"},
    {value:"1351", name: "古玩、名畫、瓷器"},
    {value:"1352", name: "仿古玩"},
    {value:"1353", name: "相簿"},
    {value:"1354", name: "音樂盒"},
    {value:"1355", name: "傢私"},
    {value:"1356", name: "仿古傢私"},
    {value:"1357", name: "磁貼(紀念品)"},
    {value:"1358", name: "鎖匙扣(紀念品)"},
    {value:"1399", name: "其他(需說明)"},
];




