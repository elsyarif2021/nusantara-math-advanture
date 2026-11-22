# Nusantara Math Adventure Pro

**Deployment produksi Vercel:** https://nusantara-math-advanture.vercel.app  
**Repository:** https://github.com/elsyarif2021/nusantara-math-advanture

## Status dan cakupan implementasi

Versi awal platform Vercel berjalan menggunakan React 19, TypeScript, Vite, Vercel Serverless Functions, dan private Vercel Blob Storage untuk menyimpan data progres siswa. Struktur proyek ini ditulis sebagai migrasi karena source aplikasi sebelumnya memakai AppDeploy SDK.

Fitur yang sudah dikodekan:
- Masuk sebagai siswa memakai **nama dan kelas tanpa PIN**.
- Peta tujuh pulau bergaya ilustrasi, misi matematika kelas 1–12, XP, koin, lencana, dan pembahasan otomatis.
- Sertifikat PDF siswa, PWA manifest dan service worker dasar.
- Panel admin terlindungi sesi dan kata sandi server, monitor progres diperbarui setiap 8 detik, bank soal, ekspor XLSX dan PDF.
- Pembuatan soal matematika melalui Ollama Cloud jika API key terpasang.
- Form soal manual dengan URL gambar, URL YouTube, dan URL audio.
- Identitas sekolah dan tampilan responsif.

**Batasan yang harus diketahui:** Peta bukan renderer 3D sungguhan; monitor memakai polling bukan WebSockets; bank soal dan input progres belum diaudit untuk penggunaan ujian berisiko tinggi; file MP3 asli belum masuk repository, audio sementara memakai URL situs Sites lama; belum ada upload file multimedia langsung, peran guru multiakun, validasi kurikulum secara menyeluruh, dan pengujian end-to-end browser. **Jangan anggap ini sebagai migrasi seluruh fitur/aset dari ZIP sebelumnya.**

## Menjalankan secara lokal

```bash
npm install
npm run check
npm run build
npm run dev
```

UI lokal membutuhkan endpoint backend di `/api/*`. Untuk menguji seluruh fitur gunakan deployment Vercel dengan koneksi penyimpanan.

## Konfigurasi Vercel

Vercel project: `nusantara-math-advanture`. Branch: `main`.
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Region fungsi: `sin1`

**Storage**: Vercel Blob store **private** `nusantara-math-pro-students` sudah dipasang ke proyek. Variabel `BLOB_READ_WRITE_TOKEN` dibuat otomatis oleh integrasi storage. Jangan menaruh token tersebut di GitHub atau React frontend.

Di **Vercel → Project → Settings → Environment Variables**, set server-only values:
- `ADMIN_PASSWORD`: kata sandi unik minimal 12 karakter.
- `SESSION_SECRET`: nilai acak panjang minimal 32 karakter untuk tanda tangan sesi.
- `OLLAMA_API_KEY`: key server Ollama Cloud untuk generator AI.
- `OLLAMA_MODEL` (opsional): contoh `glm-5.3-flash:cloud`; cek model yang tersedia di akun Ollama Cloud.

Atur minimal environment **Production**, dan redeploy project setelah perubahan env. Jangan tulis nilai rahasia di source code, issue GitHub, atau chat.

Cek kesehatan: `GET /api/health`. Balasan `admin:false` berarti ADMIN_PASSWORD / SESSION_SECRET belum disetel. Cek sesi admin: `GET /api/admin/session`.

## Pilihan Cloudflare (belum di-deploy)

File `wrangler.jsonc` dan `migrations/0001_init.sql` hanya persiapan alternatif Cloudflare Workers + D1 dan masih memerlukan ID D1 sesungguhnya, backend yang kompatibel, serta kredensial Cloudflare. Deployment aktif adalah di **Vercel**, bukan Cloudflare.

## Privasi dan keamanan

Sesi admin disimpan dalam cookie HttpOnly + Secure + SameSite=Strict. Siswa tidak memakai PIN; karena itu progres belajar bukan data resmi ujian. Gunakan identifikasi siswa yang memadai jika nanti ingin memakainya sebagai penilaian sekolah. Jangan mengunggah data pribadi siswa sebelum kebijakan privasi dan pengaturan akses sekolah ditinjau.
