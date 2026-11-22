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
| `ADMIN_PASSWORD` | Kata sandi admin minimal 12 karakter, unik |
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
