/*
* Workers File
*
*/

//Dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var _data = require('./data');
var helpers = require('./helpers');

//Container To be exported
var lib = {};

//Init Function
lib.init = function(){

	lib.performCheck();
	
};

lib.verifyData = function(originalCheckData){
	 originalCheckData.phone = typeof(originalCheckData.phone) == "string" && originalCheckData.phone.length == 10 ? originalCheckData.phone : false;
	 originalCheckData.host = typeof(originalCheckData.host) == "string" && originalCheckData.host.length > 0 ? originalCheckData.host : false;
	 originalCheckData.protocol = typeof(originalCheckData.protocol) == "string" && ["http","https"].indexOf(originalCheckData.protocol) > -1 ? originalCheckData.protocol : false;
	 originalCheckData.method = typeof(originalCheckData.method) == "string" && ["get","post","put","delete"].indexOf(originalCheckData.method.toLowerCase()) > -1 ? originalCheckData.method : false;
	 originalCheckData.timoutSeconds = typeof(originalCheckData.timoutSeconds) == "number" && originalCheckData.timoutSeconds % 1 == 0 && originalCheckData.timoutSeconds > 0 && originalCheckData.timoutSeconds <= 5 ? originalCheckData.timoutSeconds : false;
	 originalCheckData.successCodes = typeof(originalCheckData.successCodes) == "object" && originalCheckData.successCodes instanceof Array && originalCheckData.successCodes.length > 0 ? originalCheckData.successCodes : false;

	 if(originalCheckData.phone && originalCheckData.host && originalCheckData.protocol && originalCheckData.method && originalCheckData.timoutSeconds && originalCheckData.successCodes){
	 	lib.check(originalCheckData);
	 }else{
	 	console.log("Error : One of the checks is not properly framed skipping it : ",JSON.stringify(originalCheckData));
	 }
};

lib.performCheck = function(){
	//Initial Check Whenever workers are started
	lib.fetch();

	//Loop function to check every one minute
	lib.loop();

};

lib.loop = function(){
	setInterval(function(){
		lib.fetch();
	},1000*60);
};

lib.fetch = function(){
	_data.list("checks",function(err,checks){
		if(!err && checks){
			checks.forEach(function(checkName){
				_data.read("checks",checkName,function(err,originalCheckData){
					originalCheckData = helpers.parseIntoJSON(originalCheckData);
					if(!err && originalCheckData){
						//Proceed to next step
						lib.verifyData(originalCheckData);
					}else{
						console.log("Error Reading one of the check data");
					}
				});
			});
		}else{
			console.log("Error Reading All of the checks");
		}
	});
};

lib.check = function(originalCheckData){
	var newCheckData = {};
	newCheckData.checkId = originalCheckData.checkId;
	newCheckData.phone = originalCheckData.phone;
	newCheckData.host = originalCheckData.host;
	newCheckData.protocol = originalCheckData.protocol;
	newCheckData.method = originalCheckData.method;
	newCheckData.successCodes = originalCheckData.successCodes;
	newCheckData.timoutSeconds = originalCheckData.timoutSeconds;
	newCheckData.state = typeof(originalCheckData.state) == "string" && ["up","down"].indexOf(originalCheckData.state) > -1 ? originalCheckData.state : "down";
	newCheckData.lastChecked = typeof(originalCheckData.lastChecked) != "undefined" ? originalCheckData.lastChecked : false;
	var parsedUrl = url.parse(originalCheckData.protocol + "://" + originalCheckData.host,true);

	var requestDetails = {
		"hostname" : originalCheckData.host,
		"protocol" : originalCheckData.protocol + ":",
		"path" : parsedUrl.path,
		"method" : originalCheckData.method.toUpperCase(),
		"timeout" : originalCheckData.timoutSeconds
	};

	var chosenProtocol = originalCheckData.protocol == "https" ? https : http;
	var responseSent = false;

	var req = chosenProtocol.request(requestDetails,function(res){
		var status = res.statusCode;
		if(!responseSent && originalCheckData.successCodes.indexOf(status) > -1){
			newCheckData.state = "up";
			newCheckData.lastChecked = Date.now();
			responseSent = true;
			lib.sendResponse(originalCheckData,newCheckData);
		}
	});

	req.end();

	req.on("error",function(e){
		newCheckData.error = {
			"error" : true,
			"value" : e
		};
		if(!responseSent){
			newCheckData.state = "down";
			newCheckData.lastChecked = Date.now();
			responseSent = true;
			lib.sendResponse(originalCheckData,newCheckData);
		}
	});

	req.on("timeout",function(){
		if(!responseSent){
			newCheckData.state = "down";
			newCheckData.lastChecked = Date.now();
			responseSent = true;
			lib.sendResponse(originalCheckData,newCheckData);
		}
	});

};

lib.sendResponse = function(originalCheckData,newCheckData){
	var msg = "";
	var allertWarranted = false;
	_data.update("checks",originalCheckData.checkId,newCheckData,function(err){
		if(err){
			console.log("Error Updating one of the checks : ",err);
		}
	});
	if(typeof(originalCheckData.lastChecked) != "undefined" && originalCheckData.state != newCheckData.state){
		allertWarranted = true;
	}
	if(allertWarranted){
		msg = originalCheckData.method + " " + originalCheckData.protocol + "://" + originalCheckData.host + " went from " + originalCheckData.state + " to " + newCheckData.state;
		console.log("Alert Send By Twilio : ",msg);
	}
};


//Export
module.exports = lib;