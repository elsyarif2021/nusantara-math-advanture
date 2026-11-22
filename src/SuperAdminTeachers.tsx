import {useCallback,useEffect,useState} from 'react';
import {Check,ClipboardCopy,GraduationCap,KeyRound,LockKeyhole,Plus,RefreshCw,ShieldCheck,UserRound,Users,XCircle} from 'lucide-react';

type Teacher={id:string;name:string;username:string;active:boolean;createdAt?:string;linkCount:number};
type ClassLink={token:string;teacherId:string;grade:string;label:string;active:boolean};
const req=async(path:string,options:RequestInit={})=>{
 const response=await fetch('/api/'+path,{...options,credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json',...options.headers}});
 const json=await response.json().catch(()=>({error:'Respons server tidak valid.'}));
 if(!response.ok)throw Error(String(json.error||'Permintaan gagal.'));
 return json;
};
export default function SuperAdminTeachers(){
 const [teachers,setTeachers]=useState<Teacher[]>([]),[links,setLinks]=useState<ClassLink[]>([]),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false);
 const [fullName,setFullName]=useState(''),[username,setUsername]=useState(''),[password,setPassword]=useState('');
 const [resetId,setResetId]=useState<string|null>(null),[resetPassword,setResetPassword]=useState('');
 const [nameId,setNameId]=useState<string|null>(null),[editName,setEditName]=useState('');
 const [alert,setAlert]=useState(''),[error,setError]=useState(''),[selectedTeacher,setSelectedTeacher]=useState<string|null>(null);
 const load=useCallback(async()=>{
  try{const r=await req('admin/teachers');setTeachers(r.teachers||[]);setLinks(r.links||[])}catch(e:any){setError(e.message)}finally{setLoading(false)}
 },[]);
 useEffect(()=>{load()},[load]);
 async function create(){
  setBusy(true);setError('');try{
   await req('admin/teachers',{method:'POST',body:JSON.stringify({name:fullName.trim(),username:username.trim().toLowerCase(),password})});
   setFullName('');setUsername('');setPassword('');
   setAlert('Akun guru berhasil dibuat. Bagikan username dan kata sandi melalui jalur privat, lalu arahkan guru ke /guru.');
   await load();
  }catch(e:any){setError(e.message)}finally{setBusy(false)}
 }
 async function change(t:Teacher,patch:Record<string,unknown>){
  setBusy(true);setError('');try{
   await req('admin/teachers/'+t.id,{method:'PUT',body:JSON.stringify(patch)});
   setResetId(null);setResetPassword('');setNameId(null);setEditName('');
   setAlert('Akun '+t.name+' berhasil diperbarui.');
   await load();
  }catch(e:any){setError(e.message)}finally{setBusy(false)}
 }
 async function copy(url:string){
  try{await navigator.clipboard.writeText(window.location.origin+url);setAlert('Tautan kelas berhasil disalin.')}catch{setError('Penyalinan otomatis tidak didukung. Pilih teks tautan dan salin manual.')}
 }
 return <section className="admin-box super-teacher-panel" id="super-teachers">
  <div className="admin-title"><div><span className="section-tag"><ShieldCheck size={15}/> HAK AKSES SUPER ADMIN</span><h2>👩‍🏫 Kelola Akun Guru & Kelas</h2><p>Hanya Super Admin boleh membuat, mengaktifkan, menonaktifkan, dan mengatur ulang akun Guru.</p></div><button className="outline-button" onClick={load}><RefreshCw size={15}/> Segarkan</button></div>
  {error&&<div className="teacher-alert bad"><XCircle size={16}/>{error}<button onClick={()=>setError('')}>×</button></div>}
  {alert&&<div className="teacher-alert good"><Check size={16}/>{alert}<button onClick={()=>setAlert('')}>×</button></div>}
  <div className="super-teacher-create"><h3><Plus size={19}/> Tambah Akun Guru</h3><div className="teacher-form">
    <label>Nama Guru<input value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Contoh: Ibu Siti Aminah" maxLength={80}/></label>
    <label>Username Unik<input value={username} onChange={e=>setUsername(e.target.value.toLowerCase())} placeholder="Contoh: siti_sd4" maxLength={32}/></label>
    <label>Kata Sandi Awal (≥8 karakter)<input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Kata sandi guru" autoComplete="new-password"/></label>
    <button className="big-primary" onClick={create} disabled={busy||fullName.trim().length<2||username.trim().length<3||password.length<8}><Plus size={16}/> Buat Guru</button>
   </div><small>Jangan masukkan kata sandi ke chat atau file GitHub. Kata sandi guru disimpan sebagai hash terpisah, bukan teks biasa.</small></div>
  <div className="super-teacher-list-head"><h3>📋 Daftar Guru ({teachers.length})</h3><span>Guru tidak memiliki akses ke data siswa milik guru lain.</span></div>
  <div className="super-teacher-list">{teachers.map(t=><article key={t.id} className="super-teacher-item">
   <div className="super-teacher-meta"><div className="teacher-user-icon"><UserRound size={25}/></div><div><strong>{t.name}</strong><span>@{t.username} · {t.linkCount} tautan kelas aktif</span></div><span className={t.active?'teacher-status-on':'teacher-status-off'}>{t.active?'Aktif':'Nonaktif'}</span></div>
   <div className="super-teacher-actions">
    <button className="outline-button" onClick={()=>setSelectedTeacher(selectedTeacher===t.id?null:t.id)}><Users size={15}/> Tautan Kelas</button>
    <button className="outline-button" onClick={()=>{setNameId(nameId===t.id?null:t.id);setEditName(t.name);setResetId(null)}}>✏️ Ubah Nama</button>
    <button className="outline-button" onClick={()=>{setResetId(resetId===t.id?null:t.id);setResetPassword('');setNameId(null)}}><KeyRound size={15}/> Reset Sandi</button>
    <button className={t.active?'teacher-danger':'outline-button'} disabled={busy} onClick={()=>change(t,{active:!t.active})}>{t.active?'Nonaktifkan Guru':'Aktifkan Guru'}</button>
   </div>
   {nameId===t.id&&<div className="super-teacher-edit"><input value={editName} onChange={e=>setEditName(e.target.value)} placeholder="Nama guru baru"/><button className="big-primary" disabled={busy||editName.trim().length<2} onClick={()=>change(t,{name:editName.trim()})}>Simpan Nama</button><button className="outline-button" onClick={()=>setNameId(null)}>Batal</button></div>}
   {resetId===t.id&&<div className="super-teacher-edit"><input type="password" autoComplete="new-password" value={resetPassword} onChange={e=>setResetPassword(e.target.value)} placeholder="Kata sandi baru minimal 8 karakter"/><button className="big-primary" disabled={busy||resetPassword.length<8} onClick={()=>change(t,{newPassword:resetPassword})}>Simpan Kata Sandi</button><button className="outline-button" onClick={()=>setResetId(null)}>Batal</button></div>}
   {selectedTeacher===t.id&&<div className="super-teacher-links"><h4>Link kelas milik {t.name}</h4>{links.filter(l=>l.teacherId===t.id).map(l=><div key={l.token}><span>{l.label} ({l.grade}) {l.active?'✅':'⛔'}</span><input value={window.location.origin+'/gabung/'+l.token} readOnly onFocus={e=>e.target.select()}/><button className="outline-button" onClick={()=>copy('/gabung/'+l.token)}><ClipboardCopy size={14}/> Salin</button></div>)}{links.filter(l=>l.teacherId===t.id).length===0&&<p>Guru ini belum membuat tautan kelas.</p>}</div>}
  </article>)}{!loading&&teachers.length===0&&<div className="teacher-empty">Belum ada akun Guru. Buat akun di formulir atas, lalu guru dapat membuat link siswa dari portalnya.</div>}</div>
  <div className="teacher-super-notice"><LockKeyhole size={18}/> Super Admin mengawasi seluruh akun, soal, dan siswa. Guru hanya mengawasi siswa yang mendaftar melalui tautan miliknya.</div>
 </section>;
}
