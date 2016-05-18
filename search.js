/**
 * search.js
 * 
 * @author Hiroki Tanioka <tanioka@tento-net.com>
 * @version 0.3
 * @updated 2015.9.11
 * @since 2015.7.18
 */

var express = require('express'), 
	mikazuki = require('./lib/search'), 
	app = express();

app.use(express.static('front'));

app.get('/', function (req, res) {

	var query = req.query.q;
	var sortarray = [];
	if (query) {
		sortarray = mikazuki.searching(query);
	}
	display("", sortarray, res);
});

var server = app.listen(3000, function () {

	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);

});

/**
 * Initialization for indexing previously
 */
var initialize = function() {
	mikazuki.initialize();
}

/**
 * Display function for HTTP response
 * 
 * @param sortarray of retrieved documents in Array
 * @param res in Object to response
 */
var display = function(sentence, sortarray, res) {
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
		var index = mikazuki.getdocument(key);
		array.push("<li><b>" + index.name + "</b> " + index.body + " [" + score + "]");
	}
	array.push("</ol>");
	array.push("</form>");
	array.push("</body>");
	array.push("</html>");
	res.send(array.join('\n'));
}

initialize();	// load kuromoji.js and index documents

