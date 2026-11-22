export const MAX_IMAGE_SIZE=2*1024*1024;
const types=new Set(['image/png','image/jpeg','image/jpg','image/webp','image/gif','image/avif','image/bmp','image/x-ms-bmp']);

export async function uploadQuestionImage(file:File,role:'teacher'|'superadmin'):Promise<string>{
 if(!types.has(file.type))throw new Error('Format gambar: JPG/JPEG, PNG, WebP, GIF, AVIF, atau BMP.');
 if(file.size<1||file.size>MAX_IMAGE_SIZE)throw new Error('Ukuran gambar maksimal 2 MB.');
 const dataUrl=await new Promise<string>((resolve,reject)=>{
  const reader=new FileReader();
  reader.onload=()=>resolve(String(reader.result||''));
  reader.onerror=()=>reject(new Error('Gagal membaca gambar dari perangkat.'));
  reader.readAsDataURL(file);
 });
 const response=await fetch('/api/question-images/upload',{
  method:'POST',credentials:'same-origin',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({role,dataUrl}),
 });
 const result=await response.json().catch(()=>({error:'Server tidak mengembalikan respons yang benar.'}));
 if(!response.ok)throw new Error(String(result.error||'Upload gambar gagal.'));
 if(typeof result.url!=='string'||!result.url.startsWith('/api/question-images/file/'))throw new Error('Alamat gambar dari server tidak sesuai.');
 return result.url;
}
