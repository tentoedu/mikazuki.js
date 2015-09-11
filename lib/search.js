/**
 * search.js
 * 
 * @author Hiroki Tanioka <tanioka@tento-net.com>
 * @version 0.2
 * @since 2015.7.18
 */

var fs = require('fs'), 
	path = require('path'), 
	kuromoji = require("kuromoji");

var tindex = null;
var dindex = null;
var tokenizer = null;

/**
 * Initialization for indexing previously
 */
var initialize = function(dirpath) {
	tindex = {};
	dindex = [];

	kuromoji.builder({ dicPath: "./node_modules/kuromoji/dist/dict/" }).build(function (err, tokenizer_) {
		tokenizer = tokenizer_;
		// tokenizer is ready
		var path = tokenizer.tokenize("first sentence");
		// console.log(path);
		
		if (!dirpath) {
			dirpath = './files/';
		}
		readfiles(dirpath);
	});
}
module.exports.initialize = initialize;

/**
 * Search function for query
 * 
 * @param sentence as query in String
 * @res sortarray as a sorted Array
 */
var searching = function(sentence) {
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

	return sortarray;
};
module.exports.searching = searching;

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
module.exports.indexing = indexing;

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
module.exports.readfiles = readfiles;

/**
 * Get document information
 * @param document id
 */
var getdocument = function(docindex) {
	return dindex[docindex];
}
module.exports.getdocument = getdocument;

