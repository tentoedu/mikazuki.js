/**
 * search.js
 * 
 * @author Hiroki Tanioka <tanioka@tento-net.com>
 * @version 0.1
 * @since 2015.7.18
 */

var express = require('express'), 
	app = express(), 
	kuromoji = require("kuromoji");

app.use(express.static('front'));

app.get('/', function (req, res) {

	var query = req.query.q;
	if (query) {
		searching(query, res);
	} else {
		var array = [];
		array.push("<!doctype html>");
		array.push("<html>");
		array.push("<head>");
		array.push("<title>mikazuki</title>");
		array.push("</head>");
		array.push("<body>");
		array.push("<form action=\"/\" method=\"GET\">");
		array.push("<input type=\"text\" name=\"q\" value=\"\" autofocus><br>");
		array.push("</form>");
		array.push("</body>");
		array.push("</html>");
		res.send(array.join('\n'));
	}
});

var server = app.listen(3000, function () {

	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);

});

var tindex = null;
var dindex = null;
var tokenizer = null;

/**
 * Initialization for indexing previously
 */
var initialize = function() {
	tindex = {};
	dindex = [];

	kuromoji.builder({ dicPath: "node_modules/kuromoji/dist/dict/" }).build(function (err, tokenizer_) {
		tokenizer = tokenizer_;
		// tokenizer is ready
		var path = tokenizer.tokenize("first sentence");
		//console.log(path);

		indexing("大動脈解離");
		// http://hanabi.walkerplus.com/list/ar0313/
		indexing("2015年7/18（土）第37回足立の花火東京都足立区約1万2000発　");
	 	indexing("2015年7/19（日）SeaSide Live with 花火東京都江東区452発　");
		indexing(" 2015年7/21（火）第49回葛飾納涼花火大会東京都葛飾区約1万3000発　");
		indexing(" 2015年7/24（金）〜8/27（木） ※期間中複数日開催あり夏休み！ 神宮花火ナイター東京都新宿区300発　(各日)");
		indexing(" 2015年7/25（土）第38回隅田川花火大会東京都墨田区約2万発　(第一会場・第二会場合計)");
		indexing(" 2015年7/25（土）立川まつり 国営昭和記念公園花火大会東京都立川市5000発　(予定)");
		indexing(" 2015年7/30（木）御蔵島花火大会東京都御蔵島村約1000発　");
		indexing(" 2015年8/1（土）エキサイティング花火2015 第40回 江戸川区花火大会東京都江戸川区約1万4000発　");
		indexing(" 2015年8/1（土）第56回いたばし花火大会東京都板橋区約1万2000発　(戸田市と合わせて)");
		indexing(" 2015年8/1（土）八王子花火大会東京都八王子市約3300発　(予定)");
		indexing(" 2015年8/1（土）第67回青梅市納涼花火大会東京都青梅市約3200発　");
		indexing(" 2015年8/1（土）第43回昭島市民くじら祭夢花火東京都昭島市約2000発　");
		indexing(" 2015年8/2（日）神津島 渚の花火大会東京都神津島村約750発　");
		indexing(" 2015年8/4（火）第33回江東花火大会東京都江東区約4000発　");
		indexing(" 2015年8/8（土）第27回東京湾大華火祭東京都中央区約1万2000発");　
		indexing(" 2015年8/8（土）2015 伊豆大島夏まつり花火大会東京都大島町約1000発　");
		indexing(" 2015年8/8（土）奥多摩町町制施行60周年記念事業　第38回奥多摩納涼記念花火大会東京都西多摩郡奥多摩町約1000発　");
		indexing(" 2015年8/11（火）日刊スポーツ新聞社主催 東日本大震災復興チャリティー 2015 神宮外苑花火大会 東京都新宿区約1万発　");
		indexing(" 2015年8/11（火）八丈島納涼花火大会東京都八丈町600発　");
		indexing(" 2015年8/15（土）小笠原サマーフェスティバル大花火大会東京都小笠原村約500発　");
		indexing(" 2015年8/22（土）市制60周年記念 映画のまち調布“夏”花火2015東京都調布市約8000発　(昨年実績)");
		indexing(" 2015年8/29（土）第37回武蔵村山市観光納涼花火大会東京都武蔵村山市2015発　");
		//console.log(dindex);
		//console.log(tindex);
	});
}

/**
 * Search function for query
 * 
 * @param sentence as query in String
 * @param res in Object to response
 */
var searching = function(sentence, res) {
	var terms = tokenizer.tokenize(sentence);
	//console.log(terms);
	var len = terms.length;
	var docarrays = {};
	for (var i = 0; i < len; i++) {
		var term = terms[i];
		//console.log(term);
		var docarray = tindex[term.surface_form];
		if (typeof docarray === 'undefined') {
			continue;
		}
		//console.log(docarray);
		var jlen = docarray.length;
		for (var j = 0; j < jlen; j++) {
			var docindex = docarray[j];
			if (typeof docarrays[docindex] === 'undefined') {
				docarrays[docindex] = 1;
			} else {
				docarrays[docindex]++;
			}
		}
	}
	//console.log(docarrays);

	// sort
	var sortarray = [];
	for (var docindex in docarrays) {
	    sortarray.push({key : docindex, val : docarrays[docindex]});
	}
	var aSIN = new Array();
	sortarray.sort(function(a, b) {
        return b.val - a.val;
    });

	var array = [];
	array.push("<!doctype html>");
	array.push("<html>");
	array.push("<head>");
	array.push("<title>mikazuki</title>");
	array.push("</head>");
	array.push("<body>");
	array.push("<form action=\"/\" method=\"GET\">");
	array.push("<input type=\"text\" name=\"q\" value=\"" + sentence + "\" autofocus><br>");
	array.push("<ol>");
	for (var i = 0; i < sortarray.length; i++) {
		var doc = sortarray[i];
		var key = doc.key;
		var score = doc.val;
		array.push("<li>" + dindex[key] + " [" + score + "]");
	}
	array.push("</ol>");
	array.push("</form>");
	array.push("</body>");
	array.push("</html>");
	res.send(array.join('\n'));
};

/**
 * Indexing function for document
 * 
 * @param sentence of document in String
 */
var indexing = function(sentence) {
	var index = dindex.length;
	dindex[index] = sentence;
	var terms = tokenizer.tokenize(sentence);
	//console.log(terms);
	var array = [];
	var len = terms.length;
	for (var i = 0; i < len; i++) {
		var term = terms[i];
		//console.log(term);
		array.push(term.surface_form);
		var docarray = tindex[term.surface_form];
		if (docarray) {
		} else {
			docarray = new Array();
		}
		docarray.push(index);
		tindex[term.surface_form] = docarray;
	}
}

initialize();	// load kuromoji.js and index documents

