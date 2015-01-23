// Dedupes files from the Open Subtitles XML dump.
// Leaves one file in each path/xml/en/{year}/{id}.
//
// Usage: 
// node deduper.js OpenSubtitlesPath


var fs = require('fs');
var argv = require('minimist')(process.argv.slice(2));

function dedupe( dir ) {
	var idsRead = {};

    var list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        var stat = fs.statSync(file);
        if (stat && stat.isDirectory()) dedupe(file);
        else {
        	if ( file.indexOf('.xml', this.length - 4) !== -1){
        		var id = file.split("/")[6];
        		if ( typeof idsRead[id] === 'undefined' ){
        			idsRead[id] = true;
        		} else {
                    removed++;
	        		fs.unlinkSync( file );
	        	}
        	} 
        }
    });
}

if ( argv._.length != 1 ){
    console.log('Usage: node deduper [Path To Open Subtitles]');
} else {
    var path = argv._[0];
    console.log( "deduping " + path );
    var removed = dedupe( path );
    console.log("done.");
}