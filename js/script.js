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
   2. SPARKLE EMAS DI HALAMAN SAMPUL
============================================================ */
(function spawnSparkles(){
  const container = document.getElementById("sparkle-container");
  if (!container) return;
  const total = 26;
  for (let i = 0; i < total; i++) {
    const s = document.createElement("span");
    s.className = "sparkle";
    s.style.left = Math.random() * 100 + "%";
    s.style.top = Math.random() * 100 + "%";
    s.style.animationDuration = (2 + Math.random() * 3) + "s";
    s.style.animationDelay = (Math.random() * 4) + "s";
    container.appendChild(s);
  }
})();

/* ============================================================
   3. LOADING -> TAP TO START -> VIDEO KERETA (DENGAN SUARA) -> COVER
   Browser TIDAK mengizinkan video autoplay dengan suara tanpa ada
   sentuhan/klik dari pengguna terlebih dahulu — karena itu ada
   satu langkah "Ketuk untuk Memulai" di sini. Setelah diketuk,
   semuanya berjalan otomatis (video + suara, lalu ke sampul).
============================================================ */
window.addEventListener("load", () => {
  const loading = document.getElementById("loading-screen");
  const startPrompt = document.getElementById("start-prompt");
  const splash = document.getElementById("splash-video");
  const video = document.getElementById("carriage-video");
  const cover = document.getElementById("cover");

  video.addEventListener("error", () => splash.classList.add("no-video"));

  // Loading ring tampil sebentar, lalu tampilkan tombol "Ketuk untuk Memulai"
  setTimeout(() => {
    loading.classList.add("hide");
    startPrompt.hidden = false;
  }, 1500);

  function goToCoverDirectly(){
    splash.style.display = "none";
    cover.scrollIntoView({ behavior: "instant" });
  }

  document.getElementById("start-prompt-btn").addEventListener("click", () => {
    startPrompt.classList.add("hide");
    splash.scrollIntoView({ behavior: "instant" });

    video.muted = false;
    video.volume = 1;
    const playPromise = video.play();
    if (playPromise && playPromise.catch) {
      playPromise.catch(err => {
        console.warn("Video kereta tidak bisa diputar otomatis, lanjut ke sampul:", err);
        goToCoverDirectly();
      });
    }

    // Kalau video tidak tersedia/gagal dimuat, langsung lanjut ke sampul
    if (video.readyState === 0) {
      setTimeout(() => { if (video.videoWidth === 0) goToCoverDirectly(); }, 2500);
    }

    // Setelah video kereta SELESAI, langsung tampilkan sampul.
    // (Tidak ada lagi animasi gerbang/tirai terpisah — jika kamu
    // menambahkan efek gerbang, sisipkan langsung di dalam video ini.)
    video.addEventListener("ended", goToCoverDirectly, { once: true });

    // Jaga-jaga kalau video sangat panjang atau event 'ended' tidak terpicu
    setTimeout(goToCoverDirectly, 20000);
  }, { once: true });
});

/* ============================================================
   4. MUSIK LATAR — mulai HANYA setelah tombol "Buka Undangan" diklik
============================================================ */
const MusicPlayer = (function(){
  const audio = document.getElementById("bg-music");
  const btn = document.getElementById("music-toggle");

  function updateIcon(){ btn.textContent = (!audio.paused && !audio.muted) ? "🎵" : "🔇"; }

  btn.addEventListener("click", () => {
    if (audio.paused || audio.muted) {
      audio.muted = false;
      audio.play().catch(err => console.warn("Musik gagal diputar:", err));
    } else {
      audio.muted = true;
    }
    updateIcon();
  });

  audio.addEventListener("error", () => console.warn("File assets/backsound.mp3 tidak ditemukan/tidak bisa dimuat."));

  return {
    start(){
      btn.hidden = false;
      audio.muted = false;
      audio.currentTime = 0;
      const p = audio.play();
      if (p && p.catch) p.catch(err => console.warn("Musik gagal autoplay:", err));
      updateIcon();
    }
  };
})();

/* ============================================================
   5. TOMBOL "BUKA UNDANGAN" -> tampilkan undangan + musik + kembang api
============================================================ */
document.getElementById("open-invitation-btn").addEventListener("click", () => {
  const main = document.getElementById("main-invitation");
  main.hidden = false;
  document.getElementById("cover").style.display = "none";
  document.getElementById("splash-video").style.display = "none";

  MusicPlayer.start();
  playFireworksVideo();

  main.scrollIntoView({ behavior: "smooth" });
  initGalleryReveal(); // baru dipicu sekali di sini agar IntersectionObserver aktif setelah main tampil
});

/* ============================================================
   6. KEMBANG API — video overlay (assets/kembang-api.mp4), sekali jalan
============================================================ */
function playFireworksVideo(){
  const v = document.getElementById("fireworks-video");
  if (!v) return;
  v.currentTime = 0;
  v.classList.add("show");
  const p = v.play();
  if (p && p.catch) p.catch(() => { v.classList.remove("show"); });
  v.addEventListener("ended", () => v.classList.remove("show"), { once: true });
  // Jaga-jaga kalau file belum ada / gagal dimuat
  v.addEventListener("error", () => v.classList.remove("show"), { once: true });
}

/* Sembunyikan video latar/kelopak dengan rapi kalau file belum diupload */
["scenery-video", "petals-video"].forEach(id => {
  const v = document.getElementById(id);
  if (v) v.addEventListener("error", () => { v.style.display = "none"; });
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

  // --- Tahap 1: grid 10 foto muncul satu per satu ---
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
  const gridDuration = total * staggerMs + 700;

  // --- Tahap 2: 3 paragraf kenangan muncul bergantian ---
  const paraDelayAfterGrid = 900;
  const paraDurationEach = 4200;
  setTimeout(() => {
    story.hidden = false;
    const paras = story.querySelectorAll(".story-para");
    paras.forEach((p, idx) => {
      setTimeout(() => {
        paras.forEach(pp => pp.classList.remove("active"));
        p.classList.add("active");
      }, idx * paraDurationEach);
    });

    // --- Tahap 3: setelah 3 paragraf selesai, masuk ke slideshow ---
    const totalStoryTime = paras.length * paraDurationEach;
    setTimeout(() => {
      story.style.transition = "opacity .8s ease";
      story.style.opacity = "0";
      setTimeout(() => { story.hidden = true; }, 800);

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
    showRsvpToast(nama, hadir, ucapan);
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
   11. NOTIFIKASI RSVP MENGAMBANG — ATAS TENGAH, 10 DETIK
        Format: Nama | Kehadiran | Ucapan
============================================================ */
function showRsvpToast(nama, hadir, ucapan){
  const container = document.getElementById("rsvp-toast-container");
  const toast = document.createElement("div");
  toast.className = "rsvp-toast";
  const ucapanText = ucapan && ucapan.trim() ? ucapan.trim() : "—";
  toast.innerHTML = `<b>${escapeHtml(nama)}</b> &middot; ${escapeHtml(hadir)}<br>"${escapeHtml(ucapanText)}"`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 10000);
}
function escapeHtml(str){
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

let lastSeenTimestamp = null;
async function pollRsvpUpdates(){
  if (!CONFIG.APPS_SCRIPT_URL.startsWith("http")) return;
  try {
    const res = await fetch(`${CONFIG.APPS_SCRIPT_URL}?action=latest`);
    const data = await res.json();
    if (Array.isArray(data) && data.length) {
      const newest = data[data.length - 1];
      const stamp = newest.waktu;
      if (stamp && stamp !== lastSeenTimestamp) {
        lastSeenTimestamp = stamp;
        showRsvpToast(newest.nama, newest.hadir, newest.ucapan);
      }
    }
  } catch (err) {
    // diam-diam gagal — tidak mengganggu pengalaman tamu
  }
}
setInterval(pollRsvpUpdates, CONFIG.RSVP_POLL_INTERVAL_MS);
