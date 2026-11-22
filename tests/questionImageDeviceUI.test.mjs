import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=(name)=>readFileSync(new URL('../src/'+name,import.meta.url),'utf8');
for(const [file,uploadMethod] of [
 ['TeacherQuestions.tsx','onPickImage'],
 ['App.tsx','onAdminPickImage'],
]){
 test(file+': accepts an image file directly from device without an editable URL field',()=>{
  const source=read(file);
  assert.match(source,/type="file" accept="image\/jpeg,image\/png,image\/webp"/);
  assert.match(source,new RegExp('void '+uploadMethod+'\\('));
  assert.match(source,/question-image-preview/);
  assert.match(source,/Hapus gambar dari soal/);
  assert.doesNotMatch(source,/Alamat gambar HTTPS/i);
  assert.doesNotMatch(source,/value=\{draft\.imageUrl\|\|''\}/);
 });
}
test('Direct uploader posts image bytes to authenticated API, never requires a link',()=>{
 const code=read('uploadQuestionImage.ts');
 assert.match(code,/reader\.readAsDataURL\(file\)/);
 assert.match(code,/question-images\/upload/);
 assert.match(code,/role,dataUrl/);
 assert.doesNotMatch(code,/prompt\(/);
});
