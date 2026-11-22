import test from 'node:test';
import assert from 'node:assert/strict';
import {parseQuestionImage,createQuestionImageLocation,imageStorageFromRoute,isInternalQuestionImageUrl,MAX_QUESTION_IMAGE_BYTES} from '../api/questionImages.js';
import {normalizeQuestion,sdTopics} from '../api/questionBank.js';

const png=Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),Buffer.alloc(30)]);
const jpeg=Buffer.concat([Buffer.from('ffd8ffe00010','hex'),Buffer.alloc(32)]);
const webp=Buffer.concat([Buffer.from('RIFF','ascii'),Buffer.alloc(4),Buffer.from('WEBP','ascii'),Buffer.alloc(20)]);
const gif=Buffer.concat([Buffer.from('GIF89a','ascii'),Buffer.alloc(30)]);
const avif=Buffer.concat([Buffer.alloc(4),Buffer.from('ftypavif','ascii'),Buffer.alloc(30)]);
const bmp=Buffer.concat([Buffer.from('BM','ascii'),Buffer.alloc(40)]);
const dataUrl=(buffer,type)=>'data:'+type+';base64,'+buffer.toString('base64');
const owner='t-123e4567-e89b-12d3-a456-426614174000';
const imageId='456e4567-e89b-42d3-a456-426614174888';
test('Accept common JPEG PNG WEBP GIF AVIF BMP with magic-byte validation',()=>{
 for(const [bytes,mime] of [[png,'image/png'],[jpeg,'image/jpeg'],[webp,'image/webp'],[gif,'image/gif'],[avif,'image/avif'],[bmp,'image/bmp']]){
  const actual=parseQuestionImage({dataUrl:dataUrl(bytes,mime)});
  assert.equal(actual.contentType,mime);
  assert.deepEqual(actual.buffer,bytes);
 }
 assert.equal(parseQuestionImage({dataUrl:dataUrl(jpeg,'image/jpg')}).contentType,'image/jpeg');
 assert.equal(parseQuestionImage({dataUrl:dataUrl(bmp,'image/x-ms-bmp')}).contentType,'image/bmp');
 assert.throws(()=>parseQuestionImage({dataUrl:dataUrl(png,'image/jpeg')}),/Isi file/);
 assert.throws(()=>parseQuestionImage({dataUrl:'data:image/svg+xml;base64,PHN2Zz4='}),/Pilih gambar/);
 assert.throws(()=>parseQuestionImage({dataUrl:'data:image/png;base64,AAAA'}),/Isi file/);
 assert.throws(()=>parseQuestionImage({dataUrl:dataUrl(Buffer.alloc(MAX_QUESTION_IMAGE_BYTES+1),'image/png')}),/2 MB/);
});
test('Image location is private-storage backed, strictly scoped and cannot traverse paths',()=>{
 const location=createQuestionImageLocation(owner,'image/png',imageId);
 assert.equal(location.pathname,'question-images/'+owner+'/'+imageId+'.png');
 assert.equal(location.url,'/api/question-images/file/'+owner+'/'+imageId+'.png');
 assert.equal(isInternalQuestionImageUrl(location.url),true);
 assert.deepEqual(imageStorageFromRoute(location.url.slice(5)),{pathname:location.pathname,contentType:'image/png'});
 assert.equal(imageStorageFromRoute('question-images/file/../admin/escape.png'),null);
 assert.equal(isInternalQuestionImageUrl('/api/question-images/file/../../etc/passwd'),false);
 assert.equal(isInternalQuestionImageUrl(location.url+'?download=1'),false);
 assert.throws(()=>createQuestionImageLocation('../superadmin','image/png',imageId));
 assert.throws(()=>createQuestionImageLocation(owner,'text/html',imageId));
 for(const [mime,ext] of [['image/jpeg','jpg'],['image/png','png'],['image/webp','webp'],['image/gif','gif'],['image/avif','avif'],['image/bmp','bmp']]){
  const loc=createQuestionImageLocation(owner,mime,imageId);
  assert.equal(isInternalQuestionImageUrl(loc.url),true);
  assert.deepEqual(imageStorageFromRoute(loc.url.slice(5)),{pathname:loc.pathname,contentType:mime});
  assert.equal(loc.pathname.endsWith('.'+ext),true);
 }
});
test('Question CRUD accepts secure generated image URLs and rejects arbitrary relative routes',()=>{
 const imageUrl=createQuestionImageLocation('superadmin','image/jpeg',imageId).url;
 const sample={grade:'Kelas 1',topic:sdTopics['Kelas 1'][0],question:'Ada 3 rumah dan 4 rumah. Berapa jumlah seluruh rumah?',options:['5','6','7','8'],answer:'7',explanation:'Tiga tambah empat adalah tujuh.',cultureId:'sumatra'};
 assert.equal(normalizeQuestion({...sample,imageUrl}).imageUrl,imageUrl);
 assert.throws(()=>normalizeQuestion({...sample,imageUrl:'/api/teacher/questions'}));
 assert.throws(()=>normalizeQuestion({...sample,imageUrl:'javascript:alert(1)'}));
 assert.equal(normalizeQuestion({...sample,imageUrl:'https://example.org/image.png'}).imageUrl,'https://example.org/image.png');
});
