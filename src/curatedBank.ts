import kelas1 from './bank/kelas1';
import kelas2 from './bank/kelas2';
import kelas3 from './bank/kelas3';
import kelas4 from './bank/kelas4';
import kelas5 from './bank/kelas5';
import kelas6 from './bank/kelas6';
import type {Question} from './learning';

// Source: Bank_Soal_Lengkap_Kelas_1_sampai_6_Nusantara_Math_Adventure.docx
// Exactly 294 authored questions: 6 grades x 7 regions x 7 questions.
// Packaged per grade as deflate-compressed JSON, decoded in the browser on demand.
const gradePayloads:Record<string,string>={
 'Kelas 1':kelas1,'Kelas 2':kelas2,'Kelas 3':kelas3,
 'Kelas 4':kelas4,'Kelas 5':kelas5,'Kelas 6':kelas6,
};
const cultures=['sumatra','jawa','kalimantan','sulawesi','bali','maluku','papua'];
export const curriculumFocus:Record<string,string>={
 'Kelas 1':'Bilangan Cacah, Penjumlahan, Pengurangan, & Bangun Datar Dasar',
 'Kelas 2':'Bilangan s.d. 100, Operasi Hitung, Perkalian/Pembagian Awal, & Satuan',
 'Kelas 3':'Perkalian, Pembagian, & Pemecahan Masalah Kontekstual',
 'Kelas 4':'Keliling & Luas Bangun Datar, Pecahan Dasar, & Faktor/Kelipatan',
 'Kelas 5':'Pecahan & Desimal, Volume Kubus/Balok, Kecepatan, & Persentase',
 'Kelas 6':'Rasio & Perbandingan, Lingkaran, Pengolahan Data, & Bilangan Bulat',
};
type BankRecord=Question&{id:string;grade:string;cultureId:string};
const cache=new Map<string,Promise<BankRecord[]>>();
async function unpackGrade(grade:string):Promise<BankRecord[]>{
 const encoded=gradePayloads[grade];
 if(!encoded)throw Error('Bank soal untuk '+grade+' tidak tersedia.');
 if(typeof DecompressionStream==='undefined')throw Error('Browser ini belum mendukung pembukaan bank soal. Perbarui browser HP.');
 const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));
 const zipped=bytes.buffer as ArrayBuffer;
 const stream=new Blob([zipped]).stream().pipeThrough(new DecompressionStream('deflate'));
 const records=JSON.parse(await new Response(stream).text()) as BankRecord[];
 if(!Array.isArray(records)||records.length!==49)throw Error('Jumlah soal pada '+grade+' tidak lengkap.');
 for(const region of cultures){
  const items=records.filter(q=>q.cultureId===region);
  if(items.length!==7)throw Error('Soal untuk '+grade+' di '+region+' tidak lengkap.');
  for(const q of items){
   if(q.grade!==grade||!q.question||!q.explanation||!Array.isArray(q.options)||q.options.length!==4||new Set(q.options).size!==4||!q.options.includes(q.answer))throw Error('Soal pada '+region+' belum valid.');
  }
 }
 return records;
}
export async function getCuratedMission(grade:string,culture:string):Promise<Question[]>{
 if(!cultures.includes(culture))throw Error('Pulau tidak dikenal.');
 let task=cache.get(grade);
 if(!task){
  task=unpackGrade(grade).catch(err=>{cache.delete(grade);throw err});
  cache.set(grade,task);
 }
 const bank=await task;
 const result=bank.filter(q=>q.cultureId===culture);
 // Each mission uses the document's original order and original A-D options.
 return result.map(q=>({...q,source:'docx-bank-v1'}));
}
