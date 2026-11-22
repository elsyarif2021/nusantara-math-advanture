import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateMathExpression,formatMathResult} from '../src/mathAidCore.mjs';
import {readFileSync} from 'node:fs';
const helper=readFileSync(new URL('../src/MathHelper.tsx',import.meta.url),'utf8');
const app=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
test('calculator handles elementary arithmetic and precedence',()=>{
 for(const [expression,expected] of [
  ['12+8',20],['18−5',13],['6×7',42],['24÷3',8],
  ['2+3×4',14],['(2+3)×4',20],['0,5+1,25',1.75],
  ['-4+7',3],['8÷(2+2)',2],['1/4',0.25],
 ])assert.equal(evaluateMathExpression(expression),expected,expression);
 assert.equal(formatMathResult(1.25),'1,25');
});
test('calculator rejects malformed or dangerous input',()=>{
 for(const expression of [
  '','5/0','1++','12..3','Math.random()','alert(1)','5**2','4;process.exit()',
  '()','1+','1e99','1/0','2+abc','1'.repeat(85)
 ])assert.throws(()=>evaluateMathExpression(expression),undefined,expression);
});
test('guide is optional and does not reveal question answer before submission',()=>{
 assert.match(app,/<MathHelper key=\{island\+'-'\+questionIndex\}/);
 assert.match(helper,/type Stage=0\|1\|2\|3/);
 assert.match(helper,/Pahami soal/);
 assert.match(helper,/Pilih caranya/);
 assert.match(helper,/Hitung perlahan/);
 assert.match(helper,/Periksa kembali/);
 assert.match(helper,/Buka Kalkulator & Panduan/);
 assert.doesNotMatch(helper,/question\.answer/);
});
