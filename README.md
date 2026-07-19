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

## 2. Aset yang WAJIB kamu tambahkan ke folder `assets/`

Nama file harus **persis** seperti ini (huruf kecil semua):

| File | Keterangan |
|---|---|
| `kereta-pegasus.mp4` | video 3D kuda pegasus menarik kereta pengantin (untuk splash pembuka). Kalau belum ada, situs otomatis memakai ilustrasi CSS sederhana sebagai cadangan. |
| `profil-pria.jpg` | foto profil Alfaber |
| `profil-wanita.jpg` | foto profil Lenny |
| `foto1.jpg` s/d `foto10.jpg` | 10 foto kenangan (slideshow otomatis) |
| `Our Stories.mp4` | video singkat kedua mempelai |

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
