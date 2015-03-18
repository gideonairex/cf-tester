'use strict';

var request = require( 'request' );
var fs      = require( 'fs' );

var helper = require( '../init' );

require( 'should' );

describe( 'Get learning targets', function () {

	var requestLoad;

	before( function ( done ) {

		helper.login.done( function ( access, error ) {

			var data = {

				'path'   : 'com.schoolimprovement.pd360.dao.portfolio.PortfolioClientPersonnelGateway',
				'method' : 'getProfessionalLearningPlansForLearningTargets',
				'args'   : {
					'persId' : '1414881'
				}

			};

			helper.signature( data.method, data.args, access ).done( function( signature, signatureError ) {

				// Assign signature
				data.signature = signature.replace(/"/g, "");

				request.post( {
					'uri'     : access.gateway + 'CfJsonAPIService.cfc?method=cfJsonAPI',
					'headers' : {
						'Cookie'       : access.cookies.cookieString,
						'Content-Type' : 'application/json'
					},
					'body' : JSON.stringify( data )
				}, function ( error, load, body ) {

					requestLoad = {
						'error'   : error,
						'request' : load,
						'body'    : JSON.parse( body )
					};

					done();

				} );

			} );

		} );

	} );

	it( 'It should not return error', function () {

		requestLoad.should.have.property( 'error' ).and.be.Null;

	} );

	it( 'Should return an array of learning targets', function () {

		requestLoad.body.should.be.instanceOf( Array );

	} );

	it( 'Contents should have properties', function () {

		var results = requestLoad.body;

		results.forEach( function ( learningTarget, index ) {

			learningTarget.should.have.property( 'LEARNINGPLANID' );
			learningTarget.should.have.property( 'LEARNINGPLANTITLE' );

		} );

		console.log( 'Result: \n' );
		console.log( JSON.stringify( results, null, 4 ) );

	} );


} );

