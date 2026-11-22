import {isInternalQuestionImageUrl} from './questionImages.js';
import {isInternalQuestionMediaUrl} from './questionMedia.js';

// Persistent per-question documents avoid overwriting the whole shared bank.
// Legacy questions from config/bank.json remain readable and editable through overlay records.
export const sdTopics={
 'Kelas 1':['Bilangan 1–100','Puluhan & Satuan','Penjumlahan','Pengurangan','Bangun Datar','Pengukuran Tidak Baku','Diagram Gambar'],
 'Kelas 2':['Bilangan sampai 1.000','Penjumlahan Bersusun','Pengurangan Bersusun','Perkalian','Pembagian','Uang & Pengukuran','Diagram Gambar'],
 'Kelas 3':['Bilangan sampai 10.000','Pecahan Sederhana','Operasi Campuran','Keliling Bangun Datar','Luas Persegi Panjang','Konversi Satuan','Piktogram'],
 'Kelas 4':['Bilangan Cacah Besar','Pecahan & Desimal','Kelipatan & Faktor','Operasi Desimal','Luas & Keliling','Sudut & Simetri','Diagram Batang'],
 'Kelas 5':['Bilangan & Nilai Tempat','Operasi Pecahan','Desimal & Persen','FPB & KPK','Bangun Datar Gabungan','Volume Kubus & Balok','Kecepatan & Data'],
 'Kelas 6':['Pecahan & Desimal','Rasio & Proporsi','FPB & KPK','Luas Permukaan','Volume Bangun Ruang','Denah & Skala','Peluang & Data']
};
const regions=['sumatra','jawa','kalimantan','sulawesi','bali','maluku','papua'];
export const questionIdOK=id=>typeof id==='string'&&/^(?:q-[0-9a-f-]{36}|legacy-[0-9]{1,5})$/.test(id);
const hasOwn=(obj,k)=>Object.prototype.hasOwnProperty.call(obj,k);
export function normalizeQuestion(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Data soal tidak valid.');
 const grade=String(input.grade||'').trim(),question=String(input.question||'').trim(),topic=String(input.topic||'').trim();
 if(!hasOwn(sdTopics,grade))throw Error('Kelas harus dipilih dari SD kelas 1–6.');
 if(!topic||!sdTopics[grade].includes(topic))throw Error('Topik harus sesuai dengan kelas yang dipilih.');
 if(question.length<6||question.length>1200)throw Error('Teks soal harus 6–1200 karakter.');
 if(!Array.isArray(input.options)||input.options.length!==4||input.options.some(x=>typeof x!=='string'))throw Error('Wajib ada empat opsi jawaban A–D.');
 const options=input.options.map(x=>x.trim());
 if(options.some(x=>!x||x.length>230)||new Set(options).size!==4)throw Error('Keempat opsi harus diisi, unik, dan tidak terlalu panjang.');
 const answer=String(input.answer||'').trim();if(!options.includes(answer))throw Error('Kunci jawaban wajib cocok dengan salah satu opsi.');
 const explanation=String(input.explanation||'').trim();if(explanation.length<5||explanation.length>1800)throw Error('Pembahasan harus 5–1800 karakter.');
 const cultureId=String(input.cultureId||'').trim();if(cultureId&&!regions.includes(cultureId))throw Error('Wilayah budaya tidak dikenal.');
 const result={grade,topic,cultureId,question,options,answer,explanation,active:input.active!==false};
 for(const field of ['imageUrl','videoUrl','audioUrl']){
  const value=String(input[field]||'').trim();
  if(value.length>500)throw Error('Alamat media terlalu panjang.');
  if(value){
   if((field==='imageUrl'&&isInternalQuestionImageUrl(value))||isInternalQuestionMediaUrl(field,value)){result[field]=value;continue}
   let u;try{u=new URL(value)}catch{throw Error('URL '+field+' tidak valid.')}
   if(u.protocol!=='https:'||u.username||u.password)throw Error('URL media harus menggunakan HTTPS.');
   if(field==='videoUrl'&&!['youtube.com','www.youtube.com','m.youtube.com','youtu.be','www.youtube-nocookie.com'].includes(u.hostname))throw Error('Video hanya mendukung tautan YouTube.');
  }
  result[field]=value;
 }
 return result;
}
export function mergeQuestionRecords(legacy,overlays){
 const all=new Map();
 (Array.isArray(legacy)?legacy:[]).slice(0,500).forEach((q,i)=>{
  if(q&&typeof q==='object')all.set('legacy-'+i,{...q,id:'legacy-'+i,active:q.active!==false});
 });
 (Array.isArray(overlays)?overlays:[]).forEach(q=>{
  if(!q||!questionIdOK(q.id))return;
  if(q.deleted)all.delete(q.id);else all.set(q.id,{...q,active:q.active!==false});
 });
 return [...all.values()].sort((a,b)=>(Number(a.grade?.slice(-1))||0)-(Number(b.grade?.slice(-1))||0)||String(a.topic||'').localeCompare(String(b.topic||''),'id')||String(a.question||'').localeCompare(String(b.question||''),'id'));
}
export async function readQuestionBank({read,list}){
 const legacy=await read('config/bank.json')||[];
 const overlays=[];
 let cursor;let seen=0;
 do{
  const batch=await list({prefix:'questions/',limit:300,...(cursor?{cursor}:{})});
  const names=(batch.blobs||[]).filter(b=>b.pathname.endsWith('.json')).map(b=>b.pathname);
  for(let i=0;i<names.length;i+=25){
   const part=await Promise.all(names.slice(i,i+25).map(path=>read(path).catch(()=>null)));
   overlays.push(...part.filter(Boolean));
  }
  seen+=names.length;cursor=batch.hasMore?batch.cursor:null;
  if(seen>2000)throw Error('Kapasitas bank soal terlampaui.');
 }while(cursor);
 return mergeQuestionRecords(legacy,overlays);
}
