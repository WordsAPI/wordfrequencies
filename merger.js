// Merges two or more .json files, created by frequencyCounter.js
//
// Usage: 
// node merger.js -o outputFileName.json file1.json file2.json etc

var fs = require('fs');
var argv = require('minimist')(process.argv.slice(2));

if ( !argv.o ){
	console.log("Missing output file. Usage:");
	console.log("node merger.js -o outputFileName.json file1.json file2.json etc");
} else if ( !argv._.length || argv._.length == 0){
	console.log("Missing input files. Usage:");
	console.log("node merger.js -o outputFileName file1.json file2.json etc");
} else {
	var outFile = argv.o;
	var inputFiles = argv._;

	var words = {};

	for ( var i = 0, len = inputFiles.length; i < len; i++ ){
		var file = inputFiles[i];
		var data = JSON.parse( fs.readFileSync(file) );

		var keys = Object.keys( data );

		keys.forEach( function( key ){
			if ( key === "the" ){
				console.log( data[key] );
			}
			if ( !words[key] ){
				words[key] = {
					freqCount : data[key].freqCount,
					cdCount : data[key].cdCount
				}
			} else {
				words[key].freqCount += data[key].freqCount;
				words[key].cdCount += data[key].cdCount;				
			}
		})
	}

	fs.writeFileSync( outFile, JSON.stringify(words, null, 4) );
	console.log('done')
}
