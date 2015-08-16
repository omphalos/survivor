'use strict'

module.exports = function(diffs, indexOnly) {

  var oldLine = 0
    , oldCol = 0
    , map = [[]]
    , processCol = { '-1': deleteCol, '0': preserveCol, '1': insertCol }
    , processLine = { '-1': deleteLine, '0': preserveLine, '1': insertLine }
    , lookup = indexOnly ? lookupIndex : lookupLine

  diffs.forEach(function(diff) {
    var diffType = diff[0]
      , diffText = diff[1]
    for(var c = 0; c < diffText.length; c++) {
      var char = diffText[c]
      ;(indexOnly || char !== '\n' ? processCol : processLine)[diffType](char)
    }
  })

  lookup.map = map

  return lookup

  function lookupIndex(col) {
    var colMapping = map[0][col]
    return colMapping ? colMapping.col : null
  }

  function lookupLine(query) {
    var lineMapping = map[query.line]
    if(!lineMapping) return null
    var colMapping = lineMapping[query.col]
    return colMapping || null
  }

  function deleteCol(c) {
    oldCol++
  }

  function deleteLine() {
    oldCol = 0
    oldLine++
  }

  function preserveCol(c) {
    map[map.length - 1].push({ line: oldLine, col: oldCol })
    oldCol++
  }

  function preserveLine() {
    map.push([])
    oldCol = 0
    oldLine++
  }

  function insertCol(c) {
    map[map.length - 1].push(null)
  }

  function insertLine() {
    map.push([])
  }
}
