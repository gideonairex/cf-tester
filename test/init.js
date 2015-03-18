'use strict';

var path        = require( 'path' );
var request     = require( 'request' );
var when        = require( 'when' );
var fetchConfig = require( 'zero-config' );

var config = fetchConfig( path.join( __dirname, '..' ) );
var access;

function getSetCookies ( headers, personnel ) {

	var setCookie     = headers[ 'set-cookie' ];
	var parsedCookies = {};
	parsedCookies.PID = personnel.PersonnelId;
	var stringCookies = '';

	setCookie.forEach( function ( cookie, index ) {

		var temp = cookie.split( ';' );
		var cook = temp[ 0 ].split( '=' );

		stringCookies += temp[ 0 ] + '; ';
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

	var userConfig = config.get( 'credentials' );
	var api        = config.get( 'api' );

	access = {
		'username' : userConfig.username,
		'password' : userConfig.password,
		'gateway'  : api.gateway
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

var signature = function ( method, args, user ) {

	var data = {

		'method'      : 'cfJsonAPIMethod1',
		'CFToken'     : user.cookies.cookieObj.CFTOKEN,
		'personnelId' : user.cookies.cookieObj.PID,
		'args'        : {
			'method' : method,
			'args'   : args
		}

	};

	return when.promise( function ( resolve, reject ) {

		request.post( {
			'uri'     : user.gateway + 'CfJsonAPIService.cfc?method=cfJsonAPI',
			'headers' : {
				'Cookie'       : user.cookies.cookieString,
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

var fetch = function ( data, uri, cb ) {

	// Login user
	login.done( function ( user, userError ) {

		// Get signature
		signature( data.method, data.args, user ).done( function ( signatureResult, signatureError ) {

			// Assign signature
			data.signature = signatureResult.replace( /"/g, '' );

			/** Todo
			 * 1. Dynamic request method
			 *
			 */
			// Run request
			request.post( {
				'uri'     : access.gateway + uri,
				'headers' : {
					'Cookie'       : access.cookies.cookieString,
					'Content-Type' : 'application/json'
				},

				'body' : JSON.stringify( data )

			}, function ( error, load, body ) {

				var requestLoad = {
					'error'   : error,
					'request' : load,
					'body'    : JSON.parse( body )
				};

				cb( requestLoad );

			} );

		} );

	} );

};

module.exports = {
	'fetch' : fetch
};
