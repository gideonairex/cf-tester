'use strict';

/* jshint expr: true */
/* eslint no-unused-expressions:0 */

var helper = require( '../init' );

require( 'should' );

describe( 'Get learning targets', function () {

	var requestLoad;

	before( function ( done ) {

		// Request uri
		var uri =  'CfJsonAPIService.cfc?method=cfJsonAPI';

		// Payload
		var data = {

			'path'   : 'com.schoolimprovement.pd360.dao.portfolio.PortfolioClientPersonnelGateway',
			'method' : 'getProfessionalLearningPlansForLearningTargets',
			'args'   : {
				'persId' : '1414881'
			}

		};

		// Run request
		helper.fetch( data, uri, function ( load ) {
			requestLoad = load;
			done();
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
