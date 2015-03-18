'use strict';

var request = require( 'request' );
var fs      = require( 'fs' );
var when    = require( 'when' );

var access;

function getSetCookies ( headers, personnel ) {

	var setCookie = headers[ 'set-cookie' ];
	var parsedCookies = {};
	parsedCookies[ 'PID' ] = personnel.PersonnelId;
	var stringCookies = '';

	setCookie.forEach( function( cookie, index ) {
		var temp = cookie.split( ';' );
		stringCookies += temp[ 0 ] + '; ';
		var cook = temp[ 0 ].split( '=' );
		parsedCookies[ cook[ 0 ] ] = cook[ 1 ];
	} );

	stringCookies += 'PID=' + personnel.PersonnelId + '; ';

	return {
		'cookieObj'    : parsedCookies,
		'cookieString' : stringCookies
	};

}

var login = when.promise( function ( resolve, reject ) {

	if ( access ) {
		return resolve( access );
	}

	access = {
		'username' : 'lima',
		'password' : 'pd360',
		'gateway'  : 'http://cfapi.dev.pd360.com/com/schoolimprovement/pd360/dao/'
	};

	request( [
			access.gateway,
			'RespondService.cfc?method=rspndLogin&loginNm=',
			access.username,
			'&passwrd=',
			access.password,
			'&returnformat=json'
		].join( '' ), function ( error, response, body ) {

			if ( error ) {
				return reject( error );
			}

			var user = JSON.parse( body );
			access.cookies = getSetCookies( response.headers, user.personnel );

			console.log( [
				'\n\tSuccessfully login\n',
				'\tusername: ',
				access.username,
				'\n\tpassword: ',
				access.password,
				'\n'
			].join( '' ) );

			return resolve( access );

	} );

} );

var signature = function( method, args, access ) {

			var data = {

				'method'      : 'cfJsonAPIMethod1',
				'CFToken'     : access.cookies.cookieObj.CFTOKEN,
				'personnelId' : access.cookies.cookieObj.PID,
				'args'        : {
					'method' : method,
					'args'   : args
				},

			};

			return when.promise( function ( resolve, reject ) {

				request.post( {
					'uri' : access.gateway + 'CfJsonAPIService.cfc?method=cfJsonAPI',
					'headers' : {
						'Cookie' : access.cookies.cookieString,
						'Content-Type' : 'application/json'
					},
					'body' : JSON.stringify( data )
				}, function ( error, load, body ) {

					if ( error ) {
						return reject( error );
					}

					return resolve( body );

				} );

			} );
};

module.exports = {
	'login'     : login,
	'signature' : signature
};
