import {useMemo,useState} from 'react';
import {Calculator,ChevronLeft,ChevronRight,CheckCircle2,Lightbulb,RotateCcw,X} from 'lucide-react';
import {evaluateMathExpression,formatMathResult} from './mathAidCore.mjs';
import {getQuestionAid} from './questionAid.mjs';
import './mathHelper.css';

type Stage=0|1|2|3;
const titles=['Pahami soal','Pilih caranya','Hitung perlahan','Periksa kembali'];
export default function MathHelper({question,topic,grade,answered}:{question:string;topic:string;grade:string;answered:boolean}){
 const [open,setOpen]=useState(false);
 const [stage,setStage]=useState<Stage>(0);
 const [expression,setExpression]=useState('');
 const [result,setResult]=useState<number|null>(null);
 const [error,setError]=useState('');
 const [extraCalc,setExtraCalc]=useState(false);
 // Identify the mathematics actually asked, rather than supplying one fixed hint per island.
 const aid=useMemo(()=>getQuestionAid(question,topic,grade),[question,topic,grade]);
 const stageTitles=aid.calculator?titles:['Pahami soal','Pilih caranya','Kerjakan dengan ciri','Periksa kembali'];
 const append=(value:string)=>{
  setError('');setResult(null);
  setExpression(text=>text.length>=65?text:text+value);
 };
 const compute=()=>{
  try{const value=evaluateMathExpression(expression);setResult(value);setError('')}
  catch(e){setResult(null);setError(e instanceof Error?e.message:'Hitungan belum valid.')}
 };
 const reset=()=>{setExpression('');setResult(null);setError('');setExtraCalc(false);setStage(0)};
 const close=()=>setOpen(false);
 const go=(delta:number)=>setStage(v=>Math.max(0,Math.min(3,v+delta)) as Stage);
 return <div className="math-aid">
  {!open?<div className="math-aid-quick">
   <strong>{aid.icon} Bantuan Soal: {aid.title}</strong>
   <p className="math-aid-context">{aid.idea}</p>
   <ol><li>{aid.steps[0]}</li><li>{aid.steps[1]}</li><li>{aid.steps[2]}</li></ol>
   <button type="button" className="math-aid-toggle" onClick={()=>setOpen(true)} aria-expanded={false}><Lightbulb size={18}/>{aid.calculator?'🧮 Buka Kalkulator & Panduan':'💡 Buka Panduan Sesuai Soal'} <span>4 langkah</span></button>
   </div>:
  <section className="math-aid-panel" aria-label={'Panduan sesuai soal '+aid.title}>
   <div className="math-aid-heading"><div><b>{aid.icon} {aid.title}</b><small>{grade||'Siswa SD'} · Langkah khusus soal ini · Tanpa membocorkan kunci jawaban</small></div><button type="button" onClick={close} aria-label="Tutup alat bantu"><X size={18}/></button></div>
   <div className="math-aid-stages" aria-label={'Langkah '+(stage+1)+' dari 4}>{stageTitles.map((title,i)=><button type="button" key={title} className={stage===i?'active':i<stage?'visited':''} onClick={()=>setStage(i as Stage)} aria-current={stage===i?'step':undefined}><span>{i+1}</span><small>{title}</small></button>)}</div>
   <div className="math-aid-body">
    <h3>{stage+1}. {stageTitles[stage]}</h3>
    <p>{aid.steps[stage]}</p>
    {stage===0&&<div className="math-aid-insight">
     <b><Lightbulb size={17}/> Apa yang diketahui?</b>
     {aid.numbers.length>0?<div className="math-aid-numbers"><small>Angka atau ukuran yang tertulis pada soal (belum dihitung):</small><div>{aid.numbers.map((value,i)=><span key={i}>{value}</span>)}</div></div>:<p>Soal ini lebih mengutamakan pemahaman ciri atau informasi yang ditampilkan. Perhatikan kata-kata pentingnya.</p>}
     <p>Ditanya: apa yang harus kamu cari sesuai kalimat pertanyaan? Baca kembali sebelum mulai.</p>
    </div>}
    {stage===1&&<div className="math-aid-specific">
     <strong>🎯 Gunakan strategi ini</strong>
     <p>{aid.idea}</p>
     <div className="math-aid-method">{aid.formula||'Sesuaikan cara dengan informasi dalam soal.'}</div>
     {aid.kind==='fraction'||aid.kind==='fractionAdd'||aid.kind==='decimalFraction'||aid.kind==='probability'?<div className="math-aid-visual"><div className="math-aid-frac"><span>Pembilang</span><span>Penyebut</span></div><small>Atas: bagian yang dipilih. Bawah: keseluruhan atau penyebut. Jangan tertukar.</small></div>:null}
     {aid.kind==='place'?<div className="math-aid-place"><span>Ribuan</span><span>Ratusan</span><span>Puluhan</span><span>Satuan</span></div>:null}
     {['area','compoundArea','perimeter','surface','volumeBox','volumeCube','volumePrism','volumeCylinder','volumePyramid'].includes(aid.kind)&&<small className="math-aid-helper-note">📐 Buat sketsa bangun dan tulis ukuran yang diketahui sebelum menghitung.</small>}
    </div>}
    {stage===2&&<div className="math-aid-step-work">
     <div className="math-aid-method">{aid.formula||'Gunakan langkah pada soal ini.'}</div>
     {aid.calculator||extraCalc?<div className="math-aid-calculator">
       <label htmlFor="student-calc-input">🧮 Hitung setelah memilih cara yang tepat</label>
       <input id="student-calc-input" value={expression} inputMode="decimal" maxLength={65} onChange={e=>{setExpression(e.target.value);setError('');setResult(null)}} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();compute()}}} placeholder="Contoh: 12 + 8"/>
       <div className="math-aid-keypad">
        {['7','8','9','÷','4','5','6','×','1','2','3','−','0','.','(',')','C','⌫','+','='].map(value=><button type="button" key={value} className={['÷','×','−','+'].includes(value)?'operation':value==='='?'calculate':value==='C'?'clear':''} aria-label={value==='⌫'?'Hapus satu karakter':value==='C'?'Bersihkan hitungan':value==='='?'Hitung hasil':value} onClick={()=>value==='C'?(setExpression(''),setResult(null),setError('')):value==='⌫'?(setExpression(x=>x.slice(0,-1)),setResult(null),setError('')):value==='='?compute():append(value)}>{value}</button>)}
       </div>
       {error&&<p role="alert" className="math-aid-error">{error}</p>}
       {result!==null&&<div role="status" className="math-aid-result">Hasil hitung: <strong>{formatMathResult(result)}</strong></div>}
       <small>Kalkulator hanya memeriksa hitunganmu. Pilih jawaban sendiri, ya!</small>
      </div>:<div className="math-aid-insight"><p>Untuk soal ini, pahami dulu bentuk, bagian, atau konsepnya; tidak perlu memaksakan operasi hitung.</p><button type="button" className="math-aid-show-calc" onClick={()=>setExtraCalc(true)}><Calculator size={15}/> Tampilkan kalkulator jika diperlukan</button></div>}
     </div>}
    {stage===3&&<div className="math-aid-checklist">
      <p>✓ {aid.steps[3]}</p>
      <p>✓ Cocokkan dengan apa yang benar-benar ditanyakan pada soal.</p>
      <p>✓ Periksa kembali pilihan jawaban A–D.</p>
      {result!==null&&<div className="math-aid-result">Hasil yang kamu hitung: <strong>{formatMathResult(result)}</strong></div>}
      {answered&&<p className="math-aid-after">Kamu sudah menjawab. Baca pembahasan soal di bawah pilihan jawabannya.</p>}
     </div>}
   </div>
   <div className="math-aid-footer"><button type="button" className="math-aid-reset" onClick={reset}><RotateCcw size={15}/> Ulang</button><span>{stage+1} / 4</span><div><button type="button" onClick={()=>go(-1)} disabled={stage===0}><ChevronLeft size={16}/> Kembali</button>{stage<3?<button type="button" className="next" onClick={()=>go(1)}>Lanjut <ChevronRight size={16}/></button>:<button type="button" className="next" onClick={close}>Selesai ✓</button>}</div></div>
  </section>}
 </div>;
}
