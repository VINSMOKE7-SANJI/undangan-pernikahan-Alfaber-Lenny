/* ============================================================
   KONFIGURASI — GANTI SESUAI DATA KAMU
============================================================ */
const CONFIG = {
  // URL Web App hasil deploy Google Apps Script (lihat google-apps-script/Code.gs)
  APPS_SCRIPT_URL: "PASTE_URL_WEB_APP_APPS_SCRIPT_DI_SINI",

  WEDDING_DATE: "2026-10-25T09:00:00+07:00",

  WA_ALFA: "6281246211461",
  WA_LENNY: "6285859866900",

  TOTAL_GALLERY_PHOTOS: 10,
  GALLERY_INTERVAL_MS: 3000,

  RSVP_POLL_INTERVAL_MS: 8000,
};

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
   2. LOADING SCREEN -> SPLASH VIDEO -> GATE -> COVER
============================================================ */
window.addEventListener("load", () => {
  const loading = document.getElementById("loading-screen");
  const splash = document.getElementById("splash-video");
  const video = document.getElementById("carriage-video");
  const gate = document.getElementById("gate-scene");
  const cover = document.getElementById("cover");

  // Deteksi apakah video kereta pegasus tersedia. Jika tidak, tampilkan fallback ilustrasi CSS.
  video.addEventListener("error", () => splash.classList.add("no-video"));
  if (video.readyState === 0) {
    setTimeout(() => { if (video.videoWidth === 0) splash.classList.add("no-video"); }, 2500);
  }

  setTimeout(() => {
    loading.classList.add("hide");
    splash.scrollIntoView({ behavior: "instant" });
  }, 1800);

  // Setelah video berjalan beberapa detik (atau otomatis jika fallback), lanjut ke gerbang
  const goToGate = () => {
    gate.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => cover.scrollIntoView({ behavior: "smooth" }), 2200);
  };
  video.addEventListener("ended", goToGate);
  setTimeout(goToGate, 6000); // fallback timer kalau video panjang/tidak ada event 'ended'
});

/* ============================================================
   3. FALLING PETALS (bingkai bunga & kelopak berjatuhan)
============================================================ */
(function spawnPetals(){
  const container = document.getElementById("petals-container");
  const total = 22;
  for (let i = 0; i < total; i++) {
    const petal = document.createElement("span");
    petal.className = "petal";
    petal.style.left = Math.random() * 100 + "vw";
    petal.style.setProperty("--drift", (Math.random() * 120 - 60) + "px");
    petal.style.animationDuration = (8 + Math.random() * 10) + "s";
    petal.style.animationDelay = (Math.random() * 12) + "s";
    petal.style.fontSize = (12 + Math.random() * 14) + "px";
    petal.style.color = Math.random() > 0.5 ? "#E8A6A0" : "#D4AF37";
    container.appendChild(petal);
  }
})();

/* ============================================================
   4. TOMBOL "BUKA UNDANGAN" -> FIREWORKS + tampilkan isi undangan
============================================================ */
document.getElementById("open-invitation-btn").addEventListener("click", () => {
  const main = document.getElementById("main-invitation");
  main.hidden = false;
  document.getElementById("cover").style.display = "none";
  document.getElementById("splash-video").style.display = "none";
  document.getElementById("gate-scene").style.display = "none";
  runFireworks();
  main.scrollIntoView({ behavior: "smooth" });
});

/* ============================================================
   5. FIREWORKS (canvas particle animation, sekali jalan)
============================================================ */
function runFireworks(){
  const canvas = document.getElementById("fireworks-canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.classList.add("show");

  const colors = ["#D4AF37", "#F1D98B", "#E8A6A0", "#ffffff", "#2E5442"];
  let particles = [];

  function burst(x, y){
    const count = 60;
    for (let i = 0; i < count; i++){
      const angle = (Math.PI * 2 * i) / count;
      const speed = 2 + Math.random() * 4;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 60 + Math.random() * 20,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  }

  const bursts = [
    [window.innerWidth * 0.3, window.innerHeight * 0.35],
    [window.innerWidth * 0.7, window.innerHeight * 0.25],
    [window.innerWidth * 0.5, window.innerHeight * 0.45],
  ];
  bursts.forEach((pos, i) => setTimeout(() => burst(pos[0], pos[1]), i * 350));

  let frame = 0;
  function animate(){
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.04; p.life--;
      ctx.globalAlpha = Math.max(p.life / 80, 0);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });
    particles = particles.filter(p => p.life > 0);
    if (frame < 220) {
      requestAnimationFrame(animate);
    } else {
      canvas.classList.remove("show");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  animate();
}

/* ============================================================
   6. GALERI FOTO — auto slide setiap 3 detik, 10 foto
============================================================ */
(function initGallery(){
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
})();

/* ============================================================
   7. COUNTDOWN
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
   8. SALIN NOMOR REKENING
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
   9. RSVP FORM -> kirim ke Google Apps Script (Google Sheets)
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

  try {
    if (CONFIG.APPS_SCRIPT_URL.startsWith("http")) {
      await fetch(CONFIG.APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors", // Apps Script Web App tidak selalu mengirim header CORS
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(payload),
      });
    }
    status.textContent = "Terima kasih! Konfirmasi kamu sudah kami terima.";
    status.style.color = "#2E5442";
    document.getElementById("rsvp-form").reset();

    // Tampilkan tombol konfirmasi WhatsApp
    const waSection = document.getElementById("rsvp-wa-confirm");
    const msg = encodeURIComponent(
      `Halo, saya ${nama} ingin konfirmasi kehadiran (${hadir}, ${jumlah} orang) pada pernikahan Alfaber & Lenny.`
    );
    document.getElementById("wa-alfa").href = `https://wa.me/${CONFIG.WA_ALFA}?text=${msg}`;
    document.getElementById("wa-lenny").href = `https://wa.me/${CONFIG.WA_LENNY}?text=${msg}`;
    waSection.hidden = false;

    showRsvpToast(`${nama} baru saja mengonfirmasi: ${hadir}`);
  } catch (err) {
    status.textContent = "Gagal mengirim. Silakan coba lagi.";
    status.style.color = "#b23b3b";
  } finally {
    btn.disabled = false;
  }
});

/* ============================================================
   10. NOTIFIKASI RSVP MENGAMBANG (polling tanpa refresh halaman)
============================================================ */
function showRsvpToast(text){
  const container = document.getElementById("rsvp-toast-container");
  const toast = document.createElement("div");
  toast.className = "rsvp-toast";
  toast.textContent = text;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 5200);
}

let lastSeenTimestamp = null;
async function pollRsvpUpdates(){
  if (!CONFIG.APPS_SCRIPT_URL.startsWith("http")) return;
  try {
    const res = await fetch(`${CONFIG.APPS_SCRIPT_URL}?action=latest`);
    const data = await res.json();
    // data diharapkan: [{ waktu, nama, hadir, jumlah }, ...] terbaru di akhir array
    if (Array.isArray(data) && data.length) {
      const newest = data[data.length - 1];
      const stamp = newest.waktu || newest.Waktu;
      if (stamp && stamp !== lastSeenTimestamp) {
        lastSeenTimestamp = stamp;
        showRsvpToast(`${newest.nama || newest.Nama} baru saja mengonfirmasi: ${newest.hadir || newest.Kehadiran}`);
      }
    }
  } catch (err) {
    // diam-diam gagal — tidak mengganggu pengalaman tamu
  }
}
setInterval(pollRsvpUpdates, CONFIG.RSVP_POLL_INTERVAL_MS);
