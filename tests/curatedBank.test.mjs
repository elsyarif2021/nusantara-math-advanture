import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {inflateSync} from 'node:zlib';

const grades=Array.from({length:6},(_,i)=>'Kelas '+(i+1));
const islands=['sumatra','jawa','kalimantan','sulawesi','bali','maluku','papua'];
const all=[];
for(let n=1;n<=6;n++){
 const code=readFileSync(new URL('../src/bank/kelas'+n+'.ts',import.meta.url),'utf8');
 const match=code.match(/export default '([A-Za-z0-9+/=]+)'/);
 assert.ok(match,'packaged grade '+n+' must export valid base64');
 const questions=JSON.parse(inflateSync(Buffer.from(match[1],'base64')).toString('utf8'));
 assert.equal(questions.length,49,'grade '+n+' must contain 49 authored DOCX questions');
 for(const island of islands){
  const items=questions.filter(q=>q.cultureId===island);
  assert.equal(items.length,7,'grade '+n+' '+island+' must have seven questions');
  for(let i=0;i<items.length;i++){
   const q=items[i];
   assert.equal(q.id,'bank-2026-g'+n+'-p'+(islands.indexOf(island)+1)+'-q'+(i+1));
   assert.equal(q.grade,'Kelas '+n);
   assert.ok(q.question.length>10);
   assert.equal(q.options.length,4);
   assert.equal(new Set(q.options).size,4);
   assert.ok(q.options.includes(q.answer),'answer is not in the visible options: '+q.question);
   assert.ok(q.explanation.length>5);
  }
 }
 all.push(...questions);
}
test('uploaded bank is exactly 294 authentic questions with unique IDs',()=>{
 assert.equal(all.length,294);
 assert.equal(new Set(all.map(x=>x.id)).size,294);
 assert.equal(all[0].question,'Di meja makan ada 4 pempek kapal selam dan 5 pempek lenjer. Berapa jumlah semua pempek?');
 assert.deepEqual(all[0].options,['7','8','9','10']);
 assert.equal(all[0].answer,'9');
 assert.ok(all[0].explanation.includes('4 + 5 = 9'));
 const last=all.at(-1);
 assert.match(last.question,/rasio siswa yang menyukai permainan tradisional/i);
 assert.equal(last.answer,'5 : 3');
});

test('game default mission does not mix obsolete generated questions or database records',()=>{
 const app=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
 assert.match(app,/await getCuratedMission\(s\.grade,region\)/);
 assert.doesNotMatch(app,/makeMission\(/);
 assert.match(app,/if\(config\.mode==='manual'\)/);
 assert.match(app,/setQuestions\(qs\)/);
 assert.match(app,/getCuratedMission\(modeGrade,modeCulture\)/);
 assert.match(app,/Impor 7 Soal DOCX ke Bank/);
});

test('student topics and explanation follow uploaded material and no answer is supplied before answering',()=>{
 const app=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
 assert.match(app,/curriculumFocus\[student\?\.grade\|\|chosenGrade\]/);
 assert.match(app,/questions\[questionIndex\]\.explanation/);
 assert.match(app,/source==='docx-bank-v1'/);
 const source=readFileSync(new URL('../src/curatedBank.ts',import.meta.url),'utf8');
 assert.match(source,/DecompressionStream\('deflate'\)/);
 assert.match(source,/records\.length!==49/);
 assert.match(source,/items\.length!==7/);
});
