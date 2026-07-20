# Undangan Pernikahan Digital — Alfaber & Lenny

Situs undangan siap pakai untuk di-hosting di **GitHub Pages**.
Semua bagian dari brief sudah dibangun: loading, video pembuka, gerbang,
sampul dengan nama tamu, api unggun kembang api, ayat Matius 19:6, bingkai
bunga mekar animasi, profil pasangan, galeri 10 foto, video "Our Stories",
countdown + peta lokasi, info rekening, RSVP ke Google Sheets, notifikasi
mengambang, dan penutup + tombol iklan.

## 1. Struktur folder

```
undangan/
├── index.html
├── css/style.css
├── js/script.js
├── assets/              ← taruh semua foto & video asli di sini
└── google-apps-script/Code.gs
```

## 1b. Update Sesi 2 (perubahan terbaru)

- 🎵 **Musik latar** ditambahkan (`assets/backsound.mp3`), dengan tombol
  bulat 🔇/🎵 mengambang di pojok kanan atas untuk nyala/mati. Karena
  kebijakan browser, musik baru benar-benar bersuara setelah tamu klik
  tombol "Buka Undangan" (dihitung sebagai interaksi pengguna).
- ❌ Halaman gerbang berlatar gelap (setelah video kereta) **sudah dihapus**.
  Sekarang gerbang langsung terbuka sebagai overlay tepat di atas halaman
  sampul yang sudah bercahaya — tidak ada lagi jeda halaman hitam.
- ✨ Halaman sampul (sebelum klik "Buka Undangan") dibuat lebih menyala:
  ada kilau emas berdenyut + partikel sparkle supaya kesan pertama lebih
  memikat.
- 🌹 **Bingkai bunga** dibuat jauh lebih besar & megah, dengan sulur yang
  benar-benar terlihat **tumbuh berulang** (garis sulur "menggambar diri"
  lalu memudar dan tumbuh lagi) plus mawar mekar bertingkat, bukan lagi
  simbol kecil datar.
- 🌸 **Hujan kelopak mawar besar** otomatis muncul lebat begitu tombol
  "Buka Undangan" diklik (saat kalimat pembuka & ayat muncul), lalu
  melanjutkan hujan ringan terus-menerus di halaman itu.
  > Catatan: link Pinterest yang kamu kirim tidak bisa dipakai langsung —
  > itu video milik pihak lain di platform lain, dan aku tidak bisa
  > mengambil/menyalin kontennya. Efek di atas adalah animasi kelopak
  > mawar orisinal yang aku buat untuk meniru kesan serupa.
- 🌄 **Latar pemandangan baru** untuk semua halaman setelah undangan
  dibuka: padang rumput hijau, danau dengan pantulan cahaya, langit
  matahari terbenam, dan siluet gedung kota di ujung — menggantikan
  latar polos sebelumnya. Setiap kartu konten dibuat sedikit transparan
  (efek kaca buram) supaya pemandangan tetap terlihat menembus di
  belakangnya.

## 2. Aset yang WAJIB kamu tambahkan ke folder `assets/`

Nama file harus **persis** seperti ini (huruf kecil semua):

| File | Keterangan |
|---|---|
| `kereta-pegasus.mp4` | video 3D kuda pegasus menarik kereta pengantin (untuk splash pembuka). Kalau belum ada, situs otomatis memakai ilustrasi CSS sederhana sebagai cadangan. |
| `profil-pria.jpg` | foto profil Alfaber |
| `profil-wanita.jpg` | foto profil Lenny |
| `foto1.jpg` s/d `foto10.jpg` | 10 foto kenangan (slideshow otomatis) |
| `Our Stories.mp4` | video singkat kedua mempelai |
| `backsound.mp3` | musik latar (sudah kamu tambahkan ✅) |

> Catatan: nama file asli kamu ("profil-pria.jpg.jpeg") sepertinya double-extension
> bawaan HP/export. Ganti nama filenya jadi `profil-pria.jpg` biasa (atau `.jpeg`,
> lalu sesuaikan path di `index.html`/`script.js`) supaya tidak error.

Kalau foto belum ada, halaman tetap tampil rapi dengan placeholder bertuliskan
"Foto belum diupload" — jadi kamu bisa deploy dulu, upload aset belakangan.

## 3. Setup Google Sheets + Apps Script (RSVP)

1. Buka Google Sheet kamu (link yang sudah kamu kasih).
2. Buat header di baris pertama, kolom **A sampai F** persis:
   `Waktu | Nama | Kehadiran | Jumlah | Konfirmasi WA | Ucapan`
3. Menu **Extensions → Apps Script**.
4. Hapus kode default, tempel isi file `google-apps-script/Code.gs`.
5. Klik **Deploy → New deployment**.
   - Pilih tipe **Web app**.
   - Execute as: **Me**.
   - Who has access: **Anyone**.
6. Klik **Deploy**, lalu **izinkan akses** (authorize) saat diminta.
7. Salin **URL Web App** yang muncul (formatnya `https://script.google.com/macros/s/xxxx/exec`).
8. Buka `js/script.js`, ganti baris:
   ```js
   APPS_SCRIPT_URL: "PASTE_URL_WEB_APP_APPS_SCRIPT_DI_SINI",
   ```
   dengan URL yang kamu salin tadi.
9. Setiap kali kamu edit `Code.gs` lagi, jangan lupa **Manage deployments → Edit → New version** supaya perubahan aktif.

### 🔧 Kalau RSVP terkirim ke WhatsApp tapi TIDAK masuk ke Google Sheet

Ini penyebab paling umum, urutkan dari yang paling sering terjadi:

1. **Belum redeploy setelah edit kode.** Ini penyebab #1 hampir selalu.
   Setiap kali kamu mengubah isi `Code.gs` (termasuk saat pertama kali
   menempel kode dariku), kamu HARUS: **Deploy → Manage deployments →
   klik ikon pensil (Edit) → Version: New version → Deploy** lagi. Kalau
   cuma disimpan (Ctrl+S) tanpa deploy ulang, URL Web App lama masih
   menjalankan kode LAMA.
2. **URL di `js/script.js` salah/kadaluarsa.** Pastikan `APPS_SCRIPT_URL`
   diakhiri `/exec` (bukan `/dev`), dan itu URL dari deployment TERBARU.
3. **Nama tab sheet tidak cocok.** Buka `Code.gs`, cek baris
   `const SHEET_NAME = "Sheet1";` — ganti `"Sheet1"` sesuai nama tab asli
   di spreadsheet kamu (klik kanan tab di bawah spreadsheet untuk lihat
   namanya persis, termasuk huruf besar/kecil).
4. **Cara pasti untuk tahu di mana masalahnya** — buka Apps Script editor:
   - Jalankan fungsi `testDoPost` sekali lewat tombol ▷ Run di editor
     (bukan dari website). Kalau baris baru muncul di Sheet, berarti
     kode & Sheet-nya sudah benar — masalah ada di sisi deployment/URL.
     Kalau baris TIDAK muncul, lihat pesan error di menu **Executions**
     (ikon jam di sisi kiri Apps Script editor) untuk tahu persis error-nya.
   - Buka situs undangan, coba kirim RSVP, lalu tekan F12 (DevTools) →
     tab **Network** → cari request ke `.../exec` → klik → lihat tab
     **Response**. Sekarang skrip sudah aku ubah supaya selalu
     mengembalikan pesan JSON yang jelas, misalnya
     `{"status":"error","message":"..."}` — pesan itu akan langsung
     menunjukkan penyebabnya.
5. Aku juga sudah mengubah `js/script.js` supaya **tidak lagi berpura-pura
   berhasil** kalau sebenarnya gagal — sebelumnya form selalu menampilkan
   "berhasil" walau URL Apps Script salah/kosong. Sekarang kalau gagal,
   status di form akan menampilkan pesan merah dan tombol WhatsApp tetap
   muncul sebagai jalur cadangan.

Kolom "Konfirmasi WA" sengaja dikosongkan otomatis dan **tidak ditampilkan ke tamu**
— hanya untuk catatan kamu di spreadsheet, sesuai instruksi awal.

## 4. Peta lokasi (Google Maps embed)

Link `maps.app.goo.gl` (short link) tidak bisa langsung dipakai sebagai `src`
iframe. Aku sudah pasang iframe sementara berdasarkan nama lokasi
(GKJW Jemaat Gumuk Kembar & Jl. Tandean, Umbulsari, Jember). Untuk hasil
paling presisi:

1. Buka Google Maps di browser, cari lokasi persis (pemberkatan / resepsi).
2. Klik **Share/Bagikan → Sematkan peta (Embed a map)**.
3. Salin kode `<iframe ...>` yang diberikan Google.
4. Tempel, ganti iframe yang ada di dalam `.map-embed` di `index.html`
   (ada 2 lokasi: bagian "Pemberkatan" dan "Resepsi").

## 5. Countdown & tanggal

Tanggal acara sudah diset ke **Minggu, 25 Oktober 2026** di `CONFIG.WEDDING_DATE`
pada `js/script.js`. Ubah jam mulai di sana kalau perlu.

## 6. Nomor WhatsApp

Nomor Alfa & Lenny untuk konfirmasi RSVP dan tombol iklan
**MANGUNSONG TECH.AI** sudah diisi di `js/script.js` (`CONFIG.WA_ALFA`,
`CONFIG.WA_LENNY`) dan di footer `index.html`.

## 7. Nama tamu otomatis di link

Situs membaca nama tamu dari parameter URL `?to=`, contoh:

```
https://vinsmoke7-sanji.github.io/undangan-pernikahan-Alfaber-Lenny/?to=Bapak%20Budi
```

Ganti "Bapak Budi" sesuai nama tamu masing-masing saat membagikan link.

## 8. Deploy ke GitHub Pages

1. Push semua isi folder ini ke repo:
   `undangan-pernikahan-Alfaber-Lenny`
2. Di repo → **Settings → Pages** → Source: pilih branch `main`, folder `/root`.
3. Tunggu beberapa menit, situs aktif di:
   `https://vinsmoke7-sanji.github.io/undangan-pernikahan-Alfaber-Lenny/`

## 9. Yang perlu kamu cek/sesuaikan sebelum go-live

- [ ] Upload semua aset foto & video ke folder `assets/`
- [ ] Isi `APPS_SCRIPT_URL` di `js/script.js`
- [ ] Ganti iframe Google Maps dengan hasil embed asli (opsional tapi disarankan)
- [ ] Tes kirim RSVP sekali untuk pastikan data masuk ke Google Sheet
- [ ] Tes buka link dari HP (gerak animasi, video autoplay biasanya perlu `muted` — sudah diset)

Selamat mempersiapkan hari bahagianya, Alfaber & Lenny! 🎉
