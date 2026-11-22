import {idTeacherOK} from './teacherAuth.js';
import {questionIdOK,normalizeQuestion} from './questionBank.js';

export const teacherQuestionPath=(teacherId,questionId)=>'teacher-questions/'+teacherId+'/'+questionId+'.json';

export async function readTeacherQuestions(teacherId,{read,list}){
 if(!idTeacherOK(teacherId))throw Error('Identitas guru tidak valid.');
 const results=[];let cursor;let scanned=0;
 do{
  const page=await list({prefix:'teacher-questions/'+teacherId+'/',limit:300,...(cursor?{cursor}:{})});
  const paths=(page.blobs||[]).map(b=>b.pathname).filter(p=>p.endsWith('.json')&&p.startsWith('teacher-questions/'+teacherId+'/'));
  scanned+=paths.length;
  if(scanned>750)throw Error('Jumlah soal guru melewati batas penyimpanan.');
  for(let i=0;i<paths.length;i+=25){
   const values=await Promise.all(paths.slice(i,i+25).map(p=>read(p).catch(()=>null)));
   results.push(...values.filter(q=>q&&q.teacherId===teacherId&&!q.deleted&&questionIdOK(q.id)));
  }
  cursor=page.hasMore?page.cursor:null;
 }while(cursor);
 return results.sort((a,b)=>String(b.updatedAt||b.createdAt||'').localeCompare(String(a.updatedAt||a.createdAt||'')));
}

export function prepareTeacherQuestion(input,teacherId,allowedGrades){
 if(!idTeacherOK(teacherId))throw Error('Guru tidak valid.');
 const question=normalizeQuestion(input);
 if(!allowedGrades.has(question.grade))throw Error('Guru hanya dapat mengelola soal pada kelas dari tautan miliknya.');
 return {...question,teacherId};
}

export function selectPublicQuestions({globalQuestions=[],teacherQuestions=[],grade}){
 const own=teacherQuestions.filter(q=>q.grade===grade&&q.active!==false&&!q.deleted);
 const shared=globalQuestions.filter(q=>q.grade===grade&&q.active!==false);
 return [...own,...shared].slice(0,150);
}
