import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const api=readFileSync(new URL('../api/index.js',import.meta.url),'utf8');
const mongo=readFileSync(new URL('../api/mongoDocuments.js',import.meta.url),'utf8');

test('health checks the existing MongoDB connection without mutating student or school data',()=>{
 assert.match(api,/path==='health'&&method==='GET'/);
 assert.match(api,/await mongoDocPing\(\)/);
 assert.match(api,/storageProvider:'mongodb'/);
 assert.match(api,/legacyBlobMigration:'pending'/);
 assert.doesNotMatch(api,/await put\('config\/school\.json'/);
});

test('legacy Blob diagnostic remains read-only and never leaks credentials',()=>{
 assert.match(api,/await get\('config\/school\.json',\{access:'private'\}\)/);
 assert.match(api,/storageProvider:'blob'/);
 assert.match(api,/code:'BLOB_ACCESS_DENIED'/);
 assert.match(api,/console\.error\('NMA API ERROR'/);
});

test('Mongo documents preserve Blob path names and never overwrite the original Blob store',()=>{
 assert.match(mongo,/collection\('nma_documents'\)/);
 assert.match(mongo,/updateOne\(/);
 assert.match(mongo,/\$set:\{value,updatedAt:new Date\(\)\}/);
 assert.doesNotMatch(mongo,/\bdeleteMany\(/);
 assert.doesNotMatch(mongo,/\bdrop\(/);
 assert.match(api,/const list=options=>usingMongo\(\)\?mongoDocList\(options\):blobList\(options\)/);
});
