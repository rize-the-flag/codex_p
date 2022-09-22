import axios from 'axios'
import { JSDOM } from 'jsdom'
import { writeFileSync, openSync, readFileSync } from 'fs'

const REQUEST_URL = 'https://bdocodex.com'
const LAST_ITEM_ID = 900001
let FIRST_ITEM_ID = 500000
const MAX_ITEMS2FLUSH = 10

async function getCodexData (url, id, lang) {
  const result = await axios.get(
    `${url}/tip.php?id=item--${id}&l=${lang}&nf=on`)
  console.log(`STATUS: ${result.status}`)
  console.log(`STATUS TEXT: ${result.statusText}`)
  return new JSDOM(result.data, { resources: 'usable' })
}

async function getBinaryResource (url) {
  const response = await axios.get(
    url, {
      responseType: 'arraybuffer',
    },
  )
  return Buffer.from(response.data, 'binary')
}

const langArray = ['ru', 'cn', 'us']

const startTime = performance.now()
const run = async () => {
  let counter = 0
  const itemsArray = JSON.parse(
    readFileSync('items.json', { encoding: 'utf8' }))
  
  if (itemsArray.length !== 0) {
    FIRST_ITEM_ID = itemsArray[itemsArray.length - 1].id + 1
  }
  for (let id = FIRST_ITEM_ID; id < LAST_ITEM_ID; id++) {
    const o = {}
    let document = undefined
    for (const lang of langArray) {
      document = ( await getCodexData(REQUEST_URL, id, lang) ).window.document
      const item = document.getElementById('item_name')
      if (!item) continue
      console.log(lang + ' : ' + item.textContent)
      o[lang] = item.textContent
    }
    const image = document.querySelector('.item_icon')
    if (!image) continue
    const imageBuffer = await getBinaryResource(
      REQUEST_URL + image.getAttribute('src'),
    )
    itemsArray.push({ id: id, locales: o })
    writeFileSync('./images/' + id + '.png', imageBuffer)
    console.log(`TIME ELAPSED:${( performance.now() - startTime ) / 1000}`)
    console.log(`LAST_ID: ${id}`)
    
    if (counter === MAX_ITEMS2FLUSH) {
      writeFileSync('items.json',
        JSON.stringify(itemsArray), 'utf8')
      counter = 0;
    }
    counter++
  }
  writeFileSync('items.json',
    JSON.stringify(itemsArray), 'utf8')
}

run()