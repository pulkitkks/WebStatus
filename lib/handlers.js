//Dependencies
var helpers = require("./helpers");
var _data = require("./data");


var handlers = {};

//Container for user routes
handlers.usersHandler = function(data,callback){
	//Allowed Methods - GET,PUT,POST,DELETE
	var allowedMethods = ["get","post","put","delete"];
	if (allowedMethods.indexOf(data.method.toLowerCase()) > -1){
		var chosenMethod = data.method.toLowerCase();
		handlers._users[chosenMethod](data,callback);
	}else{
		callback(403,{});
	}
};

//Container for token routes
handlers.tokensHandler = function(data,callback){
	//Allowed Methods - GET,PUT,POST,DELETE
	var allowedMethods = ["get","post","put","delete"];
	if(allowedMethods.indexOf(data.method.toLowerCase()) > -1){
		var chosenMethod = data.method.toLowerCase();
		handlers._tokens[chosenMethod](data,callback);
	}else{
		callback(403,{});
	}
};

//Container for checks routes
handlers.checksHandler = function(data,callback){
	//Allowed Methods - GET,POST,PUT,DELETE
	var allowedMethods = ['get','post','put','delete'];
	if(allowedMethods.indexOf(data.method.toLowerCase()) > -1){
		var chosenMethod = data.method.toLowerCase();
		handlers._checks[chosenMethod](data,callback);
	}else{
		callback(403,{});
	}
};

handlers.pingHandler = function(data,callback){
	var output = {"status" : "200 OK"};
	callback(200,output);
};

handlers.notFoundHandler = function(data,callback){
	callback(404,{});
};


//_Users Handler to handle different methods
handlers._users = {};
//Get Method to get a specific user
//TODO apply authentication
handlers._users.get = function(data,callback){
	var tokenId = typeof(data.headers.token_id) == "string" ? data.headers.token_id : false;
	if(tokenId){
		_data.read("tokens",tokenId,function(err,tokenData){
			if(!err && tokenData){
				tokenData = helpers.parseIntoJSON(tokenData);
				if(tokenData.expiration >= Date.now()){
					var phone = tokenData.phone;
					if(phone){
						_data.read("users",phone,function(err,userData){
							if(!err && userData){
								var parsedUserData = helpers.parseIntoJSON(userData);
								if(typeof(parsedUserData) == "object"){
									delete parsedUserData.hashedPassword;
									callback(200,parsedUserData);
								}else{
									callback(500,{});
								}
							}else{
								callback(400,{"Error" : "User not found"});
							}
						});
					}else{
						callback(400,{"Error" : "Missing required Parameters"});
					}
				}else{
					callback(400,{"Error" : "Expired Session"});
				}
			}else{
				callback(400,{"Error" : "Invalid Token"});
			}
		});
	}else{
		callback(400,{"Error" : "Not Authenticated"});
	}
};


//POST Method to create a new user
handlers._users.post =  function(data,callback){
	var phone = typeof(data.payload.phone) == "string" && data.payload.phone.length == 10 ? data.payload.phone : false;
	var password = typeof(data.payload.password) == "string" && data.payload.password.length > 5 ? data.payload.password : false;
	var firstName = typeof(data.payload.firstName) == "string" ? data.payload.firstName : false;
	var lastName = typeof(data.payload.lastName) == "string" ? data.payload.lastName : false;
	var tocAgreement = typeof(data.payload.tocAgreement) == "boolean" ? data.payload.tocAgreement : false;
	if(phone && password && firstName && lastName && tocAgreement){
		var userData = {
			"phone" : phone,
			"hashedPassword" : helpers.hash(password),
			"firstName" : firstName,
			"lastName" : lastName,
			"tocAgreement" : tocAgreement
		};
		_data.create("users",phone,userData,function(err){
			if(!err){
				callback(200,{});
			}else{
				callback(400,{"Error" : err});
			}
		});
	}else{
		callback(400,{"Error" : 'Missing required fields'});
	}
};

//PUT method to update an existing user
handlers._users.put = function(data,callback){
	var tokenId = typeof(data.headers.token_id) == "string" ? data.headers.token_id : false;
	if(tokenId){
		_data.read("tokens",tokenId,function(err,tokenData){
			if(!err && tokenData){
				tokenData = helpers.parseIntoJSON(tokenData);
				if(tokenData.expiration >= Date.now()){
					var phone = tokenData.phone;
					var firstName = typeof(data.payload.firstName) == "string" ? data.payload.firstName : false;
					var lastName = typeof(data.payload.lastName) == "string" ? data.payload.lastName : false;
					if(phone && (firstName || lastName)){
						_data.read("users",phone,function(err,userData){
							if(!err && userData){
								var parsedUserData = helpers.parseIntoJSON(userData);
								if (firstName){
									parsedUserData.firstName = firstName;
								}
								if(lastName){
									parsedUserData.lastName = lastName;
								}
								_data.update("users",phone,parsedUserData,function(err){
									if(!err){
										callback(200,{});
									}else{
										callback(400,{"Error" : "Cannot Update the existng user"});
									}
								});
							}else{
								callback(400,{"Error" : "User may not exist"});
							}
						});
					}else{
						callback(400,{"Error" : "Missing required fields"});
					}
				}else{
					callback(400,{"Error" : "Expired Session"});
				}
			}else{
				callback(400,{"Error" : "Invalid Token"});
			}
		});
	}else{
		callback(400,{"Error" : "Not Authenticated"});
	}
};

//DELETE method to delete an existing user
handlers._users.delete = function(data,callback){
	var tokenId = typeof(data.headers.token_id) == "string" ? data.headers.token_id : false;
	if(tokenId){
		_data.read("tokens",tokenId,function(err,tokenData){
			if(!err && tokenData){
				tokenData = helpers.parseIntoJSON(tokenData);
				if(tokenData.expiration >= Date.now()){
					var phone = tokenData.phone;
					_data.delete("users",phone,function(err){
						if(!err){
							callback(200,{});
						}else{
							callback(400,{"Error" : "Cannot delete user it may not even exist"});
						}
					});
				}else{
					callback(400,{"Error" : "Expired Session"});
				}
			}else{
				callback(400,{"Error" : "Invalid Token"});
			}
		});
	}else{
		callback(400,{"Error" : "Not Authenticated"});
	}
};


//Handler to handle token different methods
handlers._tokens = {};
//Get Method
handlers._tokens.get = function(data,callback){
	var tokenId = typeof(data.query.tokenId) == "string" ? data.query.tokenId : false;
	if(tokenId){
		_data.read("tokens",tokenId,function(err,tokenData){
			if(!err && tokenData){
				callback(200,helpers.parseIntoJSON(tokenData));
			}else{
				callback(400,{"Error" : "Invalid Token ID"});
			}
		});
	}else{
		callback(400,{"Error" : "Missing Required Parameters"});
	}
};

//POST Method to create a new token
handlers._tokens.post = function(data,callback){
	var phone = typeof(data.payload.phone) == "string" && data.payload.phone.length == 10 ? data.payload.phone : false;
	var password =  typeof(data.payload.password) == "string" ? data.payload.password : false;
	if(phone && password){
		_data.read("users",phone,function(err,userData){
			if(!err && userData){
				var hashedPassword = helpers.hash(password);
				if(hashedPassword == helpers.parseIntoJSON(userData).hashedPassword){
					var tokenId = helpers.generateRandom(20);
					var expiration = Date.now() + (2*60*1000);
					var token = {
						"tokenId" : tokenId,
						"phone" : phone,
						"expiration" : expiration
					};
					_data.create("tokens",tokenId,token,function(err){
						if(!err){
							callback(200,{});
						}else{
							callback(500,{"Error" : "Server Error"})
						}
					});
				}else{	
					callback(400,{"Error" : "Invalid Credentials"});
				}
			}else{
				callback(400,{"Error" : "User with given phone number does not exist"});
			}
		});
	}else{
		callback(400,{"Error" : "Missing Required Parameters"});
	}
};


//PUT method to update the expiration of a existing token
handlers._tokens.put = function(data,callback){
	var tokenId = typeof(data.payload.token_id) == "string" ? data.payload.token_id : false;
	if(tokenId){
		_data.read("tokens",tokenId,function(err,tokenData){
			if(!err && tokenData){
					var expiration = Date.now() + (2*60*1000);
					tokenData = helpers.parseIntoJSON(tokenData);
					var token = {
						"tokenId" : tokenData.tokenId,
						"phone" : tokenData.phone,
						"expiration" : expiration
					};
					_data.update("tokens",tokenId,token,function(err){
						if(!err){
							callback(200,{});
						}else{
							callback(500,{"Error" : "Cannot Update Token"});
						}
					});
			}else{
				callback(400,{"Error" : "User with given phone number does not exist"});
			}
		});
	}else{
		callback(400,{"Error" : "Missing Required Parameters"});
	}
};

//DELETE method to delete an existing token
handlers._tokens.delete = function(data,callback){
	var tokenId = typeof(data.query.tokenId) == "string" ? data.query.tokenId : false;
	if(tokenId){
		_data.delete("tokens",tokenId,function(err){
			if(!err){
				callback(200,{});
			}else{
				callback(400,{"Error" : "Couldn't Delete token"});
			}
		});
	}else{
		callback(400,{"Error" : "Missing required Parameters"});
	}
};


//Handler to handle checks different methods
handlers._checks = {};

//GET method to get all checks
handlers._checks.get = function(data,callback){
	var tokenId = typeof(data.headers.token_id) == "string" ? data.headers.token_id : false;
	if(tokenId){
		_data.read("tokens",tokenId,function(err,tokenData){
			if(!err && tokenData){
				tokenData = helpers.parseIntoJSON(tokenData);
				if(Date.now() <= tokenData.expiration){
					var phone = tokenData.phone;
					_data.read("users",phone,function(err,userData){
						if(!err && userData){
							userData = helpers.parseIntoJSON(userData);
							var checks = typeof(userData.checks) == "object" && userData.checks instanceof Array ? userData.checks : [];
							callback(200,{"Checks" : checks});
						}else{
							callback(500,{"Error" : "Couldn't read user data"});
						}
					});
				}else{
					callback(400,{"Error" : "Token Expired"});
				}
			}else{
				callback(400,{"Error" : "Invalid Token"});
			}
		})
	}else{
		callback(400,{"Error" : "Not Authenticated"});
	}
};

//POST route to create new checks
handlers._checks.post = function(data,callback){
	var tokenId = typeof(data.headers.token_id) == "string" ? data.headers.token_id : false;
	var host = typeof(data.payload.host) == "string" ? data.payload.host : false;
	var method = typeof(data.payload.method) == "string" ? data.payload.method : false;
	var timoutSeconds = typeof(data.payload.timoutSeconds) == "number" ? data.payload.timoutSeconds : false;
	var protocol = typeof(data.payload.protocol) == "string" && ["http","https"].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
	var successCodes = typeof(data.payload.successCodes) == "object" && data.payload.successCodes instanceof Array ? data.payload.successCodes : false;
	if(tokenId){
		_data.read("tokens",tokenId,function(err,tokenData){
			if(!err && tokenData){
				tokenData = helpers.parseIntoJSON(tokenData);
				var expiration = tokenData.expiration;
				if(expiration >= Date.now()){
					var phone = tokenData.phone;
					_data.read("users",phone,function(err,userData){
						if(!err && userData){
							userData = helpers.parseIntoJSON(userData);
							var checks = typeof(userData.checks) == "object" && userData.checks instanceof Array ? userData.checks : [];
							if(checks.length < 5){
								var checkId = helpers.generateRandom(20);
								var newCheck = {
									"checkId" : checkId,
									"phone" : phone,
									"host" : host,
									"protocol" : protocol,
									"method" : method,
									"timoutSeconds" : timoutSeconds,
									"successCodes" : successCodes
								};
								_data.create("checks",checkId,newCheck,function(err){
									if(!err){
										if(typeof(userData.checks) == "undefined"){
											userData.checks = [];
										}
										userData.checks.push(checkId);
										_data.update("users",phone,userData,function(err){
											if(!err){
												callback(200,newCheck);
											}else{
												callback(400,{"Error" : "Couldn't update user with new check"});
											}
										});
									}else{
										callback(400,{'Error' : "Couldn't save new check"});
									}
								});
							}else{
								callback(400,{"Error" : "Maximum Check Limit Reached"});
							}
						}else{
							callback(500,{"Error" : "Can't Read User"});
						}
					});
				}else{
					callback(400,{"Error" : "Token Expired"});
				}
			}else{
				callback(400,{"Error" : "Invalid Token"});
			}
		});	
	}else{
		callback(400,{"Error" : "Not Authenticated"});
	}
};

//PUT method to update a check
handlers._checks.put = function(data,callback){
	var checkId = typeof(data.payload.checkId) == "string" ? data.payload.checkId : false;
	var tokenId = typeof(data.headers.token_id) == "string" ? data.headers.token_id : false;
	var protocol = typeof(data.payload.protocol) == "string" && ["http","https"].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
	var method = typeof(data.payload.method) == "string" ? data.payload.method : false;
	var timoutSeconds = typeof(data.payload.timoutSeconds) == "number" ? data.payload.timoutSeconds : false;
	var host = typeof(data.payload.host) == "string" ? data.payload.host : false;
	var successCodes = typeof(data.payload.successCodes) == "object" && data.payload.successCodes instanceof Array ? data.payload.successCodes : false;
	if(tokenId){
		_data.read("tokens",tokenId,function(err,tokenData){
			if(!err && tokenData){
				tokenData = helpers.parseIntoJSON(tokenData);
				if(tokenData.expiration > Date.now()){
					var phone = tokenData.phone;
					_data.read("users",phone,function(err,userData){
						if(!err && userData){
							userData = helpers.parseIntoJSON(userData);
							if(userData.checks.indexOf(checkId) > -1){
								if(protocol || host || method || timoutSeconds || successCodes){
									_data.read("checks",checkId,function(err,checkData){
										if(!err && checkData){
											checkData = helpers.parseIntoJSON(checkData);
											if(protocol){
												checkData.protocol = protocol;
											}
											if(host){
												checkData.host = host;
											}
											if(timoutSeconds){
												checkData.timoutSeconds = timoutSeconds;
											}
											if(successCodes){
												checkData.successCodes = successCodes;
											}
											if(method){
												checkData.method = method;
											}
											_data.update("checks",checkId,checkData,function(err){
												if(!err){
													callback(200,checkData);
												}else{
													callback(500,{"Error" : "Couldn't update existing check"});
												}
											});
										}else{
											callback(500,{"Error" : "Check couldn't be read system crashed"});
										}
									});
								}else{
									callback(400,{"Error" : "Missing Parameters for updation of check"});
								}
							}else{
								callback(400,{"Error" : "This check Id is not associated with logged in user"});
							}
						}else{
							callback(500,{"Error" : "Can't Read User"});
						}
					});	
				}else{
					callback(400,{"Error" : "Token Expired"});
				}
			}else{
				callback(400,{"Error" : "Invalid Token"});
			}
		});
	}else{
		callback(400,{"Error" : "Not Authenticated"});
	}
};	


//DELETE method to delete already existing check
handlers._checks.delete = function(data,callback){
	var tokenId = typeof(data.headers.token_id) == "string" ? data.headers.token_id : false;
	var checkId = typeof(data.query.checkId) == "string" ? data.query.checkId : false;
	if(tokenId){
		_data.read("tokens",tokenId,function(err,tokenData){
			if(!err && tokenData){
				tokenData = helpers.parseIntoJSON(tokenData);
				if(tokenData.expiration > Date.now()){
					var phone = tokenData.phone;
					_data.read("users",phone,function(err,userData){
						if(!err && userData){
							userData = helpers.parseIntoJSON(userData);
							if(userData.checks.indexOf(checkId) > -1){
								_data.delete("checks",checkId,function(err){
									if(!err){
										var index = userData.checks.indexOf(checkId);
										userData.checks.splice(index,1);
										_data.update("users",phone,userData,function(err){
											if(!err){
												callback(200,{});
											}else{
												callback(500,{"Error" : "Couldn't remove check from user data"});
											}
										});
									}else{
										callback(500,{"Error" : err});
									}
								});
							}else{
								callback(400,{"Error" : "User does not contain specified check"});
							}
						}else{	
							callback(400,{"Error" : "Can't Read User"});
						}
					});
				}else{
					callback(400,{"Error" : "Token Expired"});
				}
			}else{
				callback(400,{"Error" : "Invalid Token"});
			}
		});
	}else{
		callback(400,{"Error" : "Not Authenticated"});
	}
};
module.exports = handlers;



// {
// 	"host" : "www.google.com",
// 	"protocol" : "http",
// 	"successCodes" : [200,201,203],
// 	"timoutSeconds" : 2,
// 	"method" : "get"
// }