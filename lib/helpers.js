//Dependencies
var crypto = require('crypto');
var https = require('https');
var querystring = require('querystring');


var helpers = {};

//Parse Into JSON function
helpers.parseIntoJSON = function(string){
	var parsedString = "";
	try{
		parsedString = JSON.parse(string);
	}catch(e){
		return "";
	}
	return parsedString;
};	

//Hash function
helpers.hash = function(string){
	var secret = "This is my secret not to be shared";
	var hashed = crypto.createHmac('sha256',secret).update(string).digest('hex');
	return hashed;
}

//GenerateRandom function to generate random string of given length
helpers.generateRandom = function(length){
	var allowedCharacters = "abcdefghijklmnopqrstuvwxyz1234567890";
	var randomString = "";
	for(var i=0;i<length;++i){
		var random = Math.floor(Math.random()*allowedCharacters.length);
		randomString += allowedCharacters.charAt(random);
	}
	return randomString;
};

//SendTwilio function to send messages
helpers.sendTwilio = function(phone,textMessage,callback){
	if(typeof(phone) == "string" && phone.length >= 10){
		if(typeof(textMessage) == "string" && textMessage.length > 0 && textMessage.length < 1600){
			var reqPayload = {
				'From': '+919868610050',
				'To': phone,
				'Body': textMessage
			};
			var stringPayload = querystring.stringify(reqPayload);
			var requestParams = {
				'protocol' : 'https:',
				'hostname' : 'api.twilio.com',
				'path' : '/2010-04-01/Accounts/ACc63292812aa7633f5a72387d10090f02/Messages.json',
				'auth' : 'ACc63292812aa7633f5a72387d10090f02:21f1657f3ae3b22ba3732dd3de5614b6',
				'method' : 'POST',
				'headers' : {
					'Content-Type' : 'application/x-www-form-urlencoded'				}
			};
			var req = https.request(requestParams,function(res){
				var status = res.statusCode;
				if(status == 200 || status == 201){
					callback(false);
				}else{
					callback('Status Code Returned Was ' + status);
				}
			});
			req.on('error',function(e){
				callback(e);
			});
			req.write(stringPayload);
			req.end();
		}else{
			callback("Invalid Message");
		}
	}else{
		callback("Invalid Phone Number");
	}
};

module.exports = helpers;