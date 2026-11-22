import crypto from 'node:crypto';
import {idTeacherOK,tokenInviteOK,gradeOK,usernameOK,validateTeacher,hashPassword,verifyPassword,makeTeacherSession,verifyTeacherSession,isStudentOwnedByTeacher,validateInviteConfig,allowJoin} from './teacherAuth.js';
import {questionIdOK} from './questionBank.js';
import {readTeacherQuestions,teacherQuestionPath,prepareTeacherQuestion} from './teacherQuestions.js';

const MAX_TEACHERS=150,MAX_LINKS=1500,MAX_STUDENTS=10000;
const cookieOf=req=>Object.fromEntries(String(req.headers.cookie||'').split(';').map(x=>x.trim().split('=')).filter(x=>x.length>=2));
const safeTeacher=t=>({id:t.id,name:t.name,username:t.username,active:t.active!==false,createdAt:t.createdAt,updatedAt:t.updatedAt});
const sessionCookie=value=>'nma_teacher='+value+'; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800';
const clearCookie='nma_teacher=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0';
async function gather(list,prefix,max=1000){
 const entries=[];let cursor;
 do{
  const page=await list({prefix,limit:300,...cursor?{cursor}:{}});
  entries.push(...(page.blobs||[]).filter(b=>b.pathname.endsWith('.json')).map(b=>b.pathname));
  if(entries.length>max)throw Error('Batas kapasitas data tercapai.');
  cursor=page.hasMore?page.cursor:null;
 }while(cursor);
 return entries;
}
async function readMany(read,paths){
 const all=[];
 for(let i=0;i<paths.length;i+=30){
  const chunk=await Promise.all(paths.slice(i,i+30).map(p=>read(p).catch(()=>null)));
  all.push(...chunk.filter(Boolean));
 }
 return all;
}
async function teachers({read,list}){
 return readMany(read,await gather(list,'teachers/',MAX_TEACHERS));
}
async function links({read,list}){
 return readMany(read,await gather(list,'invites/',MAX_LINKS));
}
async function students({read,list}){
 return readMany(read,await gather(list,'students/',MAX_STUDENTS));
}
async function resolveTeacher(req,{read}){
 const secret=process.env.SESSION_SECRET;
 const session=verifyTeacherSession(cookieOf(req).nma_teacher,secret);
 if(!session)return null;
 const user=await read('teachers/'+session.teacherId+'.json');
 if(!user||user.active===false||user.sessionVersion!==session.sessionVersion)return null;
 return user;
}
const uniqueName=x=>String(x||'').trim().toLowerCase();
async function inviteData(token,{read}){
 if(!tokenInviteOK(token))return null;
 const invite=await read('invites/'+token+'.json');
 const teacher=invite?.teacherId&&idTeacherOK(invite.teacherId)?await read('teachers/'+invite.teacherId+'.json'):null;
 return allowJoin(invite,teacher)?{invite,teacher}:null;
}
export async function handleTeacherRoutes({path,method,req,res,send,read,write,list,isAdmin}){
 const scope={read,write,list};
 if(path==='teacher/session'&&method==='GET'){
  const current=await resolveTeacher(req,scope);
  send(res,200,{user:current?{...safeTeacher(current),role:'teacher'}:null});
  return true;
 }
 if(path==='teacher/login'&&method==='POST'){
  if(!process.env.SESSION_SECRET||process.env.SESSION_SECRET.length<32){send(res,503,{error:'SESSION_SECRET belum dikonfigurasi di Vercel.'});return true}
  const username=uniqueName(req.body?.username),password=req.body?.password;
  if(!usernameOK(username)||typeof password!=='string'||password.length>128){send(res,401,{error:'Username atau kata sandi guru salah.'});return true}
  const ip=String(req.headers['x-forwarded-for']||req.headers['x-real-ip']||'unknown').split(',')[0];
  const limitKey='security/teacher-'+crypto.createHash('sha256').update(ip+'|'+username+'|'+process.env.SESSION_SECRET).digest('hex')+'.json';
  const old=await read(limitKey)||{count:0,expires:0};
  if(old.expires>Date.now()&&old.count>=5){send(res,429,{error:'Terlalu banyak percobaan login. Coba kembali setelah 15 menit.'});return true}
  const all=await teachers(scope),user=all.find(t=>t.username===username&&t.active!==false);
  if(!user||!verifyPassword(password,user)){
   await write(limitKey,{count:old.expires>Date.now()?old.count+1:1,expires:Date.now()+900000});
   send(res,401,{error:'Username atau kata sandi guru salah.'});return true;
  }
  await write(limitKey,{count:0,expires:0});
  res.setHeader('Set-Cookie',sessionCookie(makeTeacherSession(user,process.env.SESSION_SECRET)));
  send(res,200,{user:{...safeTeacher(user),role:'teacher'}});return true;
 }
 if(path==='teacher/logout'&&method==='POST'){
  res.setHeader('Set-Cookie',clearCookie);send(res,200,{ok:true});return true;
 }
 if(path==='teacher/password'&&method==='POST'){
  const t=await resolveTeacher(req,scope);
  if(!t){send(res,401,{error:'Sesi guru tidak valid. Masuk kembali.'});return true}
  const {currentPassword,newPassword}=req.body||{};
  if(!verifyPassword(currentPassword,t)){send(res,403,{error:'Kata sandi lama tidak cocok.'});return true}
  if(typeof newPassword!=='string'||newPassword.length<8||newPassword.length>128){send(res,400,{error:'Kata sandi baru harus 8–128 karakter.'});return true}
  const updated={...t,...hashPassword(newPassword),sessionVersion:(t.sessionVersion||1)+1,updatedAt:new Date().toISOString()};
  await write('teachers/'+t.id+'.json',updated);
  res.setHeader('Set-Cookie',sessionCookie(makeTeacherSession(updated,process.env.SESSION_SECRET)));
  send(res,200,{saved:true,user:{...safeTeacher(updated),role:'teacher'}});return true;
 }
 if(path==='admin/teachers'&&method==='GET'){
  if(!isAdmin(req)){send(res,401,{error:'Hanya Super Admin yang dapat mengelola akun guru.'});return true}
  const [all,allLinks]=await Promise.all([teachers(scope),links(scope)]);
  send(res,200,{teachers:all.map(t=>({...safeTeacher(t),linkCount:allLinks.filter(l=>l.teacherId===t.id&&l.active!==false).length})),links:allLinks.map(l=>({...l,url:'/gabung/'+l.token}))});return true;
 }
 if(path==='admin/teachers'&&method==='POST'){
  if(!isAdmin(req)){send(res,401,{error:'Hanya Super Admin dapat membuat akun guru.'});return true}
  let input;try{input=validateTeacher(req.body||{})}catch(e){send(res,400,{error:e.message});return true}
  const all=await teachers(scope);
  if(all.length>=MAX_TEACHERS){send(res,409,{error:'Jumlah akun guru sudah mencapai batas.'});return true}
  if(all.some(t=>t.username===input.username)){send(res,409,{error:'Username sudah digunakan. Pilih username berbeda.'});return true}
  const timestamp=new Date().toISOString(),id='t-'+crypto.randomUUID();
  const teacher={id,name:input.name,username:input.username,...hashPassword(input.password),active:true,sessionVersion:1,createdAt:timestamp,updatedAt:timestamp};
  await write('teachers/'+id+'.json',teacher);
  send(res,201,{created:true,teacher:safeTeacher(teacher)});return true;
 }
 if(path.startsWith('admin/teachers/')&&method==='PUT'){
  if(!isAdmin(req)){send(res,401,{error:'Hanya Super Admin dapat mengubah akun guru.'});return true}
  const id=path.slice('admin/teachers/'.length);
  if(!idTeacherOK(id)){send(res,400,{error:'ID guru tidak valid.'});return true}
  const old=await read('teachers/'+id+'.json');
  if(!old){send(res,404,{error:'Guru tidak ditemukan.'});return true}
  const patch=req.body||{},updated={...old,updatedAt:new Date().toISOString()};
  if(typeof patch.active==='boolean'){updated.active=patch.active;updated.sessionVersion=(updated.sessionVersion||1)+1}
  if(patch.newPassword!==undefined){
   if(typeof patch.newPassword!=='string'||patch.newPassword.length<8||patch.newPassword.length>128){send(res,400,{error:'Kata sandi baru harus 8–128 karakter.'});return true}
   Object.assign(updated,hashPassword(patch.newPassword));updated.sessionVersion=(updated.sessionVersion||1)+1;
  }
  if(patch.name!==undefined){const n=String(patch.name).trim();if(n.length<2||n.length>80){send(res,400,{error:'Nama guru harus 2–80 karakter.'});return true}updated.name=n}
  await write('teachers/'+id+'.json',updated);
  send(res,200,{saved:true,teacher:safeTeacher(updated)});return true;
 }
 if(path==='teacher/links'&&method==='GET'){
  const teacher=await resolveTeacher(req,scope);
  if(!teacher){send(res,401,{error:'Masuk sebagai Guru terlebih dahulu.'});return true}
  const all=await links(scope);
  send(res,200,{links:all.filter(l=>l.teacherId===teacher.id).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))),teacher:safeTeacher(teacher)});return true;
 }
 if(path==='teacher/links'&&method==='POST'){
  const teacher=await resolveTeacher(req,scope);
  if(!teacher){send(res,401,{error:'Masuk sebagai Guru terlebih dahulu.'});return true}
  let data;try{data=validateInviteConfig(req.body||{})}catch(e){send(res,400,{error:e.message});return true}
  const all=await links(scope);
  if(all.filter(l=>l.teacherId===teacher.id&&l.active!==false).length>=30){send(res,409,{error:'Maksimal 30 tautan kelas aktif per guru.'});return true}
  const token=crypto.randomBytes(24).toString('hex');
  const invite={token,...data,teacherId:teacher.id,active:true,createdAt:new Date().toISOString()};
  await write('invites/'+token+'.json',invite);
  send(res,201,{created:true,link:invite});return true;
 }
 if(path.startsWith('teacher/links/')&&method==='PUT'){
  const teacher=await resolveTeacher(req,scope);
  if(!teacher){send(res,401,{error:'Masuk sebagai Guru terlebih dahulu.'});return true}
  const token=path.slice('teacher/links/'.length);
  if(!tokenInviteOK(token)||typeof req.body?.active!=='boolean'){send(res,400,{error:'Perubahan tautan kelas tidak valid.'});return true}
  const old=await read('invites/'+token+'.json');
  if(!old){send(res,404,{error:'Tautan kelas tidak ditemukan.'});return true}
  if(old.teacherId!==teacher.id){send(res,403,{error:'Guru hanya boleh mengubah tautan miliknya.'});return true}
  const updated={...old,active:req.body.active,updatedAt:new Date().toISOString()};
  await write('invites/'+token+'.json',updated);
  send(res,200,{saved:true,link:updated});return true;
 }
 if(path==='teacher/questions'||path.startsWith('teacher/questions/')){
  const teacher=await resolveTeacher(req,scope);
  if(!teacher){send(res,401,{error:'Masuk sebagai Guru untuk mengelola soal.'});return true}
  const ownedLinks=(await links(scope)).filter(l=>l.teacherId===teacher.id);
  const allowedGrades=new Set(ownedLinks.map(l=>l.grade).filter(gradeOK));
  if(path==='teacher/questions'&&method==='GET'){
   const all=await readTeacherQuestions(teacher.id,scope);
   send(res,200,{questions:all,total:all.length,allowedGrades:[...allowedGrades]});return true;
  }
  if(path==='teacher/questions'&&method==='POST'){
   let data;try{data=prepareTeacherQuestion(req.body?.question,teacher.id,allowedGrades)}catch(e){send(res,400,{error:e.message});return true}
   const all=await readTeacherQuestions(teacher.id,scope);
   if(all.length>=500){send(res,409,{error:'Bank soal guru maksimal 500 soal. Hapus soal lama yang tidak digunakan.'});return true}
   const id='q-'+crypto.randomUUID(),now=new Date().toISOString(),question={...data,id,createdAt:now,updatedAt:now};
   await write(teacherQuestionPath(teacher.id,id),question);
   send(res,201,{saved:true,question});return true;
  }
  if(path.startsWith('teacher/questions/')){
   const id=path.slice('teacher/questions/'.length);
   if(!questionIdOK(id)||!id.startsWith('q-')){send(res,400,{error:'ID soal tidak valid.'});return true}
   const key=teacherQuestionPath(teacher.id,id);
   const existing=await read(key);
   if(!existing||existing.deleted||existing.teacherId!==teacher.id){send(res,404,{error:'Soal bukan milik guru ini atau sudah dihapus.'});return true}
   if(method==='PUT'){
    let data;try{data=prepareTeacherQuestion(req.body?.question,teacher.id,allowedGrades)}catch(e){send(res,400,{error:e.message});return true}
    const question={...data,id,createdAt:existing.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};
    await write(key,question);
    send(res,200,{saved:true,question});return true;
   }
   if(method==='DELETE'){
    await write(key,{id,teacherId:teacher.id,deleted:true,updatedAt:new Date().toISOString()});
    send(res,200,{deleted:true,id});return true;
   }
  }
  send(res,405,{error:'Metode Bank Soal Guru tidak tersedia.'});return true;
 }
 if(path==='teacher/monitor'&&method==='GET'){
  const teacher=await resolveTeacher(req,scope);
  if(!teacher){send(res,401,{error:'Masuk sebagai Guru terlebih dahulu.'});return true}
  const requestedToken=String(req.query.token||'');
  if(requestedToken){
   if(!tokenInviteOK(requestedToken)){send(res,400,{error:'Filter kelas tidak valid.'});return true}
   const invite=await read('invites/'+requestedToken+'.json');
   if(!invite||invite.teacherId!==teacher.id){send(res,403,{error:'Tautan kelas bukan milik guru ini.'});return true}
  }
  const profiles=(await students(scope)).filter(s=>isStudentOwnedByTeacher(s,teacher.id)&&(!requestedToken||s.inviteToken===requestedToken));
  profiles.sort((a,b)=>Date.parse(b.updatedAt||0)-Date.parse(a.updatedAt||0));
  send(res,200,{students:profiles,studentCount:profiles.length,teacher:{id:teacher.id,name:teacher.name},updatedAt:new Date().toISOString()});return true;
 }
 if(path.startsWith('invite/')&&method==='GET'){
  const token=path.slice(7),valid=await inviteData(token,scope);
  if(!valid){send(res,404,{error:'Tautan kelas tidak ditemukan, sudah ditutup, atau guru tidak aktif.'});return true}
  const {invite,teacher}=valid;
  send(res,200,{invite:{token,grade:invite.grade,label:invite.label,teacherName:teacher.name}});return true;
 }
 if(path==='enroll'&&method==='POST'){
  const token=String(req.body?.token||''),name=String(req.body?.name||'').trim();
  if(name.length<2||name.length>80){send(res,400,{error:'Nama siswa harus 2–80 karakter.'});return true}
  const valid=await inviteData(token,scope);
  if(!valid){send(res,404,{error:'Tautan kelas sudah tidak tersedia. Hubungi guru.'});return true}
  const {invite}=valid;const id=crypto.randomBytes(16).toString('hex');
  const profile={id,name,grade:invite.grade,xp:0,gamesPlayed:0,completed:[],recent:[],teacherId:invite.teacherId,inviteToken:token,updatedAt:new Date().toISOString()};
  await write('students/'+id+'.json',profile);
  send(res,201,{enrolled:true,progress:profile});return true;
 }
 return false;
}
