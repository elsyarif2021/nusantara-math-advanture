# ⛵ Nusantara Math Adventure — Edisi Sekolah Dasar

**Aplikasi produksi:** https://nusantara-math-advanture.vercel.app  
**Source GitHub:** https://github.com/elsyarif2021/nusantara-math-advanture

Aplikasi petualangan belajar Matematika **Kurikulum Merdeka SD Kelas 1–6** berbasis React, TypeScript, Vite, Vercel Functions, dan private Vercel Blob Storage.

## 🌺 Fitur utama

- Tampilan permainan anak-anak bertema kapal dan kebudayaan Indonesia, responsif untuk HP dan desktop.
- Login siswa dengan nama dan kelas tanpa PIN, progres tersimpan secara privat.
- Peta **SVG interaktif** berisi tujuh wilayah: Sumatra, Jawa, Kalimantan, Sulawesi, Bali/Nusa Tenggara, Maluku, Papua.
- 42 kombinasi misi (enam kelas × tujuh pulau). Delapan soal dasar setiap misi dari pembangkit soal berbasis aturan, dilengkapi opsi jawaban, pembahasan, dan ilustrasi vektor budaya sesuai pulau.
- Materi yang dicakup: bilangan, operasi hitung, pecahan, desimal, kelipatan/faktor, pengukuran, geometri, volume, rasio, diagram/data, dan peluang sederhana pada jenjang yang sesuai.
- Kartu budaya: Rumah Gadang/Tari Piring; Borobudur/Batik; Rumah Betang/Orangutan; Tongkonan; Pura Bali/Sasando NTT; pala Banda/tifa; noken/cenderawasih.
- Bintang, XP, lencana pulau, progres misi, reward harian sederhana, dan sertifikat PDF.
- Audio **orisinal** di `public/resources/nusantara-ceria.wav` untuk musik latar, efek suara jawaban yang disintesis Web Audio, dan narasi bahasa Indonesia melalui Speech Synthesis pada browser yang mendukung.
- Portal admin: akses dengan kata sandi server, pemantauan progres kelas SD, ekspor Excel/PDF, generator soal Ollama Cloud bila key diaktifkan, bank soal dan pengaturan sekolah.
- PWA dasar, service worker dan manifest.

## Status pengujian

- `npm run check`: pemeriksaan TypeScript.
- `npm test`: 3 kelompok pengujian, termasuk pemeriksaan semua 42 kombinasi topik/pulau berulang untuk memastikan jawaban ada dalam empat opsi unik.
- `npm run build`: bundling Vite.
- Deployment produksi Vercel otomatis untuk push pada branch `main`.

**Catatan ketepatan konten:** Modul ini berisi soal latihan yang dibuat berdasarkan cakupan materi SD yang diberikan pengguna; bukan pengganti CP/ATP/TP resmi yang telah diverifikasi per satuan pendidikan. Soal cerita faktual dan gambar budaya perlu ditinjau guru sebelum dipakai sebagai asesmen resmi.

## Backend dan secrets

Vercel project `nusantara-math-advanture`, framework Vite, output `dist`, fungsi region `sin1`. Persistent storage menggunakan **private Vercel Blob** store yang terhubung ke project.

Atur di Vercel → Project → Settings → Environment Variables, hanya di **server**:

| Variabel | Kegunaan |
|---|---|
| `BLOB_READ_WRITE_TOKEN` | Terpasang otomatis melalui integrasi private Vercel Blob |
| `ADMIN_PASSWORD` | Kata sandi admin minimal 8 karakter; pilih kombinasi unik dan kuat (lebih panjang tetap disarankan) |
| `SESSION_SECRET` | Kunci sesi acak minimal 32 karakter |
| `OLLAMA_API_KEY` | Kunci Ollama Cloud untuk fitur generator AI |
| `OLLAMA_MODEL` | Model Ollama yang tersedia (opsional) |

Jangan menyimpan secrets dalam GitHub, frontend React, issue, atau chat. Lakukan **redeploy** setelah mengganti environment variables.

Cek kesiapan API: `GET https://nusantara-math-advanture.vercel.app/api/health`. Nilai `admin:false` berarti konfigurasi admin belum lengkap; `storage:true` berarti token penyimpanan tersedia.

## Pengembangan lokal

```bash
npm install
npm run check
npm test
npm run build
npm run dev
```

Mode `npm run dev` hanya menjalankan frontend Vite; endpoint server `/api/*` membutuhkan lingkungan Vercel atau proxy lokal.

## Keterbatasan dan keamanan

- Peta berupa ilustrasi vektor SVG, **bukan geografi presisi atau 3D**.
- Admin polling setiap 8 detik, **bukan WebSocket realtime**.
- Identitas siswa berbasis nama + token acak pada browser, **bukan autentikasi kuat**. Jangan gunakan untuk ujian resmi atau penyimpanan data sensitif tanpa perancangan ulang identitas siswa.
- XP masih dikirim klien, dengan validasi lompatan progres terbatas di backend; bukan sistem anti-kecurangan.
- Belum ada upload binary media langsung ke cloud dari dashboard guru; saat ini tersedia URL gambar, audio, dan video YouTube serta ilustrasi budaya bawaan.
- Musik `nusantara-ceria.wav` adalah track baru buatan sendiri. MP3 asli dari ZIP sumber belum dipindahkan ke repository.
- Ekspor Excel memakai ExcelJS dan PDF memakai jsPDF; format dokumen sederhana.
- Generator soal AI memerlukan kunci Ollama dan audit manual kebenaran butir.
- Kode migrasi alternatif Cloudflare Workers/D1 masih **placeholder** pada `wrangler.jsonc`; deployment aktif ada di Vercel.


## ⚙️ CRUD Bank Soal SD — dashboard administrator

Masuk ke [Portal Admin](https://nusantara-math-advanture.vercel.app/admin), kemudian klik **Pengaturan Soal** setelah berhasil login.

1. **Create:** klik **Tambah Soal Baru**, pilih **Kelas SD 1–6**, topik, dan pulau. Isi pertanyaan, empat pilihan A–D, kunci, pembahasan, status publikasi, dan URL media opsional. Klik **Simpan Soal Baru**.
2. **Read:** cari soal menurut kelas, topik, pulau, atau kata kunci. Tersedia paging 12 soal/halaman dengan preview kunci, pembahasan, dan status.
3. **Update:** klik **Edit Soal**, perbaiki isinya, kemudian klik **Simpan Perubahan**.
4. **Delete:** klik **Hapus**, lalu konfirmasi **Ya, Hapus**. Penghapusan direkam dalam penyimpanan privat dan soal tak muncul lagi di kuis.
5. **Soal dari AI:** pilih kelas, topik Kurikulum Merdeka, dan pulau pada Generator Soal AI; hasil valid dimasukkan ke bank sebagai soal yang dapat diedit/hapus.
6. **Pengaturan Sumber Soal Per Kelas & Pulau:** pilih **Campuran: bank + soal otomatis** atau **Hanya Bank Soal Guru (CRUD)**. Pilih **Simpan Mode**. Dalam mode hanya bank, misi hanya berjalan jika ada sedikitnya satu soal aktif yang sesuai.
7. **Impor 8 Soal Bawaan ke Bank** mengubah latihan otomatis untuk kelas/pulau pilihan menjadi delapan catatan tersimpan yang dapat diedit dan dihapus secara individual. Untuk menghindari soal otomatis muncul lagi setelah dihapus, pilih mode **Hanya Bank Soal Guru (CRUD)**.

**Penyimpanan:** pertanyaan menggunakan objek terpisah `questions/<id>.json` di Vercel Blob privat, sehingga tambah/edit/hapus tidak menulis ulang seluruh bank. Soal lama dari `config/bank.json` tetap dapat dibaca, diedit, dan dihapus melalui overlay atau tombstone. Semua endpoint CRUD dilindungi sesi admin.

Endpoint utama:
- `GET /api/admin/questions`
- `POST /api/admin/questions` (tambah)
- `PUT /api/admin/questions/:id` (edit)
- `DELETE /api/admin/questions/:id` (hapus)
- `POST /api/admin/questions/bulk` (impor AI atau soal bawaan)
- `PUT /api/admin/mission-config` (pilih sumber soal per kelas/pulau)
- `GET /api/public/mission-config?grade=Kelas%201&culture=sumatra`

**Penting:** sesi admin membutuhkan `ADMIN_PASSWORD` dan `SESSION_SECRET` pada Environment Variables Vercel, bukan pada frontend atau GitHub. Tanpa keduanya, login ditolak dan fitur CRUD tidak tersedia.


## 🔐 Role-Based Access Control: Super Admin, Guru, dan Siswa

Aplikasi memakai **tiga peran dengan autentikasi dan ruang data terpisah**:

| Peran | Alamat | Hak akses |
|---|---|---|
| **Super Admin** | `/admin` | Pengelolaan seluruh guru, aktivasi/nonaktivasi, reset kata sandi guru, pemantauan semua siswa, bank soal global, pengaturan sekolah dan AI |
| **Guru** | `/guru` | Login akun guru yang dibuat Super Admin, buat/tutup tautan kelas, pantau **hanya** siswa yang mendaftar lewat tautan milik guru, ekspor data kelas sendiri, ganti kata sandi pribadi |
| **Siswa** | `/gabung/<token>` | Login nama dan kelas dari tautan Guru tanpa PIN, mengikuti kuis, progres siswa tercatat pada Guru pemilik tautan |

### Langkah penggunaan

1. Konfigurasikan `ADMIN_PASSWORD` (minimal 8 karakter) dan `SESSION_SECRET` (minimal 32 karakter acak) di **Environment Variables → Production**, lalu redeploy. **Jangan simpan di GitHub/chat**.
2. Super Admin login di `/admin`, buka **Kelola Akun Guru & Kelas**, lalu isi nama, username unik, dan kata sandi awal guru (minimal 8 karakter). Super Admin juga dapat menonaktifkan guru dan mereset kata sandi guru.
3. Guru login di `/guru` menggunakan username dan kata sandi yang diterima secara privat. Guru memilih kelas SD 1–6, menuliskan nama kelompok (misal Kelas 3A), lalu klik **Buat Link Siswa**.
4. Guru menekan **Salin Link** dan membagikannya hanya kepada siswa kelompoknya. Contoh pola `https://nusantara-math-advanture.vercel.app/gabung/<token-acak-48-karakter>`.
5. Siswa membuka tautan, memasukkan nama, kemudian bermain. Kelas ditetapkan oleh tautan guru; siswa tidak dapat memilih kelas lain untuk kelompok itu.
6. Guru membuka **Pemantauan Siswa Saya**, memilih kelompok untuk memfilter hanya siswa pada tautan kelas tersebut. Guru A tidak memperoleh akses ke siswa/link Guru B.
7. Guru dapat menutup tautan agar tidak menerima siswa baru. Peserta lama tetap tercatat pada Guru pemilik sebelumnya. Super Admin dapat melihat keseluruhan data.

### Penegakan keamanan di server

- Guru disimpan dalam dokumen privat `teachers/<teacherId>.json` dengan kata sandi **scrypt + salt acak**.
- Sesi Guru memakai cookie terpisah `nma_teacher`, ditandatangani HMAC dengan `SESSION_SECRET`, HttpOnly, Secure, SameSite=Strict. Mengubah kata sandi atau menonaktifkan akun mencabut sesi sebelumnya.
- Pembuatan/pengaturan guru memerlukan cookie autentikasi **Super Admin**. Cookie Guru tidak memiliki izin akses ke endpoint tersebut.
- Tautan siswa memakai **token acak 192-bit**. Enrollment melalui `POST /api/enroll` memeriksa status tautan dan guru, lalu **server** menetapkan `teacherId`, `inviteToken`, dan kelas.
- Pembaruan progres siswa mempertahankan penugasan `teacherId` dan `inviteToken` yang telah disimpan; kiriman browser siswa tidak bisa mengubahnya.
- Endpoint `GET /api/teacher/monitor` secara ketat memfilter data hanya dengan `teacherId` dari sesi Guru yang sudah diverifikasi. Permintaan filter tautan milik guru lain ditolak.
- Hasil tanpa PIN bukan pengganti absensi/asesmen terverifikasi: tautan dapat diteruskan siswa dan nama dapat ditiru. Sebelum digunakan untuk penilaian resmi, tambahkan verifikasi siswa dan kebijakan perlindungan data anak.

Endpoint role baru: `/api/admin/teachers`, `/api/teacher/login`, `/api/teacher/session`, `/api/teacher/links`, `/api/teacher/monitor`, `/api/invite/:token`, `/api/enroll`.

Tes isolasi peran: `npm test` memeriksa akun guru yang terpisah, dua tautan milik guru berbeda, pembatasan daftar siswa, penolakan pengelolaan guru oleh cookie Guru, penutupan tautan, serta pencabutan sesi.


### CRUD Bank Soal Guru berdasarkan kelas

**Guru:** buka `/guru` → buat sekurangnya satu tautan kelas → **📚 Bank Soal Kelas Saya**. Guru dapat **menambah, melihat, mengubah, menghapus**, dan mengaktifkan/menonaktifkan soal sesuai kelas yang memiliki tautan. Setiap soal berisi kelas SD 1–6, topik terkurasi, pulau budaya, teks soal, **empat opsi A–D**, kunci, pembahasan, dan tautan HTTPS untuk gambar/audio/YouTube (opsional). Hapus soal membutuhkan konfirmasi. Bank soal milik guru disimpan secara terpisah pada private Blob `teacher-questions/<teacherId>/<questionId>.json`.

**Pembatasan akses di server:** operasi `POST/PUT/DELETE /api/teacher/questions` memerlukan sesi Guru yang valid; kelas diperiksa terhadap tautan milik Guru tersebut. ID Guru diperoleh dari cookie bertanda tangan server, bukan dikirim oleh browser. Edit dan hapus memuat berkas hanya dari prefix Guru pemilik; Guru A tidak bisa mengubah milik Guru B meskipun sama-sama Kelas 1.

**Super Admin:** `/admin` → **Kelola Akun Guru** → pilih **Tautan & Soal** pada guru bersangkutan. Super Admin dapat melihat, menambah, mengedit, dan menghapus bank soal guru itu. Endpoint `/api/admin/teacher-questions` dilindungi sesi Super Admin.

**Kuis siswa:** siswa yang masuk dari `/gabung/<token>` memperoleh soal milik Guru penanggung jawab kelas itu, disaring berdasarkan kelas, topik, pulau, dan status aktif. Soal Guru diutamakan sebelum soal global/soal otomatis; seluruh soal tersimpan berpeluang dipakai, bukan hanya tiga pertama. Soal Guru lain **tidak ditampilkan** kepada siswa kelas tersebut.

Tersedia pengujian integrasi penolakan akses Guru lain, verifikasi kelas yang dikelola, status publikasi, pembuatan/edit/penghapusan oleh Super Admin, dan pemilihan soal untuk siswa melalui `npm test`.


## 🖼️ Upload Gambar Soal dari Perangkat (Super Admin dan Guru)

**Status:** fitur pada formulir CRUD soal tersedia bagi kedua peran.
- **Guru:** `/guru` → login → **Bank Soal Kelas Saya** → **Tambah Soal** atau **Edit** → **Upload gambar soal dari HP / komputer**.
- **Super Admin (bank global):** `/admin` → **Pengaturan Soal** → tambah/edit → pilih gambar.
- **Super Admin (soal guru):** `/admin` → **Kelola Akun Guru & Kelas** → **Tautan & Soal** → edit/tambah soal guru → pilih gambar.
- Pilih **JPG, PNG, atau WEBP**, maksimal **2 MB**. Setelah unggah, gambar ditampilkan sebagai **pratinjau**; tekan **Simpan Soal** untuk menautkannya ke soal. Pilih **Hapus gambar dari soal** jika tidak ingin menggunakannya.
- Gambar muncul pada kuis siswa sesuai kelas, topik, dan pulau. URL gambar HTTPS eksternal juga masih dapat digunakan.
- Gambar ditempatkan dalam Vercel Blob **privat** pada `question-images/<owner>/<uuid>.<ext>`. Aplikasi mengirim gambar melalui `GET /api/question-images/file/<owner>/<uuid>.<ext>` dengan tipe konten gambar dan tanpa HTML/SVG.
- Upload `POST /api/question-images/upload` menggunakan cookie yang benar-benar terverifikasi server. Request JSON `{role:"teacher"|"superadmin",dataUrl:"data:image/...;base64,..."}`; pengguna tanpa sesi sah mendapat HTTP 401. Backend memeriksa isi file berdasarkan signature/magic bytes dan batas ukuran, bukan hanya ekstensi.
- Identitas guru/role diambil dari sesi dan **tidak** dipercaya dari klaim ID guru di browser; media URL menggunakan UUID acak. Jalur gambar tidak menerima traversal atau MIME berbahaya.
- Menghapus gambar dari soal hanya menghapus **referensi pada soal**, tidak otomatis menghapus objek lama dari Blob. Penghapusan fisik perlu proses pengelolaan media terpisah.
- Gambar yang sudah ditautkan dapat diakses sebagai ilustrasi soal oleh siapa pun yang mengetahui URL acaknya; jangan unggah foto pribadi siswa atau dokumen rahasia.

Pengujian: `npm run check && npm test && npm run build`.
