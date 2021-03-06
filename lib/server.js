//Required Libraries
var http = require('http');
var url = require('url');
var StringDecoder = require("string_decoder").StringDecoder;
var handlers = require("./handlers");
var  _data = require("./data");
var helpers = require("./helpers");

var lib = {};

lib.server = http.createServer(function(req,res){
	var decoder = new StringDecoder('utf-8');
	var parsedUrl = url.parse(req.url,true);
	var path = parsedUrl.pathname;
	var trimmedPath = path.replace(/^\/+|\/+$/g,"");
	var query = parsedUrl.query;
	var method = req.method;
	var headers = req.headers;
	var buffer = "";
	req.on("data",function(data){
		buffer += decoder.write(data);
	});
	req.on("end",function(){
		var data = {
			"path" : trimmedPath,
			"query" : query,
			"method" : method,
			"headers" : headers,
			"payload" : helpers.parseIntoJSON(buffer)
		};
		var chosenHandler = typeof(lib.router[trimmedPath]) != "undefined" ? lib.router[trimmedPath] : handlers.notFoundHandler;
		chosenHandler(data,function(statusCode,data){
			res.setHeader('Content-Type','application/json');
			res.writeHead(statusCode);
			res.end(JSON.stringify(data));
		});
	});
});


//Define Routes
lib.router = {
	"ping" : handlers.pingHandler,
	"users" : handlers.usersHandler,
	"tokens" : handlers.tokensHandler,
	"checks" : handlers.checksHandler
};


//Listen to port

lib.init = function(){
	lib.server.listen(3000,function(){
		//Log to console
		console.log("Server Started at port 3000");
	});
};

module.exports = lib;