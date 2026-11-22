import {useEffect,useState} from 'react';
import {ArrowLeft,BookOpen,CheckCircle2,ClipboardCopy,GraduationCap,KeyRound,Link2,LockKeyhole,LogOut,Plus,RefreshCw,ShieldCheck,UserRound,Users,XCircle} from 'lucide-react';
import {grades} from './learning';
import TeacherQuestions from './TeacherQuestions';

type Teacher={id:string;name:string;username:string;role:'teacher';active:boolean};
type TeacherLink={token:string;grade:string;label:string;teacherId:string;active:boolean;createdAt:string};
type Student={id:string;name:string;grade:string;xp:number;gamesPlayed:number;completed:number[];inviteToken?:string;updatedAt?:string};
async function request(path:string,options:RequestInit={}):Promise<any>{
 const response=await fetch('/api/'+path,{...options,credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json',...(options.headers||{})}});
 const body=await response.json().catch(()=>({error:'Server gagal mengirim respons.'}));
 if(!response.ok)throw Error(String(body.error||response.status));
 return body;
}
export default function TeacherPortal({onHome}:{onHome:()=>void}){
 const [teacher,setTeacher]=useState<Teacher|null>(null),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false);
 const [username,setUsername]=useState(''),[password,setPassword]=useState('');
 const [links,setLinks]=useState<TeacherLink[]>([]),[students,setStudents]=useState<Student[]>([]);
 const [grade,setGrade]=useState('Kelas 1'),[label,setLabel]=useState('Kelas 1A'),[filter,setFilter]=useState('Semua');
 const [search,setSearch]=useState(''),[message,setMessage]=useState(''),[error,setError]=useState('');
 const [currentPassword,setCurrentPassword]=useState(''),[newPassword,setNewPassword]=useState(''),[passwordOpen,setPasswordOpen]=useState(false);
 const [revoking,setRevoking]=useState<string|null>(null);
 const [teacherTab,setTeacherTab]=useState<'classes'|'questions'|'students'|'account'>('classes');
 useEffect(()=>{request('teacher/session').then(r=>setTeacher(r.user||null)).catch(()=>setTeacher(null)).finally(()=>setLoading(false))},[]);
 useEffect(()=>{if(!teacher)return;refresh();const t=setInterval(refresh,8000);return()=>clearInterval(t)},[teacher?.id,filter]);
 async function refresh(){
  try{const [a,b]=await Promise.all([request('teacher/links'),request('teacher/monitor'+(filter!=='Semua'?'?token='+encodeURIComponent(filter):''))]);
   setLinks(a.links||[]);setStudents(b.students||[]);
  }catch(e:any){setError(e.message);if(/Masuk sebagai Guru|Sesi guru/.test(e.message))setTeacher(null)}
 }
 async function login(){
  setBusy(true);setError('');try{
   const r=await request('teacher/login',{method:'POST',body:JSON.stringify({username:username.trim().toLowerCase(),password})});
   setTeacher(r.user);setPassword('');setMessage('Login guru berhasil. Selamat datang, '+r.user.name+'.');
  }catch(e:any){setError(e.message)}finally{setBusy(false)}
 }
 async function logout(){
  await request('teacher/logout',{method:'POST'}).catch(()=>{});
  setTeacher(null);setLinks([]);setStudents([]);setMessage('');setPassword('');setFilter('Semua');
 }
 async function createLink(){
  if(label.trim().length<2)return setError('Tuliskan nama kelompok, misalnya Kelas 4A.');
  setBusy(true);setError('');try{
   const r=await request('teacher/links',{method:'POST',body:JSON.stringify({grade,label:label.trim()})});
   setMessage('Tautan baru untuk '+r.link.label+' berhasil dibuat. Bagikan kepada siswa kelas tersebut.');
   await refresh();
  }catch(e:any){setError(e.message)}finally{setBusy(false)}
 }
 async function toggleLink(link:TeacherLink){
  setBusy(true);setError('');
  try{
   await request('teacher/links/'+link.token,{method:'PUT',body:JSON.stringify({active:!link.active})});
   setRevoking(null);setMessage(link.active?'Tautan ditutup; siswa baru tidak dapat bergabung.':'Tautan kembali aktif.');
   await refresh();
  }catch(e:any){setError(e.message)}finally{setBusy(false)}
 }
 const fullLink=(token:string)=>window.location.origin+'/gabung/'+token;
 async function copyLink(token:string){
  try{await navigator.clipboard.writeText(fullLink(token));setMessage('Tautan kelas berhasil disalin.')}catch{setError('Salin otomatis tidak tersedia. Pilih teks URL pada kolom tautan lalu salin manual.')}
 }
 async function changePassword(){
  setBusy(true);setError('');try{
   const r=await request('teacher/password',{method:'POST',body:JSON.stringify({currentPassword,newPassword})});
   setTeacher(r.user);setCurrentPassword('');setNewPassword('');setPasswordOpen(false);setMessage('Kata sandi guru berhasil diubah.');
  }catch(e:any){setError(e.message)}finally{setBusy(false)}
 }
 function exportStudents(){
  const safe=(s:unknown)=>{const v=String(s??'').replace(/"/g,'""');return '"'+(/^[=+@\-\t\r]/.test(v)?"'"+v:v)+'"'};
  const rows=[['Nama','Kelas','XP','Pulau selesai','Latihan','Terakhir aktif'],...students.map(s=>[s.name,s.grade,String(s.xp),String(s.completed?.length||0),String(s.gamesPlayed||0),s.updatedAt||''])];
  const csv='\ufeff'+rows.map(r=>r.map(safe).join(',')).join('\r\n');
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download='siswa-guru-'+(teacher?.username||'')+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 const visible=students.filter(s=>s.name.toLowerCase().includes(search.toLowerCase()));
 return <main className="teacher-page">
  <div className="teacher-page-head"><button className="back-link" onClick={onHome}><ArrowLeft size={16}/> Kembali ke permainan</button><span className="teacher-role-tag"><GraduationCap size={18}/> AKUN GURU · AKSES TERBATAS</span><h1>Portal Guru Nusantara</h1><p>Bagikan tautan kelas khususmu, kelola soal Matematika sesuai kelas, dan pantau hanya siswa dari tautan milikmu.</p></div>
  {error&&<div className="teacher-alert bad" role="alert"><XCircle size={18}/>{error}<button onClick={()=>setError('')}>×</button></div>}
  {message&&<div className="teacher-alert good"><CheckCircle2 size={18}/>{message}<button onClick={()=>setMessage('')}>×</button></div>}
  {loading?<div className="teacher-panel"><p>Memeriksa sesi guru…</p></div>:!teacher?
   <section className="teacher-panel teacher-login">
    <div className="teacher-face">👩‍🏫</div><h2>Masuk sebagai Guru</h2><p>Gunakan username dan kata sandi yang dibuat oleh Super Admin. Tidak ada akses ke data guru lain.</p>
    <label>Username Guru<input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Contoh: guru_matematika" autoComplete="username" /></label>
    <label>Kata Sandi<input value={password} type="password" onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&login()} placeholder="Kata sandi guru" autoComplete="current-password"/></label>
    <button className="big-primary" disabled={busy||username.trim().length<3||password.length<8} onClick={login}><LockKeyhole size={18}/>{busy?'Memeriksa…':'Masuk Portal Guru'}</button>
    <small>Akun guru dibuat oleh Super Admin melalui menu Kelola Akun Guru.</small>
   </section>:
   <div className="teacher-workspace">
    <div className="teacher-welcome"><div className="teacher-face">👩‍🏫</div><div><span className="teacher-role-tag">GURU · {teacher.username}</span><h2>Assalamu'alaikum, {teacher.name}! 👋</h2><p>Pilih satu menu untuk mulai bekerja.</p></div><button className="outline-button" onClick={logout}><LogOut size={16}/> Keluar</button></div>
    <nav className="role-nav" aria-label="Menu Portal Guru">
     <button className={teacherTab==='classes'?'selected':''} onClick={()=>setTeacherTab('classes')} aria-current={teacherTab==='classes'?'page':undefined}><Link2 size={18}/> Kelas & Link</button>
     <button className={teacherTab==='questions'?'selected':''} onClick={()=>setTeacherTab('questions')} aria-current={teacherTab==='questions'?'page':undefined}><BookOpen size={18}/> Bank Soal</button>
     <button className={teacherTab==='students'?'selected':''} onClick={()=>setTeacherTab('students')} aria-current={teacherTab==='students'?'page':undefined}><Users size={18}/> Pantau Siswa</button>
     <button className={teacherTab==='account'?'selected':''} onClick={()=>setTeacherTab('account')} aria-current={teacherTab==='account'?'page':undefined}><KeyRound size={18}/> Akun</button>
    </nav>
    {teacherTab==='students'&&<div className="teacher-metrics"><div><Users/><strong>{students.length}</strong><small>Siswa terpantau</small></div><div><Link2/><strong>{links.filter(l=>l.active).length}</strong><small>Tautan aktif</small></div><div><BookOpen/><strong>{students.reduce((n,s)=>n+(s.gamesPlayed||0),0)}</strong><small>Latihan siswa</small></div></div>}
    {teacherTab==='classes'&&<section className="teacher-panel"><div className="teacher-heading"><div><h2>🔗 Buat Tautan Kelas Siswa</h2><p>Setiap guru mendapat tautan unik untuk setiap kelas/kelompok. Siswa cukup mengisi nama tanpa PIN.</p></div></div>
     <div className="teacher-form"><label>Kelas SD<select value={grade} onChange={e=>{setGrade(e.target.value);setLabel(e.target.value+'A')}}>{grades.map(g=><option key={g}>{g}</option>)}</select></label><label>Nama kelompok<input value={label} onChange={e=>setLabel(e.target.value)} maxLength={80} placeholder="Misalnya Kelas 4A"/></label><button className="big-primary" disabled={busy} onClick={createLink}><Plus size={17}/> Buat Link Siswa</button></div>
     <div className="teacher-link-list">
      {links.map(l=><article key={l.token} className={'teacher-link '+(!l.active?'closed':'')}><div><div className="teacher-link-title"><strong>📚 {l.label}</strong><span>{l.grade}</span><span className={l.active?'enabled':'disabled'}>{l.active?'● Aktif':'○ Ditutup'}</span></div><input aria-label={'Tautan untuk '+l.label} readOnly onFocus={e=>e.target.select()} value={fullLink(l.token)}/><small>Dibuat {new Date(l.createdAt).toLocaleDateString('id-ID')}. {l.active?'Bagikan tautan ini hanya ke siswa kelompok tersebut.':'Tautan ditutup untuk pendaftaran baru.'}</small></div><div className="teacher-link-actions"><button onClick={()=>copyLink(l.token)} className="outline-button"><ClipboardCopy size={15}/> Salin Link</button>{revoking===l.token?<><button className="teacher-danger" disabled={busy} onClick={()=>toggleLink(l)}>{l.active?'Ya, Tutup':'Ya, Aktifkan'}</button><button className="outline-button" onClick={()=>setRevoking(null)}>Batal</button></>:<button className="outline-button" onClick={()=>setRevoking(l.token)}>{l.active?'Tutup Link':'Aktifkan Link'}</button>}</div></article>)}
      {links.length===0&&<p className="teacher-empty">Belum ada tautan. Buat link kelas pertama, lalu kirimkan kepada siswamu. 🌟</p>}
     </div>
    </section>}
    {teacherTab==='questions'&&<TeacherQuestions links={links}/>}
    {teacherTab==='students'&&<section className="teacher-panel"><div className="teacher-heading"><div><h2>📊 Pemantauan Siswa Saya</h2><p>Hanya siswa yang bergabung melalui tautan milik guru ini. Diperbarui setiap 8 detik.</p></div><div className="teacher-link-actions"><button className="outline-button" onClick={refresh}><RefreshCw size={15}/> Segarkan</button><button className="outline-button" onClick={exportStudents}>⬇️ Ekspor CSV</button></div></div>
     <div className="teacher-filters"><label>Kelompok<select value={filter} onChange={e=>setFilter(e.target.value)}><option value="Semua">Semua kelompok saya</option>{links.map(l=><option key={l.token} value={l.token}>{l.label} ({l.grade})</option>)}</select></label><label>Cari nama<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari siswa…"/></label></div>
     <div className="teacher-table-wrap"><table><thead><tr><th>Nama Siswa</th><th>Kelas</th><th>Kelompok</th><th>XP</th><th>Pulau</th><th>Latihan</th><th>Terakhir Aktif</th></tr></thead><tbody>{visible.map(s=><tr key={s.id}><td><b>{s.name}</b></td><td>{s.grade}</td><td>{links.find(l=>l.token===s.inviteToken)?.label||'Kelas Saya'}</td><td>{s.xp}</td><td>{s.completed?.length||0}/7</td><td>{s.gamesPlayed}</td><td>{s.updatedAt?new Date(s.updatedAt).toLocaleString('id-ID'):'—'}</td></tr>)}{visible.length===0&&<tr><td colSpan={7}>Belum ada siswa dalam kelompok yang dipilih.</td></tr>}</tbody></table></div>
    </section>}
    {teacherTab==='account'&&<section className="teacher-panel teacher-security"><div className="teacher-heading"><div><h2><KeyRound size={20}/> Keamanan Akun Guru</h2><p>Ganti kata sandi tanpa menghubungi Super Admin.</p></div><button className="outline-button" onClick={()=>setPasswordOpen(!passwordOpen)}>{passwordOpen?'Tutup':'Ganti Kata Sandi'}</button></div>
     {passwordOpen&&<div className="teacher-form"><label>Kata sandi lama<input type="password" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)}/></label><label>Kata sandi baru (minimal 8)<input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)}/></label><button className="big-primary" disabled={busy||newPassword.length<8} onClick={changePassword}>Simpan Kata Sandi</button></div>}
    </section>}
    {teacherTab==='account'&&<p className="teacher-footer-note"><ShieldCheck size={16}/> Akun Guru tidak mempunyai akses ke pengelolaan akun guru lain, pengaturan sistem global, atau data siswa di luar tautannya.</p>}
   </div>}
 </main>;
}
