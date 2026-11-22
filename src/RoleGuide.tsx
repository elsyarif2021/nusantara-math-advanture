import {useEffect,useMemo,useRef,useState} from 'react';
import {ChevronLeft,ChevronRight,HelpCircle,Volume2,VolumeX,X,Play} from 'lucide-react';
import './roleGuide.css';

export type GuideRole='student'|'teacher'|'superadmin';
type Step={icon:string;title:string;description:string;target?:string;spoken?:string};
const studentSteps=(signedIn:boolean):Step[]=>signedIn?[
 {icon:'🗺️',title:'Pilih pulau di peta',description:'Geser peta jika memakai HP. Ketuk pin salah satu pulau untuk membuka kuis Matematika.',target:'#peta'},
 {icon:'✏️',title:'Jawab pertanyaannya',description:'Baca soal, lalu pilih jawaban A, B, C, atau D. Jika ada gambar, video, atau suara, kamu boleh melihat atau memutarnya.',target:'.quiz-paper'},
 {icon:'🌟',title:'Kumpulkan bintang',description:'Setelah kuis selesai, lihat hasil dan XP. Kamu juga bisa melihat progres di kartu profil bawah peta.',target:'.player-card-compact'},
]:[
 {icon:'👋',title:'Masuk sebagai siswa',description:'Ketuk “Masuk Siswa” di atas. Tidak perlu PIN. Cukup isi nama dan pilih kelas sekali saja.',target:'.user-pill'},
 {icon:'🎓',title:'Pilih kelas ketika login',description:'Kelas 1 sampai 6 dipilih di formulir masuk, bukan di peta. Jika memakai tautan guru, kelas mengikuti tautan itu.',target:'.user-pill'},
 {icon:'🗺️',title:'Pilih pulau',description:'Setelah masuk, geser peta di HP dan ketuk pin pulau untuk mulai kuis.',target:'#peta'},
 {icon:'🌟',title:'Belajar dan dapat bintang',description:'Pilih jawaban A sampai D. Di akhir kuis ada nilai, XP, dan progres petualanganmu.',target:'.player-card-compact'},
];
const teacherSteps=(signedIn:boolean):Step[]=>signedIn?[
 {icon:'🔗',title:'Buat tautan kelas',description:'Di “Kelas & Link”, pilih kelas dan kelompok, lalu tekan “Buat Link Siswa”. Salin dan kirimkan tautannya.',target:'[data-guide="teacher-links"]'},
 {icon:'📝',title:'Tambah soal',description:'Buka “Bank Soal”, lalu tambah soal dan jawabannya. Gambar, video, serta MP3 boleh diunggah dari perangkat, tetapi semuanya opsional.',target:'[data-guide="teacher-questions"]'},
 {icon:'📊',title:'Pantau siswa',description:'Buka “Pantau Siswa” untuk melihat siapa yang sudah belajar, perolehan XP, dan hasil kuis. Data bisa diekspor.',target:'[data-guide="teacher-students"]'},
 {icon:'🔐',title:'Kelola akun',description:'Buka “Akun” jika ingin mengganti kata sandi. Tekan “Keluar” jika sudah selesai.',target:'[data-guide="teacher-account"]'},
]:[
 {icon:'👩‍🏫',title:'Masuk sebagai Guru',description:'Masukkan username dan kata sandi dari Super Admin, lalu tekan “Masuk Portal Guru”.',target:'.teacher-login'},
 {icon:'🔗',title:'Buat tautan kelas',description:'Setelah masuk, buka “Kelas & Link” untuk membuat tautan khusus siswa dan membagikannya.'},
 {icon:'📝',title:'Siapkan soal',description:'Di “Bank Soal”, tambah pertanyaan, pilihan jawaban, dan pembahasan. Lampiran gambar, video, MP3 tidak wajib.'},
 {icon:'📊',title:'Lihat hasil siswa',description:'Buka “Pantau Siswa” untuk memeriksa progres kelasmu. Kamu hanya dapat mengelola kelas milikmu.'},
];
const adminSteps=(signedIn:boolean):Step[]=>signedIn?[
 {icon:'👩‍🏫',title:'Kelola Guru',description:'Buka menu “Guru” untuk membuat akun Guru dan mengatur tautan kelas mereka.',target:'[data-guide="admin-teachers"]'},
 {icon:'📝',title:'Kelola Bank Soal',description:'Buka “Bank Soal” untuk menambah atau mengubah soal. Gambar, video, dan MP3 bisa dipilih langsung dari perangkat; semuanya opsional.',target:'[data-guide="admin-questions"]'},
 {icon:'📊',title:'Pantau Siswa',description:'Buka “Siswa” untuk melihat progres seluruh siswa dan mengekspor laporannya.',target:'[data-guide="admin-students"]'},
 {icon:'⚙️',title:'Pengaturan',description:'Buka “Pengaturan” untuk mengubah identitas sekolah. Akhiri pekerjaan dengan tombol “Keluar”.',target:'[data-guide="admin-settings"]'},
]:[
 {icon:'🔐',title:'Masuk Super Admin',description:'Masukkan kata sandi administrator, lalu tekan “Masuk Dashboard Admin”.',target:'.admin-login'},
 {icon:'👩‍🏫',title:'Kelola akun Guru',description:'Setelah masuk, menu “Guru” digunakan untuk membuat akun dan mengatur kelas masing-masing.'},
 {icon:'📝',title:'Tambah soal',description:'Menu “Bank Soal” untuk soal Matematika. Lampiran media boleh kosong atau diunggah langsung dari HP/laptop.'},
 {icon:'📊',title:'Pantau dan atur',description:'Menu “Siswa” untuk laporan; menu “Pengaturan” untuk identitas sekolah. Gunakan “Keluar” setelah selesai.'},
];

export function getRoleGuideSteps(role:GuideRole,signedIn:boolean):Step[]{
 return role==='teacher'?teacherSteps(signedIn):role==='superadmin'?adminSteps(signedIn):studentSteps(signedIn);
}
const roleLabel:Record<GuideRole,string>={student:'Siswa',teacher:'Guru',superadmin:'Super Admin'};
export default function RoleGuide({role,signedIn}:{role:GuideRole;signedIn:boolean}){
 const [open,setOpen]=useState(false);
 const [stepIndex,setStepIndex]=useState(0);
 const [soundEnabled,setSoundEnabled]=useState(true);
 const [speechAvailable,setSpeechAvailable]=useState(true);
 const dialogRef=useRef<HTMLElement|null>(null);
 const highlightRef=useRef<Element|null>(null);
 const steps=useMemo(()=>getRoleGuideSteps(role,signedIn),[role,signedIn]);
 const step=steps[Math.min(stepIndex,steps.length-1)];
 const stopSpeech=()=>{if(typeof window!=='undefined'&&'speechSynthesis'in window)window.speechSynthesis.cancel()};
 const speak=(item:Step,enabled=soundEnabled)=>{
  if(!enabled||typeof window==='undefined'||!('speechSynthesis'in window)||!('SpeechSynthesisUtterance'in window))return;
  try{
   window.speechSynthesis.cancel();
   const utterance=new SpeechSynthesisUtterance(item.spoken||item.title+'. '+item.description);
   utterance.lang='id-ID';
   utterance.rate=0.92;
   utterance.pitch=1.03;
   const voices=window.speechSynthesis.getVoices();
   const indonesia=voices.find(v=>v.lang.toLowerCase().startsWith('id'));
   if(indonesia)utterance.voice=indonesia;
   window.speechSynthesis.speak(utterance);
  }catch{setSpeechAvailable(false)}
 };
 const close=()=>{stopSpeech();setOpen(false)};
 const show=()=>{
  setSpeechAvailable(typeof window!=='undefined'&&'speechSynthesis'in window&&'SpeechSynthesisUtterance'in window);
  setStepIndex(0);setOpen(true);speak(steps[0]);
 };
 const next=(offset:number)=>{
  const idx=Math.max(0,Math.min(steps.length-1,stepIndex+offset));
  setStepIndex(idx);stopSpeech();speak(steps[idx]);
 };
 useEffect(()=>{setOpen(false);setStepIndex(0);stopSpeech()},[role,signedIn]);
 useEffect(()=>{
  if(!open)return;
  const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();close()}};
  document.addEventListener('keydown',escape);
  return()=>document.removeEventListener('keydown',escape);
 },[open]);
 useEffect(()=>{
  highlightRef.current?.classList.remove('nma-guide-spotlight');
  highlightRef.current=null;
  if(!open||!step.target)return;
  const target=document.querySelector(step.target);
  if(!target)return;
  highlightRef.current=target;
  target.classList.add('nma-guide-spotlight');
  // Keep the highlighted real control visible without opening an unrelated screen.
  const reduceMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({behavior:reduceMotion?'instant':'smooth',block:'nearest',inline:'nearest'});
  return()=>{target.classList.remove('nma-guide-spotlight');highlightRef.current=null};
 },[open,stepIndex,step.target,role,signedIn]);
 const toggleVoice=()=>{
  const nextEnabled=!soundEnabled;
  setSoundEnabled(nextEnabled);
  stopSpeech();
  if(nextEnabled)speak(step,true);
 };
 const jumpToMenu=()=>{
  if(!step.target)return;
  const item=document.querySelector(step.target);
  if(item instanceof HTMLButtonElement){item.click();item.scrollIntoView({behavior:'smooth',block:'nearest'})}
 };
 return <div className="nma-role-guide">
  {!open?<button type="button" className="nma-guide-fab" onClick={show} aria-label={'Buka panduan interaktif '+roleLabel[role]}><HelpCircle size={21}/><span>❔ Panduan</span></button>:
  <section ref={dialogRef} className="nma-guide-card" role="dialog" aria-modal="false" aria-label={'Panduan interaktif '+roleLabel[role]}>
   <header className="nma-guide-heading"><div><small>PANDUAN {roleLabel[role].toUpperCase()}</small><strong>Mudah dalam 4 langkah</strong></div><button type="button" aria-label="Tutup panduan" className="nma-guide-close" onClick={close}><X size={19}/></button></header>
   <div className="nma-guide-scene" aria-hidden="true"><span className="nma-guide-emoji" key={role+'-'+stepIndex}>{step.icon}</span><span className="nma-guide-decoration">✨</span></div>
   <div className="nma-guide-progress" aria-label={'Langkah '+(stepIndex+1)+' dari '+steps.length}>{steps.map((s,i)=><span key={i} className={i<=stepIndex?'active':''}/>)}</div>
   <div className="nma-guide-copy" aria-live="polite"><small>LANGKAH {stepIndex+1} / {steps.length}</small><h2>{step.title}</h2><p>{step.description}</p></div>
   <div className="nma-guide-voice">
    <button type="button" disabled={!speechAvailable} onClick={toggleVoice} aria-pressed={soundEnabled}>{soundEnabled?<Volume2 size={17}/>:<VolumeX size={17}/>} {speechAvailable?(soundEnabled?'Suara aktif':'Suara mati'):'Suara tidak tersedia'}</button>
    <button type="button" disabled={!speechAvailable} onClick={()=>speak(step,true)}><Play size={15}/> Dengarkan</button>
    {signedIn&&(role!=='student')&&step.target&&<button type="button" className="nma-guide-jump" onClick={jumpToMenu}>Buka menu</button>}
   </div>
   <footer className="nma-guide-footer">
    <button type="button" className="nma-guide-prev" onClick={()=>next(-1)} disabled={stepIndex===0}><ChevronLeft size={16}/> Kembali</button>
    {stepIndex===steps.length-1?<button type="button" className="nma-guide-next" onClick={close}>Selesai ✓</button>:
     <button type="button" className="nma-guide-next" onClick={()=>next(1)}>Lanjut <ChevronRight size={16}/></button>}
   </footer>
  </section>}
 </div>;
}
