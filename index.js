/*
* Main File
*
*/


// Dependencies
var server = require("./lib/server");
var workers = require("./lib/workers");


//Initialise the server
server.init();

//Initialise the workers
workers.init();