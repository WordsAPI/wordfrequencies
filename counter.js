// Prints out some info on a file created by frequencyCounter.json.
//
// Usage: 
// node counter.js frequencyFile.json

var fs = require('fs');
var argv = require('minimist')(process.argv.slice(2));


if ( !argv._.length || argv._.length == 0){
	console.log("Missing input file. Usage:");
	console.log("node counter.js frequencyFile.json");
} else {
	var file = argv._[0];
	
	var data = JSON.parse(fs.readFileSync( file ) );

	var keys = Object.keys( data );

	var asArray = [],
		totalWords = 0;

	for ( var i = 0, len = keys.length; i < len; i++ ){
		var key = keys[i];

		if ( /\w/.test( key ) ){
			asArray.push({
				word : key,
				freqCount : data[key].freqCount,
				cdCount : data[key].cdCount
			});
			totalWords += data[key].freqCount;
		}
	}

	asArray.sort( function(a,b){
		if ( a.freqCount > b.freqCount ){
			return -1;
		} else if ( a.freqCount < b.freqCount ){
			return 1;
		}
		return 0;
	});
	
	console.log("Total Words: " + totalWords);
	console.log("Unique Words: " + keys.length );
	console.log("");
	
	console.log("Top 10 words: " );

 	for ( var i = 0, len = 10; i < len; i++ ){
 		console.log( asArray[i] );
 	}
 	
}