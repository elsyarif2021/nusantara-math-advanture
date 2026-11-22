import test from 'node:test';
import assert from 'node:assert/strict';
import {hashPassword,verifyPassword,makeTeacherSession,verifyTeacherSession,isStudentOwnedByTeacher,allowJoin,validateInviteConfig} from '../api/teacherAuth.js';
import {handleTeacherRoutes} from '../api/teacherRoutes.js';

const secret='this-is-a-random-test-secret-more-than-32-characters';
process.env.SESSION_SECRET=secret;
function fixture(){
 const data=new Map();
 const read=async key=>data.get(key)||null;
 const write=async(key,value)=>{data.set(key,JSON.parse(JSON.stringify(value)))};
 const list=async({prefix})=>({blobs:[...data.keys()].filter(k=>k.startsWith(prefix)).map(pathname=>({pathname})),hasMore:false});
 const send=(res,status,body)=>{res.status=status;res.body=body;};
 async function call(path,method='GET',body={},cookie='',superAdmin=false,query={}){
  const req={body,query,headers:{cookie,'x-forwarded-for':'192.0.2.9'},superAdmin},res={headers:{},setHeader(key,value){this.headers[key]=value}};
  const handled=await handleTeacherRoutes({path,method,req,res,send,read,write,list,isAdmin:rq=>rq.superAdmin});
  return {...res,handled};
 }
 return {call,data};
}
test('Teacher passwords are salted and signed sessions cannot be forged',()=>{
 const a=hashPassword('MySecret8'),b=hashPassword('MySecret8');
 assert.notEqual(a.passwordHash,b.passwordHash);assert.notEqual(a.salt,b.salt);
 assert.equal(verifyPassword('MySecret8',a),true);assert.equal(verifyPassword('WrongPass8',a),false);
 const u={id:'t-123e4567-e89b-12d3-a456-426614174000',sessionVersion:1};
 const signed=makeTeacherSession(u,secret,1_700_000_000_000);
 assert.deepEqual(verifyTeacherSession(signed,secret,1_700_000_100_000)?.teacherId,u.id);
 assert.equal(verifyTeacherSession(signed+'a',secret,1_700_000_100_000),null);
 assert.equal(verifyTeacherSession(signed,secret,1_700_000_000_000+8*3600*1000+10),null);
});
test('Grade invites and ownership checks enforce assigned teacher',()=>{
 assert.equal(validateInviteConfig({grade:'Kelas 2',label:'Kelas Dua A'}).grade,'Kelas 2');
 assert.throws(()=>validateInviteConfig({grade:'Kelas 9',label:'Sembilan A'}));
 assert.equal(allowJoin({teacherId:'A',grade:'Kelas 1',active:true},{id:'B',active:true}),false);
 assert.equal(allowJoin({teacherId:'A',grade:'Kelas 1',active:true},{id:'A',active:false}),false);
 assert.equal(isStudentOwnedByTeacher({teacherId:'A'},'A'),true);
 assert.equal(isStudentOwnedByTeacher({teacherId:'B'},'A'),false);
 assert.equal(isStudentOwnedByTeacher({teacherId:null},'A'),false);
});
test('Tenant isolation: two teachers only monitor their own link-enrolled students',async()=>{
 const {call,data}=fixture();
 const mk=async(name,username)=>call('admin/teachers','POST',{name,username,password:'SchoolPass8'},'',true);
 const a=await mk('Bu Ani','guru_ani'),b=await mk('Pak Budi','guru_budi');
 assert.equal(a.status,201);assert.equal(b.status,201);
 assert.equal(a.body.teacher.passwordHash,undefined);
 const loginA=await call('teacher/login','POST',{username:'guru_ani',password:'SchoolPass8'});
 const loginB=await call('teacher/login','POST',{username:'guru_budi',password:'SchoolPass8'});
 assert.equal(loginA.status,200);assert.equal(loginB.status,200);
 const ca=loginA.headers['Set-Cookie'].split(';')[0],cb=loginB.headers['Set-Cookie'].split(';')[0];
 const linkA=await call('teacher/links','POST',{label:'Kelas 3A',grade:'Kelas 3'},ca);
 const linkB=await call('teacher/links','POST',{label:'Kelas 4B',grade:'Kelas 4'},cb);
 assert.equal(linkA.status,201);assert.equal(linkB.status,201);
 const tokenA=linkA.body.link.token,tokenB=linkB.body.link.token;
 assert.equal((await call('invite/'+tokenA)).body.invite.teacherName,'Bu Ani');
 const enrolledA=await call('enroll','POST',{name:'Siswa A',token:tokenA});
 const enrolledB=await call('enroll','POST',{name:'Siswa B',token:tokenB});
 assert.equal(enrolledA.status,201);assert.equal(enrolledB.status,201);
 assert.equal(enrolledA.body.progress.grade,'Kelas 3');
 assert.equal(enrolledA.body.progress.teacherId,a.body.teacher.id);
 const monA=await call('teacher/monitor','GET',{},ca);
 const monB=await call('teacher/monitor','GET',{},cb);
 assert.deepEqual(monA.body.students.map(x=>x.name),['Siswa A']);
 assert.deepEqual(monB.body.students.map(x=>x.name),['Siswa B']);
 assert.equal((await call('teacher/monitor','GET',{},ca,false,{token:tokenB})).status,403);
 assert.equal((await call('teacher/links/'+tokenB,'PUT',{active:false},ca)).status,403);
 assert.equal((await call('admin/teachers','GET',{},ca)).status,401);
 assert.equal((await call('teacher/monitor','GET')).status,401);
 const closed=await call('teacher/links/'+tokenA,'PUT',{active:false},ca);
 assert.equal(closed.status,200);
 assert.equal((await call('enroll','POST',{name:'Siswa Baru',token:tokenA})).status,404);
 assert.equal((await call('teacher/monitor','GET',{},ca)).body.students.length,1);
 const disabled=await call('admin/teachers/'+a.body.teacher.id,'PUT',{active:false},'',true);
 assert.equal(disabled.status,200);
 assert.equal((await call('teacher/monitor','GET',{},ca)).status,401);
 assert.equal((await call('invite/'+tokenA)).status,404);
 assert.equal((await call('admin/teachers','GET',{},'',true)).body.teachers.length,2);
 assert.ok([...data.keys()].filter(x=>x.startsWith('teachers/')).every(x=>Boolean(data.get(x).passwordHash)));
});
