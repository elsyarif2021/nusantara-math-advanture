import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=(path)=>readFileSync(new URL('../src/'+path,import.meta.url),'utf8');
const guide=read('RoleGuide.tsx');
const app=read('App.tsx');
const teacher=read('TeacherPortal.tsx');
const css=read('roleGuide.css');

test('one small, opt-in guide adapts to all three roles and login states',()=>{
 assert.match(app,/<RoleGuide role=\{/);
 assert.match(guide,/type GuideRole='student'\|'teacher'\|'superadmin'/);
 assert.match(guide,/getRoleGuideSteps\(role:GuideRole,signedIn:boolean\)/);
 assert.match(guide,/studentSteps\(signedIn\)/);
 assert.match(guide,/teacherSteps\(signedIn\)/);
 assert.match(guide,/adminSteps\(signedIn\)/);
 assert.match(guide,/!open\?<button/);
 assert.match(guide,/className="nma-guide-fab"/);
 assert.match(guide,/onClick=\{show\}/);
});
test('all role guides explain their actual work: island map, class link, question bank and reports',()=>{
 assert.match(guide,/Pilih pulau di peta/);
 assert.match(guide,/Tidak perlu PIN/);
 assert.match(guide,/Buat tautan kelas/);
 assert.match(guide,/Bank Soal/);
 assert.match(guide,/Pantau Siswa/);
 assert.match(guide,/Super Admin/);
 assert.match(guide,/gambar, video, dan MP3/i);
});
test('highlight targets correspond to actual navigation elements, and reduce motion is respected',()=>{
 for(const name of ['teacher-links','teacher-questions','teacher-students','teacher-account']){
  assert.ok(teacher.includes('data-guide="'+name+'"'),name+' missing on teacher menu');
  assert.ok(guide.includes('data-guide=\\"'+name+'\\"'),name+' missing from guide target');
 }
 for(const name of ['admin-teachers','admin-questions','admin-students','admin-settings']){
  assert.ok(app.includes('data-guide="'+name+'"'),name+' missing on admin menu');
  assert.ok(guide.includes('data-guide=\\"'+name+'\\"'),name+' missing from guide target');
 }
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(css,/\.nma-guide-spotlight/);
});
test('audio is user initiated with text fallback, explicit mute and close',()=>{
 assert.match(guide,/SpeechSynthesisUtterance/);
 assert.match(guide,/utterance\.lang='id-ID'/);
 assert.match(guide,/window\.speechSynthesis\.getVoices\(\)/);
 assert.match(guide,/window\.speechSynthesis\.cancel\(\)/);
 assert.match(guide,/onClick=\{toggleVoice\}/);
 assert.match(guide,/onClick=\{\(\)=>speak\(step,true\)\}/);
 assert.match(guide,/aria-live="polite"/);
 assert.match(guide,/onClick=\{close\}/);
});
