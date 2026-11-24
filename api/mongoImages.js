import {mongoImageCollection} from './mongoDocuments.js';
import {MAX_QUESTION_IMAGE_BYTES} from './questionImages.js';

// Images are stored separately from JSON records. 2 MB fits within the
// MongoDB document limit and avoids the exhausted legacy Vercel Blob store.
// The API authenticates uploaders before reaching this module.
export async function mongoImagePut(pathname,buffer,contentType){
 if(!pathname.startsWith('question-images/')||!Buffer.isBuffer(buffer)||buffer.length<1||buffer.length>MAX_QUESTION_IMAGE_BYTES)throw Error('Gambar tidak valid.');
 const collection=await mongoImageCollection();
 await collection.insertOne({_id:pathname,contentType,data:buffer,createdAt:new Date()});
 return {pathname};
}

export async function mongoImageGet(pathname){
 if(!pathname.startsWith('question-images/'))return null;
 const record=await(await mongoImageCollection()).findOne({_id:pathname},{projection:{data:1,contentType:1}});
 if(!record)return null;
 const data=record.data;
 const buffer=Buffer.isBuffer(data)?data:typeof data?.value==='function'?Buffer.from(data.value(true)):null;
 if(!buffer||buffer.length<1||buffer.length>MAX_QUESTION_IMAGE_BYTES)throw Error('Gambar yang tersimpan tidak valid.');
 return {buffer,contentType:record.contentType};
}
