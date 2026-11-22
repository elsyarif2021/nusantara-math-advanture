// A small deterministic calculator used by the children's learning aid.
// No eval/new Function and no dynamic code execution.
export function evaluateMathExpression(input){
 if(typeof input!=='string'||!input.trim()||input.length>80)throw Error('Masukkan hitungan yang pendek terlebih dahulu.');
 const source=input.replace(/,/g,'.').replace(/[×xX]/g,'*').replace(/[÷:]/g,'/').replace(/[−–]/g,'-').replace(/\s+/g,'');
 if(!/^[0-9.+*/()\-]+$/.test(source))throw Error('Gunakan angka dan tanda +, −, ×, ÷ saja.');
 let position=0;
 const next=()=>source[position];
 const number=()=>{
  let start=position;
  while(/[0-9.]/.test(source[position]||'')&&position<source.length)position++;
  const word=source.slice(start,position);
  if(!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(word))throw Error('Format angka kurang tepat.');
  const value=Number(word);
  if(!Number.isFinite(value)||Math.abs(value)>1e12)throw Error('Angka terlalu besar.');
  return value;
 };
 const factor=()=>{
  if(next()==='+'){position++;return factor()}
  if(next()==='-'){position++;return -factor()}
  if(next()==='('){
   position++;
   const result=sum();
   if(next()!==')')throw Error('Kurung tutup belum ada.');
   position++;
   return result;
  }
  return number();
 };
 const product=()=>{
  let value=factor();
  while(next()==='*'||next()==='/'){
   const op=source[position++];
   const right=factor();
   if(op==='/'&&right===0)throw Error('Tidak boleh membagi dengan nol.');
   value=op==='*'?value*right:value/right;
  }
  return value;
 };
 const sum=()=>{
  let value=product();
  while(next()==='+'||next()==='-'){
   const op=source[position++];
   const right=product();
   value=op==='+'?value+right:value-right;
  }
  return value;
 };
 const result=sum();
 if(position!==source.length)throw Error('Periksa kembali tanda hitungnya.');
 if(!Number.isFinite(result)||Math.abs(result)>1e12)throw Error('Hasil hitungan terlalu besar.');
 return Math.round((result+Number.EPSILON)*1e8)/1e8;
}
export function formatMathResult(number){
 if(!Number.isFinite(number))throw Error('Hasil hitungan tidak valid.');
 return new Intl.NumberFormat('id-ID',{maximumFractionDigits:8}).format(number);
}
