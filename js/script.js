/* ============================================================
   KONFIGURASI — GANTI SESUAI DATA KAMU
============================================================ */
const CONFIG = {
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbxKRWeJDz96k9IuSM_4BFyB2EG4mB3j0hmBnwMqGFvA9nVvTHd67jJ_jI9e-Hd_pXEZrw/exec",
  WEDDING_DATE: "2026-10-25T09:00:00+07:00",
  WA_ALFA: "6281247770168",
  WA_LENNY: "6285859866900",
  TOTAL_GALLERY_PHOTOS: 10,
  GALLERY_INTERVAL_MS: 3000,
  RSVP_POLL_INTERVAL_MS: 8000,
};

let lastRsvpRow = null; // baris terakhir di Google Sheet, dipakai untuk update kolom Konfirmasi WA

/* ============================================================
   1. NAMA TAMU DARI QUERY STRING  (?to=Bapak%20Budi)
============================================================ */
(function setGuestName(){
  const params = new URLSearchParams(window.location.search);
  const guest = params.get("to");
  if (guest) {
    document.getElementById("guest-name").textContent = decodeURIComponent(guest.replace(/\+/g, " "));
  }
})();

/* ============================================================
   2. LOADING -> COVER (simpel, tanpa video splash/gerbang)
============================================================ */
window.addEventListener("load", () => {
  const loading = document.getElementById("loading-screen");
  setTimeout(() => { loading.classList.add("hide"); }, 1200);
});

/* ============================================================
   4. MUSIK LATAR — mulai HANYA setelah tombol "Buka Undangan" diklik
============================================================ */
const MusicPlayer = (function(){
  const audio = document.getElementById("bg-music");
  const btn = document.getElementById("music-toggle");
  let pending = false; // mencegah play()/pause() tumpang tindih (penyebab AbortError)

  function updateIcon(){
    if (pending) { btn.textContent = "…"; return; }
    btn.textContent = (!audio.paused && !audio.muted) ? "🎵" : "🔇";
  }

  audio.addEventListener("play", updateIcon);
  audio.addEventListener("pause", updateIcon);
  audio.addEventListener("error", () => {
    btn.textContent = "⚠️";
    btn.title = "assets/backsound.mp3 tidak ditemukan/gagal dimuat — cek nama file & pastikan folder assets/ tidak ikut tertimpa saat update kode.";
    console.error("File assets/backsound.mp3 tidak ditemukan/tidak bisa dimuat.");
  });

  function safePlay(){
    if (pending) return;
    pending = true;
    updateIcon();
    audio.muted = false;
    const p = audio.play();
    const done = () => { pending = false; updateIcon(); };
    if (p && p.then) p.then(done).catch(err => {
      // AbortError normal terjadi kalau koneksi lambat lalu tombol
      // diklik lagi sebelum play() selesai — bukan error fatal.
      if (err.name !== "AbortError") console.warn("Musik gagal diputar:", err);
      done();
    });
    else done();
  }
  function safePause(){
    if (pending) return;
    pending = true;
    audio.pause();
    pending = false;
    updateIcon();
  }

  btn.addEventListener("click", () => {
    if (pending) return; // abaikan klik ganda selagi masih memuat
    if (audio.paused || audio.muted) safePlay(); else safePause();
  });

  return { start(){ safePlay(); } };
})();

/* ============================================================
   4. TOMBOL "BUKA UNDANGAN" -> tampilkan undangan + mulai musik
============================================================ */
document.getElementById("open-invitation-btn").addEventListener("click", () => {
  const main = document.getElementById("main-invitation");
  main.hidden = false;
  document.getElementById("cover").style.display = "none";

  MusicPlayer.start();

  main.scrollIntoView({ behavior: "smooth" });
  initGalleryReveal(); // baru dipicu sekali di sini agar IntersectionObserver aktif setelah main tampil
});

/* ============================================================
   7. GALERI: grid muncul satu-satu -> 3 paragraf kenangan -> slideshow
============================================================ */
let galleryStarted = false;
function initGalleryReveal(){
  if (galleryStarted) return;
  const section = document.getElementById("gallery-page");
  if (!section) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !galleryStarted) {
        galleryStarted = true;
        runGallerySequence();
        observer.disconnect();
      }
    });
  }, { threshold: 0.35 });

  observer.observe(section);
}

function runGallerySequence(){
  const total = CONFIG.TOTAL_GALLERY_PHOTOS;
  const grid = document.getElementById("gallery-grid");
  const story = document.getElementById("gallery-story");
  const slider = document.getElementById("gallery-slider");
  const dotsWrap = document.getElementById("gallery-dots");

  // --- Tahap 1: foto gaya polaroid muncul satu per satu, rotasi acak ---
  const staggerMs = 180;
  for (let i = 1; i <= total; i++) {
    const item = document.createElement("div");
    item.className = "grid-item";
    item.style.animationDelay = (i * staggerMs) + "ms";
    const img = document.createElement("img");
    img.src = `assets/foto${i}.jpg`;
    img.alt = `Kenangan ${i}`;
    img.loading = "lazy";
    img.onerror = function(){ this.onerror = null; this.src = "assets/placeholder-foto.svg"; };
    item.appendChild(img);
    grid.appendChild(item);
  }
  const gridDuration = total * staggerMs + 800;

  // --- Tahap 2: 3 paragraf kenangan slide masuk bergantian kiri/kanan,
  //     dan TETAP TERLIHAT setelah muncul (tidak dihilangkan lagi) ---
  const paraDelayAfterGrid = 900;
  const paraStagger = 1400;
  setTimeout(() => {
    story.hidden = false;
    const paras = story.querySelectorAll(".story-para");
    paras.forEach((p, idx) => {
      setTimeout(() => { p.classList.add("shown"); }, idx * paraStagger);
    });

    // --- Tahap 3: setelah paragraf terakhir muncul + jeda baca, lanjut ke slideshow ---
    const readPause = 3500;
    const totalStoryTime = (paras.length - 1) * paraStagger + readPause;
    setTimeout(() => {
      slider.hidden = false;
      dotsWrap.hidden = false;
      requestAnimationFrame(() => {
        slider.classList.add("visible");
        dotsWrap.classList.add("visible");
      });
      startGallerySlideshow();
    }, totalStoryTime);
  }, gridDuration + paraDelayAfterGrid);
}

function startGallerySlideshow(){
  const slider = document.getElementById("gallery-slider");
  const dotsWrap = document.getElementById("gallery-dots");
  const total = CONFIG.TOTAL_GALLERY_PHOTOS;

  for (let i = 1; i <= total; i++) {
    const slide = document.createElement("div");
    slide.className = "gallery-slide" + (i === 1 ? " active" : "");
    const img = document.createElement("img");
    img.src = `assets/foto${i}.jpg`;
    img.alt = `Kenangan ${i}`;
    img.loading = "lazy";
    img.onerror = function(){ this.onerror = null; this.src = "assets/placeholder-foto.svg"; };
    slide.appendChild(img);
    slider.appendChild(slide);

    const dot = document.createElement("span");
    if (i === 1) dot.className = "active";
    dotsWrap.appendChild(dot);
  }

  let current = 0;
  const slides = slider.querySelectorAll(".gallery-slide");
  const dots = dotsWrap.querySelectorAll("span");

  setInterval(() => {
    slides[current].classList.remove("active");
    dots[current].classList.remove("active");
    current = (current + 1) % slides.length;
    slides[current].classList.add("active");
    dots[current].classList.add("active");
  }, CONFIG.GALLERY_INTERVAL_MS);
}

/* ============================================================
   8. COUNTDOWN
============================================================ */
(function initCountdown(){
  const target = new Date(CONFIG.WEDDING_DATE).getTime();
  const elDays = document.getElementById("cd-days");
  const elHours = document.getElementById("cd-hours");
  const elMins = document.getElementById("cd-mins");
  const elSecs = document.getElementById("cd-secs");

  function tick(){
    const diff = target - Date.now();
    if (diff <= 0) {
      elDays.textContent = elHours.textContent = elMins.textContent = elSecs.textContent = "00";
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    elDays.textContent = String(d).padStart(2, "0");
    elHours.textContent = String(h).padStart(2, "0");
    elMins.textContent = String(m).padStart(2, "0");
    elSecs.textContent = String(s).padStart(2, "0");
  }
  tick();
  setInterval(tick, 1000);
})();

/* ============================================================
   9. SALIN NOMOR REKENING
============================================================ */
document.querySelectorAll(".btn-copy").forEach(btn => {
  btn.addEventListener("click", async () => {
    const number = btn.dataset.copy;
    try {
      await navigator.clipboard.writeText(number);
      btn.textContent = "Tersalin!";
      btn.classList.add("copied");
      setTimeout(() => { btn.textContent = "Salin Nomor"; btn.classList.remove("copied"); }, 2000);
    } catch (e) {
      alert("Nomor rekening: " + number);
    }
  });
});

/* ============================================================
   10. RSVP FORM -> Google Sheets via Apps Script
============================================================ */
document.getElementById("rsvp-form").addEventListener("submit", async function(e){
  e.preventDefault();
  const btn = document.getElementById("rsvp-submit-btn");
  const status = document.getElementById("rsvp-status");
  const nama = document.getElementById("rsvp-nama").value.trim();
  const hadir = document.getElementById("rsvp-hadir").value;
  const jumlah = document.getElementById("rsvp-jumlah").value;
  const ucapan = document.getElementById("rsvp-ucapan").value.trim();

  if (!nama || !hadir) return;

  btn.disabled = true;
  status.textContent = "Mengirim...";

  const payload = { nama, hadir, jumlah, ucapan };

  if (!CONFIG.APPS_SCRIPT_URL.startsWith("http")) {
    status.textContent = "Belum terhubung ke Google Sheet — hubungi admin situs (APPS_SCRIPT_URL belum diisi).";
    status.style.color = "#b23b3b";
    btn.disabled = false;
    console.warn("CONFIG.APPS_SCRIPT_URL belum diisi dengan URL Web App Apps Script.");
    return;
  }

  function showWaOptions(){
    const waSection = document.getElementById("rsvp-wa-confirm");
    const msg = encodeURIComponent(
      `Halo, saya ${nama} ingin konfirmasi kehadiran (${hadir}, ${jumlah} orang) pada pernikahan Alfaber & Lenny.`
    );
    document.getElementById("wa-alfa").href = `https://wa.me/${CONFIG.WA_ALFA}?text=${msg}`;
    document.getElementById("wa-lenny").href = `https://wa.me/${CONFIG.WA_LENNY}?text=${msg}`;
    waSection.hidden = false;
  }

  try {
    const res = await fetch(CONFIG.APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" }, // hindari CORS preflight
      body: JSON.stringify(payload),
    });

    const result = await res.json().catch(() => null);

    if (!res.ok || !result || result.status !== "ok") {
      throw new Error((result && result.message) || `HTTP ${res.status}`);
    }

    lastRsvpRow = result.row || null;

    status.textContent = "Terima kasih! Konfirmasi kamu sudah kami terima.";
    status.style.color = "#2E5442";
    document.getElementById("rsvp-form").reset();
    showWaOptions();
    fetchRsvpList(); // langsung refresh daftar & jumlah setelah kirim
  } catch (err) {
    console.error("Gagal mengirim RSVP ke Google Sheet:", err);
    status.textContent = "Konfirmasi belum tersimpan ke sistem kami (masalah koneksi ke Google Sheet). Silakan gunakan tombol WhatsApp di bawah, atau coba lagi.";
    status.style.color = "#b23b3b";
    showWaOptions();
  } finally {
    btn.disabled = false;
  }
});

/* Saat tombol WA Alfa/Lenny diklik: catat pilihan itu ke kolom
   "Konfirmasi WA" pada baris RSVP yang baru saja dikirim. */
["wa-alfa", "wa-lenny"].forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener("click", () => {
    if (!lastRsvpRow || !CONFIG.APPS_SCRIPT_URL.startsWith("http")) return;
    const source = el.dataset.source; // "Alfa" atau "Lenny"
    fetch(CONFIG.APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "updateWaConfirm", row: lastRsvpRow, source }),
    }).catch(err => console.warn("Gagal mencatat Konfirmasi WA:", err));
    // Catatan: ini mencatat tombol mana yang tamu klik (niat konfirmasi),
    // bukan bukti pesan WhatsApp benar-benar terkirim — itu terjadi di
    // aplikasi WhatsApp itu sendiri dan di luar jangkauan situs ini.
  });
});

/* ============================================================
   11. DAFTAR UCAPAN RSVP + JUMLAH HADIR/TIDAK HADIR
        (tampil langsung di halaman, di bawah tombol konfirmasi,
        bukan notifikasi mengambang lagi)
============================================================ */
function renderRsvpList(data){
  const listEl = document.getElementById("rsvp-list");
  const countHadir = document.getElementById("count-hadir");
  const countTidak = document.getElementById("count-tidak");
  if (!listEl) return;

  countHadir.textContent = data.hadirCount != null ? data.hadirCount : 0;
  countTidak.textContent = data.tidakCount != null ? data.tidakCount : 0;

  const entries = Array.isArray(data.entries) ? data.entries : [];
  if (!entries.length) {
    listEl.innerHTML = `<li class="rsvp-list-empty">Belum ada ucapan. Jadilah yang pertama!</li>`;
    return;
  }

  listEl.innerHTML = entries.map(entry => {
    const statusClass = (entry.hadir || "").toLowerCase().includes("tidak") ? "tidak" : "hadir";
    const ucapanText = entry.ucapan && String(entry.ucapan).trim() ? String(entry.ucapan).trim() : "—";
    return `<li>
      <div class="li-top">
        <span class="li-name">${escapeHtml(entry.nama || "Tamu")}</span>
        <span class="li-status ${statusClass}">${escapeHtml(entry.hadir || "-")}</span>
      </div>
      <div class="li-msg">"${escapeHtml(ucapanText)}"</div>
    </li>`;
  }).join("");
}
function escapeHtml(str){
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}

async function fetchRsvpList(){
  if (!CONFIG.APPS_SCRIPT_URL.startsWith("http")) return;
  try {
    const res = await fetch(`${CONFIG.APPS_SCRIPT_URL}?action=latest`);
    const data = await res.json();
    renderRsvpList(data);
  } catch (err) {
    // diam-diam gagal — tidak mengganggu pengalaman tamu
  }
}
fetchRsvpList(); // muat daftar begitu halaman dibuka, tanpa perlu submit dulu
setInterval(fetchRsvpList, CONFIG.RSVP_POLL_INTERVAL_MS);
