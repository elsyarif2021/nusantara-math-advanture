import {useEffect,useMemo,useState} from 'react';
import {BookOpen,Check,FilePenLine,Plus,RefreshCw,Save,ShieldCheck,Trash2,X} from 'lucide-react';
import {gradeTopics,grades,islandData,type Question} from './learning';
import {uploadQuestionImage} from './uploadQuestionImage';

type ClassLink={token:string;grade:string;label:string;active:boolean};
type TeacherQuestion=Question&{id:string;teacherId:string;updatedAt?:string};
async function request(path:string,init:RequestInit={}):Promise<any>{
 const res=await fetch('/api/'+path,{...init,credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json',...(init.headers||{})}});
 const data=await res.json().catch(()=>({error:'Respons tidak valid.'}));
 if(!res.ok)throw Error(String(data.error||('HTTP '+res.status)));
 return data;
}
const empty=(grade:string):Question=>({grade,topic:gradeTopics[grade][0],cultureId:'sumatra',question:'',options:['','','',''],answer:'',explanation:'',imageUrl:'',videoUrl:'',audioUrl:'',active:true});
export default function TeacherQuestions({links,mode='teacher',teacherId}:{links:ClassLink[];mode?:'teacher'|'superadmin';teacherId?:string}){
 const base=mode==='superadmin'?'admin/teacher-questions':'teacher/questions';
 const ownedGrades=useMemo(()=>grades.filter(g=>links.some(l=>l.grade===g)),[links]);
 const [items,setItems]=useState<TeacherQuestion[]>([]),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[imageUploading,setImageUploading]=useState(false);
 const [gradeFilter,setGradeFilter]=useState('Semua'),[regionFilter,setRegionFilter]=useState('Semua'),[topicFilter,setTopicFilter]=useState('Semua'),[search,setSearch]=useState('');
 const [draft,setDraft]=useState<Question|null>(null),[confirmDelete,setConfirmDelete]=useState<string|null>(null),[error,setError]=useState(''),[success,setSuccess]=useState('');
 async function refresh(){try{const r=await request(base+(mode==='superadmin'?'?teacherId='+encodeURIComponent(teacherId||''):''));setItems(r.questions||[])}catch(e:any){setError(e.message)}finally{setLoading(false)}}
 useEffect(()=>{refresh()},[mode,teacherId]);
 const accessible=items.filter(q=>ownedGrades.includes(q.grade||''));
 const filtered=accessible.filter(q=>(gradeFilter==='Semua'||q.grade===gradeFilter)&&(topicFilter==='Semua'||q.topic===topicFilter)&&(regionFilter==='Semua'||q.cultureId===regionFilter)&&(!search||[q.question,q.explanation,...q.options].join(' ').toLowerCase().includes(search.toLowerCase())));
 const topics=gradeFilter==='Semua'?[...new Set(ownedGrades.flatMap(g=>gradeTopics[g]))]:gradeTopics[gradeFilter]||[];
 function clearMessages(){setError('');setSuccess('')}
 function newQuestion(){
  if(!ownedGrades.length)return setError('Buat tautan kelas terlebih dahulu agar kelas dapat dikelola.');
  setDraft(empty(gradeFilter==='Semua'||!ownedGrades.includes(gradeFilter)?ownedGrades[0]:gradeFilter));
  setConfirmDelete(null);clearMessages();
  setTimeout(()=>document.getElementById('teacher-question-form')?.scrollIntoView({behavior:'smooth',block:'center'}),100);
 }
 function editQuestion(q:TeacherQuestion){
  setDraft({...q,options:[...q.options],active:q.active!==false});
  setConfirmDelete(null);clearMessages();
  setTimeout(()=>document.getElementById('teacher-question-form')?.scrollIntoView({behavior:'smooth',block:'center'}),100);
 }
 async function onPickImage(file?:File){
  if(!file||!draft)return;
  setImageUploading(true);clearMessages();
  try{
   const url=await uploadQuestionImage(file,mode==='superadmin'?'superadmin':'teacher');
   setDraft(d=>d?{...d,imageUrl:url}:d);
   setSuccess('Gambar berhasil diunggah. Simpan soal untuk menerapkan gambar.');
  }catch(e:any){setError(e.message)}finally{setImageUploading(false)}
 }
 async function save(){
  if(!draft)return;
  setBusy(true);clearMessages();
  try{
   const path=draft.id?base+'/'+(mode==='superadmin'?encodeURIComponent(teacherId||'')+'/':'')+encodeURIComponent(draft.id):base;
   await request(path,{method:draft.id?'PUT':'POST',body:JSON.stringify({question:draft,...(mode==='superadmin'?{teacherId}:{})})});
   await refresh();setDraft(null);
   setSuccess(draft.id?'Perubahan soal berhasil disimpan.':'Soal baru berhasil ditambahkan ke kelas yang dipilih.');
  }catch(e:any){setError(e.message)}finally{setBusy(false)}
 }
 async function remove(q:TeacherQuestion){
  setBusy(true);clearMessages();
  try{
   await request(base+'/'+(mode==='superadmin'?encodeURIComponent(teacherId||'')+'/':'')+encodeURIComponent(q.id),{method:'DELETE'});
   await refresh();if(draft?.id===q.id)setDraft(null);setConfirmDelete(null);setSuccess('Soal berhasil dihapus dari Bank Soal Guru.');
  }catch(e:any){setError(e.message)}finally{setBusy(false)}
 }
 const formOK=Boolean(draft&&ownedGrades.includes(draft.grade||'')&&gradeTopics[draft.grade||'']?.includes(draft.topic||'')&&draft.question.trim().length>=6&&draft.explanation.trim().length>=5&&draft.options.length===4&&draft.options.every(x=>x.trim())&&new Set(draft.options.map(x=>x.trim())).size===4&&draft.options.includes(draft.answer));
 return <section className="teacher-panel teacher-question-manager" id="teacher-question-manager">
  <div className="teacher-heading"><div><span className="teacher-role-tag"><ShieldCheck size={15}/> {mode==='superadmin'?'SUPER ADMIN · PENGAWASAN SOAL GURU':'CRUD KHUSUS KELAS GURU'}</span><h2>📚 {mode==='superadmin'?'Kelola Bank Soal Guru':'Bank Soal Kelas Saya'}</h2><p>{mode==='superadmin'?'Super Admin dapat mengaudit dan mengelola soal milik guru yang dipilih.':'Tambah, ubah, lihat, dan hapus soal Matematika SD. Hanya soal yang kamu buat pada kelas milikmu yang dapat kamu kelola.'}</p></div><div className="teacher-link-actions"><button className="outline-button" onClick={refresh} disabled={busy}><RefreshCw size={15}/> Segarkan</button><button className="big-primary" onClick={newQuestion} disabled={busy||!ownedGrades.length}><Plus size={17}/> Tambah Soal</button></div></div>
  {error&&<div role="alert" className="teacher-alert bad">{error}<button onClick={()=>setError('')}>×</button></div>}
  {success&&<div className="teacher-alert good"><Check size={17}/>{success}<button onClick={()=>setSuccess('')}>×</button></div>}
  {!ownedGrades.length?<div className="teacher-question-empty"><span>🔗</span><h3>Buat tautan kelas terlebih dahulu</h3><p>Kamu boleh mengelola soal hanya setelah mempunyai tautan kelas dari Portal Guru. Buat kelas di bagian atas halaman, lalu mulai menambahkan soal.</p></div>:<>
   <div className="teacher-question-summary"><span><BookOpen size={18}/> {accessible.length} soal {mode==='superadmin'?'guru ini':'milikmu'}</span><span>{ownedGrades.length} kelas dikelola</span><span>{accessible.filter(q=>q.active!==false).length} soal aktif</span></div>
   <div className="teacher-question-filters">
    <label>Kelas<select value={gradeFilter} onChange={e=>{setGradeFilter(e.target.value);setTopicFilter('Semua')}}><option value="Semua">Semua kelas saya</option>{ownedGrades.map(g=><option key={g}>{g}</option>)}</select></label>
    <label>Topik<select value={topicFilter} onChange={e=>setTopicFilter(e.target.value)}><option value="Semua">Semua topik</option>{topics.map(t=><option key={t}>{t}</option>)}</select></label>
    <label>Pulau<select value={regionFilter} onChange={e=>setRegionFilter(e.target.value)}><option value="Semua">Semua pulau</option>{islandData.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}</select></label>
    <label>Cari soal<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Kata kunci…"/></label>
   </div>
   {draft&&<div className="teacher-question-form" id="teacher-question-form">
    <div className="teacher-question-form-head"><h3>{draft.id?'✏️ Edit Soal Kelas':'➕ Tambah Soal Baru'}</h3><button className="outline-button" onClick={()=>setDraft(null)}><X size={15}/> Tutup</button></div>
    <div className="teacher-question-form-grid">
     <label>Kelas SD *<select value={draft.grade||ownedGrades[0]} onChange={e=>{const grade=e.target.value;setDraft(d=>d?{...d,grade,topic:gradeTopics[grade][0]}:d)}}>{ownedGrades.map(g=><option key={g}>{g}</option>)}</select></label>
     <label>Topik sesuai kelas *<select value={draft.topic||''} onChange={e=>setDraft(d=>d?{...d,topic:e.target.value}:d)}>{gradeTopics[draft.grade||ownedGrades[0]].map(t=><option key={t}>{t}</option>)}</select></label>
     <label>Pulau / budaya *<select value={draft.cultureId||'sumatra'} onChange={e=>setDraft(d=>d?{...d,cultureId:e.target.value}:d)}>{islandData.map(i=><option key={i.id} value={i.id}>{i.name} — {i.culture}</option>)}</select></label>
     <label>Status<select value={draft.active===false?'nonaktif':'aktif'} onChange={e=>setDraft(d=>d?{...d,active:e.target.value==='aktif'}:d)}><option value="aktif">Aktif: tampil di kuis</option><option value="nonaktif">Nonaktif: disimpan saja</option></select></label>
    </div>
    <label>Teks soal / soal cerita *<textarea rows={3} maxLength={1200} value={draft.question} onChange={e=>setDraft(d=>d?{...d,question:e.target.value}:d)} placeholder="Contoh: Ada 12 kain batik di pameran. Terjual 4. Berapa sisanya?"/></label>
    <div className="teacher-question-options"><strong>Empat pilihan jawaban (A–D) *</strong><div className="teacher-question-form-grid">{draft.options.map((v,i)=><label key={i}>Pilihan {String.fromCharCode(65+i)}<input value={v} maxLength={230} onChange={e=>setDraft(d=>{if(!d)return d;const options=[...d.options],old=options[i];options[i]=e.target.value;return {...d,options,answer:d.answer===old?e.target.value:d.answer}})}/></label>)}</div></div>
    <label>Kunci jawaban *<select value={draft.answer} onChange={e=>setDraft(d=>d?{...d,answer:e.target.value}:d)}><option value="">Pilih jawaban benar</option>{draft.options.map((v,i)=><option key={i} value={v} disabled={!v.trim()}>{String.fromCharCode(65+i)} — {v||'(belum diisi)'}</option>)}</select></label>
    <label>Pembahasan *<textarea rows={3} maxLength={1800} value={draft.explanation} onChange={e=>setDraft(d=>d?{...d,explanation:e.target.value}:d)} placeholder="Tunjukkan cara menghitung jawaban yang benar…"/></label>
    <div className="question-image-uploader">
     <label>🖼️ Gambar Soal — langsung dari HP / laptop
      <input type="file" accept="image/jpeg,image/png,image/webp" disabled={imageUploading||busy} aria-label="Pilih gambar soal dari perangkat" onChange={e=>{const f=e.currentTarget.files?.[0];if(f)void onPickImage(f);e.currentTarget.value=''}}/>
     </label>
     <small>Ketuk “Pilih File” untuk membuka galeri atau file perangkat. JPG, PNG, WEBP · maksimal 2 MB. Tidak perlu menyalin tautan gambar.</small>
     {imageUploading&&<span className="upload-image-status" role="status">Mengunggah gambar dari perangkat…</span>}
     {draft.imageUrl&&<div className="question-image-preview"><img src={draft.imageUrl} alt="Pratinjau gambar soal yang ditambahkan" loading="lazy"/><button type="button" className="outline-button" disabled={imageUploading||busy} onClick={()=>setDraft(d=>d?{...d,imageUrl:''}:d)}>Hapus gambar dari soal</button></div>}
    </div>
    <details className="question-extra-media">
     <summary>Media tambahan (video YouTube / audio eksternal, opsional)</summary>
     <div className="teacher-question-form-grid media">
      <label>Video YouTube<input type="url" value={draft.videoUrl||''} onChange={e=>setDraft(d=>d?{...d,videoUrl:e.target.value}:d)} placeholder="https://youtu.be/…"/></label>
      <label>Audio eksternal<input type="url" value={draft.audioUrl||''} onChange={e=>setDraft(d=>d?{...d,audioUrl:e.target.value}:d)} placeholder="https://…/audio.mp3"/></label>
     </div>
    </details>
    <div className="teacher-question-form-actions"><span>Gambar dipilih dari perangkat dan tersimpan otomatis. Tekan Simpan Soal untuk menautkannya ke soal.</span><button className="outline-button" onClick={()=>setDraft(null)}>Batal</button><button className="big-primary" disabled={busy||imageUploading||!formOK} onClick={save}><Save size={16}/>{busy?'Menyimpan…':draft.id?'Simpan Perubahan':'Simpan Soal'}</button></div>
   </div>}
   <div className="teacher-question-list-head"><strong>{filtered.length} soal sesuai filter</strong><small>{mode==='superadmin'?'Super Admin dapat mengelola bank setiap guru sesuai pilihan.':'Soal guru lain dan bank global tidak dapat diedit di sini.'}</small></div>
   <div className="teacher-question-list">{filtered.map(q=><article key={q.id} className="teacher-question-item">
    <div className="teacher-question-tags"><span>{q.grade}</span><span>{q.topic}</span><span>{islandData.find(x=>x.id===q.cultureId)?.name||'Nusantara'}</span><span className={q.active===false?'disabled':'enabled'}>{q.active===false?'Nonaktif':'Aktif'}</span></div>
    <h3>{q.question}</h3>
    <div className="teacher-question-preview">{q.options.map((v,i)=><span className={v===q.answer?'right':''} key={i}><b>{String.fromCharCode(65+i)}.</b> {v}{v===q.answer?' ✓':''}</span>)}</div>
    <p><b>Pembahasan:</b> {q.explanation}</p>
    {q.imageUrl&&<img className="question-list-image" src={q.imageUrl} alt="Ilustrasi untuk soal ini" loading="lazy"/>}
    <div className="teacher-question-media">{q.imageUrl&&<span>🖼️ Gambar</span>}{q.videoUrl&&<span>🎬 YouTube</span>}{q.audioUrl&&<span>🔊 Audio</span>}</div>
    <div className="teacher-question-actions">
     <button className="outline-button" disabled={busy} onClick={()=>editQuestion(q)}><FilePenLine size={15}/> Edit</button>
     {confirmDelete===q.id?<><strong>Yakin hapus?</strong><button className="teacher-danger" disabled={busy} onClick={()=>remove(q)}><Trash2 size={15}/> Ya, Hapus</button><button className="outline-button" onClick={()=>setConfirmDelete(null)}>Batal</button></>:<button className="teacher-danger-outline" disabled={busy} onClick={()=>setConfirmDelete(q.id)}><Trash2 size={15}/> Hapus</button>}
    </div>
   </article>)}{!loading&&filtered.length===0&&<div className="teacher-question-empty"><span>📝</span><h3>Belum ada soal untuk pilihan ini</h3><p>Tekan Tambah Soal untuk membuat latihan baru sesuai kelas yang kamu kelola.</p><button className="big-primary" onClick={newQuestion}><Plus size={15}/> Tambah Soal</button></div>}</div>
  </>}
 </section>;
}
