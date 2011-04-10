var sys = require("sys");
    http = require('http');
    url = require('url');
    path = require('path');
    fs = require('fs');
    events = require('events');
var Mu = require('./lib/mu');

Mu.templateRoot = './';

var API_KEY = '4522743d51eb337111172b55c2f92434';
var ip = "127.0.0.1";
//var ip = "64.30.136.162";
//var port = "8124";
var port = "80";
var api_emitter = new events.EventEmitter();

var ctx = {};

http.createServer(function (request, response) {
    var uri = url.parse(request.url).pathname;
    var params = url.parse(request.url,true).query;
    var filename = path.join(process.cwd(), uri);
    var uri_start = uri.substring(0,7);
    var search_path;
    
    var period = uri.substring(uri.length-4,uri.length-3);
    var period_2 =  uri.substring(uri.length-3,uri.length-2);

    var dance_path = false;
    if(uri == '/') {
        filename = 'index.html';
    }
    else if(uri == '/dance') {
        filename = 'dance.html';
        dance_path = true;
    }
    else if(uri_start == '/dance/' && !('.' == period || '.' == period_2)) {
        search_path = uri.substring(7,uri.length);
        ctx['input_term'] = search_path;
        filename = 'dance.html';
        dance_path = true;
    }

    if(dance_path) {
        var finalProd = '';
            Mu.render('dance.html', ctx, {}, function(err, output) {
                if(err) throw err;
            
                output
                .addListener('data', function(c) {
                    finalProd += c;
                })
                .addListener('end', function() { 
                    response.statusCode = 200;
                    response.end(finalProd, 'binary');
                })
            });
    }
    else {

    path.exists(filename, function(exists) {
	    if(!exists) {
	        response.statusCode = 404;
	        response.end('404 Not Found\n');
	        return;
	    }
        else{
                fs.readFile(filename, 'binary', function(err, file) {
	            if(err) {
		            response.statusCode = 500;
            		response.end(err+'\n');
	    	        return;
            	  }
	            response.statusCode = 200;
       	        response.end(file, 'binary');
    	        });
        }
    });
    }
}).listen(80, "64.30.136.162");
//}).listen(8124, "127.0.0.1");
console.log('Server running at http://127.0.0.1:8124/');

