const fs = require('fs')

function analyze (filePath, eventName = 'XHRLoad') {
  const file = fs.readFileSync(filePath, { encoding: 'utf8' })
  const events = JSON.parse(file)
  const filteredEvents = events.filter(e => e.name === eventName)
  return createUrlMap(filteredEvents)
}

function compare (firstPath, secondPath) {
  const map1 = analyze(firstPath)
  const map2 = analyze(secondPath)
  const map3 = new Map();
  [...map1.keys(), ...map2.keys()].forEach(key => {
    const val1 = map1.get(key)
    const val2 = map2.get(key)
    if (val1 && val2) {
      map3.set(key, `${val1}/${val2} (${(val2/val1).toFixed(2)})`)
    }
  })
  console.log(map3)
  //console.log(analyze(firstPath), '/', analyze(secondPath))
}
function createUrlMap (events) {
  const map = new Map()

  events.forEach(t => {
    const key = t.args.data.url
    const dur = t.dur || 0
    if (!dur) {return}
    if (!map.has(key)) {
      map.set(key, dur)
      return
    }
    map.set(key, (map.get(key) + dur) / 2)
  })
 return map
}

function calcAverageDuration (events, fieldName = 'dur') {
  let times = events.map(t => t[fieldName] || 0).filter(t => t > 15).sort((a, b) => b - a)

  const medianT = median(times)
  times = times.filter(t => t > medianT)
  const sum = times.reduce((a, b) => a + b, 0)
  const avgTime = +(sum / times.length).toFixed(0)

  return avgTime
}

function median (values) {
  if (values.length === 0) return 0

  values.sort(function (a, b) {
    return a - b
  })

  var half = Math.floor(values.length / 2)

  if (values.length % 2)
    return values[half]

  return (values[half - 1] + values[half]) / 2.0
}
//analyze('big_xhr_patched.json', 'XHRLoad')
//analyze('big_xhr_unpatched.json', 'XHRLoad')
//
//analyze('page_load_patched.json', 'XHRLoad')
//analyze('page_load_unpatched.json', 'XHRLoad')
//
//analyze('boadr_right_scroll_xhr_patch.json', 'XHRLoad')
//analyze('board_right_scroll_full_zone.json', 'XHRLoad')
//
//analyze('few-requests_patched.json', 'XHRLoad')
//analyze('few-requests-unpatched.json', 'XHRLoad')

//compare('big_xhr_patched.json','big_xhr_unpatched.json')
//compare('page_load_patched.json','page_load_unpatched.json')
//compare('boadr_right_scroll_xhr_patch.json','board_right_scroll_full_zone.json')
//compare('few-requests_patched.json','few-requests-unpatched.json')
compare('two_clicks_patched.json', 'two_clicks_full_zone1.json')
