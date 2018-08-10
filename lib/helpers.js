//Dependencies
var crypto = require('crypto');


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

module.exports = helpers;