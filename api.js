import axios from "axios";
import {JSDOM} from "jsdom";

import {Buffer} from 'node:buffer'



export async function getCodexData(url, id, lang) {
    const result = await axios.get(
        `${url}/tip.php?id=item--${id}&l=${lang}&nf=on`)
    console.log(`STATUS: ${result.status}`)
    console.log(`STATUS TEXT: ${result.statusText}`)
    return new JSDOM(result.data, {resources: 'usable'})
}

export async function getBinaryResource(url) {
    const response = await axios.get(
        url, {
            responseType: 'arraybuffer',
        },
    )
    return Buffer.from(response.data, 'binary')
}