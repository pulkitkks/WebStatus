# WebStatus

This is a web project developed in node.js without use of any packages.

This project does not even contain a package.json file.

Features:

1. A web API by which a user can register using his/her phone number.
2. Login functionality
3. User can create maximum 5 number of Checks.
4. Each check will contain information regarding a website i.e. HOST,TIMEOUTSECONDS,PROTOCOL,METHOD and SUCCESSCOES
5. After each one minute server will check for any change in website status that is either up or down and any change in state will be notified to user by SMS.


API Requests

=> post '/users' => To create a new user 

Mandatory Payload Parameters => 'phone' 		: 10 digit mobile number
								'firstName' 	: First Name of user
								'lastName'		: Last Name of user
								'password'		: Password
								'tocAgreement'	: Boolean that must be set to true in order to create a user

Optional Parameters => NONE

=> post '/tokens' => To Login

Mandatory Payload Parameters => 'phone'		: 10 digit password
								'password'	: Password


Optional Parameters => NONE

=> get '/users' => To know self information

Mandatory Headers Parameters => 'token_id' : token id got after login
Optional Parameters => NONE

=> put '/users' => To update your profile

Mandatory Headers Parameters => 'token_id' : token id got after login


Optional Payload Parameters => 	'firstName' : First Name of user
								'lastName' 	: Last Name of user

=> delete '/users' => To delete your user

Mandatory Headers Parameters => 'token_id' : token id got after login

Optional Parameters => NONE


=> get '/tokens' => To get token information

Mandatory Query Parameters => 'tokenId'	: Token ID to get information about

Optional Parameters => NONE


=> put '/tokens' => To extend expiration of a token

Mandatory Payload Parameters => 'token_id'	: Token ID for which updation is needed


=> delete '/tokens' => To delete a specific token

Mandatory Query Parameters => 'tokenID'	: Token ID to be deleted


=> get '/checks' => To get ID's of all the checks associated with logged in user

Mandatory Headers Parameters => 'token_id' : token id got after login

Optional Parameters => NONE


=> post '/checks' => To add a new check in the check list of logged in user

Mandatory Headers Parameters => 'token_id' : token id got after login

Mandatory Payload Parameters => 'host' 			: Information about Host of the website you want to track
								'protocol' 		: HTTP or HTTPS protocol
								'timoutSeconds' : Timeout Seconds after which website is assumed to be down
								'method'		: Method like get,put,post,delete,etc.

Optional Parameters => NONE


=> put '/checks' => To update a check data

Mandatory Headers Parameters => 'token_id' : token id got after login

Optional Payload Parameters => 	'host' 			: Information about Host of the website you want to track
								'protocol' 		: HTTP or HTTPS protocol
								'timoutSeconds' : Timeout Seconds after which website is assumed to be down
								'method'		: Method like get,put,post,delete,etc.

=> delete '/checks' => To remove a check from a user's checks list

Mandatory Headers Parameters => 'token_id' : token id got after login

Mandatory Query Parameters => 'checkId'	: ID of check to be deleted