// Removes xml files with a spelling error rate
// greater than the specified limit. Uses aspell.
//
// Usage:
// node spellingFilter [options] OpenSubtitlesPath
// options:
// 		-a <n> Acceptable Error Rate (default is .025);

var fs = require('fs'),
	async = require('async'),
	exec = require('child_process').exec,
	argv = require('minimist')(process.argv.slice(2));

var acceptableErrorRate = argv['a'] || .025;

// Counts number of misspelled words using aspell.
// Ignores words identified as a misspelling if they start with a capital letter,
// as those are probably just proper nouns.
function misspellings( path, callback ){
	fs.exists(path, function(exists) {
		if ( exists ){
			exec('aspell list --mode=sgml < ' + path + ' | grep "^[a-z]" | wc -l', function( err, output, stderr ){
				if ( stderr ){
					console.log( err );
				}
				callback(err, +(output.trim()));
			});
		} else {
			callback('file does not exist');
		}
	});
}

// Counts the number of words in a file.
function wordcount( path, callback ){
	fs.exists(path, function(exists) {
		if ( exists ){
			exec('grep "<w " ' + path + " | wc -l", function( err, output ){
				callback(err, +(output.trim()));
			});
		} else {
			callback('file does not exist');
		}
	});
}

// Walk a directory structure recursively and return a list of xml files.
function getFileList( dir ) {
	var results = [];
    var idsRead = {};

    var list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        var stat = fs.statSync(file);
        if (stat && stat.isDirectory()) results = results.concat(getFileList(file));
        else {
        	if ( file.indexOf('.xml', this.length - 4) !== -1){        		
        		results.push(file);
        	} 
        }
    })
    return results;
}

// Checks to see if a file has an acceptable spelling error rate.
function vetFile( path, callback ){

	async.parallel([
		function( callback ){
			misspellings( path, callback );
		},
		function( callback ){
			wordcount( path, callback );
		}
	], function(err, results ){
		if ( err ){
			callback( err );
		} else {
			var misspellings = results[0],
				count = results[1],
				errRate = misspellings/count;

			callback( null, ( errRate < acceptableErrorRate ) );
		}
	});
}

if ( argv._.length != 1 ){
    console.log('Usage: node spellingFilter [Path To Open Subtitles]');
} else {
    var path = argv._[0];
	var fileList = getFileList( path );
	var removed = 0;
	console.log("Will spellcheck " + fileList.length + " files.");

	async.eachLimit( fileList, 5, function( path, done ){
		vetFile( path, function( err, acceptable ){
			if ( err ){
				done( err );
			} else {
				if (!acceptable){
					removed++;
					fs.unlinkSync( path );
				}
				done();
			}
		});
	}, function( err ){
		console.log('done. removed ' + removed + ' files.');
	});
}
