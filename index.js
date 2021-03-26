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
  Object.keys(map).forEach(key => map[key] = +_.mean(map[key]).toFixed(0))
  return map
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
      resultsTable.push({ url: key.substring(0,80), [firstPath]: val1, [secondPath]: val2, [diffLabel]: diff })
    }
  })
  resultsTable = _.orderBy(resultsTable, diffLabel, 'desc')
  console.table(resultsTable)

}


////compare('big_xhr_patched.json', 'big_xhr_unpatched.json')
////compare('page_load_patched.json', 'page_load_unpatched.json')
//compare('boadr_right_scroll_xhr_patch.json', 'board_right_scroll_full_zone.json')
////compare('few-requests_patched.json', 'few-requests-unpatched.json')
//compare('two_clicks_patched.json', 'two_clicks_full_zone1.json')
