import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {shouldShowRoleEntry} from '../src/roleEntryVisibility.mjs';

test('guest can choose role only before signing in',()=>{
 for(const view of ['home','materi','pencapaian','quiz','result']){
  assert.equal(shouldShowRoleEntry({view,student:false,teacherAuthed:false,admin:false}),true,view);
 }
});

test('logged-in student never sees role selector, including on quiz screen',()=>{
 for(const view of ['home','materi','pencapaian','quiz','result']){
  assert.equal(shouldShowRoleEntry({view,student:true,teacherAuthed:false,admin:false}),false,view);
 }
});

test('signed-in teacher and Super Admin never see a second role chooser',()=>{
 for(const role of ['teacherAuthed','admin']){
  for(const view of ['home','materi','pencapaian','quiz','result','teacher','admin']){
   const s={view,student:false,teacherAuthed:false,admin:false};s[role]=true;
   assert.equal(shouldShowRoleEntry(s),false,role+' '+view);
  }
 }
});

test('role selection is hidden in dedicated teacher/admin login pages before authentication too',()=>{
 for(const view of ['admin','teacher']){
  assert.equal(shouldShowRoleEntry({view,student:false,teacherAuthed:false,admin:false}),false,view);
 }
});

test('App uses the shared visibility guard and preserves role-specific current-user UI',()=>{
 const app=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
 assert.match(app,/shouldShowRoleEntry\(\{view,student:Boolean\(student\),teacherAuthed,admin\}\)/);
 assert.match(app,/student\?<button className="user-pill"/);
 assert.match(app,/view==='admin'&&<main/);
 assert.match(app,/view==='teacher'&&<TeacherPortal/);
 assert.match(app,/function signout\(/);
 assert.match(app,/logoutAdmin/);
});
