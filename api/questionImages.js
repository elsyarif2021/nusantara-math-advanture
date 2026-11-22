import crypto from 'node:crypto';

export const MAX_QUESTION_IMAGE_BYTES=2*1024*1024;
const EXTENSIONS={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'};
const OWNER_PATTERN='(?:superadmin|t-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})';
const FILE_PATTERN='[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.(?:png|jpg|webp)';
const URL_PATTERN=new RegExp('^/api/question-images/file/('+OWNER_PATTERN+')/('+FILE_PATTERN+')$');
const ROUTE_PATTERN=new RegExp('^question-images/file/('+OWNER_PATTERN+')/('+FILE_PATTERN+')$');

export function isInternalQuestionImageUrl(value){
 return typeof value==='string'&&URL_PATTERN.test(value);
}
export function imageStorageFromRoute(route){
 const match=typeof route==='string'?route.match(ROUTE_PATTERN):null;
 if(!match)return null;
 const filename=match[2];
 const ext=filename.slice(filename.lastIndexOf('.')+1);
 return {pathname:'question-images/'+match[1]+'/'+filename,contentType:ext==='jpg'?'image/jpeg':ext==='png'?'image/png':'image/webp'};
}
export function parseQuestionImage(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Data gambar tidak valid.');
 const data=String(input.dataUrl||'');
 const match=data.match(/^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/]+={0,2})$/);
 if(!match)throw Error('Pilih gambar JPG, PNG, atau WEBP dari perangkat.');
 if(match[2].length>Math.ceil(MAX_QUESTION_IMAGE_BYTES/3)*4+8)throw Error('Ukuran gambar maksimal 2 MB.');
 const buffer=Buffer.from(match[2],'base64');
 if(!buffer.length||buffer.length>MAX_QUESTION_IMAGE_BYTES)throw Error('Ukuran gambar harus antara 1 byte sampai 2 MB.');
 const claimedMime=match[1];
 const detectedMime=buffer.length>=12&&buffer.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex'))?'image/png'
  :buffer.length>=4&&buffer[0]===0xff&&buffer[1]===0xd8&&buffer[2]===0xff?'image/jpeg'
  :buffer.length>=12&&buffer.toString('ascii',0,4)==='RIFF'&&buffer.toString('ascii',8,12)==='WEBP'?'image/webp':null;
 if(detectedMime!==claimedMime)throw Error('Isi file tidak sesuai dengan format gambar JPG/PNG/WEBP.');
 return {buffer,contentType:detectedMime};
}
export function createQuestionImageLocation(owner,contentType,id=crypto.randomUUID()){
 if(!new RegExp('^'+OWNER_PATTERN+'$').test(owner)||!EXTENSIONS[contentType]||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id))throw Error('Lokasi gambar tidak valid.');
 const pathname='question-images/'+owner+'/'+id+'.'+EXTENSIONS[contentType];
 return {pathname,url:'/api/'+pathname.replace('question-images/','question-images/file/')};
}
