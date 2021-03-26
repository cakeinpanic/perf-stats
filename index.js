const fs = require('fs')
const _ = require('lodash')

function getUrlTimeMap (filePath) {
  const file = fs.readFileSync(filePath, { encoding: 'utf8' })
  const events = JSON.parse(file)
  const filteredEvents = events.filter(e => e.name === 'XHRLoad')
  return createUrlMap(filteredEvents)
}

function createUrlMap (events) {
  const map = {}

  events.forEach(t => {
    const key = t.args.data.url
    const dur = t.dur || 0
    if (!dur) {return}
    if (!map[key]) {
      map[key] = [dur]
    } else {
      map[key].push(dur)
    }
  })

  return _.mapValues(map, value => +(_.mean(value).toFixed(0)))
}

function compare (firstPath, secondPath) {
  const map1 = getUrlTimeMap(firstPath)
  const map2 = getUrlTimeMap(secondPath)
  const diffLabel = 'diff(%)'
  let resultsTable = [];
  _.uniq([...Object.keys(map1), ...Object.keys(map2)]).forEach(key => {
    const val1 = map1[key]
    const val2 = map2[key]
    if (val1 && val2) {
      const diff = +((val2 / val1) * 100).toFixed(0)
      resultsTable.push({ url: key.substring(0, 80), [firstPath]: val1, [secondPath]: val2, [diffLabel]: diff })
    }
  })
  resultsTable = _.orderBy(resultsTable, diffLabel, 'desc')
  console.table(resultsTable)

}

compare('xhr_patched.json', 'xhr_not_patched.json')
