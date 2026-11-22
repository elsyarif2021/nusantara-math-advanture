import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeQuestion,questionIdOK,mergeQuestionRecords,readQuestionBank,sdTopics} from '../api/questionBank.js';
const sample=(grade='Kelas 3',topic=sdTopics[grade][0])=>({grade,topic,cultureId:'sumatra',question:'Di Rumah Gadang ada 8 piring dan datang 4 lagi. Berapa semuanya?',options:['10','11','12','13'],answer:'12',explanation:'Jumlahkan delapan dan empat untuk mendapatkan dua belas.',active:true});
test('CRUD accepts valid class/topic, four answers and cultural image',()=>{
 const q=normalizeQuestion({...sample(),imageUrl:'https://example.org/budaya.png',audioUrl:'https://example.org/audio.mp3',videoUrl:'https://youtu.be/abcdefghijk'});
 assert.equal(q.grade,'Kelas 3');assert.equal(q.topic,sdTopics['Kelas 3'][0]);
 assert.equal(q.answer,'12');assert.equal(q.active,true);
 assert.equal(q.imageUrl,'https://example.org/budaya.png');
});
test('CRUD rejects wrong grade, mismatched topic, duplicates and incorrect answer keys',()=>{
 const invalid=[
  {...sample(),'grade':'Kelas 7'},
  {...sample(),'topic':sdTopics['Kelas 1'][0]},
  {...sample(),'options':['1','1','2','3']},
  {...sample(),'answer':'99'},
  {...sample(),'question':'Hi'},
  {...sample(),'imageUrl':'http://test.invalid/a.png'},
  {...sample(),'videoUrl':'https://evil.example/video'},
  {...sample(),'cultureId':'atlantis'},
  {...sample(),'active':true,'explanation':''}
 ];
 for(const q of invalid)assert.throws(()=>normalizeQuestion(q),{name:'Error'});
});
test('IDs accept only expected new and legacy patterns',()=>{
 assert.equal(questionIdOK('q-123e4567-e89b-12d3-a456-426614174000'),true);
 assert.equal(questionIdOK('legacy-12'),true);
 assert.equal(questionIdOK('../config/bank'),false);
 assert.equal(questionIdOK('legacy-1/../../'),false);
});
test('legacy is preserved on update and tombstones hide deleted records',()=>{
 const old=[sample('Kelas 1',sdTopics['Kelas 1'][0]),sample('Kelas 2',sdTopics['Kelas 2'][0])];
 const replaced={...normalizeQuestion(sample('Kelas 5',sdTopics['Kelas 5'][0])),id:'legacy-0'};
 const current=mergeQuestionRecords(old,[replaced,{id:'legacy-1',deleted:true},{id:'q-123e4567-e89b-12d3-a456-426614174000',...sample()}]);
 assert.equal(current.length,2);assert.ok(current.find(q=>q.id==='legacy-0'&&q.grade==='Kelas 5'));
 assert.ok(!current.find(q=>q.id==='legacy-1'));
});
test('storage reads multiple pages including legacy without loss',async()=>{
 const old=[sample('Kelas 1',sdTopics['Kelas 1'][0])];
 const file1={...sample('Kelas 2',sdTopics['Kelas 2'][0]),id:'q-123e4567-e89b-12d3-a456-426614174000'};
 const file2={...sample('Kelas 3',sdTopics['Kelas 3'][0]),id:'q-123e4567-e89b-12d3-a456-426614174001'};
 const data={'config/bank.json':old,'questions/a.json':file1,'questions/b.json':file2};
 const list=async(args)=>args.cursor?{blobs:[{pathname:'questions/b.json'}],hasMore:false}:{blobs:[{pathname:'questions/a.json'}],hasMore:true,cursor:'page2'};
 const result=await readQuestionBank({read:async k=>data[k]||null,list});
 assert.equal(result.length,3);
 assert.deepEqual(new Set(result.map(q=>q.grade)),new Set(['Kelas 1','Kelas 2','Kelas 3']));
});
