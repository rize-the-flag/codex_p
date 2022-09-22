import {getBinaryResource, getCodexData} from "./api.js";
import chalk from 'chalk'
import fs from 'node:fs';

const langArray = ['ru', 'cn', 'us']
import {writeFileSync, readFileSync} from 'fs';

const {threadId, threadAmounts, maxItemsToFlush, maxItemId} = JSON.parse(process.argv[2]);


let MAX_ITEM_ID = maxItemId;
let FIRST_ITEM_ID = threadId * MAX_ITEM_ID / threadAmounts - MAX_ITEM_ID / threadAmounts;
const LAST_ITEM_ID = threadId * MAX_ITEM_ID / threadAmounts;

const REQUEST_URL = 'https://bdocodex.com';

console.log(chalk.bgGreen(`MAX_ITEM_ID: ${MAX_ITEM_ID}`));
console.log(chalk.bgGreen(`FIRST_ITEM_ID: ${FIRST_ITEM_ID}`));
console.log(chalk.bgGreen(`LAST_ITEM_ID: ${LAST_ITEM_ID}`));

function isExists(path) {
    try {
        if (fs.existsSync(path)) {
            return true;
        }
    } catch (err) {
        console.error(chalk.bgRed(err));
        return false;
    }
}

const run = async () => {
    let counter = 0
    const itemsArray = [];

    if (isExists(`items${threadId}.json`)) {
        itemsArray.push(...JSON.parse(
            readFileSync(`items${threadId}.json`, {encoding: 'utf8'})))
    }

    if (itemsArray.length !== 0) {
        FIRST_ITEM_ID = itemsArray[itemsArray.length - 1].id + 1
    }
    
    for (let id = FIRST_ITEM_ID; id < LAST_ITEM_ID; id++) {
        const o = {}
        let document = undefined
        for (const lang of langArray) {
            document = (await getCodexData(REQUEST_URL, id, lang)).window.document
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
        itemsArray.push({id: id, locales: o})
        writeFileSync('./images/' + id + '.png', imageBuffer)
        console.log(chalk.bgRed(`LAST_ID: ${id}`));

        if (counter === maxItemsToFlush) {
            writeFileSync(`items${threadId}.json`,
                JSON.stringify(itemsArray), 'utf8')
            counter = 0;
        }
        counter++
    }
    writeFileSync(`items${threadId}.json`,
        JSON.stringify(itemsArray), 'utf8')

    console.log(chalk.bgGreen('DONE'))
}

run()
