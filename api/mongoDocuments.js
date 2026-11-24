import {MongoClient} from 'mongodb';

// MongoDB keeps JSON documents in the same pathname namespace as the legacy
// private Blob store. Existing Blob objects are never deleted or overwritten.
let clientPromise;
async function documents(){
 const uri=process.env.MONGODB_URI;
 if(!uri)throw Error('MONGODB_URI belum terhubung ke proyek.');
 if(!clientPromise){
  const client=new MongoClient(uri,{serverSelectionTimeoutMS:7000,maxPoolSize:8});
  clientPromise=client.connect().then(()=>client).catch(error=>{clientPromise=undefined;throw error});
 }
 const client=await clientPromise;
 return client.db(process.env.MONGODB_DB_NAME||undefined).collection('nma_documents');
}
export async function mongoImageCollection(){
 const collection=await documents();
 return collection.db.collection('nma_question_images');
}
export async function mongoDocPing(){
 const collection=await documents();
 await collection.db.admin().ping();
 return true;
}
export async function mongoDocRead(path){
 const record=await(await documents()).findOne({_id:path});
 return record?.value??null;
}
export async function mongoDocWrite(path,value){
 if(typeof path!=='string'||!path.endsWith('.json'))throw Error('Kunci dokumen tidak valid.');
 const collection=await documents();
 await collection.updateOne({_id:path},{$set:{value,updatedAt:new Date()}},{upsert:true});
 return {pathname:path};
}
export async function mongoDocList({prefix='',limit=300,cursor}={}){
 if(typeof prefix!=='string'||prefix.length>180||prefix.includes('..'))throw Error('Prefix tidak valid.');
 const pageSize=Math.max(1,Math.min(300,Number(limit)||300));
 let after='';
 if(cursor){
  try{after=Buffer.from(cursor,'base64url').toString('utf8')}
  catch{throw Error('Cursor dokumen tidak valid.')}
  if(!after.startsWith(prefix))throw Error('Cursor dokumen di luar prefix.');
 }
 const escaped=prefix.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const match={$regex:'^'+escaped};
 if(after)match.$gt=after;
 const docs=await(await documents()).find({_id:match},{projection:{_id:1}}).sort({_id:1}).limit(pageSize+1).toArray();
 const hasMore=docs.length>pageSize;
 const blobs=docs.slice(0,pageSize).map(doc=>({pathname:doc._id}));
 return {blobs,hasMore,cursor:hasMore?Buffer.from(blobs.at(-1).pathname).toString('base64url'):undefined};
}
