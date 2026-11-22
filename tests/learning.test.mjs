import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const source=readFileSync(new URL('../src/learning.ts',import.meta.url),'utf8');
const javascript=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {makeCultureQuestion,makeMission,islandData,gradeTopics,grades}=await import('data:text/javascript;base64,'+Buffer.from(javascript).toString('base64'));

test('SD curriculum only: six grades and seven islands',()=>{
 assert.equal(grades.length,6);assert.equal(islandData.length,7);
 for(const g of grades){assert.match(g,/^Kelas [1-6]$/);assert.equal(gradeTopics[g].length,7);}
});
test('all elementary challenges have four unique answer choices, explanation and culture',()=>{
 for(const g of grades)for(let stage=0;stage<7;stage++)for(let i=0;i<80;i++){
  const q=makeCultureQuestion(g,stage);
  assert.equal(q.options.length,4,g+' '+stage+': '+q.options);
  assert.equal(new Set(q.options).size,4,g+' '+stage+': duplicate choice '+q.question);
  assert.ok(q.options.includes(q.answer),g+' '+stage+': missing answer '+q.question);
  assert.ok(q.explanation.length>8,g+' '+stage+': no explanation');
  assert.equal(q.cultureId,islandData[stage].id);
  assert.equal(q.grade,g);
  assert.equal(q.topic,gradeTopics[g][stage]);
 }
});
test('missions generate eight questions consistently',()=>{
 for(const g of grades)for(let i=0;i<7;i++){
  const q=makeMission(g,i,8);assert.equal(q.length,8);
  assert.ok(q.every(x=>x.answer&&x.options.includes(x.answer)));
 }
});
