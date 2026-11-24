import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseQuestionImage,createQuestionImageLocation,imageStorageFromRoute} from '../api/questionImages.js';

const api=readFileSync(new URL('../api/index.js',import.meta.url),'utf8');
const mongodb=readFileSync(new URL('../api/mongoImages.js',import.meta.url),'utf8');
const db=readFileSync(new URL('../api/mongoDocuments.js',import.meta.url),'utf8');

test('new images are uploaded into MongoDB after role authentication, never the limited Blob store',()=>{
 const upload=api.slice(api.indexOf("if(path==='question-images/upload'"),api.indexOf("if(path.startsWith('question-images/file/')"));
 assert.match(upload,/isAdmin\(req\)/);
 assert.match(upload,/resolveTeacher\(req,\{read\}\)/);
 assert.match(upload,/parseQuestionImage\(req\.body\)/);
 assert.match(upload,/if\(usingMongo\(\)\)await mongoImagePut\(location\.pathname,parsed\.buffer,parsed\.contentType\)/);
 assert.match(upload,/uploaded:true,url:location\.url/);
 assert.match(mongodb,/collection\.insertOne\(/);
 assert.match(mongodb,/MAX_QUESTION_IMAGE_BYTES/);
});
test('new image GET uses Mongo while preserving legacy Blob access',()=>{
 const image=api.slice(api.indexOf("if(path.startsWith('question-images/file/')"),api.indexOf("if(await handleTeacherRoutes"));
 assert.match(image,/await mongoImageGet\(location\.pathname\)/);
 assert.match(image,/if\(stored\)\{buffer=stored\.buffer\}/);
 assert.match(image,/await get\(location\.pathname,\{access:'private'\}\)/);
 assert.match(image,/Content-Type/);
 assert.match(image,/nosniff/);
 assert.match(db,/collection\('nma_question_images'\)/);
});
test('image URLs are correctly validated and binary image type preserved',()=>{
 const bytes=Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),Buffer.alloc(35)]);
 const parsed=parseQuestionImage({dataUrl:'data:image/png;base64,'+bytes.toString('base64')});
 const location=createQuestionImageLocation('superadmin',parsed.contentType);
 assert.deepEqual(imageStorageFromRoute(location.url.slice('/api/'.length)),{pathname:location.pathname,contentType:'image/png'});
 assert.equal(parsed.buffer.length,bytes.length);
});
