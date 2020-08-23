const https = require('https')
const fs = require('fs')
const path = require('path')
const options = {
  hostname: 'coderbyte.com',
  port: 443,
  path: '/api/challenges/json/json-cleaning',
  method: 'GET'
}

let json = new Map()
let keys = []

let callback = (res) => {
  console.log(`status code: ${res.statusCode}`)

  res.on('data', (d) => {
    json = new Map(Object.entries(JSON.parse(d)))
    console.log(json)
    keys = json.keys()
    console.log(keys)

    removeEmptyValues()
  })
}

function removeEmptyValues() {
  Array.from(keys).forEach(key => {
    let value = json.get(key)
    if (typeof value === "string" &&
      (value === "-" || value === "N\/A" || value === "")) {
      json.delete(key)
    } else if (Array.isArray(value)) {
      let arr = value.filter(item => {
        if (!(item === "-" || item === "N\/A" || item === "")) {
          return item
        }
      })

      console.log(arr)
      if (arr.length > 0) json.set(key, arr)
      else json.delete(key)
    } else if (typeof value === 'object' && value !== null) {
      Object.keys(value).forEach(vKey => {
        let vValue = value[vKey]
        if (vValue === "-" || vValue === "N\/A" || vValue === "") {
          delete value[vKey]
        }
      })
      json.set(key, value)
    }
  })


  writeToFile()
}

function writeToFile() {
  console.log(json)
  const obj = {}

  let file = fs.createWriteStream(path.join(process.cwd(), 'cleaned.txt'), { flags: 'w+' })
  json.forEach((value, key) => { obj[key] = value })
  file.write(JSON.stringify(obj))
  file.close()
}

const req = https.request(options, callback)
  .on('error', (error) => {
    console.error(error)
  })
  .end()