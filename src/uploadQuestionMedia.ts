import {upload} from '@vercel/blob/client';

export type OptionalMediaKind='video'|'audio';
export const OPTIONAL_MEDIA_LIMITS={video:50*1024*1024,audio:15*1024*1024};
const MIME_TYPES={
 video:{'video/mp4':'mp4','video/webm':'webm','video/quicktime':'mov'},
 audio:{'audio/mpeg':'mp3'},
} as const;

export async function uploadQuestionMedia(
 file:File,role:'teacher'|'superadmin',kind:OptionalMediaKind,teacherId?:string
):Promise<string>{
 const ext=(MIME_TYPES[kind] as Record<string,string>)[file.type];
 const allowed=kind==='video'?'Video MP4, WebM, atau MOV':'Audio MP3';
 if(!ext)throw new Error(allowed+' saja yang didukung.');
 if(file.size<1||file.size>OPTIONAL_MEDIA_LIMITS[kind])throw new Error('Ukuran '+kind+' maksimal '+(OPTIONAL_MEDIA_LIMITS[kind]/1048576)+' MB.');
 const owner=role==='superadmin'?'superadmin':teacherId;
 if(!owner||!(owner==='superadmin'||/^t-[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/.test(owner))){
  throw new Error('Sesi guru tidak ditemukan. Silakan masuk kembali.');
 }
 const id=crypto.randomUUID();
 const path='question-media/'+kind+'/'+owner+'/'+id+'.'+ext;
 const result=await upload(path,file,{
  access:'private',
  handleUploadUrl:'/api/question-media/upload',
  clientPayload:JSON.stringify({role}),
  multipart:kind==='video',
 });
 if(result.pathname!==path)throw new Error('Lokasi media tidak sesuai dengan file yang diunggah.');
 return '/api/question-media/file/'+kind+'/'+owner+'/'+id+'.'+ext;
}
