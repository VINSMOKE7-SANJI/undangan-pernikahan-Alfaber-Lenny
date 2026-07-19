/**
 * ============================================================
 *  RSVP BACKEND — Undangan Pernikahan Alfaber & Lenny
 * ============================================================
 *  Cara pakai:
 *  1. Buka Google Sheet kamu:
 *     https://docs.google.com/spreadsheets/d/1outQEbGrSohNRHCHH5fk6P0zIZzWTjPj-IS-3y4t_Hg/edit
 *  2. Pastikan baris pertama (header) berisi persis kolom berikut,
 *     di sheet pertama (ganti nama sheet di SHEET_NAME jika beda):
 *     Waktu | Nama | Kehadiran | Jumlah | Konfirmasi WA | Ucapan
 *  3. Menu Extensions > Apps Script.
 *  4. Hapus isi default, lalu tempel semua kode ini.
 *  5. Klik Deploy > New deployment > pilih tipe "Web app".
 *     - Execute as: Me
 *     - Who has access: Anyone
 *  6. Salin URL Web App yang muncul, tempel ke variabel
 *     CONFIG.APPS_SCRIPT_URL di file js/script.js.
 *  7. Setiap kali mengubah kode ini, buat "New deployment" lagi
 *     (atau gunakan "Manage deployments" > edit > New version).
 * ============================================================
 */

const SHEET_NAME = "Sheet1"; // ganti sesuai nama tab sheet kamu

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = JSON.parse(e.postData.contents);

  const waktu = new Date();
  const nama = data.nama || "";
  const hadir = data.hadir || "";
  const jumlah = data.jumlah || "";
  const ucapan = data.ucapan || "";
  const konfirmasiWA = ""; // diisi manual/terpisah, tidak ditampilkan ke tamu lain

  sheet.appendRow([waktu, nama, hadir, jumlah, konfirmasiWA, ucapan]);

  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Dipanggil oleh script.js untuk polling notifikasi RSVP terbaru
 * tanpa perlu refresh halaman. Mengembalikan beberapa entri terakhir.
 */
function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const values = sheet.getDataRange().getValues();

  // Baris pertama = header, lewati
  const rows = values.slice(1);
  const last10 = rows.slice(-10).map(row => ({
    waktu: row[0] instanceof Date ? row[0].toISOString() : String(row[0]),
    nama: row[1],
    hadir: row[2],
    jumlah: row[3],
  }));

  return ContentService
    .createTextOutput(JSON.stringify(last10))
    .setMimeType(ContentService.MimeType.JSON);
}

