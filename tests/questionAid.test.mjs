import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import {getQuestionAid} from '../src/questionAid.mjs';
const source=readFileSync(new URL('../src/learning.ts',import.meta.url),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {makeCultureQuestion,grades,gradeTopics}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
const expected=[
 ['count','place','add','subtract','shape','measure','data'],
 ['place','add','subtract','multiply','divide',['money','convert'],'data'],
 ['place','fraction','mixed','perimeter','area','convert','data'],
 ['place','fraction','multiple','decimal','area',['symmetry','angle'],'data'],
 ['place','fractionAdd','percent','fpb','compoundArea','volumeBox',['speed','data']],
 ['decimalFraction','ratio','kpk','surface',['volumeBox','volumeCylinder','volumePrism','volumePyramid'],'scale',['probability','add']],
];

test('all 42 grade/island topics receive hints matching the actual question rather than generic arithmetic',()=>{
 for(let gi=0;gi<6;gi++)for(let region=0;region<7;region++)for(let i=0;i<40;i++){
  const g=grades[gi],q=makeCultureQuestion(g,region);
  const aid=getQuestionAid(q.question,q.topic,g);
  const allowed=[expected[gi][region]].flat();
  assert.ok(allowed.includes(aid.kind),
    g+' region '+region+' expected '+allowed+' but got '+aid.kind+' for: '+q.question);
  assert.equal(aid.steps.length,4);
  assert.ok(aid.steps.every(s=>s.length>25));
  assert.equal(aid.grade,g);
  assert.ok(!aid.steps.join(' ').includes(q.answer+' = '+q.answer),'answer inadvertently repeated');
 }
});

test('question text overrides the chapter label for a teacher-created question',()=>{
 const cases=[
  ['Sebuah persegi panjang panjang 8 m dan lebar 3 m. Kelilingnya?','Pecahan Sederhana','perimeter'],
  ['Di diagram batang ada 4 siswa dan 5 siswa. Berapa jumlahnya?','Operasi Pecahan','data'],
  ['Tentukan FPB dari 18 dan 24','Volume Bangun Ruang','fpb'],
  ['Ada 7 siswa, 3 pergi. Berapa sisanya?','Diagram Batang','subtract'],
  ['Bangun dengan tiga sisi disebut ...','Bilangan 1–100','shape'],
  ['Kotak berbentuk tabung, tinggi 8 cm. Berapa volumenya?','Pecahan Sederhana','volumeCylinder'],
 ];
 for(const [q,topic,kind] of cases)assert.equal(getQuestionAid(q,topic,'Kelas 5').kind,kind,q);
});

test('conceptual questions never force unrelated calculator operators and unknown text has safe fallback',()=>{
 for(const question of ['Bentuk yang memiliki 3 sisi adalah ...','Bentuk apa yang simetris?','Dari 4 bagian, 1 diambil. Pecahan yang diambil ...']){
  const aid=getQuestionAid(question,'','Kelas 1');
  assert.equal(aid.calculator,false,question);
 }
 const unknown=getQuestionAid('Pilih jawaban sesuai gambar terlampir.','','Kelas 4');
 assert.equal(unknown.kind,'generic');
 assert.match(unknown.idea,/belum dapat dipastikan/);
});
test('UI mounts actual question topic, not just fixed island topic and preserves on-demand calculator',()=>{
 const app=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
 const helper=readFileSync(new URL('../src/MathHelper.tsx',import.meta.url),'utf8');
 assert.match(app,/topic=\{questions\[questionIndex\]\.topic\|\|gradeTopics/);
 assert.match(helper,/getQuestionAid\(question,topic,grade\)/);
 assert.match(helper,/Buka Kalkulator & Panduan/);
 assert.match(helper,/Buka Panduan Sesuai Soal/);
 assert.match(helper,/Tampilkan kalkulator jika diperlukan/);
 assert.doesNotMatch(helper,/question\.answer/);
});
