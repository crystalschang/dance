var sys = require("sys");
    http = require('http');
    url = require('url');
    path = require('path');
    fs = require('fs');
    events = require('events');
var API_KEY = '4522743d51eb337111172b55c2f92434';


var api_emitter = new events.EventEmitter();

http.createServer(function (request, response) {
    var uri = url.parse(request.url).pathname;
    var params = url.parse(request.url,true).query;
    var filename = path.join(process.cwd(), uri);

    if(uri == '/') {
        filename = 'dance.html';
    }

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
}).listen(80, "127.0.0.1");
console.log('Server running at http://127.0.0.1:8124/');

