/**
 * search.js
 * 
 * @author Hiroki Tanioka <tanioka@tento-net.com>
 * @version 0.2
 * @since 2015.7.18
 */

var express = require('express'), 
	fs = require('fs'), 
	path = require('path'), 
	app = express(), 
	kuromoji = require("kuromoji");

app.use(express.static('front'));

app.get('/', function (req, res) {

	var query = req.query.q;
	if (query) {
		searching(query, res);
	} else {
		display("", [], res);
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

		readfiles('./files/');
	});
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
		var index = dindex[key];
		array.push("<li><b>" + index.name + "</b> " + index.body + " [" + score + "]");
	}
	array.push("</ol>");
	array.push("</form>");
	array.push("</body>");
	array.push("</html>");
	res.send(array.join('\n'));
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

    display(sentence, sortarray, res);
};

/**
 * Indexing function for document
 * 
 * @param sentence of document in String
 */
var indexing = function(filename, sentence) {
	var index = dindex.length;
	dindex[index] = {name : filename, body : sentence};
	var names = tokenizer.tokenize(filename);
	var terms = sentence && sentence.length > 0 ? tokenizer.tokenize(sentence) : [];
	terms = names.concat(terms);
	// console.log(terms);
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

/**
 * Read local files
 * @param dirpath for loading files in String
 */
var readfiles = function(dirpath) {
	fs.readdir(dirpath, function(err, files){
		if (err) {
			throw err;
		}
		files.forEach(function (file) {
			console.log(file);
			var filepath = path.join(dirpath, file)
			fs.readFile(filepath, function (err, text) {
				if (err) {
					console.error(err);
					return;
				}
				var content = text.toString();
				console.log(content);
				indexing(file, content);
			});	
		});
	});
}

initialize();	// load kuromoji.js and index documents

