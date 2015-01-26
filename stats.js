// Adds statistical information to a file created by frequencyCounter.json
//
// Usage: 
// node stats.js -i inFileName -o outFileName

var fs = require('fs');
var argv = require('minimist')(process.argv.slice(2));

function zipF( frequency, totalWords ){

}

if ( !argv.i || !argv.o ){
	console.log("Missing parameter. Usage:");
	console.log("node stats.js -i inFileName -o outFileName");
} else {
	var inFile = argv.i,
		outFile = argv.o;
	
	var data = JSON.parse(fs.readFileSync( inFile ) );

	var keys = Object.keys( data );

	var asArray = [],
		corpusSize = 0,
		totalWords = 0;

	// First loop is needed to get the count of total words.
	for ( var i = 0, len = keys.length; i < len; i++ ){
		var key = keys[i];

		if ( /\w/.test( key ) ){
			totalWords += data[key].freqCount;
		}

		if ( data[key].cdCount > corpusSize ){
			corpusSize = data[key].cdCount;
		}
	}

	// Second loop adds the stats.
	for ( var i = 0, len = keys.length; i < len; i++ ){
		var key = keys[i];

		if ( /\w/.test( key ) ){
			data[key].zipf = zipf( data[key].freqCount, totalWords );
			data[key].perMillion = Math.round( data[key].freqCount / totalWords * 100 ) / 100; //round to 2 decimal places
			data[key].diversity = Math.round( data[key].cdCount / corpusSize * 100 ) / 100;
		}
	}
}