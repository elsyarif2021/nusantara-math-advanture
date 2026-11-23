import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
const lesson=readFileSync(new URL('../src/OperationLessons.tsx',import.meta.url),'utf8');

test('student grade from login determines multiplication and division lessons',()=>{
 assert.match(app,/student&&<OperationLessons grade=\{student\.grade\}\/>/);
 assert.match(lesson,/examples\[grade\]/);
 assert.match(lesson,/\['Kelas 1'\]|'Kelas 1':/);
 assert.match(lesson,/'Kelas 6':/);
});
test('lesson covers both operations, examples, practice, answers and explanation',()=>{
 for(const item of ['Perkalian','Pembagian','Latihan','question.explanation','selected===question.answer','Ulangi latihan'])assert.ok(lesson.includes(item),item);
 assert.match(lesson,/const factors=/);
 assert.match(lesson,/role="status"/);
 assert.match(lesson,/const lessons=useMemo/);
 assert.match(lesson,/index===lessons.length-1/);
});
test('independent lessons do not modify student progress or add a duplicate grade selector',()=>{
 assert.doesNotMatch(lesson,/\/api\/progress|setStudent|setChosenGrade|levelPick/);
 assert.match(app,/view==='materi'/);
});
