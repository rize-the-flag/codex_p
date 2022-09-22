import {writeFileSync, readFileSync} from 'fs'
import {fork} from 'child_process'

const MAX_THREAD_COUNT = 4;
const MAX_ID = 1000000;
const MAX_FLUSH_ITEMS = 10;

const fp = [];
for (let i = 1; i <= MAX_THREAD_COUNT; i++)
    fp[i] = fork('fork-process.js', [JSON.stringify({
        threadId: i,
        threadAmounts: MAX_THREAD_COUNT,
        maxItemId: MAX_ID,
        maxItemsToFlush: MAX_FLUSH_ITEMS
    })]);

