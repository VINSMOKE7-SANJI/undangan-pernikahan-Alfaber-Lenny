/**
 * ============================================================
 *  RSVP BACKEND — Undangan Pernikahan Alfaber & Lenny
 * ============================================================
 *  Kolom Sheet (baris pertama harus persis ini, A-F):
 *     Waktu | Nama | Kehadiran | Jumlah | Konfirmasi WA | Ucapan
 *
 *  Cara pakai:
 *  1. Buka Google Sheet kamu, pastikan header sudah sesuai di atas.
 *  2. Menu Extensions > Apps Script. Hapus isi default, tempel semua
 *     kode ini.
 *  3. Deploy > New deployment > tipe "Web app".
 *     - Execute as: Me
 *     - Who has access: Anyone
 *  4. Salin URL Web App (harus berakhiran /exec), tempel ke
 *     CONFIG.APPS_SCRIPT_URL di js/script.js.
 *  5. SETIAP KALI kamu ubah kode ini lagi: Deploy > Manage deployments
 *     > (ikon pensil) Edit > Version: New version > Deploy.
 *     Ini penyebab #1 kenapa perubahan tidak berlaku.
 * ============================================================
 */

const SHEET_NAME = "TAMU DIGITAL"; // ganti sesuai nama tab sheet kamu

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      return jsonOutput({
        status: "error",
        message: "Sheet dengan nama '" + SHEET_NAME + "' tidak ditemukan. Cek nama tab di baris const SHEET_NAME."
      });
    }
    if (!e || !e.postData || !e.postData.contents) {
      return jsonOutput({ status: "error", message: "Tidak ada data yang diterima (postData kosong)." });
    }

    const data = JSON.parse(e.postData.contents);

    // ---- Aksi khusus: update kolom "Konfirmasi WA" pada baris tertentu ----
    if (data.action === "updateWaConfirm") {
      const row = Number(data.row);
      const source = data.source || "";
      if (!row || row < 2) {
        return jsonOutput({ status: "error", message: "Nomor baris tidak valid." });
      }
      sheet.getRange(row, 5).setValue(source); // kolom E = Konfirmasi WA
      return jsonOutput({ status: "ok" });
    }

    // ---- Aksi default: simpan RSVP baru ----
    const waktu = new Date();
    const nama = data.nama || "";
    const hadir = data.hadir || "";
    const jumlah = data.jumlah || "";
    const ucapan = data.ucapan || "";
    const konfirmasiWA = ""; // diisi otomatis lewat aksi updateWaConfirm di atas

    sheet.appendRow([waktu, nama, hadir, jumlah, konfirmasiWA, ucapan]);
    const rowNumber = sheet.getLastRow();

    return jsonOutput({ status: "ok", row: rowNumber });
  } catch (err) {
    return jsonOutput({ status: "error", message: String(err) });
  }
}

/**
 * Dipanggil oleh script.js untuk polling notifikasi RSVP terbaru
 * tanpa perlu refresh halaman. Mengembalikan beberapa entri terakhir,
 * termasuk ucapan (untuk notifikasi mengambang Nama | Kehadiran | Ucapan).
 */
function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) return jsonOutput({ status: "error", message: "Sheet '" + SHEET_NAME + "' tidak ditemukan." });

    const values = sheet.getDataRange().getValues();
    const rows = values.slice(1); // lewati header
    const last10 = rows.slice(-10).map(row => ({
      waktu: row[0] instanceof Date ? row[0].toISOString() : String(row[0]),
      nama: row[1],
      hadir: row[2],
      jumlah: row[3],
      konfirmasiWA: row[4],
      ucapan: row[5],
    }));

    return jsonOutput(last10);
  } catch (err) {
    return jsonOutput({ status: "error", message: String(err) });
  }
}

function jsonOutput(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Jalankan SEKALI secara manual dari editor Apps Script (tombol ▷ Run,
 * pilih testDoPost) untuk memastikan penulisan ke Sheet berfungsi,
 * tanpa perlu lewat browser. Lihat hasilnya di menu Executions.
 */
function testDoPost() {
  const fakeEvent = {
    postData: {
      contents: JSON.stringify({ nama: "Tes Manual", hadir: "Hadir", jumlah: 1, ucapan: "Coba dari editor" })
    }
  };
  const result = doPost(fakeEvent);
  Logger.log(result.getContent());
}
