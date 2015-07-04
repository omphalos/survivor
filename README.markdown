Survivor
========

[![Build Status](https://secure.travis-ci.org/omphalos/survivor.png)](http://travis-ci.org/omphalos/survivor)

Survivor is a utility
for finding the original locations of changed text in a diff.

The intended use case is code diffs
with the [googlediff](https://www.npmjs.com/package/googlediff) library
but it can be used for any string diffs
and any diffing library that generates `diff-match-patch`-style output.

Installation
============

Run `npm install survivor`.

In the browser, add a script tag referencing *survivor.js*.
Since survivor uses [UMD](https://github.com/umdjs/umd),
this will expose 'survivor' as a global variable.

Usage
=====

    var DiffMatchPath = require('googlediff')
      , survivor = require('survivor')
      , dmp = new DiffMatchPatch()
      , diffs = dmp.diff_main('A quick brown fox', 'A fast brown dog', false)
      , lookup = survivor(diffs)

    // lookup 'A' (at the beginning of both lines)
    lookup({ line: 0, col: 0 }) // returns { line: 0, col: 0 }

    // lookup 'f' from 'fast' (absent from the original)
    lookup({ line: 0, col: 2 }) // returns null

    // lookup 'b' from 'brown' (moved in the new version)
    lookup({ line: 0, col: 7 }) // returns { line: 0, col: 8 }

Tests
=====

To set up the tests from the repo directory, `npm install`.
And to run them, `npm test`.

License
=======

MIT
