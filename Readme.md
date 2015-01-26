# Word Frequencies

A set of tools to compute the frequencies of word usage in the English language. Uses subtitles from movies and television as a data source.  

Original idea: 
Brysbaert & New, [SUBTLEXus](http://expsy.ugent.be/subtlexus/Brysbaert&NewBRM2009Subtlexus.pdf)

## Data Source

To get started, you'll need to download the OpenSubtitles English data from [Open Corpus](http://opus.lingfil.uu.se/index.php).  Open Corpus got the data from [Open Subtitles](http://www.opensubtitles.org/en/search).  If you use this data, please consider supporting the site.

You can grab the 2012 tokenized corpus files in XML from here:

http://opus.lingfil.uu.se/OpenSubtitles2012.php

**Warning**: The 2012 *en.tar.gz* is 11 GB, compressed.
  
After you've downloaded the data, extract it's contents, which is a lot of .gz files in a lot of directories. You'll need to uncompress the xml files you're interested before these tools will work.

## Installation

Clone from GitHub:

`git clone git@github.com:WordsAPI/wordfrequencies.git`

## Usage

### deduper.js

The data from Open Corpus is broken down into directories like this:

`OpenSubtitles2012/en/{year}/{movieId}/`

Inside each `movieId` directory are one or more subtitle files. If there are more than one file, it's because that movie or tv episode was released in different formats (or encodings), each of which needed it's own subtitle file.

Since we only want to count each movie once time, the deduper will select one of the files in each subdirectory and delete the others, to clean up space.

`node deduper.js {OpenSubtitlesDirectoryPath}`

### spellingFilter.js

Deletes files that have an unacceptable spelling error rate (default is 2.5%).

```
node spellingFilter.js [options] {OpenSubtitlesDirectoryPath}
options:
    -a <n> Acceptable Error Rate (default is .025);
```
### frequencyCounter.js

Generates a JSON file with counts of the frequencies of unique words from Open Subtitles.    The format of the file is a big JSON object, and looks like this:

```js
    "devine": {
        "freqCount": 15,
        "cdCount": 7
    },
    "mess": {
        "freqCount": 2514,
        "cdCount": 1591
    },
```
The keys in the object are the words. Each word has a `freqCount`, which is the number of times the word was seen, and a `cdCount`, which is the number of files the word was seen in.

To run it:
```
node frequencyCounter.js [options] OpenSubtitlesPath
options:
-m, <n> Maximum number of words to stop counting at (default is 60,000,000).
	Note, this is only checked once every 100 files, so you may go over it
	by a bit.
-o  <path> Path to write output. Default is frequency.json.
```

### cleaner.js

"Cleans" a file created by frequencyCounter.js. Removes words with weird characters and attempts to merge them with the 'clean' version. Fixes contractions.

### merger.js

Merges two or more files created by frequencyCounter.js.  So if you created a JSON file per year, you can use this to combine them into a file spanning multiple years.

### counter.js

Spits out the number of total words, number of unique words, and the top 10 words from a file created by frequencyCounter.js.

## Output

The result of running these tools will be a JSON file you can slice and dice to your heart's content. You may want to check out [jq](http://stedolan.github.io/jq/) if you just want to peek at the results.

## License (MIT)
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.