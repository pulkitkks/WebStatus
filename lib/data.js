//Libraries
var fs = require('fs');
var path = require('path');

var data = {};
//Base Directory
var base_dir = path.join(__dirname,"../.data");


//Function To Create a new File
data.create = function(lib,name,data,callback){
	fs.open(base_dir + "/" + lib + "/" + name + ".json","wx",function(err,fileDescryptor){
		if(!err && fileDescryptor){
			var stringData = JSON.stringify(data);
			fs.writeFile(fileDescryptor,stringData,function(err){
				if(!err){
					callback(false);
				}else{
					callback("Error Writing to the new file");
				}
			});
		}else{
			callback("Error Opening New File");
		}
	});
};

//Function To rea an existing file

data.read = function(lib,name,callback){
	fs.readFile(base_dir + "/" + lib + "/" + name + ".json",function(err,data){
		if(!err && data){
			callback(false,data);
		}else{
			callback("Error Reading the file");
		}
	});
};


//Funtion to Update an existing file
data.update = function(lib,name,data,callback){
	fs.open(base_dir + "/" + lib + "/" + name + ".json","r+",function(err,fileDescryptor){
		if(!err && fileDescryptor){
			fs.truncate(fileDescryptor,function(err){
				if(!err){
					var stringData = JSON.stringify(data);
					fs.writeFile(fileDescryptor,stringData,function(err){
						if(!err){
							callback(false);
						}else{
							callback("Error Writing to the opened file in updation");
						}
					});
				}else{
					callback("Error Truncating the file");
				}
			});
		}else{
			callback("Error Opening the file for updation");
		}
	});
};	

//Function To delete an existing file
data.delete = function(lib,name,callback){
	fs.unlink(base_dir + "/" + lib + "/" + name + ".json",function(err){
		if(!err){
			callback(false);
		}else{
			callback(err);
		}
	});	
};



module.exports = data;