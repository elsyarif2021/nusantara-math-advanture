import test from 'node:test';
import assert from 'node:assert/strict';
import {handleTeacherRoutes} from '../api/teacherRoutes.js';
import {readTeacherQuestions,selectPublicQuestions} from '../api/teacherQuestions.js';
import {sdTopics} from '../api/questionBank.js';
const secret='teacher-test-secret-value-00000000000000001';
process.env.SESSION_SECRET=secret;
function fixture(){
 const values=new Map();
 const read=async path=>values.get(path)||null;
 const write=async (path,value)=>{values.set(path,structuredClone(value))};
 const list=async ({prefix})=>({blobs:[...values.keys()].filter(k=>k.startsWith(prefix)).map(pathname=>({pathname})),hasMore:false});
 const send=(res,status,body)=>{res.status=status;res.body=body};
 async function req(path,method='GET',body={},cookie='',asSuper=false,query={}){
  const request={body,query,headers:{cookie,'x-forwarded-for':'198.51.100.3'},asSuper};
  const response={headers:{},setHeader(k,v){this.headers[k]=v}};
  const handled=await handleTeacherRoutes({path,method,req:request,res:response,send,read,write,list,isAdmin:r=>r.asSuper});
  return {...response,handled};
 }
 return {req,read,list,values};
}
const payload=(grade,cultureId='sumatra')=>({
 grade,topic:sdTopics[grade][0],cultureId,
 question:'Di rumah adat terdapat 8 piring dan 4 piring lagi. Berapa jumlahnya?',
 options:['10','11','12','13'],answer:'12',explanation:'Delapan tambah empat sama dengan dua belas.',active:true
});
test('teacher CRUD is scoped to their identity and to their own class links',async()=>{
 const {req,read,list,values}=fixture();
 const a=await req('admin/teachers','POST',{name:'Ibu Ratna',username:'ratna',password:'Password123'},'',true);
 const b=await req('admin/teachers','POST',{name:'Pak Wahyu',username:'wahyu',password:'Password123'},'',true);
 assert.equal(a.status,201);assert.equal(b.status,201);
 const loginA=await req('teacher/login','POST',{username:'ratna',password:'Password123'});
 const loginB=await req('teacher/login','POST',{username:'wahyu',password:'Password123'});
 assert.equal(loginA.status,200);assert.equal(loginB.status,200);
 const ca=loginA.headers['Set-Cookie'].split(';')[0],cb=loginB.headers['Set-Cookie'].split(';')[0];
 assert.equal((await req('teacher/questions','GET')).status,401);
 assert.equal((await req('teacher/questions','POST',{question:payload('Kelas 1')},ca)).status,400,'Teacher must create class link before adding questions');
 const linkA=await req('teacher/links','POST',{label:'Satu A',grade:'Kelas 1'},ca);
 const linkB=await req('teacher/links','POST',{label:'Satu B',grade:'Kelas 1'},cb);
 assert.equal(linkA.status,201);assert.equal(linkB.status,201);
 assert.equal((await req('teacher/questions','POST',{question:payload('Kelas 2')},ca)).status,400,'Teacher cannot add questions to a grade without link');
 const postA=await req('teacher/questions','POST',{question:payload('Kelas 1')},ca);
 const postB=await req('teacher/questions','POST',{question:payload('Kelas 1','jawa')},cb);
 assert.equal(postA.status,201);assert.equal(postB.status,201);
 assert.notEqual(postA.body.question.id,postB.body.question.id);
 assert.equal(postA.body.question.teacherId,a.body.teacher.id);
 assert.equal(postB.body.question.teacherId,b.body.teacher.id);
 const qA=postA.body.question.id,qB=postB.body.question.id;
 const ownA=await req('teacher/questions','GET',{},ca);
 const ownB=await req('teacher/questions','GET',{},cb);
 assert.deepEqual(ownA.body.questions.map(q=>q.id),[qA]);assert.deepEqual(ownB.body.questions.map(q=>q.id),[qB]);
 assert.equal((await req('teacher/questions/'+qB,'PUT',{question:payload('Kelas 1')},ca)).status,404);
 assert.equal((await req('teacher/questions/'+qA,'DELETE',{},cb)).status,404);
 assert.equal((await req('teacher/questions/'+qA,'PUT',{question:payload('Kelas 2')},ca)).status,400);
 assert.equal((await req('admin/teachers','GET',{},ca)).status,401);
 const updated=await req('teacher/questions/'+qA,'PUT',{question:{...payload('Kelas 1'),question:'Di Pulau Sumatra ada 5 rumah dan 3 rumah lagi. Ada berapa rumah?',options:['6','7','8','9'],answer:'8'}},ca);
 assert.equal(updated.status,200);assert.equal(updated.body.question.answer,'8');
 assert.equal((await req('teacher/questions','GET',{},cb)).body.questions[0].question,postB.body.question.question,'Other teacher question must remain untouched');
 const deleted=await req('teacher/questions/'+qA,'DELETE',{},ca);
 assert.equal(deleted.status,200);
 assert.equal((await req('teacher/questions','GET',{},ca)).body.questions.length,0);
 assert.equal((await req('teacher/questions','GET',{},cb)).body.questions.length,1);
 assert.ok([...values.keys()].some(k=>k==='teacher-questions/'+a.body.teacher.id+'/'+qA+'.json'));
 const own=await readTeacherQuestions(b.body.teacher.id,{read,list});
 const mixedA=selectPublicQuestions({globalQuestions:[],teacherQuestions:await readTeacherQuestions(a.body.teacher.id,{read,list}),grade:'Kelas 1'});
 const mixedB=selectPublicQuestions({globalQuestions:[],teacherQuestions:own,grade:'Kelas 1'});
 assert.equal(mixedA.length,0);assert.equal(mixedB.length,1);
 assert.equal(mixedB[0].cultureId,'jawa');
});
test('Super Admin retains full control over teacher-owned questions, teacher cannot use admin endpoints',async()=>{
 const {req}=fixture();
 const created=await req('admin/teachers','POST',{name:'Ibu Citra',username:'citra',password:'Password123'},'',true);
 const teacherId=created.body.teacher.id;
 const login=await req('teacher/login','POST',{username:'citra',password:'Password123'});
 const cookie=login.headers['Set-Cookie'].split(';')[0];
 await req('teacher/links','POST',{label:'Kelas Dua',grade:'Kelas 2'},cookie);
 assert.equal((await req('admin/teacher-questions','GET',{},cookie,false,{teacherId})).status,401);
 const posted=await req('admin/teacher-questions','POST',{teacherId,question:payload('Kelas 2')},'',true);
 assert.equal(posted.status,201);
 const questionId=posted.body.question.id;
 assert.equal((await req('teacher/questions','GET',{},cookie)).body.questions.length,1);
 const list=await req('admin/teacher-questions','GET',{},'',true,{teacherId});
 assert.equal(list.status,200);assert.equal(list.body.questions.length,1);
 assert.equal((await req('admin/teacher-questions/'+teacherId+'/'+questionId,'DELETE',{},cookie)).status,401);
 const changed=await req('admin/teacher-questions/'+teacherId+'/'+questionId,'PUT',{question:{...payload('Kelas 2'),active:false}},'',true);
 assert.equal(changed.status,200);assert.equal(changed.body.question.active,false);
 assert.equal((await req('teacher/questions','GET',{},cookie)).body.questions[0].active,false);
 assert.equal((await req('admin/teacher-questions/'+teacherId+'/'+questionId,'DELETE',{},'',true)).status,200);
 assert.equal((await req('teacher/questions','GET',{},cookie)).body.questions.length,0);
});
test('published selection favors own teacher content, hides inactive and other grades',()=>{
 const global=[{...payload('Kelas 1'),id:'global'}, {...payload('Kelas 2'),id:'global2'}];
 const own=[{...payload('Kelas 1'),id:'myone'}, {...payload('Kelas 1'),active:false,id:'hidden'}];
 const selected=selectPublicQuestions({globalQuestions:global,teacherQuestions:own,grade:'Kelas 1'});
 assert.deepEqual(selected.map(q=>q.id),['myone','global']);
});
