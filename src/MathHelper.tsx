import {useMemo,useState} from 'react';
import {Calculator,ChevronLeft,ChevronRight,CheckCircle2,Lightbulb,RotateCcw,X} from 'lucide-react';
import {evaluateMathExpression,formatMathResult} from './mathAidCore.mjs';
import './mathHelper.css';

type Stage=0|1|2|3;
const operations=[
 {symbol:'+',label:'Tambah',hint:'Saat jumlah menjadi lebih banyak atau benda digabungkan.'},
 {symbol:'−',label:'Kurang',hint:'Saat benda diambil atau mencari selisih.'},
 {symbol:'×',label:'Kali',hint:'Saat ada kelompok sama banyak yang berulang.'},
 {symbol:'÷',label:'Bagi',hint:'Saat benda dibagi sama rata.'},
];
const titles=['Pahami soal','Pilih caranya','Hitung perlahan','Periksa kembali'];
const tips=[
 'Baca sekali lagi. Tandai angka, satuannya, dan apa yang harus dicari.',
 'Pilih cara yang cocok. Kamu boleh mencoba lalu mengubahnya.',
 'Masukkan hitungan yang sudah kamu susun. Kalkulator membantu menghitung, bukan memilih jawaban.',
 'Perkirakan apakah hasil masuk akal, lalu cocokkan dengan pilihan jawaban A–D.',
];
function topicHint(topic:string){
 const t=topic.toLowerCase();
 if(/tambah|penjumlahan|bilangan/.test(t))return 'Coba perhatikan apakah soal menggabungkan atau membandingkan jumlah.';
 if(/kurang|pengurangan/.test(t))return 'Perhatikan jumlah awal, perubahan, atau selisih.';
 if(/perkalian|kelipatan|faktor/.test(t))return 'Cari kelompok berulang atau hubungan kelipatan.';
 if(/pembagian/.test(t))return 'Cari petunjuk membagi sama banyak.';
 if(/pecahan|desimal|rasio|persen/.test(t))return 'Periksa bagian, keseluruhan, satuan, dan operasi yang dibutuhkan.';
 if(/bangun|luas|keliling|volume|sudut|geometri/.test(t))return 'Buat sketsa bentuk dan tulis rumus yang sesuai sebelum menghitung.';
 if(/diagram|data|piktogram|peluang/.test(t))return 'Baca informasi pada data atau diagram terlebih dahulu.';
 return 'Pilih langkah yang sesuai dengan informasi pada soal.';
}
export default function MathHelper({question,topic,answered}:{question:string;topic:string;answered:boolean}){
 const [open,setOpen]=useState(false);
 const [stage,setStage]=useState<Stage>(0);
 const [selected,setSelected]=useState('');
 const [expression,setExpression]=useState('');
 const [result,setResult]=useState<number|null>(null);
 const [error,setError]=useState('');
 const numbers=useMemo(()=>[...question.matchAll(/\d+(?:[.,]\d+)?/g)].slice(0,6).map(x=>x[0]),[question]);
 const append=(value:string)=>{
  setError('');setResult(null);
  setExpression(text=>text.length>=65?text:text+value);
 };
 const compute=()=>{
  try{const value=evaluateMathExpression(expression);setResult(value);setError('')}catch(e){setResult(null);setError(e instanceof Error?e.message:'Hitungan belum valid.')}
 };
 const reset=()=>{setExpression('');setResult(null);setError('');setSelected('');setStage(0)};
 const close=()=>{setOpen(false)};
 const go=(delta:number)=>setStage(v=>Math.max(0,Math.min(3,v+delta)) as Stage);
 return <div className="math-aid">
  {!open?<div className="math-aid-quick">
    <strong>💡 Cara Mudah Menjawab Soal</strong>
    <ol><li>Baca soal, temukan angka dan yang ditanya.</li><li>{topicHint(topic)}</li><li>Hitung perlahan, lalu cocokkan dengan pilihan A–D.</li></ol>
    <button type="button" className="math-aid-toggle" onClick={()=>setOpen(true)} aria-expanded={false}><Calculator size={19}/> 🧮 Buka Kalkulator & Panduan <span>4 langkah</span></button>
   </div>:
  <section className="math-aid-panel" aria-label="Alat bantu hitung dan langkah pemecahan soal">
   <div className="math-aid-heading"><div><b>🧮 Ayo pecahkan bersama!</b><small>Kalkulator & langkah belajar • tidak menampilkan kunci jawaban</small></div><button type="button" onClick={close} aria-label="Tutup alat bantu"><X size={18}/></button></div>
   <div className="math-aid-stages" aria-label={'Langkah '+(stage+1)+' dari 4'}>{titles.map((title,i)=><button type="button" key={title} className={stage===i?'active':i<stage?'visited':''} onClick={()=>setStage(i as Stage)} aria-current={stage===i?'step':undefined}><span>{i+1}</span><small>{title}</small></button>)}</div>
   <div className="math-aid-body">
    <h3>{stage+1}. {titles[stage]}</h3>
    <p>{tips[stage]}</p>
    {stage===0&&<div className="math-aid-insight">
      <b><Lightbulb size={17}/> Pertanyaan pembantu</b>
      <p>Apa yang diketahui? Apa yang ditanyakan? Apakah ada satuan yang harus diperhatikan?</p>
      {numbers.length>0&&<div className="math-aid-numbers"><small>Angka yang tertulis pada soal:</small><div>{numbers.map((x,i)=><span key={i}>{x}</span>)}</div></div>}
    </div>}
    {stage===1&&<div className="math-aid-operators"><p className="math-aid-topic"><Lightbulb size={16}/> {topicHint(topic)}</p>
       <div>{operations.map(op=><button type="button" key={op.symbol} className={selected===op.symbol?'chosen':''} onClick={()=>setSelected(op.symbol)}><strong>{op.symbol}</strong><span><b>{op.label}</b><small>{op.hint}</small></span>{selected===op.symbol&&<CheckCircle2 size={17}/>}</button>)}</div>
       {selected&&<p className="math-aid-choice">Kamu memilih: <b>{operations.find(op=>op.symbol===selected)?.label}</b>. Kamu boleh mengubah pilihan setelah membaca ulang soal.</p>}
    </div>}
    {stage===2&&<div className="math-aid-calculator">
      <label htmlFor="student-calc-input">Tulis hitunganmu (contoh: 12 + 8)</label>
      <input id="student-calc-input" value={expression} inputMode="decimal" maxLength={65} onChange={e=>{setExpression(e.target.value);setError('');setResult(null)}} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();compute()}}} placeholder="12 + 8"/>
      <div className="math-aid-keypad">
       {['7','8','9','÷','4','5','6','×','1','2','3','−','0','.','(',')','C','⌫','+','='].map(val=><button type="button" key={val} className={['÷','×','−','+'].includes(val)?'operation':val==='='?'calculate':val==='C'?'clear':''} aria-label={val==='⌫'?'Hapus satu karakter':val==='C'?'Bersihkan hitungan':val==='='?'Hitung hasil':val} onClick={()=>val==='C'?(setExpression(''),setResult(null),setError('')):val==='⌫'?(setExpression(x=>x.slice(0,-1)),setResult(null),setError('')):val==='='?compute():append(val)}>{val}</button>)}
      </div>
      {error&&<p role="alert" className="math-aid-error">{error}</p>}
      {result!==null&&<div role="status" className="math-aid-result">Hasil hitung: <strong>{formatMathResult(result)}</strong></div>}
      <small>Gunakan kalkulator untuk memeriksa perhitungan. Pilih jawaban soal sendiri, ya!</small>
     </div>}
    {stage===3&&<div className="math-aid-checklist">
      <p>✓ Apakah hitungan sesuai cerita dalam soal?</p>
      <p>✓ Apakah satuan dan nilai hasilnya masuk akal?</p>
      <p>✓ Apakah jawabannya cocok dengan salah satu pilihan A–D?</p>
      {result!==null&&<div className="math-aid-result">Hasil yang kamu hitung: <strong>{formatMathResult(result)}</strong></div>}
      {answered&&<p className="math-aid-after">Kamu sudah menjawab. Baca pembahasan di bawah pilihan untuk memahami cara penyelesaiannya.</p>}
     </div>}
   </div>
   <div className="math-aid-footer"><button type="button" className="math-aid-reset" onClick={reset}><RotateCcw size={15}/> Ulang</button><span>{stage+1} / 4</span><div><button type="button" onClick={()=>go(-1)} disabled={stage===0}><ChevronLeft size={16}/> Kembali</button>{stage<3?<button type="button" className="next" onClick={()=>go(1)}>Lanjut <ChevronRight size={16}/></button>:<button type="button" className="next" onClick={close}>Selesai ✓</button>}</div></div>
  </section>}
 </div>;
}
