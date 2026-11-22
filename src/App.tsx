import {useEffect,useMemo,useRef,useState} from 'react';
import {Anchor,ArrowLeft,BookOpen,CheckCircle2,Compass,Crown,Download,GraduationCap,Headphones,LockKeyhole,LogOut,MapPinned,Medal,Play,Plus,RefreshCw,School,Settings,ShieldCheck,Ship, Sparkles,Star, Trophy,Volume2,VolumeX,WandSparkles,XCircle} from 'lucide-react';

type Q={question:string;options:string[];answer:string;explanation:string;grade?:string;topic?:string;imageUrl?:string;videoUrl?:string;audioUrl?:string};
type Score={region:string;score:number;total:number;date:string};
type Student={id:string;name:string;grade:string;xp:number;gamesPlayed:number;completed:number[];recent:Score[];updatedAt?:string};
type SchoolCfg={name:string;music:boolean;logoUrl?:string};
const locations=[
 {name:'Sumatra',place:'Tanah Rencong',emoji:'🌿',x:15,y:28,story:'Temukan pola angka di tengah hutan hujan dan benteng sejarah.'},
 {name:'Jawa',place:'Candi dan Ilmu',emoji:'🏛️',x:40,y:73,story:'Jelajahi candi, pasar, dan bangun matematika Nusantara.'},
 {name:'Kalimantan',place:'Sungai Mahakam',emoji:'🌳',x:43,y:30,story:'Selesaikan tantangan di antara hutan dan sungai besar.'},
 {name:'Sulawesi',place:'Pelaut Pemberani',emoji:'⛵',x:64,y:43,story:'Gunakan logika untuk membantu pelaut mencari jalur terbaik.'},
 {name:'Bali',place:'Pulau Dewata',emoji:'🌺',x:55,y:83,story:'Ungkap rahasia geometri dan tradisi seni Bali.'},
 {name:'Maluku',place:'Kepulauan Rempah',emoji:'🪸',x:79,y:57,story:'Kumpulkan rempah lewat operasi hitung yang menantang.'},
 {name:'Papua',place:'Puncak Cartenz',emoji:'🏔️',x:91,y:33,story:'Taklukkan puncak matematika dan dapatkan harta karun.'}
];
const topics:Record<string,string[]>={
 'Kelas 1':['Bilangan','Penjumlahan','Pengurangan','Pola','Bangun Datar','Pengukuran','Waktu'],
 'Kelas 2':['Bilangan Ratusan','Operasi Hitung','Perkalian','Pembagian','Pecahan','Pengukuran','Pola'],
 'Kelas 3':['Bilangan','Pecahan','Perkalian','Pembagian','Keliling','Pengukuran','Data'],
 'Kelas 4':['Bilangan','FPB dan KPK','Pecahan','Desimal','Luas','Keliling','Diagram'],
 'Kelas 5':['Bilangan Bulat','Operasi Pecahan','Akar dan Kuadrat','Rasio','Kecepatan','Volume','Data'],
 'Kelas 6':['Operasi Bilangan','Rasio','Lingkaran','Volume','Koordinat','Statistika','Peluang'],
 'Kelas 7':['Bilangan Bulat','Pecahan','Himpunan','Bentuk Aljabar','Persamaan Linear','Perbandingan','Statistika'],
 'Kelas 8':['Pola Bilangan','Relasi dan Fungsi','Persamaan Garis','SPLDV','Pythagoras','Lingkaran','Peluang'],
 'Kelas 9':['Bilangan Berpangkat','Persamaan Kuadrat','Transformasi','Kesebangunan','Bangun Ruang','Fungsi Kuadrat','Statistika'],
 'Kelas 10':['Eksponen','Logaritma','Persamaan Linear','SPLTV','Fungsi Kuadrat','Trigonometri','Statistika'],
 'Kelas 11':['Matriks','Barisan Aritmetika','Barisan Geometri','Limit','Turunan','Peluang','Lingkaran'],
 'Kelas 12':['Permutasi','Kombinasi','Bunga Majemuk','Statistika','Limit','Integral','Geometri Ruang']
};
const grades=Object.keys(topics);
const rand=(a:number,b:number)=>Math.floor(Math.random()*(b-a+1))+a;
const num=(n:number)=>Number.isInteger(n)?String(n):String(Math.round(n*100)/100);
function makeQ(prompt:string,answer:number|string,why:string,vals:(number|string)[]=[]):Q{
 const correct=String(answer),opts=new Set([correct]);
 for(const v of vals)if(opts.size<4&&String(v)!==correct)opts.add(String(v));
 if(typeof answer==='number')for(const v of [answer+1,answer-1,answer+2,answer-2,answer*2,answer+5,answer/2])if(opts.size<4&&String(v)!==correct)opts.add(num(v));
 while(opts.size<4)opts.add(String(rand(1,99)));
 return {question:prompt,answer:correct,explanation:why,options:[...opts].sort(()=>Math.random()-.5)};
}
function question(grade:string,stage:number):Q{
 const g=parseInt(grade.replace('Kelas ','')),a=rand(2,12),b=rand(2,10),c=rand(2,6);
 if(g<=6){
  if(stage===0)return makeQ('Berapa hasil '+a+' + '+b+'?',a+b,'Jumlahkan kedua bilangan: '+a+' + '+b+' = '+(a+b)+'.');
  if(stage===1)return makeQ('Berapa hasil '+(a+b)+' − '+a+'?',b,'Pengurangan adalah kebalikan penjumlahan.');
  if(stage===2)return makeQ('Berapa hasil '+a+' × '+b+'?',a*b,'Kalikan '+a+' dengan '+b+'.');
  if(stage===3)return makeQ('Berapa hasil '+(a*b)+' ÷ '+a+'?',b,'Karena '+a+' × '+b+' = '+(a*b)+'.');
  if(stage===4)return makeQ('Persegi dengan sisi '+a+' cm, kelilingnya ... cm.',4*a,'Keliling persegi = 4 × sisi.');
  if(stage===5)return makeQ('Persegi panjang panjang '+a+' cm dan lebar '+b+' cm, luasnya ... cm².',a*b,'Luas = panjang × lebar.');
  return makeQ('Data: '+a+', '+b+', '+(a+b)+'. Nilai terbesar?',a+b,'Bandingkan ketiga angka.');
 }
 switch(g){
 case 7:
  switch(stage){
   case 0:return makeQ('Hitung '+a+' − ('+(a+b)+') = ...',-b,'Hasilnya '+a+' − '+(a+b)+' = '+(-b)+'.');
   case 1:return makeQ('Hitung '+a+'/'+b+' + '+c+'/'+b+' = ...',(a+c)+'/'+b,'Penyebut sama, sehingga pembilang dijumlahkan menjadi '+(a+c)+'/'+b+'.',[(a+c)+'/'+(b*2),(a*c)+'/'+b,a+'/'+(b+c)]);
   case 2:return makeQ('Jika A = {1,2,3,'+a+'}, jumlah anggota A adalah ...',a===1||a===2||a===3?3:4,'Himpunan tidak menghitung elemen yang berulang.');
   case 3:return makeQ('Koefisien x dari '+a+'x + '+b+'x = ...',a+b,'Suku sejenis dijumlahkan, sehingga ('+a+'+'+b+')x.');
   case 4:return makeQ('Jika '+a+'x + '+b+' = '+(a*c+b)+', nilai x adalah ...',c,'Kurangi '+b+', lalu bagi '+a+'.');
   case 5:return makeQ('Harga '+a+' pensil adalah Rp'+(a*b*1000)+'. Harga 1 pensil adalah ... rupiah.',b*1000,'Gunakan perbandingan senilai, total harga dibagi jumlah pensil.');
   default:return makeQ('Rata-rata dari '+a+', '+b+', '+(a+b)+' adalah ...',(2*(a+b))/3,'Jumlah data dibagi 3.',[a+b,(a+b)/3]);
  }
 case 8:
  switch(stage){
   case 0:return makeQ('Barisan '+a+', '+(a+b)+', '+(a+2*b)+', ... Suku ke-'+c+' adalah ...',a+(c-1)*b,'Un = a + (n−1)b.');
   case 1:return makeQ('Diberikan f(x) = '+a+'x + '+b+'. Nilai f('+c+') adalah ...',a*c+b,'Substitusi x='+c+'.');
   case 2:return makeQ('Gradien garis y = '+a+'x + '+b+' adalah ...',a,'Koefisien x merupakan gradien m.');
   case 3:return makeQ('x + y = '+(a+b)+' dan x − y = '+(a-b)+'. Nilai y adalah ...',b,'Kurangi kedua persamaan lalu bagi 2.');
   case 4:return makeQ('Sisi siku-siku segitiga adalah '+(3*c)+' cm dan '+(4*c)+' cm. Sisi miringnya ... cm.',5*c,'Triple Pythagoras 3:4:5.');
   case 5:return makeQ('Keliling lingkaran dengan r = '+(7*c)+' cm (π = 22/7) adalah ... cm.',44*c,'K = 2πr = 2×22/7×'+(7*c)+'.');
   default:return makeQ('Peluang muncul angka genap pada dadu bersisi enam adalah ...','1/2','Terdapat 3 angka genap dari 6 hasil yang mungkin.',['1/6','2/6','5/6']);
  }
 case 9:
  switch(stage){
   case 0:return makeQ('2 pangkat '+c+' adalah ...',2**c,'2 dikalikan dengan dirinya sebanyak '+c+' kali.');
   case 1:return makeQ('Akar terbesar x² − '+(a+b)+'x + '+(a*b)+' = 0 adalah ...',Math.max(a,b),'Persamaan dapat difaktorkan menjadi (x−'+a+')(x−'+b+') = 0.');
   case 2:return makeQ('Bayangan titik ('+a+','+b+') jika dicerminkan pada sumbu-Y adalah ...','('+(-a)+','+b+')','Refleksi sumbu-Y mengubah tanda koordinat x.',['('+a+','+(-b)+')','('+(-a)+','+(-b)+')','('+b+','+a+')']);
   case 3:return makeQ('Dua segitiga sebangun memiliki skala 1:'+c+'. Jika sisi kecil '+a+' cm, sisi besar ... cm.',a*c,'Kalikan sisi dengan faktor skala '+c+'.');
   case 4:return makeQ('Volume kubus dengan panjang rusuk '+a+' cm adalah ... cm³.',a**3,'Volume kubus = rusuk³ = '+a+'³.');
   case 5:return makeQ('Jika f(x)='+a+'x² + '+b+'x, f('+c+') adalah ...',a*c*c+b*c,'Substitusi x='+c+' ke f(x).');
   default:return makeQ('Rata-rata data '+a+', '+b+', '+(a+b)+' adalah ...',num(2*(a+b)/3),'Rata-rata = ('+a+'+'+b+'+'+(a+b)+')/3.',[a+b,num((a+b)/3)]);
  }
 case 10:
  switch(stage){
   case 0:return makeQ('Hitung 3^'+c+' = ...',3**c,'Pangkat '+c+' berarti mengalikan bilangan 3 sebanyak '+c+' kali.');
   case 1:return makeQ('log basis 2 dari '+(2**c)+' = ...',c,'Karena 2^'+c+' = '+(2**c)+'.');
   case 2:return makeQ('Jika '+a+'x + '+b+' = '+(a*c+b)+', x = ...',c,'Kurangi kedua ruas dengan '+b+' lalu bagi '+a+'.');
   case 3:return makeQ('x+y+z = '+(a+b+c)+', y='+b+' dan z='+c+'. Maka x = ...',a,'Substitusi nilai y dan z ke persamaan pertama.');
   case 4:return makeQ('Titik puncak fungsi y = x² − '+(2*c)+'x + '+(c*c)+' memiliki absis ...',c,'Kuadrat sempurna (x−'+c+')², puncak saat x='+c+'.');
   case 5:return makeQ('Besar sin 30° adalah ...','1/2','Nilai sudut istimewa sin 30° = 1/2.',['1','0','√3/2']);
   default:return makeQ('Median dari bilangan '+a+', '+b+', '+(a+b)+' adalah ...',Math.max(a,b),'Urutan tiga nilai: yang terkecil, terbesar dari a dan b, serta a+b.');
  }
 case 11:
  switch(stage){
   case 0:return makeQ('Elemen kiri atas A+B jika elemen kiri atas A='+a+' dan B='+b+' adalah ...',a+b,'Penjumlahan matriks dilakukan per elemen.');
   case 1:return makeQ('Suku ke-'+c+' barisan aritmetika dengan U1='+a+' dan beda='+b+' adalah ...',a+(c-1)*b,'Un=a+(n−1)b.');
   case 2:return makeQ('Suku ke-'+c+' barisan geometri dengan U1='+a+' dan rasio 2 adalah ...',a*2**(c-1),'Un=ar^(n−1).');
   case 3:return makeQ('Limit x→'+c+' dari '+a+'x + '+b+' adalah ...',a*c+b,'Fungsi linear kontinu, substitusi x='+c+'.');
   case 4:return makeQ('Jika f(x)='+a+'x²+'+b+'x, f\'(1)= ...',2*a+b,'f\'(x)=2×'+a+'x + '+b+'.');
   case 5:return makeQ('Peluang jumlah 7 dari dua dadu adalah ...','1/6','Terdapat 6 hasil berjumlah 7 dari 36 kemungkinan.',['1/12','1/3','7/36']);
   default:return makeQ('Panjang busur 90° pada lingkaran dengan r='+7*c+' cm (π=22/7) adalah ... cm.',11*c,'Panjang busur = (90/360)×2πr.');
  }
 case 12:
 default:
  switch(stage){
   case 0:return makeQ('Banyak susunan berbeda memilih ketua dan wakil dari '+(a+3)+' orang adalah ...',(a+3)*(a+2),'P(n,2) = n(n−1).');
   case 1:return makeQ('Banyak cara memilih 2 siswa dari '+(a+3)+' siswa adalah ...',((a+3)*(a+2))/2,'C(n,2) = n(n−1)/2.');
   case 2:return makeQ('Modal Rp'+(a*100000)+' mendapat bunga majemuk 10% per tahun. Nilai akhir 2 tahun dalam rupiah adalah ...',a*121000,'A=P(1+0,1)^2 = P×1,21.');
   case 3:return makeQ('Rata-rata data '+a+', '+b+', '+(a+b)+' adalah ...',num(2*(a+b)/3),'Jumlah data dibagi 3.',[a+b,num((a+b)/3)]);
   case 4:return makeQ('Limit x→'+a+' dari (x²−'+(a*a)+')/(x−'+a+') = ...',2*a,'Faktorkan pembilang menjadi (x−a)(x+a), hasilnya 2a.');
   case 5:return makeQ('Hasil integral '+(2*c)+'x dx adalah ...',c+'x² + C','Integral ax dx = (a/2)x² + C.',[(2*c)+'x² + C',c+'x + C',c+'x³ + C']);
   default:return makeQ('Diagonal ruang kubus dengan rusuk '+a+' cm adalah ...',a+'√3 cm','Diagonal ruang kubus d=s√3.',[a+'√2 cm',(3*a)+' cm',a+' cm']);
  }
 }
}
async function api(path:string,options:RequestInit={}):Promise<any>{
 const response=await fetch('/api/'+path,{...options,credentials:'same-origin',headers:{'Content-Type':'application/json',...options.headers},cache:'no-store'});
 let data:any;try{data=await response.json()}catch{throw Error('Server tidak mengembalikan JSON.')}
 if(!response.ok)throw Error(data.error||('HTTP '+response.status));return data;
}
function videoId(url:string){try{const u=new URL(url);if(u.hostname==='youtu.be')return u.pathname.slice(1,12);if(['www.youtube.com','youtube.com','m.youtube.com'].includes(u.hostname))return(u.searchParams.get('v')||u.pathname.split('/embed/')[1]||'').slice(0,11)}catch{}return null}
const audioUrl='https://nusantara-math-adventure.abumumtaz.chatgpt.site/resources/heart-of-nusantara.mp3';
export default function App(){
 const[page,setPage]=useState<'login'|'map'|'quiz'|'result'|'admin'>('login');
 const[student,setStudent]=useState<Student|null>(null),[name,setName]=useState(''),[grade,setGrade]=useState('Kelas 7');
 const[school,setSchool]=useState<SchoolCfg>({name:'Nusantara Math Adventure',music:true});
 const[error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false);
 const[island,setIsland]=useState(0),[questions,setQuestions]=useState<Q[]>([]),[index,setIndex]=useState(0),[answer,setAnswer]=useState(''),[points,setPoints]=useState(0),[earnedXP,setEarnedXP]=useState(0);
 const[admin,setAdmin]=useState(false),[password,setPassword]=useState(''),[students,setStudents]=useState<Student[]>([]),[bank,setBank]=useState<Q[]>([]),[filter,setFilter]=useState('Semua'),[query,setQuery]=useState('');
 const[aiTopic,setAiTopic]=useState(''),[aiGrade,setAiGrade]=useState('Kelas 7'),[aiBusy,setAiBusy]=useState(false);
 const[adding,setAdding]=useState(false),[draft,setDraft]=useState<Q>({question:'',options:['','','',''],answer:'',explanation:'',grade:'Kelas 7',topic:''});
 const[music,setMusic]=useState(false),[voice,setVoice]=useState(false);
 const musicRef=useRef<HTMLAudioElement|null>(null);
 useEffect(()=>{api('school').then((r)=>setSchool(r.school)).catch(()=>{});const saved=localStorage.getItem('nma-student-id');if(saved&&/^[a-f0-9]{32}$/.test(saved)){api('progress/'+saved).then((r)=>{if(r.progress){setStudent(r.progress);setName(r.progress.name);setGrade(r.progress.grade);setPage('map')}}).catch(()=>{})}},[]);
 useEffect(()=>{if(!music&&musicRef.current)musicRef.current.pause();if(music&&musicRef.current)musicRef.current.play().catch(()=>setMusic(false))},[music]);
 useEffect(()=>{if(page!=='admin'||!admin)return;loadAdmin();const t=setInterval(loadAdmin,8000);return()=>clearInterval(t)},[page,admin]);
 const enrolledCount=students.length;
 const totalXP=students.reduce((a,s)=>a+s.xp,0);
 const filtered=students.filter(s=>(filter==='Semua'||s.grade===filter)&&s.name.toLowerCase().includes(query.toLowerCase()));
 const today=new Date().toLocaleDateString('id-ID');
 function speak(text:string){if(!voice||!('speechSynthesis'in window))return;window.speechSynthesis.cancel();const utter=new SpeechSynthesisUtterance(text);utter.lang='id-ID';utter.rate=.93;window.speechSynthesis.speak(utter)}
 async function enrol(){
  const clean=name.trim();if(clean.length<2){setError('Masukkan nama siswa minimal 2 huruf.');return}
  setBusy(true);setError('');
  try{const newId=Array.from(crypto.getRandomValues(new Uint8Array(16))).map(x=>x.toString(16).padStart(2,'0')).join('');
   const p:Student={id:newId,name:clean,grade,xp:0,gamesPlayed:0,completed:[],recent:[]};
   await api('progress/'+newId,{method:'PUT',body:JSON.stringify(p)});localStorage.setItem('nma-student-id',newId);setStudent(p);setPage('map');setNotice('Selamat datang, '+clean+'! Pilih sebuah pulau untuk memulai.');speak('Selamat datang di Nusantara Math Adventure.')}
  catch(e:any){setError(e.message)}finally{setBusy(false)}
 }
 function exit(){localStorage.removeItem('nma-student-id');setStudent(null);setPage('login');setName('');setMusic(false);setError('')}
 async function begin(i:number){if(!student)return;setBusy(true);setError('');try{
  const data=await api('public/questions?grade='+encodeURIComponent(student.grade));
  const teacher:Q[]=(data.questions||[]).filter((q:Q)=>!q.topic||q.topic===topics[student.grade][i]);
  const chosen=[...teacher.sort(()=>Math.random()-.5).slice(0,4),...Array.from({length:8},()=>question(student.grade,i))].slice(0,8);
  setQuestions(chosen);setIsland(i);setIndex(0);setPoints(0);setAnswer('');setPage('quiz');speak(locations[i].story);
 }catch(e:any){setError(e.message)}finally{setBusy(false)}}
 async function finish(){if(!student)return;const completed=[...new Set([...student.completed,island+1])];const awarded=points*25+(!student.completed.includes(island+1)?50:0);const xp=student.xp+awarded;setEarnedXP(awarded);
 const p:Student={...student,completed,xp,gamesPlayed:student.gamesPlayed+1,recent:[...student.recent,{region:locations[island].name,score:points,total:questions.length,date:new Date().toISOString()}].slice(-25)};
 setStudent(p);setPage('result');setNotice('');
 try{await api('progress/'+p.id,{method:'PUT',body:JSON.stringify(p)});setNotice('Progres tersimpan permanen.')}catch(e:any){setError('Hasil tersimpan sementara di layar tetapi gagal disinkronkan: '+e.message)}
 }
 async function loginAdmin(){setBusy(true);setError('');try{await api('admin/login',{method:'POST',body:JSON.stringify({password})});setAdmin(true);setPassword('');await loadAdmin()}catch(e:any){setError(e.message)}finally{setBusy(false)}}
 async function loadAdmin(){try{const [m,b]=await Promise.all([api('admin/monitor'),api('bank')]);setStudents(m.students||[]);setBank(b.questions||[]);setAdmin(true)}catch(e:any){setError(e.message);if(e.message.includes('Login'))setAdmin(false)}}
 async function logoutAdmin(){await api('admin/logout',{method:'POST'}).catch(()=>{});setAdmin(false);setStudents([]);setBank([]);setPage(student?'map':'login')}
 async function saveBank(items:Q[]){setBusy(true);setError('');try{await api('bank',{method:'PUT',body:JSON.stringify({questions:items})});setBank(items);setAdding(false);setNotice('Bank soal diperbarui.')}catch(e:any){setError(e.message)}finally{setBusy(false)}}
 async function generateAI(){if(!aiTopic.trim()){setError('Tulis topik matematika terlebih dahulu.');return}setAiBusy(true);setError('');try{const r=await api('admin/generate',{method:'POST',body:JSON.stringify({grade:aiGrade,topic:aiTopic})});if(!r.questions?.length)throw Error('AI belum menghasilkan soal valid.');await saveBank([...bank,...r.questions.map((q:Q)=>({...q,grade:aiGrade,topic:aiTopic}))]);setNotice(r.questions.length+' soal AI berhasil dimasukkan ke bank soal.')}catch(e:any){setError(e.message)}finally{setAiBusy(false)}}
 async function exportExcel(){try{const {default:ExcelJS}=await import('exceljs');const wb=new ExcelJS.Workbook(),ws=wb.addWorksheet('Prestasi Siswa');ws.addRow(['Nama','Kelas','XP','Misi Selesai','Kuis Dikerjakan','Update Terakhir']);students.forEach(s=>ws.addRow([s.name,s.grade,s.xp,s.completed.length,s.gamesPlayed,s.updatedAt]));const blob=new Blob([await wb.xlsx.writeBuffer()],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});download(blob,'laporan-nusantara.xlsx')}catch(e:any){setError('Ekspor Excel gagal: '+e.message)}}
 function download(blob:Blob,file:string){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=file;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
 async function exportPDF(){try{const {jsPDF}=await import('jspdf');const pdf=new jsPDF();pdf.setFontSize(17);pdf.text('Laporan Nusantara Math Adventure',14,20);pdf.setFontSize(10);let y=34;students.slice(0,65).forEach((s,i)=>{if(y>278){pdf.addPage();y=20}pdf.text((i+1)+'. '+s.name+' — '+s.grade+' — '+s.xp+' XP',14,y);y+=7});pdf.save('laporan-nusantara.pdf')}catch(e:any){setError('Ekspor PDF gagal: '+e.message)}}
 async function cert(){if(!student)return;const {jsPDF}=await import('jspdf');const pdf=new jsPDF({orientation:'landscape'});pdf.setFillColor(8,61,76);pdf.rect(0,0,297,210,'F');pdf.setDrawColor(250,199,92);pdf.setLineWidth(3);pdf.rect(12,12,273,186);pdf.setTextColor(255,235,162);pdf.setFontSize(34);pdf.text('SERTIFIKAT PETUALANGAN',148,58,{align:'center'});pdf.setTextColor(255,255,255);pdf.setFontSize(18);pdf.text(student.name,148,97,{align:'center'});pdf.setFontSize(13);pdf.text(student.grade+' | '+student.xp+' XP | '+student.completed.length+' pulau ditaklukkan',148,122,{align:'center'});pdf.text('NUSANTARA MATH ADVENTURE PRO',148,168,{align:'center'});pdf.save('sertifikat-'+student.name.replace(/[^a-zA-Z0-9]/g,'-')+'.pdf')}
 function goAdmin(){setError('');setPage('admin');api('admin/session').then(r=>setAdmin(Boolean(r.user))).catch(()=>{})}
 const medal=student?(student.completed.length>=7?'Penjelajah Legendaris':student.completed.length>=4?'Pelaut Emas':student.completed.length>=1?'Penjelajah Pemula':'Calon Petualang'):'';
 return <div className="shell">
  <audio ref={musicRef} src={audioUrl} loop preload="none" onError={()=>{if(music){setMusic(false);setNotice('Musik asli tidak dapat dijangkau dari situs sumber.')}}}/>
  <header className="header"><button className="identity" onClick={()=>setPage(student?'map':'login')}><span className="logo">⛵</span><span><b>NUSANTARA MATH</b><small>ADVENTURE <em>PRO</em></small></span></button>
    <div className="nav"><span className="nav-caption">Petualangan Matematika Indonesia</span><button title="Narasi suara" className="iconbtn" onClick={()=>setVoice(!voice)}>{voice?<Headphones size={18}/>:<VolumeX size={18}/>}</button><button title="Musik latar" className="iconbtn" onClick={()=>setMusic(!music)}>{music?<Volume2 size={18}/>:<VolumeX size={18}/>}</button>
    {student&&page!=='admin'&&<button className="quiet" onClick={exit}><LogOut size={15}/> Keluar</button>}
    {page==='admin'?<button className="quiet" onClick={()=>setPage(student?'map':'login')}><ArrowLeft size={16}/> Kembali</button>:<button className="admin-btn" onClick={goAdmin}><ShieldCheck size={15}/> Admin</button>}</div>
  </header>
  {error&&<div className="toast error" role="alert"><XCircle size={16}/>{error}<button onClick={()=>setError('')}>×</button></div>}
  {notice&&<div className="toast good"><CheckCircle2 size={16}/>{notice}<button onClick={()=>setNotice('')}>×</button></div>}
  {page==='login'&&<main className="landing"><section className="hero"><span className="eyebrow"><Sparkles size={16}/> PETUALANGAN EDUKASI DIGITAL</span><h1>Jelajahi Nusantara,<br/><span>Taklukkan Matematika!</span></h1><p>Berlayar dari Sumatra hingga Papua. Pecahkan soal matematika, kumpulkan koin dan XP, dan raih gelar penjelajah hebat.</p><div className="hero-badges"><span>🧭 7 Pulau</span><span>📚 Kelas 1–12</span><span>🏆 Badge & Sertifikat</span></div>
    <div className="ship-scene" aria-hidden="true"><span className="sun">☀️</span><span className="cloud">☁️</span><span className="hero-island">🏝️</span><span className="hero-ship">⛵</span><div className="water"/></div></section>
    <section className="login-card"><div className="login-icon"><Compass size={26}/></div><h2>Siap Berpetualang?</h2><p>Masuk dengan nama dan kelas, tanpa PIN siswa.</p><label>Nama lengkap siswa<input value={name} onChange={e=>setName(e.target.value)} placeholder="Contoh: Mumtaz Abdullah" maxLength={80}/></label><label>Kelas<select value={grade} onChange={e=>setGrade(e.target.value)}>{grades.map(g=><option key={g}>{g}</option>)}</select></label><button className="primary wide" disabled={busy} onClick={enrol}><Ship size={18}/>{busy?'Menghubungkan…':'Mulai Petualangan'}</button><p className="privacy">🔐 Progres siswa disimpan melalui backend privat.</p></section>
  </main>}
  {page==='map'&&student&&<main className="content"><div className="greeting"><div><span className="eyebrow"><Compass size={16}/> SELAMAT DATANG, PETUALANG</span><h1>Halo, {student.name.split(' ')[0]}! 👋</h1><p>Pilih pulau dan selesaikan misi <b>{student.grade}</b>.</p></div><div className="badge-rank"><Medal size={23}/><span><b>{medal}</b><small>{student.completed.length}/7 pulau selesai</small></span></div></div>
  <div className="metrics"><div className="metric"><Star className="gold"/><span><b>{student.xp.toLocaleString('id-ID')}</b><small>Total XP</small></span></div><div className="metric"><Trophy className="mint"/><span><b>{student.completed.length}/7</b><small>Pulau selesai</small></span></div><div className="metric"><BookOpen className="blue"/><span><b>{student.gamesPlayed}</b><small>Latihan dikerjakan</small></span></div><div className="metric"><Crown className="gold"/><span><b>{Math.floor(student.xp/10)}</b><small>Koin Nusantara</small></span></div></div>
  <div className="section-label"><h2><MapPinned size={23}/> Peta Petualangan Nusantara</h2><span>Ketuk pulau untuk memulai misi</span></div>
  <div className="map-board"><div className="map-title">LAUT NUSANTARA <span>✧</span></div><div className="map-waves"/>{locations.map((l,i)=><button key={l.name} disabled={busy} onClick={()=>begin(i)} className={'island '+(student.completed.includes(i+1)?'cleared':'')} style={{left:l.x+'%',top:l.y+'%'}}><span className="island-emoji">{l.emoji}</span><span className="island-name">{l.name}</span>{student.completed.includes(i+1)&&<span className="island-done">✓</span>}</button>)}<span className="ship-floating">⛵</span><span className="compass-icon">✣</span></div>
  <div className="section-label"><h2><BookOpen size={23}/> Misi Matematika {student.grade}</h2><span>7 tahap pembelajaran</span></div><div className="island-cards">{locations.map((l,i)=><article key={l.name} className="mission-card"><span className="mission-art">{l.emoji}</span><div><small>MISI {i+1} · {l.name.toUpperCase()}</small><h3>{topics[student.grade]?.[i]||'Matematika'}</h3><p>{l.story}</p><button onClick={()=>begin(i)} disabled={busy} className="mission-btn">{student.completed.includes(i+1)?'Ulangi misi':'Mulai misi'} <Play size={14}/></button></div>{student.completed.includes(i+1)&&<span className="tick">✓</span>}</article>)}</div>
  <div className="bottom-banner"><span>🏅</span><div><b>Hadiah hari ini: {today}</b><p>Selesaikan satu misi untuk memperoleh XP dan melanjutkan perjalanan.</p></div><button onClick={()=>cert()}><Download size={16}/> Sertifikat</button></div></main>}
  {page==='quiz'&&student&&questions.length>0&&<main className="quiz-wrap"><button className="backlink" onClick={()=>setPage('map')}><ArrowLeft size={15}/> Kembali ke peta</button><div className="quiz-head"><span>⛵ MISI {island+1} · {locations[island].name}</span><b>{topics[student.grade][island]}</b><p>{locations[island].story}</p></div><div className="quiz-progress"><div style={{width:((index+1)/questions.length*100)+'%'}}/></div><section className="quiz-card"><div className="quiz-meta"><span>SOAL {index+1} DARI {questions.length}</span><span>⭐ {points} benar</span></div><h2>{questions[index].question}</h2>{questions[index].imageUrl&&<img alt="Ilustrasi soal" className="question-image" src={questions[index].imageUrl}/>}
  {questions[index].videoUrl&&videoId(questions[index].videoUrl!)&&<iframe className="question-video" title="Video soal" src={'https://www.youtube-nocookie.com/embed/'+videoId(questions[index].videoUrl!)} allowFullScreen/>}
  {questions[index].audioUrl&&<audio controls src={questions[index].audioUrl}/>}
  <div className="options">{questions[index].options.map((o,j)=><button key={j} disabled={!!answer} className={'option '+(answer?(o===questions[index].answer?'correct':o===answer?'wrong':''):'')} onClick={()=>{setAnswer(o);if(o===questions[index].answer)setPoints(v=>v+1);speak(o===questions[index].answer?'Jawaban benar, hebat!':'Belum tepat. Simak pembahasannya.')}}><span>{String.fromCharCode(65+j)}</span>{o}{answer&&o===questions[index].answer&&<CheckCircle2 size={19}/>}</button>)}</div>
  {answer&&<div className="explanation"><b>💡 Pembahasan {answer===questions[index].answer?'— Jawaban Tepat!':'— Pelajari lagi'}</b><p>{questions[index].explanation}</p></div>}
  <button className="primary wide" disabled={!answer} onClick={()=>{if(index+1===questions.length)finish();else{setIndex(index+1);setAnswer('')}}}>{index+1===questions.length?'Selesaikan Misi':'Soal Berikutnya →'}</button></section></main>}
  {page==='result'&&student&&<main className="result"><div className="result-emoji">🏆</div><span className="eyebrow">MISI BERHASIL DISELESAIKAN</span><h1>Hebat, {student.name.split(' ')[0]}!</h1><p>Petualangan di {locations[island].name} telah selesai.</p><div className="score">{points}<small> / {questions.length} soal benar</small></div><div className="result-reward">✨ +{earnedXP} XP</div><div className="result-actions"><button className="primary" onClick={()=>setPage('map')}><MapPinned size={17}/> Kembali ke peta</button><button className="quiet" onClick={()=>begin(island)}><RefreshCw size={17}/> Ulangi</button><button className="quiet" onClick={()=>cert()}><Download size={17}/> Sertifikat PDF</button></div></main>}
  {page==='admin'&&<main className="admin-area"><div className="admin-heading"><span className="eyebrow"><ShieldCheck size={16}/> PORTAL ADMINISTRATOR</span><h1>Dashboard Guru & Administrator</h1><p>Pantau pembelajaran, kelola soal, dan identitas sekolah.</p></div>
  {!admin?<section className="admin-login"><div className="login-icon"><LockKeyhole size={26}/></div><h2>Login Administrator</h2><p>Khusus pengelola sekolah. Siswa tidak memerlukan PIN.</p><label>Kata sandi admin<input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Kata sandi admin" onKeyDown={e=>e.key==='Enter'&&loginAdmin()}/></label><button className="primary wide" disabled={busy} onClick={loginAdmin}>{busy?'Memeriksa…':'Masuk Dashboard'}</button><small>Administrator harus dikonfigurasi di Environment Variables Vercel.</small></section>:
  <div className="admin-body"><div className="admin-toolbar"><b><ShieldCheck size={18}/> Sesi administrator aktif</b><button onClick={logoutAdmin} className="quiet"><LogOut size={15}/> Keluar admin</button></div>
  <div className="metrics"><div className="metric"><GraduationCap className="blue"/><span><b>{enrolledCount}</b><small>Profil siswa</small></span></div><div className="metric"><Star className="gold"/><span><b>{totalXP}</b><small>Total XP</small></span></div><div className="metric"><BookOpen className="mint"/><span><b>{bank.length}</b><small>Bank soal</small></span></div><div className="metric"><RefreshCw className="blue"/><span><b>8 dtk</b><small>Interval pemantauan</small></span></div></div>
  <section className="admin-panel"><div className="panel-heading"><div><h2>Aktivitas siswa</h2><p>Penyimpanan privat; diperbarui berkala.</p></div><div className="buttons"><button className="quiet" onClick={loadAdmin}><RefreshCw size={15}/> Segarkan</button><button className="quiet" onClick={exportExcel}><Download size={15}/> Excel</button><button className="quiet" onClick={exportPDF}><Download size={15}/> PDF</button></div></div>
  <div className="filters"><select value={filter} onChange={e=>setFilter(e.target.value)}><option>Semua</option>{grades.map(g=><option key={g}>{g}</option>)}</select><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cari nama siswa…"/></div>
  <div className="table-scroll"><table><thead><tr><th>Nama Siswa</th><th>Kelas</th><th>XP</th><th>Misi</th><th>Latihan</th><th>Update</th></tr></thead><tbody>{filtered.length?filtered.map(s=><tr key={s.id}><td><b>{s.name}</b></td><td>{s.grade}</td><td>{s.xp}</td><td>{s.completed.length}/7</td><td>{s.gamesPlayed}</td><td>{s.updatedAt?new Date(s.updatedAt).toLocaleString('id-ID'):'-'}</td></tr>):<tr><td colSpan={6}>Belum ada progres siswa yang tercatat.</td></tr>}</tbody></table></div></section>
  <section className="admin-panel"><div className="panel-heading"><div><h2><WandSparkles size={22}/> Generator Soal Ollama Cloud</h2><p>AI tersedia setelah OLLAMA_API_KEY dikonfigurasi.</p></div></div><div className="generation"><select value={aiGrade} onChange={e=>setAiGrade(e.target.value)}>{grades.filter(g=>parseInt(g.replace('Kelas ',''))>=7).map(g=><option key={g}>{g}</option>)}</select><input value={aiTopic} onChange={e=>setAiTopic(e.target.value)} placeholder="Topik, mis. Persamaan Kuadrat"/><button className="primary" disabled={aiBusy} onClick={generateAI}><WandSparkles size={16}/>{aiBusy?'Menghasilkan…':'Generate 5 Soal'}</button></div></section>
  <section className="admin-panel"><div className="panel-heading"><div><h2>Bank Soal ({bank.length})</h2><p>Soal tambahan otomatis masuk ke latihan sesuai kelas/topik.</p></div><button className="quiet" onClick={()=>setAdding(v=>!v)}><Plus size={16}/> Tambah Manual</button></div>
  {adding&&<div className="editor"><div className="filters"><select value={draft.grade||'Kelas 7'} onChange={e=>setDraft({...draft,grade:e.target.value})}>{grades.map(g=><option key={g}>{g}</option>)}</select><input placeholder="Topik (opsional)" value={draft.topic||''} onChange={e=>setDraft({...draft,topic:e.target.value})}/></div><textarea placeholder="Teks soal" value={draft.question} onChange={e=>setDraft({...draft,question:e.target.value})}/>{draft.options.map((o,i)=><input key={i} placeholder={'Pilihan '+String.fromCharCode(65+i)} value={o} onChange={e=>setDraft({...draft,options:draft.options.map((x,j)=>i===j?e.target.value:x)})}/>)}<label>Kunci jawaban<select value={draft.answer} onChange={e=>setDraft({...draft,answer:e.target.value})}><option value="">Pilih jawaban benar</option>{draft.options.map((o,i)=><option key={i} value={o}>{String.fromCharCode(65+i)} — {o}</option>)}</select></label><textarea placeholder="Pembahasan" value={draft.explanation} onChange={e=>setDraft({...draft,explanation:e.target.value})}/><input placeholder="URL gambar (HTTPS, opsional)" value={draft.imageUrl||''} onChange={e=>setDraft({...draft,imageUrl:e.target.value})}/><input placeholder="URL YouTube (opsional)" value={draft.videoUrl||''} onChange={e=>setDraft({...draft,videoUrl:e.target.value})}/><input placeholder="URL audio (opsional)" value={draft.audioUrl||''} onChange={e=>setDraft({...draft,audioUrl:e.target.value})}/><button className="primary" disabled={!draft.question||!draft.answer||!draft.explanation||draft.options.some(x=>!x)} onClick={()=>saveBank([...bank,{...draft}])}>Simpan Soal</button></div>}
  <div className="banklist">{bank.slice(-30).reverse().map((q,i)=><div key={i} className="bankitem"><span>{q.grade} · {q.topic||'Umum'}</span><b>{q.question}</b><button onClick={()=>saveBank(bank.filter(x=>x!==q))}>Hapus</button></div>)}{bank.length===0&&<p>Bank soal masih kosong. Tambahkan soal manual atau gunakan AI.</p>}</div></section>
  <section className="admin-panel"><div className="panel-heading"><div><h2><School size={22}/> Identitas Sekolah</h2><p>Nama sekolah ditampilkan pada laman permainan.</p></div></div><div className="generation"><input value={school.name} onChange={e=>setSchool({...school,name:e.target.value})} placeholder="Nama sekolah"/><input value={school.logoUrl||''} onChange={e=>setSchool({...school,logoUrl:e.target.value})} placeholder="URL logo sekolah HTTPS"/><button className="primary" onClick={async()=>{try{const r=await api('school',{method:'PUT',body:JSON.stringify(school)});setSchool(r.school);setNotice('Pengaturan sekolah disimpan')}catch(e:any){setError(e.message)}}}><Settings size={16}/> Simpan</button></div></section>
  </div>}</main>}
  <footer><span>⛵ {school.name}</span><span>Nusantara Math Adventure Pro • Pendidikan matematika Indonesia</span></footer>
 </div>
}
