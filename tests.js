var survivor = require('./survivor')
  , DiffMatchPatch = require('googlediff')

var lines = [
  'first line',
  'second line',
  'third line'
]

exports['should find locations in unchanging texts'] = function(test) {
  var lookup = getLookup(lines, lines)
  for(var l = 0; l < lines.length; l++)
    for(var c = 0; c < lines[l].length; c++)
      test.deepEqual(lookup({ line: l, col: c }), { line: l, col: c })
  test.done()
}

exports['should return null for missing lines'] = function(test) {
  var lookup = getLookup(lines, lines)
  test.deepEqual(lookup({ line: -1, col: 0 }), null)
  test.deepEqual(lookup({ line: 4, col: 0 }), null)
  test.done()
}

exports['should return null for out-of-range columns'] = function(test) {
  var lookup = getLookup(lines, lines)
  for(var l = 0; l < lines.length; l++) {
    test.deepEqual(lookup({ line: 0, col: -1 }), null)
    test.deepEqual(lookup({ line: 0, col: lines[l].length }), null)
  }
  test.done()
}

exports['should detect deleting first line'] = function(test) {
  var lookup = getLookup(lines, ['second line', 'third line'])
  test.deepEqual(lookup({ line: 0, col: 0}), { line: 1, col: 0})
  test.deepEqual(lookup({ line: 1, col: 0}), { line: 2, col: 0})
  test.deepEqual(lookup({ line: 2, col: 0}), null)
  test.done()
}

exports['should detect deleting middle line'] = function(test) {
  var lookup = getLookup(lines, ['first line', 'third line'])
  test.deepEqual(lookup({ line: 0, col: 0}), { line: 0, col: 0})
  test.deepEqual(lookup({ line: 1, col: 0}), { line: 2, col: 0})
  test.deepEqual(lookup({ line: 2, col: 0}), null)
  test.done()
}

exports['should detect deleting last line'] = function(test) {
  var lookup = getLookup(lines, ['first line', 'second line'])
  test.deepEqual(lookup({ line: 0, col: 0}), { line: 0, col: 0})
  test.deepEqual(lookup({ line: 1, col: 0}), { line: 1, col: 0})
  test.deepEqual(lookup({ line: 2, col: 0}), null)
  test.done()
}

exports['should detect inserting first line'] = function(test) {
  var lookup = getLookup(lines, [
    'INSERTED LINE',
    'first line',
    'second line',
    'third line'
  ])
  test.deepEqual(lookup({ line: 0, col: 0}), null)
  test.deepEqual(lookup({ line: 1, col: 0}), { line: 0, col: 0})
  test.deepEqual(lookup({ line: 2, col: 0}), { line: 1, col: 0})
  test.deepEqual(lookup({ line: 3, col: 0}), { line: 2, col: 0})
  test.done()
}

exports['should detect inserting middle line'] = function(test) {
  var lookup = getLookup(lines, [
    'first line',
    'INSERTED LINE',
    'second line',
    'third line'
  ])
  test.deepEqual(lookup({ line: 0, col: 0}), { line: 0, col: 0})
  test.deepEqual(lookup({ line: 1, col: 0}), null)
  test.deepEqual(lookup({ line: 2, col: 0}), { line: 1, col: 0})
  test.deepEqual(lookup({ line: 3, col: 0}), { line: 2, col: 0})
  test.done()
}

exports['should detect inserting last line'] = function(test) {
  var lookup = getLookup(lines, [
    'first line',
    'second line',
    'third line',
    'INSERTED LINE',
  ])
  test.deepEqual(lookup({ line: 0, col: 0}), { line: 0, col: 0})
  test.deepEqual(lookup({ line: 1, col: 0}), { line: 1, col: 0})
  test.deepEqual(lookup({ line: 2, col: 0}), { line: 2, col: 0})
  test.deepEqual(lookup({ line: 3, col: 0}), null)
  test.done()
}

exports['should detect deleting text from line start'] = function(test) {
  var lookup = getLookup(lines, [
    'first line',
    'line',
    'third line',
  ])
  var removed = 'second '
  test.deepEqual(lookup(
    { line: 1, col: 0}),
    { line: 1, col: removed.length })
  test.deepEqual(lookup(
    { line: 1, col: 1}),
    { line: 1, col: removed.length + 1 })
  test.done()
}

exports['should detect deleting text from line middle'] = function(test) {
  var lookup = getLookup(lines, [
    'first line',
    'secondline',
    'third line',
  ])
  var removedIndex = 'second line'.indexOf(' ')
  test.deepEqual(lookup(
    { line: 1, col: removedIndex}),
    { line: 1, col: removedIndex + 1 })
  test.deepEqual(lookup(
    { line: 1, col: removedIndex - 1 }),
    { line: 1, col: removedIndex - 1 })
  test.done()
}

exports['should detect deleting text from line end'] = function(test) {
  var lookup = getLookup(lines, [
    'first line',
    'second',
    'third line',
  ])
  var removedIndex = 'second line'.indexOf(' ')
  test.deepEqual(lookup(
    { line: 1, col: 'second'.length - 1 }),
    { line: 1, col: 'second'.length - 1 })
  test.deepEqual(lookup({ line: 1, col: 'second'.length }), null)
  test.done()
}

exports['should detect inserting text at line start'] = function(test) {
  var lookup = getLookup(lines, [
    'first line',
    'INSERTED-TEXTsecond line',
    'third line',
  ])
  test.deepEqual(lookup({ line: 1, col: 0 }), null)
  test.deepEqual(lookup({ line: 1, col: 'INSERTED-TEXT'.length - 1 }), null)
  test.deepEqual(lookup(
    { line: 1, col: 'INSERTED-TEXT'.length }),
    { line: 1, col: 0 })
  test.done()
}

exports['should detect inserting text at line middle'] = function(test) {
  var lookup = getLookup(lines, [
    'first line',
    'second INSERTED-TEXTline',
    'third line',
  ])
  test.deepEqual(lookup(
    { line: 1, col: 'second '.length - 1 }),
    { line: 1, col: 'second '.length - 1 })
  test.deepEqual(lookup({ line: 1, col: 'second I'.length - 1 }), null)
  test.deepEqual(lookup(
    { line: 1, col: 'second INSERTED-TEXT'.length - 1 }),
    null)
  test.deepEqual(lookup(
    { line: 1, col: 'second INSERTED-TEXTl'.length - 1 }),
    { line: 1, col: 'second l'.length - 1 })
  test.done()
}

exports['should detect inserting text at line end'] = function(test) {
  var lookup = getLookup(lines, [
    'first line',
    'second lineINSERTED-TEXT',
    'third line',
  ])
  test.deepEqual(lookup(
    { line: 1, col: 'second line'.length - 1 }),
    { line: 1, col: 'second line'.length - 1 })
  test.deepEqual(lookup({ line: 1, col: 'second lineI'.length - 1 }), null)
  test.deepEqual(lookup(
    { line: 1, col: 'second lineINSERTED-TEXT'.length - 1 }),
    null)
  test.done()
}

exports['should run README example'] = function(test) {

  var DiffMatchPath = require('googlediff')
  //, survivor = require('survivor')
    , dmp = new DiffMatchPatch()
    , diffs = dmp.diff_main('A quick brown fox', 'A fast brown dog', false)
    , lookup = survivor(diffs)

  // lookup 'A' (at the beginning of both lines)
  test.deepEqual(lookup({ line: 0, col: 0 }), { line: 0, col: 0 })

  // lookup 'f' from 'fast' (absent from the original)
  test.deepEqual(lookup({ line: 0, col: 2 }), null)

  // lookup 'b' from 'brown' (moved in the new version)
  test.deepEqual(lookup({ line: 0, col: 7 }), { line: 0, col: 8 })

  test.done()
}

function getLookup(lhs, rhs) {
  var dmp = new DiffMatchPatch()
    , diffs = dmp.diff_main(lhs.join('\n'), rhs.join('\n'))
  return survivor(diffs)
}
