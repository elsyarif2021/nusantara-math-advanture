// Pure, answer-free support. Prefer the *actual question text* over generic topic labels.
// Used for built-in missions and teacher-authored questions, with safe fallback for unknown formats.
const guide=(kind,title,icon,idea,understand,strategy,work,check,formula='',calculator=true)=>({
 kind,title,icon,idea,formula,calculator,steps:[understand,strategy,work,check]
});
const G={
 count:guide('count','Menghitung benda','🧸','Hitung benda satu per satu; jangan menjumlahkan jika tidak ada benda baru.',
  'Temukan benda yang ditanyakan dan berapa banyak benda yang ada.',
  'Bayangkan benda berjajar; beri satu hitungan untuk setiap benda.',
  'Hitung urut satu-satu, atau kelompokkan menjadi puluhan dan satuan.',
  'Hitung ulang agar tidak ada benda yang terlewati.', 'Hitung tiap benda tepat satu kali.',false),
 place:guide('place','Nilai tempat bilangan','🔢','Pecah bilangan menurut satuan, puluhan, ratusan, dan seterusnya.',
  'Temukan bilangan atau banyaknya puluhan dan satuan yang tertulis.',
  'Urutkan tempat angka dari kanan: satuan → puluhan → ratusan → ribuan.',
  'Jika soalnya menyebut puluhan, ubah puluhan menjadi kelompok sepuluh. Susun menurut nilai tempat.',
  'Periksa urutan angka dan jumlah nolnya.', 'Ribuan | Ratusan | Puluhan | Satuan',false),
 add:guide('add','Penjumlahan','➕','Menggabungkan beberapa jumlah menjadi satu.',
  'Tandai kelompok benda yang akan digabung, bukan yang dikurangi.',
  'Gunakan penjumlahan: jumlah awal + tambahan, jika memang ada benda yang bertambah.',
  'Tuliskan angka sejajar menurut nilai tempat, lalu jumlahkan dari kanan.',
  'Cek: hasil penggabungan biasanya tidak lebih kecil daripada jumlah sebelumnya.', 'jumlah pertama + jumlah kedua'),
 subtract:guide('subtract','Pengurangan','➖','Mencari sisa atau selisih dari jumlah awal.',
  'Temukan jumlah mula-mula dan jumlah yang diambil atau diberikan.',
  'Gunakan pengurangan ketika jumlah benda berkurang.',
  'Tulis jumlah awal − jumlah yang diambil; kurangi dari satuan terlebih dahulu.',
  'Periksa dengan penjumlahan balik: sisa + yang diambil = jumlah awal.', 'jumlah awal − yang diambil'),
 multiply:guide('multiply','Perkalian kelompok','✖️','Kelompok yang sama banyak dapat dihitung dengan perkalian.',
  'Temukan jumlah kelompok dan isi tiap kelompok.',
  'Gunakan perkalian untuk kelompok berulang yang sama banyak.',
  'Tulis banyak kelompok × isi tiap kelompok.',
  'Periksa dengan penjumlahan berulang jika jumlahnya masih kecil.', 'banyak kelompok × isi tiap kelompok'),
 divide:guide('divide','Pembagian sama rata','➗','Membagi benda menjadi bagian yang sama banyak.',
  'Temukan jumlah semua benda dan jumlah kelompok atau penerimanya.',
  'Gunakan pembagian: total benda dibagi jumlah kelompok.',
  'Tulis total ÷ banyak kelompok; boleh gunakan gambar lingkaran untuk membagikan benda.',
  'Cek dengan mengalikan hasil tiap kelompok × jumlah kelompok.', 'total benda ÷ jumlah kelompok'),
 mixed:guide('mixed','Operasi hitung campuran','🧩','Selesaikan perhitungan menurut urutan operasi.',
  'Pisahkan jumlah kelompok, isi setiap kelompok, dan tambahan atau pengurangan terakhir.',
  'Kerjakan perkalian atau pembagian terlebih dahulu; penjumlahan atau pengurangan setelahnya.',
  'Tulis dua baris hitungan: hasil kelompok lebih dahulu, lalu gabungkan dengan tambahan.',
  'Periksa bahwa setiap angka pada soal sudah digunakan satu kali sesuai ceritanya.', '(banyak kelompok × isi kelompok) + tambahan'),
 fraction:guide('fraction','Mengenal pecahan','🍰','Pecahan menunjukkan berapa bagian dari satu keseluruhan.',
  'Tentukan berapa bagian sama besar seluruh benda dan berapa bagian yang dipilih.',
  'Pembilang adalah banyak bagian yang dipilih; penyebut adalah jumlah bagian sama besar.',
  'Tuliskan pembilang di atas penyebut. Jangan tertukar.',
  'Periksa bahwa semua bagian berukuran sama.', 'bagian yang dipilih / seluruh bagian',false),
 fractionAdd:guide('fractionAdd','Menjumlah pecahan','🍰','Jika penyebutnya sama, cukup jumlahkan pembilangnya.',
  'Cari dua pecahan pada soal, lalu bandingkan penyebutnya.',
  'Untuk penyebut sama, pertahankan penyebut. Untuk penyebut berbeda, samakan dahulu.',
  'Jumlahkan pembilang setelah penyebutnya sama; tulis hasil sebagai pecahan.',
  'Cek apakah pecahan perlu disederhanakan.', 'a/n + b/n = (a + b)/n',false),
 decimal:guide('decimal','Operasi desimal','🔟','Letakkan tanda koma pada kolom yang sama.',
  'Tandai bilangan desimal dan operasi yang ditanyakan.',
  'Sejajarkan koma dan nilai tempat (satuan, persepuluhan, perseratusan).',
  'Hitung tiap kolom mulai dari kanan; letakkan koma sejajar pada hasil.',
  'Periksa jumlah angka di belakang koma dan satuannya.', 'satuan , persepuluhan , perseratusan'),
 decimalFraction:guide('decimalFraction','Pecahan menjadi desimal','🔟','Baca nilai penyebut sebelum mengubah pecahan.',
  'Lihat pembilang dan penyebut pecahan yang akan diubah.',
  'Penyebut 10 berarti persepuluhan; penyebut 100 berarti perseratusan.',
  'Tulis desimal dengan jumlah tempat di belakang koma sesuai penyebut; jika perlu lakukan pembilang ÷ penyebut.',
  'Periksa bahwa nilai pecahan dan desimal sama.', 'pembilang ÷ penyebut',false),
 percent:guide('percent','Menghitung persen','💯','Persen artinya per seratus.',
  'Temukan persentase dan jumlah seluruh benda.',
  'Ubah persen menjadi pecahan dengan penyebut 100.',
  'Kalikan pecahan persen dengan total benda atau jumlah yang ditanyakan.',
  'Periksa hasil dengan perkiraan: 50% adalah setengah.', '(persentase ÷ 100) × total'),
 multiple:guide('multiple','Kelipatan bilangan','🔁','Kelipatan adalah hasil perkalian bilangan dengan urutan ke-berapa.',
  'Cari angka dasar dan urutan kelipatan yang diminta.',
  'Tulis kelipatan secara teratur, atau gunakan angka dasar × urutan.',
  'Hitung sesuai urutan yang ditanyakan, bukan urutan sebelumnya.',
  'Periksa dengan menuliskan kelipatan berurutan.', 'bilangan × urutan kelipatan'),
 fpb:guide('fpb','Faktor Persekutuan Terbesar (FPB)','🧺','Cari pembagi terbesar yang dapat membagi semua jumlah tanpa sisa.',
  'Catat dua jumlah yang akan dibagi ke kelompok sama banyak.',
  'Daftar faktor dari tiap jumlah, lalu cari faktor yang muncul pada keduanya.',
  'Pilih faktor bersama yang paling besar untuk banyaknya kelompok.',
  'Pastikan masing-masing jumlah habis dibagi banyak kelompok pilihanmu.', 'FPB = faktor bersama paling besar',false),
 kpk:guide('kpk','Kelipatan Persekutuan Terkecil (KPK)','⏰','Cari waktu paling cepat ketika dua kegiatan kembali bersamaan.',
  'Temukan jarak waktu pengulangan tiap kegiatan.',
  'Buat daftar kelipatan dari masing-masing selang waktu.',
  'Temukan kelipatan positif terkecil yang sama pada kedua daftar.',
  'Periksa bahwa waktu tersebut habis dibagi kedua selang.', 'KPK = kelipatan bersama paling kecil',false),
 perimeter:guide('perimeter','Keliling bangun','📏','Keliling adalah panjang garis di sekeliling bentuk.',
  'Cari panjang setiap sisi dan satuannya.',
  'Untuk persegi panjang, dua sisi panjang dan dua sisi lebar sama.',
  'Jumlahkan panjang seluruh sisi mengelilingi bangun.',
  'Periksa hasil tetap menggunakan satuan panjang, bukan satuan luas.', 'persegi panjang: 2 × (panjang + lebar)'),
 area:guide('area','Luas bangun datar','🟦','Luas menunjukkan banyaknya daerah yang ditutupi bentuk.',
  'Cari jenis bangun serta ukuran panjang dan lebarnya.',
  'Untuk persegi panjang, gunakan panjang × lebar.',
  'Substitusikan ukuran sisi ke dalam rumus, kemudian hitung.',
  'Luas menggunakan satuan persegi, misalnya cm² atau m².', 'persegi panjang: panjang × lebar'),
 compoundArea:guide('compoundArea','Luas bangun gabungan','🧩','Pisahkan bentuk gabungan menjadi bentuk sederhana.',
  'Tentukan ukuran tiap petak atau bagian bangun.',
  'Hitung luas setiap bagian secara terpisah dahulu.',
  'Jumlahkan luas bagian yang tidak tumpang tindih.',
  'Periksa tidak ada bagian yang dihitung dua kali; tulis satuan m² atau cm².', 'luas total = luas bagian 1 + luas bagian 2'),
 surface:guide('surface','Luas permukaan kubus','🧊','Luas permukaan menghitung seluruh bidang sisi di luar bangun.',
  'Tentukan bentuk bangun dan ukuran panjang rusuknya.',
  'Kubus memiliki enam sisi berbentuk persegi yang sama luas.',
  'Cari luas satu sisi lebih dahulu, lalu kalikan jumlah sisinya.',
  'Gunakan satuan persegi, bukan kubik.', 'kubus: 6 × rusuk × rusuk'),
 volumeCube:guide('volumeCube','Volume kubus','🧊','Volume menghitung isi ruang tiga dimensi.',
  'Tandai panjang rusuk kubus.',
  'Semua rusuk kubus sama panjang.',
  'Kalikan panjang × lebar × tinggi dengan panjang yang sama.',
  'Gunakan satuan kubik (cm³ atau m³).', 'kubus: rusuk × rusuk × rusuk'),
 volumeBox:guide('volumeBox','Volume balok','📦','Volume balok berasal dari tiga ukurannya.',
  'Temukan panjang, lebar, dan tinggi balok.',
  'Gunakan perkalian ketiga ukuran dalam satuan yang sama.',
  'Kalikan panjang × lebar × tinggi.',
  'Hasil volume harus dalam satuan kubik, seperti cm³.', 'balok: panjang × lebar × tinggi'),
 volumeCylinder:guide('volumeCylinder','Volume tabung','🥫','Volume tabung memakai luas lingkaran alas dan tingginya.',
  'Cari jari-jari, tinggi, dan nilai π yang diberikan soal.',
  'Luas lingkaran alas = π × jari-jari².',
  'Kalikan luas alas tersebut dengan tinggi tabung.',
  'Hasil volume memakai satuan cm³ atau m³.', 'tabung: π × r × r × tinggi'),
 volumePrism:guide('volumePrism','Volume prisma segitiga','📐','Prisma: luas alas segitiga dikalikan panjang prisma.',
  'Pisahkan alas segitiga, tinggi segitiga, dan panjang prisma.',
  'Luas alas segitiga = (alas × tinggi segitiga) ÷ 2.',
  'Kalikan luas segitiga dengan panjang prisma.',
  'Periksa satuan volumenya berbentuk kubik.', '((alas × tinggi segitiga) ÷ 2) × panjang prisma'),
 volumePyramid:guide('volumePyramid','Volume limas','🔺','Volume limas adalah sepertiga volume prisma beralas dan bertinggi sama.',
  'Tandai ukuran alas dan tinggi tegak limas.',
  'Untuk alas persegi, luas alas = sisi × sisi.',
  'Kalikan luas alas dengan tinggi, kemudian bagi 3.',
  'Periksa satuan kubik pada hasil.', '(luas alas × tinggi) ÷ 3'),
 shape:guide('shape','Mengenali bangun datar','🔺','Cocokkan ciri-ciri bangun dengan pilihan jawabannya.',
  'Perhatikan petunjuk jumlah sisi, sudut, atau bentuk garis.',
  'Bayangkan atau gambar bentuk sederhana sesuai ciri pada soal.',
  'Bandingkan jumlah sisi dan bentuk bangun pada setiap pilihan.',
  'Pilih nama bentuk yang cocok tanpa menebak dari warnanya.', 'Perhatikan jumlah sisi dan sudut.',false),
 symmetry:guide('symmetry','Simetri lipat','🪞','Bayangkan bangun dilipat tepat pada garis yang disebut.',
  'Cari informasi tentang garis lipatan dan kesamaan dua bagian.',
  'Bayangkan satu bagian menutupi bagian lainnya saat dilipat.',
  'Cocokkan istilah pada pilihan dengan sifat garis lipatan itu.',
  'Periksa apakah kedua sisi benar-benar bertumpuk.', 'Lipat → dua bagian saling menutupi',false),
 angle:guide('angle','Jenis sudut','📐','Kenali sudut lewat bentuk pertemuan dua garis.',
  'Temukan sudut yang dijelaskan dalam soal.',
  'Bandingkan dengan sudut pojok buku atau sudut lain yang kamu kenal.',
  'Perhatikan ukuran yang ditanyakan, kemudian pilih nilai yang sesuai.',
  'Periksa apakah bentuk sudut dan besar derajatnya sepadan.', 'Sudut diukur dalam derajat (°).',false),
 measure:guide('measure','Mengukur dengan satuan tidak baku','🖐️','Mengukur berarti membandingkan panjang dengan satuan tertentu.',
  'Temukan satuan yang dipakai pada soal, misalnya jengkal.',
  'Hitung berapa satuan yang digunakan dari ujung ke ujung.',
  'Gunakan hasil pengukuran sesuai satuan itu, jangan mengganti satuan tanpa diminta.',
  'Periksa penulisan satuan dan jumlah ulang jika perlu.', 'panjang = banyaknya satuan yang dihitung',false),
 convert:guide('convert','Konversi satuan','📏','Samakan satuan sebelum menjawab.',
  'Tandai besaran awal dan satuan tujuan.',
  'Bila meter menjadi sentimeter, kalikan dengan 100. Bila sebaliknya, bagi 100.',
  'Ubah angka sesuai hubungan kedua satuan.',
  'Tulis satuan baru dan periksa arah konversi.', '1 meter = 100 sentimeter'),
 money:guide('money','Menghitung uang belanja','💰','Harga total berasal dari harga satu barang dan jumlah barang.',
  'Temukan harga satu barang serta banyaknya barang yang dibeli.',
  'Jika harga setiap barang sama, gunakan perkalian.',
  'Kalikan harga satu barang × jumlah barang.',
  'Pastikan satuan hasilnya rupiah.', 'harga satu barang × banyak barang'),
 data:guide('data','Membaca diagram / data','📊','Baca nilai simbol atau batang sebelum menghitung.',
  'Tentukan apa arti satu gambar, tinggi batang, atau data setiap hari.',
  'Jika satu simbol mewakili beberapa benda, hitung simbol lalu kalikan nilainya. Jika dua batang dijumlah, tambahkan nilainya.',
  'Tulis nilai setiap bagian dari diagram, kemudian lakukan operasi yang diminta.',
  'Cek kembali label dan jangan keliru antara jumlah gambar dan nilai yang diwakilinya.', 'jumlah simbol × nilai tiap simbol  |  jumlah beberapa batang'),
 probability:guide('probability','Peluang sederhana','🎲','Peluang membandingkan kejadian yang diinginkan dengan seluruh kemungkinan.',
  'Hitung semua benda dan banyak benda dengan ciri yang ditanyakan.',
  'Banyak kejadian yang diinginkan menjadi pembilang; banyak seluruh kejadian menjadi penyebut.',
  'Tulis peluang dalam bentuk pecahan.',
  'Peluang tidak boleh kurang dari 0 atau lebih dari 1.', 'kejadian yang diinginkan / seluruh kemungkinan',false),
 ratio:guide('ratio','Perbandingan / rasio','⚖️','Rasio membandingkan dua banyaknya bagian.',
  'Cari bagian pertama dan bagian kedua pada soal.',
  'Baca rasio a:b sebagai a bagian pertama dan b bagian kedua.',
  'Jika ditanya jumlah bagian, jumlahkan kedua bagian.',
  'Periksa pertanyaan meminta rasio atau jumlah seluruh bagian.', 'total bagian = bagian pertama + bagian kedua'),
 scale:guide('scale','Skala denah','🗺️','Skala menghubungkan jarak pada denah dengan jarak sebenarnya.',
  'Temukan skala denah dan jarak yang diukur di gambar.',
  'Skala 1:n berarti 1 satuan di denah mewakili n satuan sebenarnya.',
  'Kalikan jarak denah dengan penyebut skala, lalu samakan satuan tujuan.',
  'Periksa apakah hasil dinyatakan dalam sentimeter, meter, atau kilometer.', 'jarak sebenarnya = jarak denah × penyebut skala'),
 speed:guide('speed','Kecepatan rata-rata','🚢','Kecepatan adalah jarak dibagi waktu tempuh.',
  'Tandai jarak yang ditempuh dan lama perjalanan.',
  'Pastikan satuan jarak dan waktu sama dengan satuan yang diminta.',
  'Bagi jarak dengan waktu, bukan sebaliknya.',
  'Tulis satuan kecepatan seperti km/jam.', 'kecepatan = jarak ÷ waktu'),
 generic:guide('generic','Membaca soal dengan teliti','💡','Ikuti permintaan pada soal. Jenis hitungannya belum dapat dipastikan otomatis.',
  'Garisbawahi data yang diberikan serta hal yang ditanyakan.',
  'Jika soal meminta nama bentuk atau istilah, cocokkan cirinya. Jika meminta hasil hitungan, pilih operasi sesuai ceritanya.',
  'Selesaikan hanya operasi yang benar-benar diperlukan; jangan menebak rumus dari judul bab.',
  'Baca ulang jawaban dan minta bantuan guru jika petunjuk belum cocok.', 'Gunakan cara sesuai pertanyaannya.',false)
};

function chooseByQuestion(raw){
 const q=String(raw||'').toLowerCase();
 // Exact question intent comes first: never let a topic label force an unrelated method.
 if(/peluang|mengambil kelereng|di kantong ada/.test(q))return 'probability';
 if(/denah|skala\s*1\s*:/.test(q))return 'scale';
 if(/kecepatan|menempuh.*\bkm\b|km\/jam/.test(q))return 'speed';
 if(/luas permukaan/.test(q))return 'surface';
 if(/volume/.test(q)||/berbentuk tabung/.test(q)){
  if(/tabung/.test(q))return 'volumeCylinder';
  if(/prisma/.test(q))return 'volumePrism';
  if(/limas/.test(q))return 'volumePyramid';
  if(/kubus/.test(q))return 'volumeCube';
  return 'volumeBox';
 }
 if(/dua petak|bangun datar gabungan|tanpa tumpang tindih/.test(q))return 'compoundArea';
 if(/keliling/.test(q))return 'perimeter';
 if(/luas/.test(q)&&/persegi panjang|halaman|lantai|bangun|taman/.test(q))return 'area';
 if(/garis lipatan|simetri|membagi dua bagian sama persis/.test(q))return 'symmetry';
 if(/sudut|derajat/.test(q))return 'angle';
 if(/3 sisi|tiga sisi|bentuk yang memiliki|nama bangun/.test(q))return 'shape';
 if(/kpk|tampil bersama lagi|setiap \d+ menit.*setiap \d+ menit/.test(q))return 'kpk';
 if(/fpb|dibagi ke kelompok sebanyak mungkin|tanpa sisa.*kelompok/.test(q))return 'fpb';
 if(/kelipatan|urutan ke-/.test(q)&&!/bilangan.*bernilai/.test(q))return 'multiple';
 if(/perbandingan|rasio/.test(q))return 'ratio';
 if(/bentuk desimal pecahan|bentuk desimal.*\d+\/\d+/.test(q))return 'decimalFraction';
 if(/persen|\d+(?:[.,]\d+)?\s*%/.test(q))return 'percent';
 if(/\d+\s*\/\s*\d+.*\d+\s*\/\s*\d+/.test(q)&&/jumlah|ditambah|total|penjumlahan/.test(q))return 'fractionAdd';
 if(/pecahan|\d+\s*\/\s*\d+|bagian kue|bagian diambil|satu bagian ditulis/.test(q))return 'fraction';
 if(/di piktogram|diagram|setiap gambar|setiap ikon|ikon 🌸|gambar ⭐|gambar 🌴/.test(q))return 'data';
 if(/harga|rupiah|rp\s*\d+|membeli.*buah/.test(q))return 'money';
 if(/sentimeter|berapa cm|berapa meter|1 meter|panjangnya.*cm/.test(q))return 'convert';
 if(/jengkal|pengukuran tidak baku/.test(q))return 'measure';
 if(/pita.*\d+[,.]\d|\d+[,.]\d\s*m.*\d+[,.]\d\s*m|desimal/.test(q))return 'decimal';
 if(/\bkelompok\b.*\bsetiap kelompok\b.*\bditambah\b|kelompok.*membawa.*ditambah|perkalian dahulu/.test(q))return 'mixed';
 if(/dibagikan rata|diberi sama rata|tiap kelompok dapat|masing-masing menerima|dibagi sama rata/.test(q))return 'divide';
 if(/kelompok.*masing-masing|setiap baris|baris.*setiap|kelompok.*membawa|dikalikan|total.*kelompok/.test(q))return 'multiply';
 if(/sisanya|sisa berapa|diberikan|dibawa pulang|tersisa|berkurang|diambil dari/.test(q))return 'subtract';
 if(/puluhan dan .*satuan|nomor tersebut bernilai|bilangan pengunjung itu|tuliskan bilangan|bilangan ini bernilai|nilai tempat|bernomor|nilai bilangan/.test(q))return 'place';
 if(/berapa banyak seluruh.*\?|berapa jengkal panjangnya/.test(q)){
  if(/jengkal/.test(q))return 'measure';
  return 'count';
 }
 if(/ditambah|menambah|tiba lagi|datang lagi|jumlah semuanya|jumlah seluruh|berapa total|total benda|total harga|berapa jumlahnya/.test(q))return 'add';
 return null;
}
function chooseByTopic(topic){
 const t=String(topic||'').toLowerCase();
 if(/pecahan.*desimal/.test(t))return 'fraction';
 if(/operasi pecahan/.test(t))return 'fractionAdd';
 if(/pecahan/.test(t))return 'fraction';
 if(/desimal/.test(t))return 'decimal';
 if(/persen/.test(t))return 'percent';
 if(/keliling/.test(t))return 'perimeter';
 if(/luas permukaan/.test(t))return 'surface';
 if(/luas|bangun datar gabungan/.test(t))return 'area';
 if(/volume/.test(t))return 'volumeBox';
 if(/kecepatan/.test(t))return 'speed';
 if(/denah|skala/.test(t))return 'scale';
 if(/fpb/.test(t))return 'fpb';
 if(/kpk/.test(t))return 'kpk';
 if(/kelipatan/.test(t))return 'multiple';
 if(/rasio|proporsi/.test(t))return 'ratio';
 if(/piktogram|diagram|data/.test(t))return 'data';
 if(/peluang/.test(t))return 'probability';
 if(/simetri|sudut/.test(t))return 'shape';
 if(/bangun/.test(t))return 'shape';
 if(/pengukuran tidak baku/.test(t))return 'measure';
 if(/konversi|pengukuran/.test(t))return 'convert';
 if(/pembagian/.test(t))return 'divide';
 if(/perkalian/.test(t))return 'multiply';
 if(/penjumlahan/.test(t))return 'add';
 if(/pengurangan/.test(t))return 'subtract';
 if(/operasi campuran/.test(t))return 'mixed';
 if(/bilangan|puluhan|satuan|nilai tempat/.test(t))return 'place';
 return 'generic';
}
export function getQuestionAid(question,topic='',grade=''){
 const text=String(question||'');
 const kind=chooseByQuestion(text)||chooseByTopic(topic);
 const entry=G[kind]||G.generic;
 const numbers=[...text.matchAll(/\d+(?:[.,]\d+)*(?:\/\d+)?%?/g)].map(m=>m[0]).slice(0,7);
 return {...entry,grade:String(grade||''),numbers};
}
