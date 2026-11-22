export type Question={id?:string;question:string;options:string[];answer:string;explanation:string;grade?:string;topic?:string;imageUrl?:string;videoUrl?:string;audioUrl?:string;cultureId?:string;active?:boolean;createdAt?:string;updatedAt?:string};
export type Score={region:string;score:number;total:number;date:string};
export type Student={id:string;name:string;grade:string;xp:number;gamesPlayed:number;completed:number[];recent:Score[];updatedAt?:string;teacherId?:string|null;inviteToken?:string|null};
export type SchoolConfig={name:string;music:boolean;logoUrl?:string};

export const islandData=[
 {id:'sumatra',name:'Sumatra',region:'Sumatra Barat',symbol:'🏠',culture:'Rumah Gadang dan Tari Piring',fact:'Rumah Gadang berasal dari budaya Minangkabau di Sumatra Barat. Atapnya dikenal bergonjong.',objects:'piring tari',a:'8',b:'4',description:'Menghitung piring Tari Piring di halaman Rumah Gadang.',color:'#ffcc7c'},
 {id:'jawa',name:'Jawa',region:'Jawa Tengah',symbol:'🏛️',culture:'Candi Borobudur dan Batik',fact:'Candi Borobudur berada di Magelang, Jawa Tengah. Batik merupakan warisan budaya Indonesia.',objects:'kain batik',a:'6',b:'3',description:'Menjelajah candi dan pola batik yang indah.',color:'#d4b5ff'},
 {id:'kalimantan',name:'Kalimantan',region:'Kalimantan Tengah',symbol:'🌳',culture:'Rumah Betang dan Orangutan',fact:'Rumah Betang merupakan rumah panjang tradisional sejumlah masyarakat Dayak. Orangutan hidup di hutan Kalimantan.',objects:'bibit pohon',a:'7',b:'5',description:'Menanam bibit untuk melindungi hutan orangutan.',color:'#b8e9a1'},
 {id:'sulawesi',name:'Sulawesi',region:'Sulawesi Selatan',symbol:'🏡',culture:'Tongkonan dan Kerbau',fact:'Tongkonan adalah rumah adat masyarakat Toraja di Sulawesi Selatan, dikenal dengan bentuk atap melengkung.',objects:'hiasan kayu',a:'5',b:'4',description:'Mengamati bentuk dan hiasan Rumah Tongkonan.',color:'#ffc69f'},
 {id:'bali',name:'Bali & Nusa Tenggara',region:'Bali dan Nusa Tenggara',symbol:'🌺',culture:'Pura Bali dan Sasando NTT',fact:'Pura adalah tempat ibadah umat Hindu di Bali. Sasando merupakan alat musik tradisional dari Pulau Rote, Nusa Tenggara Timur.',objects:'keranjang bunga',a:'9',b:'3',description:'Menghitung bunga dan mengenal alat musik Sasando.',color:'#ffc0de'},
 {id:'maluku',name:'Maluku',region:'Kepulauan Banda, Maluku',symbol:'🌰',culture:'Pala Banda dan Tifa',fact:'Kepulauan Banda dikenal sebagai penghasil pala. Tifa digunakan dalam beragam tradisi musik di Maluku dan Papua.',objects:'buah pala',a:'6',b:'5',description:'Menghitung hasil panen pala di Kepulauan Banda.',color:'#ffe69b'},
 {id:'papua',name:'Papua',region:'Pegunungan Papua',symbol:'🦜',culture:'Noken dan Burung Cenderawasih',fact:'Noken adalah tas rajutan tradisional Papua. Cenderawasih merupakan kelompok burung khas kawasan Papua.',objects:'noken',a:'4',b:'7',description:'Mengenal kerajinan noken dan alam Papua.',color:'#b0d6ff'}
] as const;
export const gradeTopics:Record<string,string[]>={
 'Kelas 1':['Bilangan 1–100','Puluhan & Satuan','Penjumlahan','Pengurangan','Bangun Datar','Pengukuran Tidak Baku','Diagram Gambar'],
 'Kelas 2':['Bilangan sampai 1.000','Penjumlahan Bersusun','Pengurangan Bersusun','Perkalian','Pembagian','Uang & Pengukuran','Diagram Gambar'],
 'Kelas 3':['Bilangan sampai 10.000','Pecahan Sederhana','Operasi Campuran','Keliling Bangun Datar','Luas Persegi Panjang','Konversi Satuan','Piktogram'],
 'Kelas 4':['Bilangan Cacah Besar','Pecahan & Desimal','Kelipatan & Faktor','Operasi Desimal','Luas & Keliling','Sudut & Simetri','Diagram Batang'],
 'Kelas 5':['Bilangan & Nilai Tempat','Operasi Pecahan','Desimal & Persen','FPB & KPK','Bangun Datar Gabungan','Volume Kubus & Balok','Kecepatan & Data'],
 'Kelas 6':['Pecahan & Desimal','Rasio & Proporsi','FPB & KPK','Luas Permukaan','Volume Bangun Ruang','Denah & Skala','Peluang & Data']
};
export const grades=Object.keys(gradeTopics);
export const topicChips=[['🔢','Bilangan'],['➕','Penjumlahan'],['➖','Pengurangan'],['✖️','Perkalian'],['➗','Pembagian'],['½','Pecahan'],['🔺','Bangun Datar'],['📏','Pengukuran'],['📊','Data'],['🧊','Volume']];
const r=(a:number,b:number)=>Math.floor(Math.random()*(b-a+1))+a;
const gcd=(a:number,b:number):number=>b===0?a:gcd(b,a%b);
const only=(v:number)=>Number.isInteger(v)?String(v):String(Math.round(v*100)/100);
function numeric(text:string,answer:number,explanation:string):Question{
 const opts=[answer];for(const delta of [1,-1,2,-2,3,-3,5,-5,10,-10,answer>2?-Math.ceil(answer/3):7]){
  const x=answer+delta;
  if(x>=0&&!opts.includes(x)&&opts.length<4)opts.push(x);
 }
 while(opts.length<4){const n=answer+r(4,15);if(!opts.includes(n))opts.push(n)}
 const shuffled=opts.map(only).sort(()=>Math.random()-.5);return {question:text,options:shuffled,answer:only(answer),explanation};
}
function choices(text:string,ans:string,wrong:string[],why:string):Question{
 const possibilities=[...new Set([ans,...wrong])];
 if(new RegExp('^[0-9]+/[0-9]+$').test(ans)){const [num,den]=ans.split('/').map(Number);for(const candidate of [(num+1)+'/'+den,num+'/'+(den+1),(num+2)+'/'+den,(num+1)+'/'+(den+1)])if(!possibilities.includes(candidate))possibilities.push(candidate)}
 for(const fallback of ['Tidak cukup data','0','1','2','3'])if(possibilities.length<4&&!possibilities.includes(fallback))possibilities.push(fallback);
 const options=possibilities.slice(0,4).sort(()=>Math.random()-.5);
 return {question:text,answer:ans,options,explanation:why};
}
export function makeCultureQuestion(grade:string,stage:number):Question{
 const level=Number(grade.replace('Kelas ','')),zone=islandData[stage],item=zone.objects;
 const a=r(level===1?2:6,level===1?12:level<=3?30:60),b=r(1,level===1?6:level<=3?15:24),n=r(2,8),k=r(2,5);
 const inRegion='Di '+zone.region+', ';
 let q:Question;
 switch(level){
 case 1:switch(stage){
 case 0:q=numeric(inRegion+'ada '+a+' '+item+'. Berapa banyak seluruh '+item+'?',a,'Hitung satu per satu sebanyak '+a+'.');break;
 case 1:{const tens=r(1,8),units=r(0,9);q=numeric('Di pameran budaya '+zone.name+', terkumpul '+tens+' puluhan dan '+units+' satuan benda. Berapa seluruh benda?',tens*10+units,tens+' puluhan = '+(tens*10)+', ditambah '+units+' satuan.');break}
 case 2:q=numeric(inRegion+'ada '+a+' '+item+'. Datang lagi '+b+' '+item+'. Berapa jumlah semuanya?',a+b,a+' + '+b+' = '+(a+b)+'.');break;
 case 3:q=numeric('Di '+zone.region+' ada '+(a+b)+' '+item+'. Sebanyak '+b+' dibawa pulang. Berapa sisanya?',a,(a+b)+' − '+b+' = '+a+'.');break;
 case 4:q=choices('Bentuk yang memiliki 3 sisi seperti bendera kecil pada perahu Nusantara adalah ...','Segitiga',['Lingkaran','Persegi','Persegi panjang'],'Segitiga memiliki tiga sisi dan tiga sudut.');break;
 case 5:q=numeric('Panjang hiasan '+zone.name+' diukur memakai '+a+' jengkal. Berapa jengkal panjangnya?',a,'Pengukuran tidak baku dapat menggunakan jengkal.');break;
 default:q=numeric('Pada diagram gambar, satu ikon 🌸 = satu bunga. Ada '+n+' ikon 🌸. Berapa bunga seluruhnya?',n,'Satu ikon menunjukkan satu bunga, jadi jumlahnya '+n+'.');
 }break;
 case 2:switch(stage){
 case 0:{const val=r(101,999);q=numeric('Tiket festival budaya '+zone.name+' bernomor '+val+'. Nomor tersebut bernilai ...',val,'Bacalah angka sesuai ratusan, puluhan, dan satuannya.');break}
 case 1:q=numeric('Panitia mengumpulkan '+(a+80)+' '+item+' lalu menambah '+(b+30)+' lagi. Total benda?',a+b+110,'Jumlahkan puluhan dan satuan: '+(a+80)+' + '+(b+30)+'.');break;
 case 2:q=numeric('Ada '+(a+b+100)+' '+item+' di gudang. Sebanyak '+(b+30)+' diberikan. Sisanya?',a+70,(a+b+100)+' − '+(b+30)+' = '+(a+70)+'.');break;
 case 3:q=numeric('Ada '+n+' kelompok, masing-masing membawa '+k+' '+item+'. Berapa totalnya?',n*k,n+' × '+k+' = '+(n*k)+'.');break;
 case 4:q=numeric('Sebanyak '+(n*k)+' '+item+' dibagikan rata kepada '+n+' kelompok. Tiap kelompok dapat?',k,(n*k)+' ÷ '+n+' = '+k+'.');break;
 case 5:if(Math.random()<.5)q=numeric('Harga satu cendera mata '+zone.name+' Rp'+(k*1000)+'. Kamu membeli '+n+' buah. Total harga (rupiah)?',k*n*1000,'Kalikan harga satu benda dengan jumlah pembelian.');else q=numeric('Perjalanan menuju rumah adat sepanjang '+n+' meter. Panjangnya ... sentimeter.',n*100,'1 meter sama dengan 100 sentimeter.');break;
 default:q=numeric('Di piktogram, setiap gambar ⭐ mewakili 2 pengunjung. Ada '+n+' gambar ⭐. Berapa pengunjung?',n*2,n+' gambar × 2 = '+(n*2)+'.');
 }break;
 case 3:switch(stage){
 case 0:{const val=r(1000,9999);q=numeric('Pada festival '+zone.name+', tercatat '+val+' pengunjung. Tuliskan bilangan pengunjung itu!',val,'Nilai tempat bilangan terdiri atas ribuan, ratusan, puluhan, dan satuan.');break}
 case 1:q=choices('Panitia membagi satu kue khas Nusantara menjadi '+k+' bagian sama besar. Satu bagian ditulis ...','1/'+k,['1/'+(k+1),k+'/1','2/'+(k+1)],'Satu dari '+k+' bagian sama besar adalah 1/'+k+'.');break;
 case 2:q=numeric('Di '+zone.name+', ada '+n+' kelompok yang membawa '+k+' '+item+' setiap kelompok. Ditambah '+a+' buah lagi. Berapa total?',n*k+a,'Kerjakan perkalian dahulu: '+n+'×'+k+'+'+a+' = '+(n*k+a)+'.');break;
 case 3:q=numeric('Panggung budaya berbentuk persegi panjang, panjang '+a+' m dan lebar '+b+' m. Kelilingnya?',2*(a+b),'Keliling = 2×(panjang+lebar).');break;
 case 4:q=numeric('Lantai pameran berbentuk persegi panjang berukuran '+n+' m × '+k+' m. Luasnya ... m².',n*k,'Luas = panjang × lebar.');break;
 case 5:q=numeric('Jalan menuju rumah adat sepanjang '+n+' meter. Berapa sentimeter?',n*100,'1 meter = 100 sentimeter.');break;
 default:q=numeric('Diagram gambar: 🌴🌴🌴🌴 setiap 🌴 mewakili '+k+' pohon. Jumlah seluruh pohon?',4*k,'Empat gambar × '+k+' pohon per gambar.');
 }break;
 case 4:switch(stage){
 case 0:{const val=r(10000,99999);q=numeric('Jumlah benda dalam pameran daerah adalah '+val+'. Bilangan tersebut adalah ...',val,'Perhatikan nilai tempat puluh ribuan hingga satuan.');break}
 case 1:q=choices('Dari '+k+' bagian kue yang sama, '+(k-1)+' bagian diambil. Pecahan yang diambil adalah ...',(k-1)+'/'+k,['1/'+k,k+'/'+(k-1),'2/'+(k+1)],'Pembilang menyatakan '+(k-1)+' bagian yang diambil dari '+k+' bagian.');break;
 case 2:q=numeric('Ada '+n+' baris hiasan dan setiap baris berisi '+k+' benda. Kelipatan '+k+' pada urutan ke-'+n+' adalah ...',n*k,'Kelipatan ke-'+n+' dari '+k+' = '+n+'×'+k+'.');break;
 case 3:{const x=r(10,40)/10,y=r(10,30)/10;const sum=Math.round((x+y)*10)/10;q=choices('Penjual cendera mata mengukur pita '+x.toFixed(1).replace('.',',')+' m dan '+y.toFixed(1).replace('.',',')+' m. Total panjangnya ... m.',sum.toFixed(1).replace('.',','),[(sum+.1).toFixed(1).replace('.',','),(sum+1).toFixed(1).replace('.',','),(sum-.1).toFixed(1).replace('.',',')],'Jumlahkan kedua bilangan desimal.');break}
 case 4:q=numeric('Halaman rumah adat berbentuk persegi panjang, panjang '+n+' m dan lebar '+k+' m. Luasnya?',n*k,'Luas = panjang × lebar = '+n+' × '+k+'.');break;
 case 5:if(Math.random()<.5)q=choices('Motif kain memiliki satu garis lipatan yang membagi dua bagian sama persis. Garis itu disebut ...','Sumbu simetri',['Jari-jari','Diagonal ruang','Sisi lengkung'],'Sumbu simetri membagi bentuk menjadi dua bagian yang saling menutupi.');else q=numeric('Sudut siku-siku pada pintu rumah adat besarnya ... derajat.',90,'Sudut siku-siku selalu 90 derajat.');break;
 default:q=numeric('Diagram batang mencatat '+a+' pengunjung hari Senin dan '+b+' pengunjung hari Selasa. Berapa jumlahnya?',a+b,'Jumlah dua batang: '+a+'+'+b+' = '+(a+b)+'.');
 }break;
 case 5:switch(stage){
 case 0:{const val=r(100000,900000);q=numeric('Jumlah pengunjung museum di Nusantara '+val+'. Bilangan ini bernilai ...',val,'Pahami nilai tempat ratus ribuan.');break}
 case 1:{const den=r(5,10),p=r(1,3),j=r(1,den-p);q=choices('Di festival budaya, '+p+'/'+den+' bagian hiasan berwarna merah dan '+j+'/'+den+' bagian berwarna biru. Jumlah bagiannya adalah ...',(p+j)+'/'+den,[p+'/'+den,j+'/'+den,(p+j)+'/'+(den+1)],'Jika penyebut sama, jumlahkan pembilang: ('+p+'+'+j+')/'+den+'.');break}
 case 2:{const v=r(10,85);q=numeric(v+'% dari 100 bendera kecil adalah ... bendera.',v,'Persen berarti per seratus.');break}
 case 3:{const x=n*k,y=n*k+k;const f=gcd(x,y);q=numeric('Panitia budaya mempunyai '+x+' pita merah dan '+y+' pita biru. Keduanya dibagi ke kelompok sebanyak mungkin dengan isi sama tanpa sisa. Maksimal jumlah kelompok (FPB)?',f,'FPB dari '+x+' dan '+y+' adalah '+f+'.');break}
 case 4:q=numeric('Ada dua petak taman pameran, berukuran '+n+'×'+k+' m dan '+b+'×2 m, tanpa tumpang tindih. Luas total?',n*k+b*2,'Jumlah luas kedua petak yang tidak tumpang tindih.');break;
 case 5:q=numeric('Kotak suvenir berbentuk balok dengan ukuran '+n+' cm, '+k+' cm, dan 3 cm. Volumenya ... cm³.',n*k*3,'Volume balok = panjang × lebar × tinggi.');break;
 default:if(Math.random()<.5)q=numeric('Kapal menempuh '+n*10+' km dalam '+k+' jam. Kecepatan rata-rata ... km/jam.',n*10/k,'Kecepatan = jarak / waktu.');else q=numeric('Pada diagram batang, pengunjung pameran hari Sabtu '+a+' orang dan hari Minggu '+b+' orang. Jumlah pengunjung?',a+b,'Jumlah kedua batang = '+a+'+'+b+'.');
 }break;
 default:switch(stage){
 case 0:{const val=r(1,8);q=choices('Dalam festival, '+val+'/10 bagian peserta memakai pakaian merah. Bentuk desimal pecahan ini adalah ...','0,'+val,['0,'+(val===9?8:val+1),val+',0','0,0'+val],'Penyebut 10 berarti satu angka di belakang koma.');break}
 case 1:q=numeric('Perbandingan penari pria dan wanita adalah '+n+':'+k+'. Jika keduanya memiliki '+(n+k)+' bagian yang sama, jumlah bagian seluruhnya?',n+k,'Jumlah bagian perbandingan = '+n+' + '+k+'.');break;
 case 2:{const lcm=n*k/gcd(n,k);q=numeric('Di festival '+zone.name+', kelompok drum tampil setiap '+n+' menit dan kelompok tari setiap '+k+' menit. Setelah berapa menit mereka tampil bersama lagi (KPK)?',lcm,'KPK dari '+n+' dan '+k+' adalah '+lcm+'.');break}
 case 3:q=numeric('Kubus suvenir memiliki rusuk '+n+' cm. Luas permukaannya ... cm².',6*n*n,'Luas permukaan kubus = 6 × rusuk².');break;
 case 4:{const shape=r(0,3);if(shape===0)q=numeric('Kotak cendera mata berbentuk balok ukuran '+n+'×'+k+'×2 cm. Volumenya ... cm³.',n*k*2,'Volume balok = panjang × lebar × tinggi.');else if(shape===1)q=numeric('Wadah berbentuk tabung memiliki jari-jari 7 cm dan tinggi '+n+' cm. Berapa volumenya (π=22/7) ... cm³?',154*n,'Volume tabung = πr²t = (22/7)×49×'+n+'.');else if(shape===2)q=numeric('Prisma segitiga memiliki alas segitiga '+n+' cm, tinggi segitiga '+(2*k)+' cm, dan panjang prisma 3 cm. Volumenya ... cm³.',n*k*3,'Luas alas segitiga = '+n+'×'+(2*k)+'/2, lalu kali 3.');else q=numeric('Limas persegi memiliki sisi alas '+n+' cm dan tinggi '+(3*k)+' cm. Volumenya ... cm³.',n*n*k,'Volume limas = (luas alas×tinggi)/3.');break}
 case 5:q=numeric('Pada denah skala 1:100, jarak dua rumah adat '+n+' cm. Jarak sebenarnya ... meter.',n,'Jarak asli '+n+' × 100 cm = '+n+' meter.');break;
 default:if(Math.random()<.5)q=choices('Di kantong ada 3 kelereng merah dan 1 biru. Peluang mengambil kelereng biru adalah ...','1/4',['1/3','3/4','1/2'],'Ada 1 biru dari 4 seluruh kelereng. Peluangnya 1/4.');else q=numeric('Dari '+(a+b)+' siswa peserta, '+a+' memilih belajar di pameran budaya dan '+b+' memilih permainan. Berapa jumlah seluruh siswa?',a+b,'Jumlah siswa = '+a+' + '+b+'.');
 }
 }
 return {...q,grade,topic:gradeTopics[grade]?.[stage]||'',cultureId:zone.id};
}
export function makeMission(grade:string,stage:number,count=8):Question[]{return Array.from({length:count},()=>makeCultureQuestion(grade,stage))}
export function sanitizeStudentGrade(s:string){return grades.includes(s)?s:'Kelas 1'}
