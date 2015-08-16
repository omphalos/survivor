'use strict'

return function survivor(diffs) {

  var oldLine = 0
    , oldCol = 0
    , map = [[]]
    , processCol = { '-1': deleteCol, '0': preserveCol, '1': insertCol }
    , processLine = { '-1': deleteLine, '0': preserveLine, '1': insertLine }

  diffs.forEach(function(diff) {
    var diffType = diff[0]
      , diffText = diff[1]
    for(var c = 0; c < diffText.length; c++) {
      var char = diffText[c]
      ;(char === '\n' ? processLine : processCol)[diffType](char)
    }
  })

  lookup.map = map

  return lookup

  function lookup(query) {
    var lineMapping = map[query.line]
    if(!lineMapping) return null
    var colMapping = lineMapping[query.col]
    if(colMapping === undefined) return null
    return colMapping
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
