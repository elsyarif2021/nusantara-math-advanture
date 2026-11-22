import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {ArrowLeft,BookOpen,Check,CheckCircle2,ChevronRight,Compass,Crown,Download,GraduationCap,Headphones,Home,LockKeyhole,LogOut,MapPinned,Medal,Play,Plus,RefreshCw,School,Settings,ShieldCheck,Ship, Sparkles,Star, Trophy,Volume2,VolumeX,WandSparkles,XCircle,X,BarChart3,Flag,Map as MapIcon,Gift,Users} from 'lucide-react';
import {CultureArt,ExplorerHero,IndonesiaMap} from './Art';
import TeacherPortal from './TeacherPortal';
import SuperAdminTeachers from './SuperAdminTeachers';
import './teacher.css';
import {quizSound} from './sounds';
import {gradeTopics,grades,islandData,makeMission,topicChips,type Question,type Student,type SchoolConfig} from './learning';
type View='home'|'materi'|'peringkat'|'pencapaian'|'quiz'|'result'|'admin'|'teacher';
type ClassInvite={token:string;grade:string;label:string;teacherName:string};
const pathJoinToken=()=>window.location.pathname.match(/^\/gabung\/([a-f0-9]{48})\/?$/)?.[1]||null;
const isJoinPath=()=>window.location.pathname.startsWith('/gabung/');
const api=async(path:string,options:RequestInit={})=>{
 const response=await fetch('/api/'+path,{credentials:'same-origin',cache:'no-store',...options,headers:{'Content-Type':'application/json',...options.headers}});
 let data:any;try{data=await response.json()}catch{throw Error('Server tidak mengembalikan respons JSON.')}
 if(!response.ok)throw Error(String(data.error||'HTTP '+response.status));return data;
};
function download(blob:Blob,file:string){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=file;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function videoId(url:string){try{const u=new URL(url);if(u.hostname==='youtu.be')return u.pathname.slice(1,12);if(['www.youtube.com','youtube.com','m.youtube.com'].includes(u.hostname))return(u.searchParams.get('v')||u.pathname.split('/embed/')[1]||'').slice(0,11)}catch{}return null}
const quote=['Matematika itu seru!','Kamu hebat! Terus berlatih, ya!','Setiap soal adalah petualangan baru!','Mari belajar sambil mengenal budaya Indonesia!'];
const emptyQuestion=(grade='Kelas 1'):Question=>({grade,topic:gradeTopics[grade]?.[0]||'',cultureId:'sumatra',question:'',options:['','','',''],answer:'',explanation:'',imageUrl:'',videoUrl:'',audioUrl:'',active:true});
export default function App(){
 const[view,setView]=useState<View>(()=>window.location.pathname==='/admin'?'admin':window.location.pathname==='/guru'?'teacher':'home');
 const[adminSetup,setAdminSetup]=useState<boolean|null>(null);
 const[chosenGrade,setChosenGrade]=useState('Kelas 1'),[student,setStudent]=useState<Student|null>(null),[name,setName]=useState(''),[modal,setModal]=useState(false);
 const[invite,setInvite]=useState<ClassInvite|null>(null),[inviteStatus,setInviteStatus]=useState<'none'|'loading'|'valid'|'invalid'>(()=>isJoinPath()?'loading':'none');
 const[school,setSchool]=useState<SchoolConfig>({name:'Nusantara Math Adventure',music:true,logoUrl:''});
 const[error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false);
 const[island,setIsland]=useState(0),[questions,setQuestions]=useState<Question[]>([]),[questionIndex,setQuestionIndex]=useState(0),[answer,setAnswer]=useState(''),[correct,setCorrect]=useState(0),[awardedXP,setAwardedXP]=useState(0);
 const[admin,setAdmin]=useState(false),[password,setPassword]=useState(''),[students,setStudents]=useState<Student[]>([]),[bank,setBank]=useState<Question[]>([]);
 const[filter,setFilter]=useState('Semua'),[query,setQuery]=useState(''),[draft,setDraft]=useState<Question>(()=>emptyQuestion()),[adding,setAdding]=useState(false);
 const[questionGrade,setQuestionGrade]=useState('Semua'),[questionTopic,setQuestionTopic]=useState('Semua'),[questionSearch,setQuestionSearch]=useState(''),[questionRegion,setQuestionRegion]=useState('Semua'),[confirmDelete,setConfirmDelete]=useState<string|null>(null),[questionPage,setQuestionPage]=useState(1);
 const[modeGrade,setModeGrade]=useState('Kelas 1'),[modeCulture,setModeCulture]=useState('sumatra'),[modeValue,setModeValue]=useState<'mixed'|'manual'>('mixed'),[modeLoading,setModeLoading]=useState(false);
 const[aiGrade,setAiGrade]=useState('Kelas 1'),[aiTopic,setAiTopic]=useState(gradeTopics['Kelas 1'][0]),[aiRegion,setAiRegion]=useState('Sumatra'),[aiBusy,setAiBusy]=useState(false);
 const[music,setMusic]=useState(false),[voice,setVoice]=useState(false);
 const audioRef=useRef<HTMLAudioElement|null>(null),mapRef=useRef<HTMLElement|null>(null);
 const rank=student?(student.completed.length>=7?'Penjelajah Nusantara':student.completed.length>=4?'Pelaut Emas':student.completed.length>=1?'Petualang Hebat':'Petualang Baru'):'Ayo Jadi Petualang';
 const daily=student?.recent.some(x=>new Date(x.date).toDateString()===new Date().toDateString())??false;
 const sample=islandData[0];
 const gradeIndex=Number(chosenGrade.replace('Kelas ','')),profileGrade=student?.grade??chosenGrade;
 useEffect(()=>{api('school').then((r)=>setSchool(r.school)).catch(()=>{});
  const token=pathJoinToken();
  if(isJoinPath()){
   if(!token){setInviteStatus('invalid');setError('Alamat kelas tidak valid. Mintalah tautan baru dari guru.');return}
   api('invite/'+token).then(r=>{setInvite(r.invite);setInviteStatus('valid');setChosenGrade(r.invite.grade);setModal(true);setNotice('Tautan kelas '+r.invite.label+' dari '+r.invite.teacherName+' berhasil dibuka.');}).catch(e=>{setInviteStatus('invalid');setError(e.message)});
  }
  const saved=localStorage.getItem('nma-student-id'),savedToken=localStorage.getItem('nma-student-invite');
  if(isJoinPath()&&savedToken!==token)return;
  if(saved&&/^[a-f0-9]{32}$/.test(saved))api('progress/'+saved).then((r)=>{
   if(r.progress&&grades.includes(r.progress.grade)&&(!token||r.progress.inviteToken===token)){
    setStudent(r.progress);setName(r.progress.name);setChosenGrade(r.progress.grade);if(token)setModal(false);
   }else if(!token)localStorage.removeItem('nma-student-id');
  }).catch(()=>{});
 },[]);
 useEffect(()=>{if(!audioRef.current)return;if(music)audioRef.current.play().catch(()=>{setMusic(false);setNotice('Musik belum tersedia. Narasi suara tetap bisa digunakan.');});else audioRef.current.pause()},[music]);
 useEffect(()=>{if(view!=='admin'||!admin)return;loadAdmin();const timer=setInterval(loadAdmin,8000);return()=>clearInterval(timer)},[view,admin]);
 useEffect(()=>{const pop=()=>setView(window.location.pathname==='/admin'?'admin':window.location.pathname==='/guru'?'teacher':'home');window.addEventListener('popstate',pop);return()=>window.removeEventListener('popstate',pop)},[]);
 useEffect(()=>{if(view!=='admin')return;api('health').then(r=>setAdminSetup(Boolean(r.admin))).catch(()=>setAdminSetup(null));api('admin/session').then(r=>setAdmin(Boolean(r.user))).catch(()=>setAdmin(false))},[view]);
 useEffect(()=>{if(view!=='admin'||!admin)return;let cancelled=false;setModeLoading(true);api('public/mission-config?grade='+encodeURIComponent(modeGrade)+'&culture='+encodeURIComponent(modeCulture)).then(r=>{if(!cancelled)setModeValue(r.mode==='manual'?'manual':'mixed')}).catch(e=>{if(!cancelled)setError(e.message)}).finally(()=>{if(!cancelled)setModeLoading(false)});return()=>{cancelled=true}},[view,admin,modeGrade,modeCulture]);
 function say(t:string){if(!voice||!('speechSynthesis'in window))return;window.speechSynthesis.cancel();const utter=new SpeechSynthesisUtterance(t);utter.lang='id-ID';utter.rate=.87;window.speechSynthesis.speak(utter)}
 function navigate(next:View){setView(next);setError('');const target=next==='admin'?'/admin':next==='teacher'?'/guru':invite&&inviteStatus==='valid'?'/gabung/'+invite.token:'/';if(window.location.pathname!==target)window.history.pushState({page:next},'',target);window.scrollTo({top:0,behavior:'smooth'});}
 function openAdmin(){navigate('admin');}
 function openTeacher(){navigate('teacher');}
 function mapScroll(){setView('home');setTimeout(()=>mapRef.current?.scrollIntoView({behavior:'smooth',block:'center'}),100)}
 function levelPick(g:string){if(invite&&g!==invite.grade){setNotice('Kelas sudah ditentukan oleh tautan guru: '+invite.grade+'.');return}if(student&&student.grade!==g){setNotice('Untuk mengganti kelas, keluar dari profil siswa terlebih dahulu.');return}setChosenGrade(g)}
 function needStudent(){if(student)return true;if(isJoinPath()&&inviteStatus!=='valid'){setError('Tautan kelas harus diverifikasi. Mintalah tautan baru jika sudah ditutup.');return false}setModal(true);setNotice('Masukkan nama dan kelas untuk menyimpan petualanganmu.');return false}
 async function enroll(){const clean=name.trim();if(clean.length<2){setError('Tuliskan nama siswa sedikitnya 2 huruf.');return}if(!grades.includes(chosenGrade)){setError('Pilih kelas SD 1 sampai 6.');return}
 if(isJoinPath()&&(!invite||inviteStatus!=='valid')){setError('Tautan kelas tidak tersedia. Mintalah tautan aktif dari guru.');return}
 setBusy(true);setError('');
 try{let saved:Student;
  if(invite&&inviteStatus==='valid'){
   const r=await api('enroll',{method:'POST',body:JSON.stringify({token:invite.token,name:clean})});
   saved=r.progress;localStorage.setItem('nma-student-invite',invite.token);
  }else{
   const id=Array.from(crypto.getRandomValues(new Uint8Array(16))).map(x=>x.toString(16).padStart(2,'0')).join('');
   const p:Student={id,name:clean,grade:chosenGrade,xp:0,gamesPlayed:0,completed:[],recent:[]};
   const r=await api('progress/'+id,{method:'PUT',body:JSON.stringify(p)});
   saved=r.progress||p;localStorage.removeItem('nma-student-invite');
  }
  localStorage.setItem('nma-student-id',saved.id);setStudent(saved);setChosenGrade(saved.grade);setModal(false);setNotice('Selamat datang, '+clean+'! Progresmu akan tercatat untuk guru kelas.');say('Selamat datang di Nusantara Math Adventure!');
 }catch(e:any){setError(e.message)}finally{setBusy(false)}}
 function signout(){localStorage.removeItem('nma-student-id');localStorage.removeItem('nma-student-invite');setStudent(null);setName('');setMusic(false);navigate('home')}
 async function startMission(i:number){if(!needStudent())return;const s=student!;setBusy(true);setError('');
 try{const [r,config]=await Promise.all([api('public/questions?grade='+encodeURIComponent(s.grade)),api('public/mission-config?grade='+encodeURIComponent(s.grade)+'&culture='+islandData[i].id)]);const topic=gradeTopics[s.grade][i];
  const fromBank:(Question[])=(r.questions||[]).filter((q:Question)=>(!q.topic||q.topic===topic)&&(!q.cultureId||q.cultureId===islandData[i].id));
  const qs=config.mode==='manual'?fromBank.slice(0,8):[...fromBank.slice(0,3),...makeMission(s.grade,i,8)].slice(0,8);
  if(qs.length<1)throw Error('Belum ada soal aktif untuk '+s.grade+' di '+islandData[i].name+'. Hubungi guru untuk mengisi Bank Soal.');
  setIsland(i);setQuestions(qs);setQuestionIndex(0);setAnswer('');setCorrect(0);navigate('quiz');say('Selamat datang di '+islandData[i].name+'. '+islandData[i].fact+' Pertanyaan pertama. '+qs[0].question);
 }catch(e:any){setError(e.message)}finally{setBusy(false)}}
 async function finish(){if(!student)return;const wasDone=student.completed.includes(island+1),earned=correct*25+(wasDone?0:50)+(daily?0:20),completed=[...new Set([...student.completed,island+1])];
 const p:Student={...student,completed,xp:student.xp+earned,gamesPlayed:student.gamesPlayed+1,recent:[...student.recent,{region:islandData[island].name,score:correct,total:questions.length,date:new Date().toISOString()}].slice(-25)};
 setAwardedXP(earned);setStudent(p);navigate('result');try{const r=await api('progress/'+p.id,{method:'PUT',body:JSON.stringify(p)});setStudent(r.progress||p);setNotice('Hasil petualangan tersimpan!')}catch(e:any){setError('Progres belum tersinkron: '+e.message)}}
 async function loginAdmin(){setBusy(true);setError('');try{const r=await api('admin/login',{method:'POST',body:JSON.stringify({password})});if(!r.user)throw Error('Login tidak berhasil');setAdmin(true);setPassword('');await loadAdmin()}catch(e:any){setError(e.message)}finally{setBusy(false)}}
 async function loadAdmin(){try{const [m,b]=await Promise.all([api('admin/monitor'),api('admin/questions')]);setStudents(m.students||[]);setBank(b.questions||[]);setAdmin(true)}catch(e:any){setError(e.message);if(e.message.toLowerCase().includes('login'))setAdmin(false)}}
 async function logoutAdmin(){await api('admin/logout',{method:'POST'}).catch(()=>{});setAdmin(false);setStudents([]);setBank([]);navigate('home')}
 async function refreshQuestions(){const result=await api('admin/questions');setBank(result.questions||[]);return result.questions as Question[]}
 function openNewQuestion(){const grade=questionGrade==='Semua'?'Kelas 1':questionGrade;setDraft(emptyQuestion(grade));setConfirmDelete(null);setAdding(true);setTimeout(()=>document.getElementById('soal-editor')?.scrollIntoView({behavior:'smooth',block:'start'}),60)}
 function editQuestion(q:Question){setDraft({...q,grade:q.grade||'Kelas 1',topic:gradeTopics[q.grade||'Kelas 1']?.includes(q.topic||'')?q.topic:gradeTopics[q.grade||'Kelas 1']?.[0]||'',cultureId:q.cultureId||'sumatra',options:[...q.options],active:q.active!==false});setAdding(true);setConfirmDelete(null);setTimeout(()=>document.getElementById('soal-editor')?.scrollIntoView({behavior:'smooth',block:'start'}),60)}
 async function submitQuestion(){setBusy(true);setError('');try{
  const isEdit=Boolean(draft.id),path=isEdit?'admin/questions/'+encodeURIComponent(draft.id!):'admin/questions';
  await api(path,{method:isEdit?'PUT':'POST',body:JSON.stringify({question:draft})});
  await refreshQuestions();setAdding(false);setDraft(emptyQuestion(questionGrade==='Semua'?'Kelas 1':questionGrade));
  setNotice(isEdit?'Perubahan soal berhasil disimpan.':'Soal baru berhasil ditambahkan ke bank soal.');
 }catch(e:any){setError(e.message)}finally{setBusy(false)}}
 async function deleteQuestion(q:Question){if(!q.id)return setError('ID soal tidak ditemukan.');setBusy(true);setError('');try{
  await api('admin/questions/'+encodeURIComponent(q.id),{method:'DELETE'});
  await refreshQuestions();setConfirmDelete(null);if(draft.id===q.id){setAdding(false);setDraft(emptyQuestion())}
  setNotice('Soal berhasil dihapus dari bank soal.');
 }catch(e:any){setError(e.message)}finally{setBusy(false)}}
 async function generateAI(){if(!aiTopic.trim())return setError('Pilih topik soal terlebih dahulu.');setAiBusy(true);setError('');try{
  const r=await api('admin/generate',{method:'POST',body:JSON.stringify({grade:aiGrade,topic:aiTopic,region:aiRegion})});
  const zone=islandData.find(i=>i.name===aiRegion)||islandData[0];
  const items:Question[]=(r.questions||[]).map((q:Question)=>({...q,grade:aiGrade,topic:aiTopic,cultureId:zone.id,active:true}));
  if(!items.length)throw Error('AI belum menghasilkan soal valid.');
  const saved=await api('admin/questions/bulk',{method:'POST',body:JSON.stringify({questions:items})});
  await refreshQuestions();setNotice(saved.count+' soal AI berhasil ditambahkan. Periksa kunci dan pembahasannya sebelum digunakan.');
 }catch(e:any){setError(e.message)}finally{setAiBusy(false)}}
 async function saveMode(){setBusy(true);setError('');try{
  await api('admin/mission-config',{method:'PUT',body:JSON.stringify({grade:modeGrade,culture:modeCulture,mode:modeValue})});
  setNotice('Pengaturan sumber soal '+modeGrade+' di '+islandData.find(z=>z.id===modeCulture)?.name+' berhasil disimpan.');
 }catch(e:any){setError(e.message)}finally{setBusy(false)}}
 async function importStarterQuestions(){const stage=islandData.findIndex(z=>z.id===modeCulture);if(stage<0)return;
  setBusy(true);setError('');try{
   const questions=makeMission(modeGrade,stage,8).map(q=>({...q,active:true}));
   const result=await api('admin/questions/bulk',{method:'POST',body:JSON.stringify({questions})});
   await refreshQuestions();
   setQuestionGrade(modeGrade);setQuestionTopic(gradeTopics[modeGrade][stage]);setQuestionRegion(modeCulture);setQuestionPage(1);
   setNotice(result.count+' soal latihan bawaan berhasil diimpor ke Bank Soal, sekarang bisa diedit atau dihapus.');
  }catch(e:any){setError(e.message)}finally{setBusy(false)}}
 async function saveSchool(){try{const r=await api('school',{method:'PUT',body:JSON.stringify(school)});setSchool(r.school);setNotice('Identitas sekolah disimpan.')}catch(e:any){setError(e.message)}}
 async function excel(){try{const {default:ExcelJS}=await import('exceljs');const wb=new ExcelJS.Workbook();const ws=wb.addWorksheet('Perkembangan Siswa');ws.addRow(['Nama','Kelas','XP','Pulau','Misi dimainkan','Diperbarui']);students.forEach(s=>ws.addRow([s.name,s.grade,s.xp,s.completed.length,s.gamesPlayed,s.updatedAt||'']));download(new Blob([await wb.xlsx.writeBuffer()],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),'laporan-nusantara-sd.xlsx')}catch(e:any){setError('Ekspor Excel gagal: '+e.message)}}
 async function pdf(){try{const {jsPDF}=await import('jspdf');const d=new jsPDF();d.setFontSize(18);d.text('Laporan Petualangan Matematika SD',14,20);d.setFontSize(10);let y=33;students.forEach((s,i)=>{if(y>274){d.addPage();y=20}d.text((i+1)+'. '+s.name+' | '+s.grade+' | '+s.xp+' XP | '+s.completed.length+'/7 pulau',14,y);y+=7});d.save('laporan-nusantara-sd.pdf')}catch(e:any){setError(e.message)}}
 async function certificate(){if(!student)return;const {jsPDF}=await import('jspdf');const d=new jsPDF({orientation:'landscape'});d.setFillColor(25,107,170);d.rect(0,0,297,210,'F');d.setDrawColor(255,207,89);d.setLineWidth(3);d.rect(12,12,273,186);d.setTextColor(255,235,156);d.setFontSize(34);d.text('SERTIFIKAT PETUALANGAN',148,57,{align:'center'});d.setTextColor(255,255,255);d.setFontSize(24);d.text(student.name,148,94,{align:'center'});d.setFontSize(15);d.text(student.grade+'  •  '+student.completed.length+' pulau  •  '+student.xp+' XP',148,123,{align:'center'});d.text('NUSANTARA MATH ADVENTURE SD',148,174,{align:'center'});d.save('sertifikat-'+student.name.replace(/[^a-zA-Z0-9]/g,'-')+'.pdf')}
 const visible=students.filter(s=>grades.includes(s.grade)&&(filter==='Semua'||s.grade===filter)&&s.name.toLowerCase().includes(query.toLowerCase()));
 const filteredQuestions=bank.filter(q=>(questionGrade==='Semua'||q.grade===questionGrade)&&(questionTopic==='Semua'||q.topic===questionTopic)&&(questionRegion==='Semua'||q.cultureId===questionRegion)&&(!questionSearch||[q.question,q.explanation,...q.options].join(' ').toLowerCase().includes(questionSearch.toLowerCase())));
 const pageCount=Math.max(1,Math.ceil(filteredQuestions.length/12)),safePage=Math.min(questionPage,pageCount),pagedQuestions=filteredQuestions.slice((safePage-1)*12,safePage*12);
 return <div className="app-shell">
  <audio ref={audioRef} src="/resources/nusantara-ceria.wav" loop preload="none"/>
  <header className="topbar">
   <button className="brand" onClick={()=>navigate('home')} aria-label="Beranda Nusantara Math Adventure"><span className="wheel">🧭</span><span><b>Nusantara</b><strong>Math Adventure</strong></span></button>
   <nav className="topnav" aria-label="Menu utama">
    <button className={view==='home'?'active':''} onClick={()=>navigate('home')}><Home size={17}/> Beranda</button>
    <button onClick={mapScroll}><MapIcon size={18}/> Peta Petualangan</button>
    <button className={view==='materi'?'active':''} onClick={()=>navigate('materi')}><BookOpen size={17}/> Materi</button>
    <button className={view==='quiz'?'active':''} onClick={()=>startMission(Math.max(0,(student?.completed.length||0)%7))}><Play size={17}/> Latihan & Kuis</button>
    <button className={view==='peringkat'?'active':''} onClick={()=>navigate('peringkat')}><Trophy size={17}/> Peringkat</button>
    <button className={view==='pencapaian'?'active':''} onClick={()=>navigate('pencapaian')}><Star size={17}/> Pencapaian</button>
   </nav>
   <div className="top-actions"><button className="audio-toggle" title="Narasi bahasa Indonesia" onClick={()=>setVoice(x=>!x)}>{voice?<Headphones size={19}/>:<VolumeX size={19}/>}</button><button className="audio-toggle" title="Musik" onClick={()=>setMusic(x=>!x)}>{music?<Volume2 size={19}/>:<VolumeX size={19}/>}</button><button className="teacher-header" onClick={openTeacher} aria-label="Masuk ke portal guru"><GraduationCap size={17}/><span>Masuk Guru</span></button><button className="admin-header" onClick={openAdmin} aria-label="Masuk ke portal super admin"><ShieldCheck size={17}/><span>Super Admin</span></button>{student?<button className="user-pill" onClick={()=>navigate('pencapaian')}>👦 {student.name.split(' ')[0]}</button>:<button className="user-pill" onClick={()=>setModal(true)}>👤 Masuk Siswa</button>}</div>
  </header>
  {error&&<div role="alert" className="flash err"><XCircle size={16}/>{error}<button onClick={()=>setError('')} aria-label="Tutup">×</button></div>}
  {notice&&<div className="flash ok"><CheckCircle2 size={16}/>{notice}<button onClick={()=>setNotice('')} aria-label="Tutup">×</button></div>}
  {view==='home'&&<main>
   {inviteStatus==='loading'&&<section className="student-invite-banner"><span>📚</span><div><strong>Memeriksa tautan kelas dari guru…</strong><p>Data kelompok sedang diverifikasi oleh server.</p></div></section>}
   {inviteStatus==='invalid'&&<section className="student-invite-banner invalid"><span>⚠️</span><div><strong>Tautan kelas tidak aktif atau tidak dikenali</strong><p>Minta guru membagikan tautan kelas yang baru. Jangan masuk melalui tautan kelas lain.</p></div></section>}
   {invite&&inviteStatus==='valid'&&<section className="student-invite-banner"><span>👩‍🏫</span><div><strong>Selamat datang di {invite.label} ({invite.grade})</strong><p>Guru: {invite.teacherName}. Masuk dengan nama tanpa PIN; hasil belajarmu hanya tercatat di kelompok guru ini.</p></div><button className="big-primary" onClick={()=>setModal(true)}>Masuk Kelas</button></section>}
   <section className="banner"><ExplorerHero/><div className="banner-copy"><div className="wood">Nusantara Math Adventure</div><h1>Ayo Belajar Matematika<br/><span>Keliling Nusantara!</span></h1><p>Jelajahi pulau-pulau Indonesia, kenali budayanya,<br/>selesaikan misi matematika, dan kumpulkan bintang!</p></div><button className="start-hero" onClick={()=>{if(!student)setModal(true);else mapScroll()}}><Play size={25} fill="currentColor"/> Mulai Petualangan</button></section>
   <div className="main-width">
    <section className="class-strip"><div className="class-label">🎓 <b>Pilih Kelasmu<small>(SD Kelas 1–6)</small></b></div><div className="class-buttons">{grades.map((g,i)=><button key={g} style={{'--grade-color':['#ff4f8d','#ff893a','#ffcb39','#76c94c','#279cfa','#a75bf3'][i]} as CSSProperties} className={chosenGrade===g?'selected':''} onClick={()=>levelPick(g)}>{g}</button>)}</div></section>
    <section className="topic-strip" aria-label="Topik Matematika SD">{topicChips.map(([emoji,label])=><button key={label} onClick={()=>navigate('materi')}><span>{emoji}</span>{label}</button>)}</section>
    <div className="game-layout">
     <aside className="player-card">
      <div className="player-name"><div className="avatar">👧🏽</div><div><small>Halo, Petualang! 👋</small><b>{student?.name||'Sahabat Nusantara'}</b><span>SD {profileGrade}</span></div></div>
      <div className="level-card"><div className="level-label"><span>🌟</span><div><b>Level {student?Math.floor(student.xp/250)+1:1}</b><small>{rank}</small></div></div><div className="progress-rail"><div style={{width:((student?.xp||0)%250)/250*100+'%'}}/></div><small>{student?.xp||0} XP • Menuju level berikutnya</small></div>
      <div className="stats"><div><span>⭐ Bintang</span><b>{student?Math.floor(student.xp/25):0}</b></div><div><span>🏅 Lencana</span><b>{student?.completed.length||0}</b></div><div><span>🚩 Misi Selesai</span><b>{student?.completed.length||0} / 7</b></div></div>
      <div className="daily-card"><b>🎯 Target Petualangan</b><p>Selesaikan tujuh misi pulau untuk menjadi Penjelajah Nusantara!</p><div className="progress-rail"><div style={{width:((student?.completed.length||0)/7*100)+'%'}}/></div><small>{student?.completed.length||0}/7 pulau • {daily?'Misi hari ini selesai ✅':'Misi harian menunggu ✨'}</small></div>
      <button className="profile-action" onClick={()=>student?navigate('pencapaian'):setModal(true)}>{student?'Lihat Pencapaian':'Masuk sebagai Siswa'} <ChevronRight size={15}/></button>
     </aside>
     <section className="map-card" ref={mapRef} id="peta"><div className="map-heading"><h2>🧭 Peta Petualangan Nusantara</h2><small>Klik pin pulau untuk bermain</small></div><IndonesiaMap completed={student?.completed||[]} onSelect={startMission}/><div className="map-foot"><span>⛵ Kapalmu siap berlayar!</span><span>7 Pulau • 7 Budaya • 7 Misi</span></div></section>
     <aside className="sample-card"><h2>🎮 Contoh Misi Matematika</h2><CultureArt id={sample.id}/><div className="sample-text"><small>🏡 DARI PULAU SUMATRA</small><p>Di halaman Rumah Gadang ada <b>8 anak</b> sedang menari Tari Piring. Kemudian, <b>4 anak</b> lagi ikut menari.</p><strong>Berapa jumlah anak yang menari sekarang?</strong></div><div className="sample-options">{['10','11','12','13'].map((v,i)=><button key={v} onClick={()=>{setNotice(i===2?'Benar! 8 + 4 = 12. Hebat! 🎉':'Coba lagi. Jumlahkan 8 dan 4, ya!')}}><b>{String.fromCharCode(65+i)}</b>{v}</button>)}</div><button className="sample-cta" onClick={()=>startMission(0)}>Coba misi Sumatra <Play size={15}/></button></aside>
    </div>
    <section className="culture-section"><div className="wood-label">🌺 Kenali Budaya Nusantara di Setiap Misi!</div><div className="culture-cards">{islandData.map((item,i)=><button className="culture-tile" key={item.id} onClick={()=>startMission(i)}><CultureArt id={item.id} label={false}/><strong>{item.name}</strong><span>{item.culture}</span></button>)}</div></section>
    <div className="after-story"><div><b>🧩 Belajar sambil bermain</b><p>Setiap soal disertai ilustrasi budaya, pembahasan matematika, dan cerita tentang daerah di Indonesia.</p></div><button onClick={()=>navigate('materi')}>Lihat Materi SD <ChevronRight size={17}/></button></div>
   </div>
  </main>}
  {view==='materi'&&<main className="inner-page"><button className="back-link" onClick={()=>navigate('home')}><ArrowLeft size={16}/> Beranda</button><span className="section-tag">📚 KURIKULUM MERDEKA · SEKOLAH DASAR</span><h1>Materi Matematika SD</h1><p>Pilih kelas dan pelajari tujuh topik matematika melalui kisah dari berbagai pulau Indonesia.</p><div className="class-buttons inline">{grades.map((g,i)=><button key={g} style={{'--grade-color':['#ff4f8d','#ff893a','#ffcb39','#76c94c','#279cfa','#a75bf3'][i]} as CSSProperties} className={chosenGrade===g?'selected':''} onClick={()=>levelPick(g)}>{g}</button>)}</div><div className="lesson-grid">{gradeTopics[chosenGrade].map((topic,i)=><article key={topic} className="lesson-card"><CultureArt id={islandData[i].id} label={false}/><div><small>📍 {islandData[i].name} · MISI {i+1}</small><h3>{topic}</h3><p>{islandData[i].fact}</p><button onClick={()=>startMission(i)}>Mulai Latihan <ChevronRight size={15}/></button></div></article>)}</div></main>}
  {view==='peringkat'&&<main className="inner-page"><button className="back-link" onClick={()=>navigate('home')}><ArrowLeft size={16}/> Beranda</button><span className="section-tag">🏆 PERINGKAT PETUALANG</span><h1>Perjalanan Para Juara</h1><div className="achievement-hero"><span>🏅</span><div><h2>Setiap Anak Bisa Jadi Juara!</h2><p>Perbandingan pribadi: tingkatkan XP dan selesaikan lebih banyak pulau. Data pribadi peserta lain tidak ditampilkan untuk menjaga privasi anak.</p></div></div><div className="achievement-grid"><div><b>{student?.xp||0} XP</b><small>XP milikmu</small></div><div><b>{student?.gamesPlayed||0}</b><small>Latihan selesai</small></div><div><b>{student?.completed.length||0}/7</b><small>Pulau ditaklukkan</small></div></div>{!student&&<button className="big-primary" onClick={()=>setModal(true)}>Masuk untuk Melihat Kemajuan</button>}</main>}
  {view==='pencapaian'&&<main className="inner-page"><button className="back-link" onClick={()=>navigate('home')}><ArrowLeft size={16}/> Beranda</button><span className="section-tag">⭐ KOLEKSI PENGHARGAAN</span><h1>Galeri Pencapaian</h1><p>{student?'Selamat, '+student.name+'! Lihat bintang dan lencana yang telah kamu peroleh.':'Masuk untuk menyimpan pencapaian petualanganmu.'}</p><div className="achievement-grid">{[0,1,2,3,4,5,6].map(i=><div key={i} className={!student?.completed.includes(i+1)?'locked':''}><span className="big-emoji">{student?.completed.includes(i+1)?'🌟':'🔒'}</span><b>{islandData[i].name}</b><small>{student?.completed.includes(i+1)?'Misi selesai!':'Belum dijelajahi'}</small></div>)}</div>{student?<div className="profile-buttons"><button className="big-primary" onClick={certificate}><Download size={17}/> Unduh Sertifikat PDF</button><button onClick={signout} className="outline-button"><LogOut size={16}/> Keluar Profil</button></div>:<button className="big-primary" onClick={()=>setModal(true)}>Masuk Sekarang</button>}</main>}
  {view==='quiz'&&questions.length>0&&<main className="quiz-page"><button className="back-link" onClick={()=>navigate('home')}><ArrowLeft size={16}/> Kembali ke Peta</button><div className="quiz-heading"><div><span>🧭 MISI PULAU {islandData[island].name.toUpperCase()}</span><h1>{gradeTopics[chosenGrade][island]}</h1><p>Kenali budaya {islandData[island].name}, selesaikan soal, kumpulkan bintang!</p></div><div className="round-badge">⭐ {correct} benar</div></div><div className="quiz-track"><div style={{width:((questionIndex+1)/questions.length*100)+'%'}}/></div>
   <div className="quiz-columns"><section className="quiz-scene"><CultureArt id={islandData[island].id}/><h2>🌺 Tahukah Kamu?</h2><p>{islandData[island].fact}</p><div className="info-tip">🎓 Selesaikan {questions.length} soal untuk mendapat hadiah XP dan bintang.</div></section><section className="quiz-paper"><div className="quiz-top"><span>SOAL {questionIndex+1} DARI {questions.length}</span><span>{chosenGrade}</span></div><h2>{questions[questionIndex].question}</h2>
   {questions[questionIndex].imageUrl&&/^https:\/\//.test(questions[questionIndex].imageUrl!)&&<img className="extra-media" src={questions[questionIndex].imageUrl} alt="Ilustrasi tambahan soal" loading="lazy"/>}
   {questions[questionIndex].videoUrl&&videoId(questions[questionIndex].videoUrl!)&&<iframe className="extra-media video" src={'https://www.youtube-nocookie.com/embed/'+videoId(questions[questionIndex].videoUrl!)} title="Video pelajaran" allowFullScreen/>}
   {questions[questionIndex].audioUrl&&/^https:\/\//.test(questions[questionIndex].audioUrl!)&&<audio controls src={questions[questionIndex].audioUrl}/>}
   <div className="answer-choices">{questions[questionIndex].options.map((option,i)=><button key={i} disabled={!!answer} className={answer?(option===questions[questionIndex].answer?'right':option===answer?'not-right':''):''} onClick={()=>{setAnswer(option);quizSound(option===questions[questionIndex].answer);if(option===questions[questionIndex].answer)setCorrect(x=>x+1);say(option===questions[questionIndex].answer?'Benar! Kamu hebat!':'Coba lagi besok ya. Perhatikan pembahasan.')}}><span>{String.fromCharCode(65+i)}</span><b>{option}</b>{answer&&option===questions[questionIndex].answer&&<Check size={21}/>}</button>)}</div>
   {answer&&<div className="quiz-explanation"><b>{answer===questions[questionIndex].answer?'🎉 Hebat, jawabanmu benar!':'💡 Ayo pahami pembahasannya!'}</b><p>{questions[questionIndex].explanation}</p></div>}
   <button className="big-primary next-btn" disabled={!answer} onClick={()=>{if(questionIndex+1===questions.length)finish();else{setQuestionIndex(questionIndex+1);setAnswer('');say('Pertanyaan berikutnya. '+questions[questionIndex+1].question)}}}>{questionIndex+1===questions.length?'Selesaikan Misi! 🎉':'Lanjut Soal Berikutnya'} <ChevronRight size={18}/></button></section></div>
  </main>}
  {view==='result'&&<main className="inner-page result-page"><div className="result-cup">🏆</div><span className="section-tag">MISI SUKSES!</span><h1>Hebat, {student?.name.split(' ')[0]}!</h1><p>Kamu menyelesaikan petualangan di Pulau {islandData[island].name}.</p><div className="result-number">{correct} <small>dari {questions.length} soal benar</small></div><div className="result-stars">🌟 +{awardedXP} XP diperoleh</div><p>{islandData[island].fact}</p><div className="profile-buttons"><button className="big-primary" onClick={()=>navigate('home')}>🗺️ Kembali ke Peta</button><button className="outline-button" onClick={()=>startMission(island)}><RefreshCw size={16}/> Ulangi Misi</button><button className="outline-button" onClick={certificate}><Download size={16}/> Sertifikat</button></div></main>}
  {view==='teacher'&&<TeacherPortal onHome={()=>navigate('home')}/>}
  {view==='admin'&&<main className="inner-page admin-page"><button className="back-link" onClick={()=>navigate('home')}><ArrowLeft size={16}/> Kembali ke beranda</button><span className="section-tag"><ShieldCheck size={17}/> HAK AKSES PENUH · SUPER ADMIN</span><h1>Dashboard Super Admin</h1><p>Kelola seluruh akun guru, tautan kelas, progres siswa, bank soal, dan pengaturan aplikasi.</p>
   {!admin?<div className="admin-login"><div className="login-mascot">🔐</div><h2>Masuk sebagai Super Admin</h2><p>Hak akses penuh hanya untuk Super Admin. Guru masuk melalui portal <a href="/guru">Masuk Guru</a> dengan akun tersendiri.</p>{adminSetup===false&&<div className="admin-setup-warning"><b>⚠️ Login admin belum diaktifkan</b><p>Atur <code>ADMIN_PASSWORD</code> (minimal 8 karakter) dan <code>SESSION_SECRET</code> (minimal 32 karakter acak) pada Vercel → Settings → Environment Variables → Production. Lakukan redeploy setelah menyimpan. Jangan taruh kata sandi dalam kode GitHub.</p><a href="https://vercel.com/elsyarif2021s-projects/nusantara-math-advanture/settings/environment-variables" target="_blank" rel="noopener noreferrer">Buka Pengaturan Vercel ↗</a></div>}{adminSetup===true&&<p className="admin-ready-label">✅ Sistem login administrator siap dipakai.</p>}<label>Kata Sandi Admin<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Kata sandi administrator" autoComplete="current-password" onKeyDown={e=>e.key==='Enter'&&loginAdmin()}/></label><button disabled={busy||adminSetup===false} className="big-primary" onClick={loginAdmin}>{busy?'Memeriksa…':'Masuk Dashboard Admin'}</button><p className="admin-login-footnote">Siswa tetap masuk menggunakan nama dan kelas tanpa PIN.</p></div>:
   <div className="admin-section"><div className="admin-bar"><b>🟢 Super Admin terhubung</b><div className="row-buttons"><button onClick={()=>document.getElementById('super-teachers')?.scrollIntoView({behavior:'smooth'})}><Users size={16}/> Kelola Guru</button><button onClick={()=>document.getElementById('pengaturan-soal')?.scrollIntoView({behavior:'smooth'})}><Settings size={16}/> Pengaturan Soal</button><button onClick={logoutAdmin}><LogOut size={16}/> Keluar admin</button></div></div><div className="achievement-grid admin-stats"><div><b>{students.filter(s=>grades.includes(s.grade)).length}</b><small>Siswa SD terpantau</small></div><div><b>{bank.length}</b><small>Butir soal</small></div><div><b>{students.reduce((a,s)=>a+s.xp,0)}</b><small>Total XP</small></div></div>
    <SuperAdminTeachers/>
    <section className="admin-box"><div className="admin-title"><div><h2>📊 Pemantauan Seluruh Siswa</h2><p>Data diperbarui setiap 8 detik.</p></div><div className="row-buttons"><button onClick={loadAdmin}><RefreshCw size={15}/> Segarkan</button><button onClick={excel}><Download size={15}/> Excel</button><button onClick={pdf}><Download size={15}/> PDF</button></div></div><div className="row-buttons"><select value={filter} onChange={e=>setFilter(e.target.value)}><option>Semua</option>{grades.map(g=><option key={g}>{g}</option>)}</select><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cari siswa…"/></div><div className="table-wrap"><table><thead><tr><th>Nama</th><th>Kelas</th><th>XP</th><th>Pulau</th><th>Kuis</th><th>Aktivitas</th></tr></thead><tbody>{visible.length?visible.map(s=><tr key={s.id}><td><b>{s.name}</b></td><td>{s.grade}</td><td>{s.xp}</td><td>{s.completed.length}/7</td><td>{s.gamesPlayed}</td><td>{s.updatedAt?new Date(s.updatedAt).toLocaleString('id-ID'):'—'}</td></tr>):<tr><td colSpan={6}>Belum ada aktivitas siswa yang tercatat.</td></tr>}</tbody></table></div></section>
    <section className="admin-box"><div className="admin-title"><div><h2>✨ Generator Soal AI SD</h2><p>Buat soal kelas 1–6 dengan latar budaya Nusantara. Memerlukan OLLAMA_API_KEY.</p></div></div><div className="admin-input-row"><select value={aiGrade} onChange={e=>{setAiGrade(e.target.value);setAiTopic(gradeTopics[e.target.value][0])}}>{grades.map(g=><option key={g}>{g}</option>)}</select><select value={aiRegion} onChange={e=>setAiRegion(e.target.value)}>{islandData.map(i=><option key={i.id}>{i.name}</option>)}</select><select value={aiTopic} onChange={e=>setAiTopic(e.target.value)} aria-label="Topik Matematika">{gradeTopics[aiGrade].map(t=><option key={t}>{t}</option>)}</select><button className="big-primary" disabled={aiBusy} onClick={generateAI}><WandSparkles size={16}/>{aiBusy?'Memproses…':'Generate Soal'}</button></div></section>
    <section className="admin-box question-manager" id="pengaturan-soal">
     <div className="admin-title">
      <div><span className="section-tag">⚙️ PENGATURAN SOAL · CRUD</span><h2>📚 Kelola Bank Soal SD ({bank.length})</h2><p>Tambah, lihat, ubah, dan hapus soal kelas 1–6 secara permanen. Pilih kelas, topik, dan pulau agar soal sesuai dengan misi.</p></div>
      <button className="big-primary" disabled={busy} onClick={openNewQuestion}><Plus size={18}/> Tambah Soal Baru</button>
     </div>
     <div className="question-mode-panel">
      <div><h3>🎛️ Sumber Soal Per Kelas & Pulau</h3><p>Pilih soal campuran, atau gunakan hanya soal yang kamu kelola melalui CRUD. Soal bawaan dapat diimpor agar bisa diedit dan dihapus.</p></div>
      <div className="question-mode-controls">
       <label>Kelas<select value={modeGrade} onChange={e=>setModeGrade(e.target.value)}>{grades.map(g=><option key={g}>{g}</option>)}</select></label>
       <label>Pulau<select value={modeCulture} onChange={e=>setModeCulture(e.target.value)}>{islandData.map(z=><option key={z.id} value={z.id}>{z.name}</option>)}</select></label>
       <label>Sumber soal<select value={modeValue} disabled={modeLoading} onChange={e=>setModeValue(e.target.value as 'mixed'|'manual')}><option value="mixed">Campuran: bank + soal otomatis</option><option value="manual">Hanya Bank Soal Guru (CRUD)</option></select></label>
       <button className="big-primary" disabled={busy||modeLoading} onClick={saveMode}>💾 Simpan Mode</button>
      </div>
      <div className="question-mode-footer">
       <span>📚 {bank.filter(q=>q.grade===modeGrade&&(!q.topic||q.topic===gradeTopics[modeGrade][islandData.findIndex(z=>z.id===modeCulture)])&&(!q.cultureId||q.cultureId===modeCulture)&&q.active!==false).length} soal aktif dari bank tersedia untuk misi ini. {modeValue==='manual'?'Mode hanya bank: misi membutuhkan sedikitnya satu soal aktif.':'Mode campuran: soal otomatis akan melengkapi kuis.'}</span>
       <button className="outline-button" disabled={busy} onClick={importStarterQuestions}><Plus size={16}/> Impor 8 Soal Bawaan ke Bank</button>
      </div>
     </div>
     <div className="question-class-tabs" role="group" aria-label="Filter kelas soal">
      <button className={questionGrade==='Semua'?'chosen':''} onClick={()=>{setQuestionGrade('Semua');setQuestionTopic('Semua');setQuestionPage(1)}}>Semua <small>{bank.length}</small></button>
      {grades.map(g=><button key={g} className={questionGrade===g?'chosen':''} onClick={()=>{setQuestionGrade(g);setQuestionTopic('Semua');setQuestionPage(1)}}>{g} <small>{bank.filter(q=>q.grade===g).length}</small></button>)}
     </div>
     <div className="question-filter-bar">
      <label>Topik
       <select value={questionTopic} onChange={e=>{setQuestionTopic(e.target.value);setQuestionPage(1)}}><option value="Semua">Semua topik</option>{(questionGrade==='Semua'?[...new Set(grades.flatMap(g=>gradeTopics[g]))]:gradeTopics[questionGrade]).map(t=><option key={t} value={t}>{t}</option>)}</select>
      </label>
      <label>Pulau / budaya
       <select value={questionRegion} onChange={e=>{setQuestionRegion(e.target.value);setQuestionPage(1)}}><option value="Semua">Semua pulau</option>{islandData.map(z=><option key={z.id} value={z.id}>{z.name}</option>)}</select>
      </label>
      <label>Cari soal atau jawaban
       <input value={questionSearch} onChange={e=>{setQuestionSearch(e.target.value);setQuestionPage(1)}} placeholder="Cari kata kunci…" aria-label="Cari soal"/>
      </label>
      <button className="outline-button" onClick={()=>{setQuestionGrade('Semua');setQuestionTopic('Semua');setQuestionRegion('Semua');setQuestionSearch('');setQuestionPage(1)}}><RefreshCw size={15}/> Reset filter</button>
     </div>
     {adding&&<div className="question-editor" id="soal-editor">
      <div className="question-editor-head"><div><h3>{draft.id?'✏️ Edit Soal':'➕ Tambah Soal Baru'}</h3><p>{draft.id?'Ubah isi soal dan simpan untuk memperbarui soal ini.':'Buat soal pilihan ganda untuk SD dengan empat opsi jawaban.'}</p></div><button className="outline-button" onClick={()=>{setAdding(false);setDraft(emptyQuestion())}}><X size={16}/> Tutup</button></div>
      <div className="question-fields two">
       <label>Kelas SD *<select value={draft.grade||'Kelas 1'} onChange={e=>{const grade=e.target.value;setDraft(d=>({...d,grade,topic:gradeTopics[grade][0]}))}}>{grades.map(g=><option key={g}>{g}</option>)}</select></label>
       <label>Topik materi *<select value={draft.topic||''} onChange={e=>setDraft(d=>({...d,topic:e.target.value}))}>{gradeTopics[draft.grade||'Kelas 1'].map(t=><option key={t} value={t}>{t}</option>)}</select></label>
       <label>Pulau / budaya<select value={draft.cultureId||'sumatra'} onChange={e=>setDraft(d=>({...d,cultureId:e.target.value}))}>{islandData.map(z=><option key={z.id} value={z.id}>{z.name} — {z.region}</option>)}</select></label>
       <label>Status publikasi<select value={draft.active===false?'nonaktif':'aktif'} onChange={e=>setDraft(d=>({...d,active:e.target.value==='aktif'}))}><option value="aktif">Aktif — muncul di kuis siswa</option><option value="nonaktif">Nonaktif — hanya tersimpan di admin</option></select></label>
      </div>
      <label>Isi soal / soal cerita *<textarea rows={4} maxLength={1200} value={draft.question} onChange={e=>setDraft(d=>({...d,question:e.target.value}))} placeholder="Contoh: Di Rumah Gadang ada 8 penari. Datang lagi 4 penari. Berapa seluruh penari?"/></label>
      <div className="question-choices-edit"><b>Empat pilihan jawaban *</b><div className="question-fields two">
       {draft.options.map((choice,i)=><label key={i}>Pilihan {String.fromCharCode(65+i)}<input value={choice} maxLength={230} onChange={e=>setDraft(d=>{const old=d.options[i];const options=d.options.map((v,j)=>j===i?e.target.value:v);return {...d,options,answer:d.answer===old?e.target.value:d.answer}})} placeholder={'Jawaban '+String.fromCharCode(65+i)}/></label>)}
      </div></div>
      <label>Kunci jawaban *<select value={draft.answer} onChange={e=>setDraft(d=>({...d,answer:e.target.value}))}><option value="">Pilih kunci jawaban</option>{draft.options.map((v,i)=><option key={i} value={v} disabled={!v.trim()}>{String.fromCharCode(65+i)} — {v||'(belum diisi)'}</option>)}</select></label>
      <label>Pembahasan *<textarea rows={3} value={draft.explanation} maxLength={1800} onChange={e=>setDraft(d=>({...d,explanation:e.target.value}))} placeholder="Jelaskan langkah perhitungan dan alasan jawaban benar…"/></label>
      <div className="question-fields three">
       <label>URL gambar HTTPS<input type="url" value={draft.imageUrl||''} onChange={e=>setDraft(d=>({...d,imageUrl:e.target.value}))} placeholder="https://.../gambar.png"/></label>
       <label>URL YouTube<input type="url" value={draft.videoUrl||''} onChange={e=>setDraft(d=>({...d,videoUrl:e.target.value}))} placeholder="https://youtu.be/..."/></label>
       <label>URL audio HTTPS<input type="url" value={draft.audioUrl||''} onChange={e=>setDraft(d=>({...d,audioUrl:e.target.value}))} placeholder="https://.../narasi.mp3"/></label>
      </div>
      <div className="question-editor-actions"><span>* Wajib diisi. Gambar budaya otomatis mengikuti pulau, sementara URL media bersifat opsional.</span><button className="outline-button" onClick={()=>{setAdding(false);setDraft(emptyQuestion())}}>Batal</button><button className="big-primary" disabled={busy||draft.question.trim().length<6||draft.explanation.trim().length<5||draft.options.some(o=>!o.trim())||new Set(draft.options.map(x=>x.trim())).size!==4||!draft.options.includes(draft.answer)} onClick={submitQuestion}>{busy?'Menyimpan…':draft.id?'💾 Simpan Perubahan':'💾 Simpan Soal Baru'}</button></div>
     </div>}
     <div className="question-list-heading"><strong>{filteredQuestions.length} soal ditemukan</strong><button className="outline-button" disabled={busy} onClick={()=>refreshQuestions().then(()=>setNotice('Daftar soal terbaru berhasil dimuat.')).catch(e=>setError(e.message))}><RefreshCw size={14}/> Muat Ulang</button></div>
     <div className="question-list">
      {pagedQuestions.map((q,i)=><article className={'question-manage-card '+(q.active===false?'question-inactive':'')} key={q.id||i}>
       <div className="question-manage-top"><div><span className="question-tag">{q.grade}</span><span className="question-tag topic">{q.topic||'Topik belum diatur'}</span><span className="question-tag region">{islandData.find(z=>z.id===q.cultureId)?.name||'Semua pulau'}</span><span className={'question-tag '+(q.active===false?'off':'on')}>{q.active===false?'Nonaktif':'Aktif'}</span></div><small>#{(safePage-1)*12+i+1}</small></div>
       <h3>{q.question}</h3>
       <div className="question-option-preview">{q.options.map((x,j)=><span key={j} className={q.answer===x?'correct':''}><b>{String.fromCharCode(65+j)}.</b> {x}{q.answer===x?' ✓':''}</span>)}</div>
       <div className="question-answer-note"><b>Pembahasan:</b> {q.explanation}</div>
       <div className="question-media-links">{q.imageUrl&&<span>🖼️ Gambar</span>}{q.videoUrl&&<span>🎬 Video</span>}{q.audioUrl&&<span>🔊 Audio</span>}</div>
       <div className="question-manage-actions"><button className="outline-button" disabled={busy} onClick={()=>editQuestion(q)}>✏️ Edit Soal</button>{confirmDelete===q.id?<div className="delete-confirm"><strong>Hapus soal ini?</strong><button className="danger-button" disabled={busy} onClick={()=>deleteQuestion(q)}>Ya, Hapus</button><button className="outline-button" onClick={()=>setConfirmDelete(null)}>Batal</button></div>:<button className="danger-outline" disabled={busy||!q.id} onClick={()=>setConfirmDelete(q.id||null)}>🗑️ Hapus</button>}</div>
      </article>)}
      {filteredQuestions.length===0&&<div className="question-empty"><span>📭</span><h3>Belum ada soal untuk filter ini</h3><p>Tambahkan soal, pilih kelas lain, atau reset filter. Soal bawaan misi tetap tersedia secara otomatis.</p><button className="big-primary" onClick={openNewQuestion}><Plus size={16}/> Tambah Soal</button></div>}
     </div>
     {pageCount>1&&<div className="question-pagination"><button className="outline-button" disabled={safePage===1} onClick={()=>setQuestionPage(p=>Math.max(1,p-1))}>← Sebelumnya</button><span>Halaman {safePage} dari {pageCount}</span><button className="outline-button" disabled={safePage===pageCount} onClick={()=>setQuestionPage(p=>Math.min(pageCount,p+1))}>Berikutnya →</button></div>}
    </section>
    <section className="admin-box"><div className="admin-title"><div><h2>🏫 Identitas Sekolah</h2><p>Sesuaikan nama dan URL logo sekolah.</p></div></div><div className="admin-input-row"><input value={school.name} onChange={e=>setSchool({...school,name:e.target.value})} placeholder="Nama sekolah"/><input value={school.logoUrl||''} onChange={e=>setSchool({...school,logoUrl:e.target.value})} placeholder="URL logo sekolah (HTTPS)"/><button className="big-primary" onClick={saveSchool}><Settings size={15}/> Simpan</button></div></section>
   </div>}
  </main>}
  <footer className="site-footer"><span>⛵ {school.name}</span><div><span>Matematika SD Kelas 1–6 • Jelajah Budaya Indonesia</span><button onClick={openTeacher}><GraduationCap size={13}/> Masuk Guru</button><button onClick={openAdmin}><ShieldCheck size={13}/> Super Admin</button></div></footer>
  {modal&&<div className="modal-underlay" onMouseDown={e=>{if(e.target===e.currentTarget)setModal(false)}}><section className="login-modal" role="dialog" aria-modal="true" aria-label="Masuk sebagai siswa"><button className="modal-close" onClick={()=>setModal(false)} aria-label="Tutup"><X size={19}/></button><div className="login-mascot">🧒🏽 🗺️</div><h2>Halo, Petualang Hebat!</h2><p>Isi nama dan kelasmu untuk mulai berlayar. Tanpa PIN, ya!</p><label>Nama Lengkap Siswa<input value={name} maxLength={80} onChange={e=>setName(e.target.value)} placeholder="Tulis nama kamu…"/></label>{invite&&inviteStatus==='valid'&&<div className="invite-modal-label">👩‍🏫 Kelas {invite.label} · Guru {invite.teacherName}</div>}<label>Kelas SD<select disabled={Boolean(invite)} value={invite?.grade||chosenGrade} onChange={e=>setChosenGrade(e.target.value)}>{grades.map(g=><option key={g}>{g}</option>)}</select></label><button className="big-primary full" disabled={busy||(isJoinPath()&&inviteStatus!=='valid')} onClick={enroll}><Ship size={18}/>{busy?'Menyimpan…':'Mulai Petualangan!'}</button><small>Data belajar tersimpan di penyimpanan privat. Jangan gunakan nama lengkap jika perangkat dipakai bersama.</small></section></div>}
 </div>;
}
