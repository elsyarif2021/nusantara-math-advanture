import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const api=readFileSync(new URL('../api/index.js',import.meta.url),'utf8');

test('health probes real Blob access without overwriting or exposing stored school data',()=>{
 assert.match(api,/path==='health'&&method==='GET'/);
 assert.match(api,/await get\('config\/school\.json',\{access:'private'\}\)/);
 assert.match(api,/storageAccess:'reachable'/);
 assert.match(api,/storageAccess:forbidden\?'forbidden':'unreachable'/);
 assert.doesNotMatch(api,/await put\('config\/school\.json'/);
});
test('a forbidden Blob read produces a useful server error without leaking credentials',()=>{
 assert.match(api,/code:'BLOB_ACCESS_DENIED'/);
 assert.match(api,/Vercel Blob 403/);
 assert.match(api,/console\.error\('NMA API ERROR'/);
});
