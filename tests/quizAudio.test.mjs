import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {quizQuestionSpeech} from '../src/quizAudio.mjs';
const app=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
const teacherCss=readFileSync(new URL('../src/teacher.css',import.meta.url),'utf8');
const helper=readFileSync(new URL('../src/MathHelper.tsx',import.meta.url),'utf8');
const worker=readFileSync(new URL('../public/sw.js',import.meta.url),'utf8');
test('narrator reads question and choices in Indonesian without disclosing correct answer',()=>{
 const message=quizQuestionSpeech({question:'Ada 4 mangga dan 2 jeruk.',options:['2','4','6','8'],answer:'6'},0);
 assert.match(message,/Soal nomor 1/);assert.match(message,/Ada 4 mangga dan 2 jeruk/);
 for(const letter of ['A','B','C','D'])assert.ok(message.includes('Pilihan '+letter));
 assert.doesNotMatch(message,/jawaban benar|jawaban adalah/i);
});
test('voice controls are reachable in every quiz and music uses the direct click-to-play path',()=>{
 assert.match(app,/function toggleMusic\(\)/);
 assert.match(app,/audio\.play\(\)/);
 assert.match(app,/function toggleNarrator\(\)/);
 assert.match(app,/className="quiz-audio-tools"/);
 assert.match(app,/Bacakan Soal/);
 assert.match(app,/onClick=\{toggleMusic\}/);
 assert.match(app,/onClick=\{toggleNarrator\}/);
 assert.match(app,/const\[music,setMusic\]=useState\(false\),\[voice,setVoice\]=useState\(true\)/);
 assert.match(app,/<MathHelper key=\{island\+'-'\+questionIndex\}/);
});
test('children see easy instructions and main questions before culture art on small screens',()=>{
 assert.match(helper,/Cara Mudah Menjawab Soal/);
 assert.match(helper,/Buka Kalkulator & Panduan/);
 assert.match(teacherCss,/\.quiz-page \.quiz-columns \.quiz-paper\{order:1/);
 assert.match(teacherCss,/\.quiz-page \.quiz-columns \.quiz-scene\{order:2/);
});
test('service worker versioned cache always refreshes HTML online',()=>{
 assert.match(worker,/nma-shell-v3-narator-kalkulator/);
 assert.match(worker,/request\.mode==='navigate'/);
 assert.match(worker,/cache:'no-store'/);
});
