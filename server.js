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

    console.log(filename);
    if(filename == null) {
        filename = "dance.html";
    }
    path.exists(filename, function(exists) {
    if(!exists) {
        if(uri == '/map') {
        var productId = params['productId'];
        console.log('productId='+productId);
        response.setHeader('Content-Type','application/json');

        retrieve_reviews(productId);

        var listener = api_emitter.on('data', function(data) {
            response.statusCode = 200; 
            response.end(data);
        }); 
        }
        else if (uri.substring(0,4) == '/api') {
            api_proxy(uri.substring(4));
            var listener = api_emitter.on('data', function(data) {
                response.statusCode = 200;
                response.end(data);
            });
        }   
        else{
	        response.statusCode = 404;
	        response.end('404 Not Found\n');
	        return;
        }
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
}).listen(80, "64.30.136.162");
console.log('Server running at http://127.0.0.1:8124/');



function api_proxy(pathInput) {
    var key_end = '?';
    if(pathInput.indexOf('?')>0) {
        key_end = '&';
    }
    key_end += 'key='+API_KEY;

    var options = { 
        host: 'api.zappos.com',
        port: 80, 
        path: pathInput+key_end,
    };

    console.log("Proxy to: " +options['path']);
    var proxy = http.get(options, function(res) {
        var data = '';
        res.on('data', function(chunk) {
            data += chunk;
        });

        res.on('end', function() {
            api_emitter.emit('data',data);
        });
    });
}

function retrieve_reviews(productId) {
    var options = {
        host: 'api.zappos.com',
        port: 80,
        path: '/Review?productId='+productId+'&key='+API_KEY,
    };
console.log('x');
    var proxy = http.get(options, function(res) {
        var data='';
        res.on('data', function (chunk) {
            data += chunk;
        });

        res.on('end', function () {
            var rval = []; 
            var reviews = JSON.parse(data).reviews;   
            for(var i=0; i<reviews.length; i++) {
                var locationText = reviews[i].location;
                if(locationText != '') {
                    retrieve_coords(i,locationText);                    
                }
            }
           var count = 0;
           var g_listener = api_emitter.on('coord', function(coord) {
              var review = reviews[coord.index];
              reviews[coord.index].x = coord.lat;
              reviews[coord.index].y = coord.lng;
              count += 1;
              if(count == reviews.length-1) {
                api_emitter.emit('data',JSON.stringify(reviews));
               }
           });
            
        });
    }).on('error', function(e) {
        console.log('error. error.'+e.message);
    });
}

function retrieve_coords(i,location) {
    var options = {
        host: 'maps.googleapis.com',
        port: 80,
        path: '/maps/api/geocode/json?sensor=true&address='+escape(location),
    };
  
    var proxy = http.get(options, function(res) {
        var data='';
        res.on('data', function(chunk) {
            data+=chunk;
        });
        res.on('end', function() {
            var resultJSON = JSON.parse(data);
            var result = JSON.parse(data).results[0];
            var location = result.geometry.location;
            location.index=i;
            api_emitter.emit('coord',result.geometry.location);
        });
    });
}
