import crypto from 'node:crypto';

export const idTeacherOK=id=>typeof id==='string'&&/^t-[0-9a-f]{8}-[0-9a-f-]{27,}$/.test(id);
export const tokenInviteOK=value=>typeof value==='string'&&/^[a-f0-9]{48}$/.test(value);
export const gradeOK=grade=>typeof grade==='string'&&/^Kelas [1-6]$/.test(grade);
export const usernameOK=username=>typeof username==='string'&&/^[a-z0-9_.-]{3,32}$/.test(username);
export function validateTeacher({name,username,password}){
 const n=String(name??'').trim(),u=String(username??'').trim().toLowerCase();
 if(n.length<2||n.length>80)throw Error('Nama guru harus 2–80 karakter.');
 if(!usernameOK(u))throw Error('Username guru: 3–32 huruf kecil, angka, titik, garis, atau underscore.');
 if(typeof password!=='string'||password.length<8||password.length>128)throw Error('Kata sandi guru harus 8–128 karakter.');
 return {name:n,username:u,password};
}
export function hashPassword(password,salt=crypto.randomBytes(16).toString('hex')){
 const value=crypto.scryptSync(password,salt,64).toString('hex');
 return {salt,passwordHash:value};
}
export function verifyPassword(password,record){
 if(typeof password!=='string'||password.length>128||!record?.passwordHash||!record?.salt)return false;
 try{
  const candidate=crypto.scryptSync(password,record.salt,64);
  const stored=Buffer.from(record.passwordHash,'hex');
  return stored.length===candidate.length&&crypto.timingSafeEqual(stored,candidate);
 }catch{return false}
}
const sig=(part,secret)=>crypto.createHmac('sha256',secret).update(part).digest('hex');
export function makeTeacherSession({id,sessionVersion},secret,now=Date.now()){
 const payload=[id,String(sessionVersion),String(now+8*60*60*1000),crypto.randomBytes(16).toString('hex')].join('.');
 return payload+'.'+sig(payload,secret);
}
export function verifyTeacherSession(cookie,secret,now=Date.now()){
 if(!cookie||typeof cookie!=='string'||!secret||secret.length<32)return null;
 const p=cookie.split('.');
 if(p.length!==5)return null;
 const [id,version,expires,nonce,signature]=p;
 if(!idTeacherOK(id)||!Number.isSafeInteger(Number(version))||!Number.isSafeInteger(Number(expires))||Number(expires)<now||!/^[a-f0-9]{32}$/.test(nonce)||!/^[a-f0-9]{64}$/.test(signature))return null;
 const expected=sig(p.slice(0,4).join('.'),secret);
 const a=Buffer.from(expected,'hex'),b=Buffer.from(signature,'hex');
 if(a.length!==b.length||!crypto.timingSafeEqual(a,b))return null;
 return {teacherId:id,sessionVersion:Number(version),expires:Number(expires)};
}
export function isStudentOwnedByTeacher(student,teacherId){
 return Boolean(student&&teacherId&&student.teacherId===teacherId);
}
export function validateInviteConfig({grade,label}){
 if(!gradeOK(grade))throw Error('Kelas tautan harus kelas SD 1–6.');
 const clean=String(label||'').trim();
 if(clean.length<2||clean.length>80)throw Error('Nama kelompok harus 2–80 karakter.');
 return {grade,label:clean};
}
export function allowJoin(invite,teacher){
 return Boolean(invite&&invite.active!==false&&teacher&&teacher.active!==false&&invite.teacherId===teacher.id&&gradeOK(invite.grade));
}
