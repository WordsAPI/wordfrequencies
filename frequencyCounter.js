// Counts words in OpenSubtitles xml files.
//
// Usage:
// node frequencyCounter.js [options] OpenSubtitlesPath
// options:
// 		-m, <n> Maximum number of words to stop counting at (default is 60,000,000).
//			Note, this is only checked once every 100 files, so you may go over it
//			by a bit.
//		-o  <path> Path to write output. Default is frequency.json.

var async = require('async'),
	fs = require('fs')
	parseString = require('xml2js').parseString,
	argv = require('minimist')(process.argv.slice(2));;

var maxTotalWords = argv['m'] || 60000000, // when to stop counting words.
	outputFile = argv['o'] || 'frequency.json'; // file to write output to.

var processedFileCount = 0; // Number of files we've processed so far.

var words = {}, // master json structure of word counts.
	totWords = 0; // total number of words counted across all files.

function getWords( file, callback ){
	
	// filewords is a count of words in this document.
	var fileWords = {};

	fs.readFile( file, function(err, data) {
		processedFileCount++;
	    parseString(data, function (err, result) {
	    	if ( err ){
	    		console.log('error parsing xml for');
	    		console.log( file );
	    		console.log( err );
	    	} else if (result && result.document){
		        var sentences = result.document.s;
		        for ( var i = 0, len = sentences.length; i < len; i++ ){
		        	var sentence = sentences[i];
		        	var sWords = sentence.w;
		        	
		        	if ( sWords && sWords.length ){
		        		for ( var w = 0, wlen = sWords.length; w < wlen; w++ ){
		        			if ( sWords[w]._ ){
		        				var word = sWords[w]._.toLowerCase();
		        				if ( typeof fileWords[ word ] == "undefined" ){
				        			fileWords[ word ] = {
				        				freqCount : 0
				        			};
				        		}
				        		fileWords[ word ].freqCount++;
				        		totWords++;
		        			}
		        		}
			        }			        
		        }
		    }

		    //merge fileWords into words, where the master count is kept
		    Object.keys( fileWords ).forEach( function( word ){
		    	if ( typeof words[ word ] == 'undefined' ){
		    		words[ word ] = {
		    			freqCount : fileWords[ word ].freqCount,
		    			cdCount : 1
		    		}
		    	} else {
		    		words[ word ].freqCount += fileWords[ word ].freqCount;
		    		words[ word ].cdCount++;
		    	}
		    });
	        
	        // Progress logging.
		    if ( processedFileCount % 100 === 0 ){
		    	fs.writeFileSync( outputFile, JSON.stringify( words, null, 4));
		        
		        var uniqueWords = Object.keys( words ).length;
		        console.log('Last file processed: ' + file);
	        	console.log('Total Words: ' + totWords);
	        	console.log('Unique Words: ' + uniqueWords );
	        	console.log('');

		        var percent = Math.round( processedFileCount / fileList.length * 100 );
		        console.log("");
		        console.log("Files processed: " + processedFileCount );
		        console.log("Total files: " + fileList.length );
		        console.log("Percent complete: " + percent );
		        console.log("");
		        console.log("");

		        // Stop if we have exceeded the maxTotalWords set with the -m option
		        if ( totWords > maxTotalWords){
		        	callback( "Stopping. Max total words reached." );
		        } else {
		        	callback();
		        }
		    } else {
	        	callback();
	        }
	       
	    });
	});
}

// Walk a directory structure recursively and return a list of xml files.
function getXMLFileList( dir ) {
	var results = [];
    var idsRead = {};

    var list = fs.readdirSync(dir);
    
    list.forEach(function(file) {
        file = dir + '/' + file;
        var stat = fs.statSync(file);
        if (stat && stat.isDirectory()) results = results.concat(getXMLFileList(file));
        else {
        	if ( file.indexOf('.xml', this.length - 4) !== -1){
        		results.push(file);
        	} 
        }
    })
    return results;
}

if ( argv._.length == 0 ){
    console.log('Usage: node frequencyCounter [options] OpenSubtitlesPath');
} else {
    var path = argv._[0];
	
	var fileList = getXMLFileList( path );
	console.log("Files to count: " + fileList.length );
	
	// Sort files by year, so the results reflect modern usage.
	var yearRegex = /\/\d{4}\/|\/0\//;
	
	fileList.sort( function( a, b ){
		var aYear = a.match(yearRegex)[0].replace(/\//g,''),
			bYear = b.match(yearRegex)[0].replace(/\//g,'');
		if (aYear > bYear){
			return -1;
		} else if (bYear > aYear ){
			return 1;
		} 
		return 0;
	});	

	async.eachLimit( fileList, 5, getWords, function( err ){
		if ( err ){
			console.log( err );
		}

		fs.writeFileSync( outputFile, JSON.stringify( words, null, 4));
		console.log('done.')
		console.log('Total Words: ' + totWords);
	});
}