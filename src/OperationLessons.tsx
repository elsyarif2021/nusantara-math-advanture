import {useMemo,useState} from 'react';
import './operationLessons.css';

type Operation='multiplication'|'division';
type Practice={question:string;answer:number;explanation:string;choices:number[]};

const examples:Record<string,{multiply:[number,number];divide:[number,number];note:string}>={
 'Kelas 1':{multiply:[2,3],divide:[6,2],note:'Mulai dengan kelompok benda dan membagi sama banyak.'},
 'Kelas 2':{multiply:[4,3],divide:[12,3],note:'Gunakan penjumlahan berulang dan pengurangan berulang.'},
 'Kelas 3':{multiply:[7,6],divide:[42,7],note:'Latih perkalian 1–10 dan hubungan kebalikannya dengan pembagian.'},
 'Kelas 4':{multiply:[24,3],divide:[72,3],note:'Pahami perkalian dan pembagian bilangan lebih besar.'},
 'Kelas 5':{multiply:[125,4],divide:[500,4],note:'Gunakan nilai tempat dan strategi pengelompokan.'},
 'Kelas 6':{multiply:[36,25],divide:[900,25],note:'Terapkan operasi hitung untuk menyelesaikan soal cerita.'}
};

function makePractice(grade:string,operation:Operation):Practice[]{
 const level=Number(grade.replace('Kelas ',''))||2;
 const factors=level<=2?[[2,3],[3,4],[5,2],[4,5],[6,3]]:
 level===3?[[4,7],[6,8],[9,3],[7,7],[8,5]]:
 level===4?[[12,3],[14,5],[24,4],[36,3],[18,6]]:
 level===5?[[25,4],[35,6],[125,3],[48,7],[75,8]]:
 [[24,12],[36,25],[125,8],[45,16],[64,15]];
 return factors.map(([a,b],i)=>{
  const answer=operation==='multiplication'?a*b:a;
  const question=operation==='multiplication'
   ?'Ada '+a+' kelompok, masing-masing berisi '+b+' benda. Berapa jumlah seluruh benda?'
   :'Ada '+a*b+' benda yang dibagi sama rata kepada '+b+' kelompok. Berapa benda setiap kelompok?';
  const explanation=operation==='multiplication'
   ?a+' × '+b+' = '+answer+'. Perkalian menghitung '+a+' kelompok yang masing-masing berisi '+b+' benda.'
   :(a*b)+' ÷ '+b+' = '+a+'. Karena '+a+' × '+b+' = '+(a*b)+', hasil pembagiannya adalah '+a+'.';
  const choices=[answer,answer+1,Math.max(0,answer-1),answer+(i+2)];
  return {question,answer,explanation,choices:choices.sort((x,y)=>((x*7+i)%11)-((y*7+i)%11))};
 });
}

export default function OperationLessons({grade}:{grade:string}){
 const [operation,setOperation]=useState<Operation>('multiplication');
 const [index,setIndex]=useState(0);
 const [selected,setSelected]=useState<number|null>(null);
 const [correct,setCorrect]=useState(0);
 const pair=examples[grade]||examples['Kelas 2'];
 const lessons=useMemo(()=>makePractice(grade,operation),[grade,operation]);
 const [a,b]=operation==='multiplication'?pair.multiply:pair.divide;
 const isMultiply=operation==='multiplication';
 const result=isMultiply?a*b:a;
 const dots=Math.min(a,8);
 const showObjects=a<=8&&b<=10;
 const question=lessons[index];
 const complete=index===lessons.length-1&&selected!==null;
 function switchOperation(next:Operation){setOperation(next);setIndex(0);setSelected(null);setCorrect(0)}
 function next(){setSelected(null);setIndex(i=>i+1)}
 function restart(){setIndex(0);setSelected(null);setCorrect(0)}
 return <section className="operation-lessons" aria-label="Materi perkalian dan pembagian">
  <header className="operation-head">
   <span className="operation-icon">🧮</span>
   <div><small>MATERI INTERAKTIF • {grade}</small><h2>Belajar Perkalian & Pembagian</h2><p>Pelajari konsepnya, perhatikan contoh, lalu jawab 5 soal latihan.</p></div>
  </header>
  <div className="operation-switch" role="group" aria-label="Pilih materi">
   <button type="button" className={isMultiply?'selected':''} aria-pressed={isMultiply} onClick={()=>switchOperation('multiplication')}>✖️ Perkalian</button>
   <button type="button" className={!isMultiply?'selected':''} aria-pressed={!isMultiply} onClick={()=>switchOperation('division')}>➗ Pembagian</button>
  </div>
  <div className="operation-explain">
   <h3>{isMultiply?'Apa itu perkalian?':'Apa itu pembagian?'}</h3>
   <p>{isMultiply?'Perkalian adalah penjumlahan berulang dari kelompok yang jumlah anggotanya sama.':'Pembagian berarti membagi benda sama banyak ke beberapa kelompok. Pembagian adalah kebalikan perkalian.'}</p>
   <p className="operation-level-tip">{pair.note}</p>
   <div className="operation-equation"><span>{a}</span><span>{isMultiply?'×':'÷'}</span><span>{b}</span><span>=</span><strong>{result}</strong></div>
   <p className="operation-steps">{isMultiply
    ?a+' × '+b+' = '+Array.from({length:Math.min(a,8)},()=>String(b)).join(' + ')+(a>8?' + …':'')+' = '+result
    :a+' ÷ '+b+' = '+result+' karena '+result+' × '+b+' = '+a}</p>
   {showObjects&&isMultiply&&<div className="operation-objects" aria-label={a+' kelompok masing-masing '+b+' benda'}>
    {Array.from({length:dots},(_,i)=><div key={i} className="operation-object-group">{Array.from({length:b},(_,j)=><span key={j} aria-hidden="true">⭐</span>)}</div>)}
   </div>}
   <p className="operation-context"><b>Contoh di kehidupan sehari-hari:</b> {isMultiply
    ?'Ada '+a+' keranjang, tiap keranjang berisi '+b+' buah. Seluruhnya '+result+' buah.'
    :'Ada '+a+' buah yang dibagi rata ke '+b+' anak. Masing-masing mendapat '+result+' buah.'}</p>
  </div>
  <div className="operation-practice">
   <div className="operation-practice-head"><h3>🎯 Latihan {isMultiply?'Perkalian':'Pembagian'}</h3><span>Soal {index+1} dari {lessons.length}</span></div>
   <p className="operation-question">{question.question}</p>
   <div className="operation-answers">
    {question.choices.map((choice,i)=><button type="button" key={i} disabled={selected!==null} className={selected!==null?(choice===question.answer?'right':choice===selected?'wrong':''):''} onClick={()=>{setSelected(choice);if(choice===question.answer)setCorrect(c=>c+1)}}>{String.fromCharCode(65+i)}. {choice}</button>)}
   </div>
   {selected!==null&&<div className="operation-feedback" role="status"><strong>{selected===question.answer?'✅ Tepat sekali!':'💡 Belum tepat, yuk pelajari caranya!'}</strong><p>{question.explanation}</p>{complete?<><p>Nilai latihanmu: <b>{correct} dari {lessons.length}</b> soal benar.</p><button type="button" onClick={restart}>🔄 Ulangi latihan</button></>:<button type="button" onClick={next}>Soal berikutnya →</button>}</div>}
  </div>
  <p className="operation-footnote">Latihan pada halaman Materi tidak mengubah skor atau progres misi pulau. Untuk mendapatkan bintang, kerjakan kuis melalui peta.</p>
 </section>;
}
