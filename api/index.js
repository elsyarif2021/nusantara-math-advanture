import crypto from 'node:crypto';
import {Readable} from 'node:stream';
import {get,put,list} from '@vercel/blob';
import {handleUpload} from '@vercel/blob/client';
import {normalizeQuestion,questionIdOK,readQuestionBank} from './questionBank.js';
import {handleTeacherRoutes,resolveTeacher} from './teacherRoutes.js';
import {tokenInviteOK,idTeacherOK} from './teacherAuth.js';
import {readTeacherQuestions,selectPublicQuestions} from './teacherQuestions.js';
import {parseQuestionImage,createQuestionImageLocation,imageStorageFromRoute} from './questionImages.js';
import {mediaUploadPath,mediaRoute} from './questionMedia.js';

const send=(res,status,body,headers={})=>{res.status(status);res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');for(const[k,v]of Object.entries(headers))res.setHeader(k,v);res.json(body)};
const idOK=x=>typeof x==='string'&&/^[a-f0-9]{32}$/.test(x);
const adminReady=()=>Boolean(process.env.ADMIN_PASSWORD?.length>=8&&process.env.SESSION_SECRET?.length>=32);
const safeEqual=(a,b)=>{const x=crypto.createHash('sha256').update(String(a)).digest(),y=crypto.createHash('sha256').update(String(b)).digest();return crypto.timingSafeEqual(x,y)};
const sign=part=>crypto.createHmac('sha256',process.env.SESSION_SECRET).update(part).digest('hex');
const cookies=req=>Object.fromEntries((req.headers.cookie||'').split(';').map(x=>x.trim().split('=')).filter(x=>x.length>=2));
function isAdmin(req){if(!adminReady())return false;const value=cookies(req).nma_admin||'';const [expires,nonce,signature]=value.split('.');if(!expires||!nonce||!signature||Number(expires)<Date.now())return false;return safeEqual(signature,sign(expires+'.'+nonce))}
const storeReady=()=>Boolean(process.env.BLOB_READ_WRITE_TOKEN);
async function read(path){const r=await get(path,{access:'private'});if(!r)return null;return await new Response(r.stream).json()}
async function write(path,obj){return put(path,JSON.stringify(obj),{access:'private',contentType:'application/json',allowOverwrite:true})}
function studentOK(p,id){return p&&p.id===id&&typeof p.name==='string'&&p.name.trim().length>=2&&p.name.length<=80&&/^Kelas [1-6]$/.test(p.grade)&&Number.isSafeInteger(p.xp)&&p.xp>=0&&p.xp<=10000000&&Array.isArray(p.completed)&&p.completed.length<=14&&p.completed.every(x=>Number.isInteger(x)&&x>=1&&x<=7)&&Number.isInteger(p.gamesPlayed)&&p.gamesPlayed>=0&&p.gamesPlayed<=1000000&&Array.isArray(p.recent)&&p.recent.length<=25}
const pathname=req=>{let s=req.query.path??'';if(Array.isArray(s))s=s.join('/');return String(s).replace(/^\/+|\/+$/g,'')};
export default async function handler(req,res){
 const path=pathname(req), method=req.method;
 if(!['GET','POST','PUT','DELETE'].includes(method))return send(res,405,{error:'Metode tidak tersedia'});
 const origin=req.headers.origin, host=req.headers['x-forwarded-host']||req.headers.host;
 if(method!=='GET'&&origin&&new URL(origin).host!==host)return send(res,403,{error:'Origin tidak diizinkan'});
 if(path==='health'&&method==='GET'){
  if(!storeReady())return send(res,503,{ok:false,storage:false,storageAccess:'missing_token',admin:adminReady(),platform:'vercel',message:'Token Blob tidak terpasang di Vercel Production.'});
  try{
   // A non-mutating authenticated read: a missing document (null) is fine,
   // but 403 means the configured token/store/access mode is wrong.
   await get('config/school.json',{access:'private'});
   return send(res,200,{ok:true,storage:true,storageAccess:'reachable',admin:adminReady(),platform:'vercel'});
  }catch(error){
   const forbidden=/\\b403\\b|forbidden|access denied|not authorized|unauthorized/i.test(String(error?.message||''));
   return send(res,503,{ok:false,storage:false,storageAccess:forbidden?'forbidden':'unreachable',admin:adminReady(),platform:'vercel',
    message:forbidden?'Vercel Blob menolak akses (403). Periksa koneksi dan izin Private Blob store yang sudah ada.':'Vercel Blob belum dapat dibaca; periksa koneksi storage.'});
  }
 }
 if(!storeReady())return send(res,503,{error:'Penyimpanan belum diaktifkan. Hubungkan private Vercel Blob ke proyek ini.'});
 try{
  if(path==='question-media/upload'&&method==='POST'){
   if(req.body?.type!=='blob.generate-client-token'&&req.body?.type!=='blob.upload-completed')return send(res,400,{error:'Permintaan upload tidak valid.'});
   const result=await handleUpload({
    request:req,
    body:req.body,
    onBeforeGenerateToken:async(pathname,clientPayload)=>{
     const media=mediaUploadPath(pathname);
     if(!media)return Promise.reject(Error('Format dan alamat media tidak valid.'));
     let payload;
     try{payload=JSON.parse(clientPayload||'{}')}catch{throw Error('Data peran pengunggah tidak valid.')}
     if(payload.role==='superadmin'){
      if(!isAdmin(req)||media.owner!=='superadmin')throw Error('Akses upload Super Admin tidak diizinkan.');
     }else if(payload.role==='teacher'){
      const teacher=await resolveTeacher(req,{read});
      if(!teacher||teacher.id!==media.owner)throw Error('Akses upload Guru tidak diizinkan.');
     }else throw Error('Peran pengunggah tidak valid.');
     return {
      allowedContentTypes:[media.contentType],
      maximumSizeInBytes:media.maxBytes,
      addRandomSuffix:false,
      allowOverwrite:false,
      validUntil:Date.now()+15*60*1000,
      tokenPayload:JSON.stringify({owner:media.owner,kind:media.kind}),
     };
    },
   });
   return send(res,200,result);
  }
  if(path.startsWith('question-media/file/')&&method==='GET'){
   const media=mediaRoute(path);
   if(!media)return send(res,404,{error:'Media soal tidak ditemukan.'});
   // Serve short byte ranges so videos and MP3 can seek without exceeding Vercel response limits.
   const raw=String(req.headers.range||'');
   if(raw&&!/^bytes=\d+-\d*$/.test(raw))return send(res,416,{error:'Range media tidak valid.'});
   const match=raw.match(/^bytes=(\d+)-(\d*)$/);
   const start=match?Number(match[1]):0;
   if(!Number.isSafeInteger(start)||start<0)return send(res,416,{error:'Range media tidak valid.'});
   const endRequested=match&&match[2]?Number(match[2]):start+1048575;
   if(!Number.isSafeInteger(endRequested)||endRequested<start)return send(res,416,{error:'Range media tidak valid.'});
   const end=Math.min(endRequested,start+1048575);
   const blob=await get(media.pathname,{access:'private',headers:{Range:'bytes='+start+'-'+end}});
   if(!blob)return send(res,404,{error:'Media soal tidak ditemukan.'});
   const contentRange=blob.headers.get('content-range');
   if(!contentRange){console.error('Blob did not honor media byte-range request');return send(res,503,{error:'Media belum dapat diputar. Coba beberapa saat lagi.'});}
   res.status(206);
   res.setHeader('Content-Type',media.contentType);
   res.setHeader('Content-Range',contentRange);
   res.setHeader('Accept-Ranges','bytes');
   res.setHeader('X-Content-Type-Options','nosniff');
   res.setHeader('Cache-Control','public, max-age=86400');
   const length=blob.headers.get('content-length');
   if(length)res.setHeader('Content-Length',length);
   Readable.fromWeb(blob.stream).on('error',e=>{console.error('Streaming media failed',e.message);res.destroy(e)}).pipe(res);
   return;
  }
  if(path==='question-images/upload'&&method==='POST'){
   const requestedRole=String(req.body?.role||'');
   let owner;
   if(requestedRole==='superadmin'){
    if(!isAdmin(req))return send(res,401,{error:'Masuk sebagai Super Admin untuk mengunggah gambar.'});
    owner='superadmin';
   }else if(requestedRole==='teacher'){
    const teacher=await resolveTeacher(req,{read});
    if(!teacher)return send(res,401,{error:'Masuk sebagai Guru untuk mengunggah gambar.'});
    owner=teacher.id;
   }else return send(res,400,{error:'Jenis akses pengunggah tidak valid.'});
   let parsed;try{parsed=parseQuestionImage(req.body)}catch(e){return send(res,400,{error:e.message})}
   const location=createQuestionImageLocation(owner,parsed.contentType);
   await put(location.pathname,parsed.buffer,{access:'private',contentType:parsed.contentType,allowOverwrite:false,addRandomSuffix:false});
   return send(res,201,{uploaded:true,url:location.url,size:parsed.buffer.length,contentType:parsed.contentType});
  }
  if(path.startsWith('question-images/file/')&&method==='GET'){
   const location=imageStorageFromRoute(path);
   if(!location)return send(res,404,{error:'Gambar soal tidak ditemukan.'});
   const blob=await get(location.pathname,{access:'private'});
   if(!blob)return send(res,404,{error:'Gambar soal tidak ditemukan.'});
   const buffer=Buffer.from(await new Response(blob.stream).arrayBuffer());
   res.setHeader('Content-Type',location.contentType);
   res.setHeader('Cache-Control','public, max-age=31536000, immutable');
   res.setHeader('X-Content-Type-Options','nosniff');
   return res.status(200).end(buffer);
  }
  if(await handleTeacherRoutes({path,method,req,res,send,read,write,list,isAdmin}))return;
  if(path==='admin/session'&&method==='GET')return send(res,200,{user:isAdmin(req)?{name:'Super Admin',role:'super_admin'}:null});
  if(path==='admin/login'&&method==='POST'){
   if(!adminReady())return send(res,503,{error:'ADMIN_PASSWORD dan SESSION_SECRET belum disetel di Vercel.'});
   const ip=String(req.headers['x-forwarded-for']||'unknown').split(',')[0];const key='security/'+crypto.createHash('sha256').update(ip+process.env.SESSION_SECRET).digest('hex')+'.json';
   const attempt=await read(key)||{count:0,expires:0};
   if(attempt.expires>Date.now()&&attempt.count>=5)return send(res,429,{error:'Terlalu banyak percobaan. Coba lagi dalam 15 menit.'});
   const password=typeof req.body?.password==='string'?req.body.password:'';
   if(password.length>256||!safeEqual(password,process.env.ADMIN_PASSWORD)){
    await write(key,{count:attempt.expires>Date.now()?attempt.count+1:1,expires:Date.now()+900000});
    return send(res,401,{error:'Kata sandi administrator salah.'});
   }
   await write(key,{count:0,expires:0});
   const value=String(Date.now()+28800000)+'.'+crypto.randomBytes(16).toString('hex');
   res.setHeader('Set-Cookie','nma_admin='+value+'.'+sign(value)+'; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800');
   return send(res,200,{user:{name:'Super Admin',role:'super_admin'}});
  }
  if(path==='admin/logout'&&method==='POST'){res.setHeader('Set-Cookie','nma_admin=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0');return send(res,200,{ok:true})}
  if(path==='admin/monitor'&&method==='GET'){
   if(!isAdmin(req))return send(res,401,{error:'Login administrator diperlukan'});
   const paths=[];let cursor;
   do{
    const page=await list({prefix:'students/',limit:300,...cursor?{cursor}:{}});
    paths.push(...(page.blobs||[]).filter(b=>b.pathname.endsWith('.json')).map(b=>b.pathname));
    if(paths.length>10000)return send(res,409,{error:'Terlalu banyak data siswa untuk pemantauan saat ini.'});
    cursor=page.hasMore?page.cursor:null;
   }while(cursor);
   const profiles=[];for(let i=0;i<paths.length;i+=30){const data=await Promise.all(paths.slice(i,i+30).map(p=>read(p).catch(()=>null)));profiles.push(...data.filter(Boolean));}
   profiles.sort((a,b)=>Date.parse(b.updatedAt||0)-Date.parse(a.updatedAt||0));
   return send(res,200,{students:profiles,studentCount:profiles.length,updatedAt:new Date().toISOString()});
  }
  if(path==='admin/generate'&&method==='POST'){
   if(!isAdmin(req))return send(res,401,{error:'Login administrator diperlukan'});
   if(!process.env.OLLAMA_API_KEY)return send(res,503,{error:'Setel OLLAMA_API_KEY di Environment Variables Vercel'});
   const body=req.body||{},grade=String(body.grade||''),topic=String(body.topic||'').slice(0,100),region=String(body.region||'Nusantara').slice(0,80);
   if(!/^Kelas [1-6]$/.test(grade)||!topic)return send(res,400,{error:'Kelas atau topik tidak valid'});
   const prompt='Untuk anak SD '+grade+' (Kurikulum Merdeka) buat 5 soal matematika topik '+topic+'. Gunakan soal cerita ramah anak terkait budaya '+region+' Indonesia secara akurat dan hormat. Gunakan bilangan dan konsep matematika sesuai jenjang; pecahan dengan operasi benar dan jawaban tunggal. Setiap soal memiliki tepat 4 opsi string, answer SAMA PERSIS dengan salah satu opsi, dan explanation langkah perhitungan. Kembalikan HANYA array JSON [{question:string,options:string[],answer:string,explanation:string}]. Jangan mengarang fakta budaya yang tidak pasti.';
   const response=await fetch('https://ollama.com/api/chat',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+process.env.OLLAMA_API_KEY},body:JSON.stringify({model:process.env.OLLAMA_MODEL||'glm-5.3-flash:cloud',messages:[{role:'user',content:prompt}],stream:false}),signal:AbortSignal.timeout(55000)});
   if(!response.ok)return send(res,502,{error:'Ollama Cloud mengembalikan HTTP '+response.status});
   const raw=await response.json();const content=String(raw.message?.content||'').replace(/^\`\`\`(?:json)?\s*/,'').replace(/\s*\`\`\`$/,'');let questions;try{questions=JSON.parse(content)}catch{return send(res,502,{error:'Format jawaban Ollama bukan JSON valid'});}
   if(!Array.isArray(questions)||questions.length<1)return send(res,502,{error:'AI tidak menghasilkan soal'});
   const clean=questions.slice(0,8).filter(q=>q&&typeof q.question==='string'&&Array.isArray(q.options)&&q.options.length===4&&q.options.every(x=>typeof x==='string')&&typeof q.answer==='string'&&q.options.includes(q.answer)&&typeof q.explanation==='string').map(q=>({question:q.question.slice(0,500),options:q.options.map(x=>x.slice(0,120)),answer:q.answer,explanation:q.explanation.slice(0,600)}));
   return send(res,200,{questions:clean});
  }
  if(path==='public/mission-config'&&method==='GET'){
   const grade=String(req.query.grade||''),culture=String(req.query.culture||'');
   if(!/^Kelas [1-6]$/.test(grade)||!['sumatra','jawa','kalimantan','sulawesi','bali','maluku','papua'].includes(culture))return send(res,400,{error:'Kelas atau pulau tidak valid.'});
   const config=await read('settings/missions/'+grade.slice(-1)+'/'+culture+'.json');
   return send(res,200,{grade,culture,mode:config?.mode==='manual'?'manual':'mixed'});
  }
  if(path==='admin/mission-config'&&method==='PUT'){
   if(!isAdmin(req))return send(res,401,{error:'Login administrator diperlukan'});
   const grade=String(req.body?.grade||''),culture=String(req.body?.culture||''),mode=String(req.body?.mode||'');
   if(!/^Kelas [1-6]$/.test(grade)||!['sumatra','jawa','kalimantan','sulawesi','bali','maluku','papua'].includes(culture)||!['manual','mixed'].includes(mode))return send(res,400,{error:'Pengaturan misi tidak valid.'});
   await write('settings/missions/'+grade.slice(-1)+'/'+culture+'.json',{grade,culture,mode,updatedAt:new Date().toISOString()});
   return send(res,200,{saved:true,grade,culture,mode});
  }
  if((path==='admin/questions'||path.startsWith('admin/questions/'))){
   if(!isAdmin(req))return send(res,401,{error:'Login administrator diperlukan'});
   const all=()=>readQuestionBank({read,list});
   if(path==='admin/questions'&&method==='GET'){
    const questions=await all();
    return send(res,200,{questions,total:questions.length});
   }
   if(path==='admin/questions'&&method==='POST'){
    const questions=await all();
    if(questions.length>=500)return send(res,409,{error:'Batas 500 soal tercapai.'});
    let sanitized;try{sanitized=normalizeQuestion(req.body?.question)}catch(e){return send(res,400,{error:e.message})}
    const now=new Date().toISOString(),id='q-'+crypto.randomUUID();
    const question={...sanitized,id,createdAt:now,updatedAt:now};
    await write('questions/'+id+'.json',question);
    return send(res,201,{saved:true,question});
   }
   if(path==='admin/questions/bulk'&&method==='POST'){
    const input=req.body?.questions;
    if(!Array.isArray(input)||input.length<1||input.length>10)return send(res,400,{error:'Masukkan 1–10 soal sekaligus.'});
    const old=await all();
    if(old.length+input.length>500)return send(res,409,{error:'Kapasitas maksimal 500 soal.'});
    let records;try{records=input.map(normalizeQuestion)}catch(e){return send(res,400,{error:e.message})}
    const now=new Date().toISOString(),questions=[];
    for(const data of records){
     const id='q-'+crypto.randomUUID();
     const question={...data,id,createdAt:now,updatedAt:now};
     await write('questions/'+id+'.json',question);
     questions.push(question);
    }
    return send(res,201,{saved:true,questions,count:questions.length});
   }
   if(path.startsWith('admin/questions/')){
    const id=decodeURIComponent(path.slice('admin/questions/'.length));
    if(!questionIdOK(id))return send(res,400,{error:'ID soal tidak valid.'});
    const questions=await all(),existing=questions.find(q=>q.id===id);
    if(!existing)return send(res,404,{error:'Soal tidak ditemukan atau sudah dihapus.'});
    if(method==='PUT'){
     let sanitized;try{sanitized=normalizeQuestion(req.body?.question)}catch(e){return send(res,400,{error:e.message})}
     const question={...sanitized,id,createdAt:existing.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};
     await write('questions/'+id+'.json',question);
     return send(res,200,{saved:true,question});
    }
    if(method==='DELETE'){
     await write('questions/'+id+'.json',{id,deleted:true,updatedAt:new Date().toISOString()});
     return send(res,200,{deleted:true,id});
    }
   }
   return send(res,405,{error:'Metode CRUD tidak didukung.'});
  }
  if(path==='bank'&&method==='GET'){
   if(!isAdmin(req))return send(res,401,{error:'Login administrator diperlukan'});
   return send(res,200,{questions:await readQuestionBank({read,list})});
  }
  if(path==='bank'&&method==='PUT'){
   return send(res,410,{error:'Penyimpanan massal lama dihentikan. Gunakan API admin/questions agar soal lain tidak tertimpa.'});
  }
  if(path==='public/questions'&&method==='GET'){
   const grade=String(req.query.grade||''),token=String(req.query.token||'');
   if(!/^Kelas [1-6]$/.test(grade))return send(res,400,{error:'Kelas tidak didukung.'});
   let owned=[];
   if(token){
    if(!tokenInviteOK(token))return send(res,400,{error:'Kode tautan kelas tidak valid.'});
    const invite=await read('invites/'+token+'.json');
    if(!invite||invite.grade!==grade||!idTeacherOK(invite.teacherId))return send(res,404,{error:'Kelas dari tautan guru tidak ditemukan.'});
    const teacher=await read('teachers/'+invite.teacherId+'.json');
    if(!teacher||teacher.active===false)return send(res,404,{error:'Guru pengampu tidak tersedia.'});
    owned=await readTeacherQuestions(teacher.id,{read,list});
   }
   const shared=await readQuestionBank({read,list});
   const questions=selectPublicQuestions({globalQuestions:shared,teacherQuestions:owned,grade});
   return send(res,200,{questions});
  }
  if(path==='school'&&method==='GET')return send(res,200,{school:await read('config/school.json')||{name:'Nusantara Math Adventure',music:true}});
  if(path==='school'&&method==='PUT'){
   if(!isAdmin(req))return send(res,401,{error:'Login administrator diperlukan'});
   const value=req.body||{},name=String(value.name||'').trim().slice(0,100);
   if(!name)return send(res,400,{error:'Nama sekolah diperlukan'});
   const school={name,music:Boolean(value.music),logoUrl:typeof value.logoUrl==='string'?value.logoUrl.slice(0,500):''};await write('config/school.json',school);
   return send(res,200,{saved:true,school});
  }
  if(path.startsWith('progress/')){
   const id=path.slice(9);if(!idOK(id))return send(res,400,{error:'ID perjalanan tidak valid'});
   if(method==='GET')return send(res,200,{progress:await read('students/'+id+'.json')});
   if(method==='PUT'){
    const p=req.body;if(!studentOK(p,id))return send(res,400,{error:'Data siswa tidak valid'});
    const old=await read('students/'+id+'.json');
    if(old&&(old.id!==id||old.grade!==p.grade||old.name!==p.name))return send(res,409,{error:'Identitas perjalanan tidak cocok'});
    if(!old&&(p.gamesPlayed!==0||p.xp!==0||p.completed.length!==0||p.recent.length!==0))return send(res,409,{error:'Profil baru wajib dimulai dengan progres kosong'});
    if(old&&(p.gamesPlayed!==old.gamesPlayed+1||p.xp<old.xp||p.xp-old.xp>300||p.completed.length<old.completed.length||p.completed.length>old.completed.length+1))return send(res,409,{error:'Lompatan progres tidak valid'});
    if(old&&(p.recent.length===0||!Number.isInteger(p.recent.at(-1)?.total)||p.recent.at(-1)?.total<1||p.recent.at(-1)?.total>8||p.recent.at(-1)?.score<0||p.recent.at(-1)?.score>8))return send(res,409,{error:'Hasil latihan tidak valid'});
    const progress={id,name:p.name.trim(),grade:p.grade,completed:[...new Set(p.completed)],xp:p.xp,gamesPlayed:p.gamesPlayed,recent:p.recent.slice(-25),teacherId:old?.teacherId||null,inviteToken:old?.inviteToken||null,updatedAt:new Date().toISOString()};
    await write('students/'+id+'.json',progress);
    return send(res,200,{saved:true,progress});
   }
  }
  return send(res,404,{error:'Endpoint tidak ditemukan'});
 }catch(err){
  console.error('NMA API ERROR',err?.message||err);
  const forbidden=/\\b403\\b|forbidden|access denied|not authorized|unauthorized/i.test(String(err?.message||''));
  if(forbidden)return send(res,503,{code:'BLOB_ACCESS_DENIED',error:'Penyimpanan Nusantara Math Adventure belum dapat diakses (Vercel Blob 403). Hubungi Super Admin untuk memeriksa koneksi Private Blob store.'});
  return send(res,503,{error:'Layanan penyimpanan atau API gagal. Periksa log Vercel.'});
 }
}
