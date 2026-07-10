// Deklarasi audio global
const audio = document.getElementById('wedding-audio');

// 1. Logika Ambil Nama Tamu dari URL Parameter (?to=NamaTamu)
const urlParams = new URLSearchParams(window.location.search);
const guestName = urlParams.get('to');
if (guestName) {
    document.getElementById('guest-name').innerText = guestName;
} else {
    document.getElementById('guest-name').innerText = "Tamu Undangan";
}

// ========================================================
// 2. Buka Undangan & Play Musik Otomatis dengan MUTED BYPASS
// ========================================================
function openInvitation() {

    const cover = document.getElementById("cover");
    const main = document.getElementById("main-content");
    const musicBtn = document.getElementById("music-control");

    cover.style.opacity = "0";
    cover.style.transform = "translateY(-100vh)";

    setTimeout(() => {

        cover.classList.add("hidden");
        main.classList.remove("hidden");
        musicBtn.style.display = "flex";

        audio.currentTime = 0;

        audio.play()
        .then(() => {
            console.log("Music playing");
        })
        .catch(err => {
            console.error(err);
        });

    },1000);

}

// Toggle Musik On/Off (Mute/Unmute)
function toggleMusic(){

    const icon=document.getElementById("music-icon");

    if(audio.paused){

        audio.play();

        icon.innerHTML="🎵";

    }else{

        audio.pause();

        icon.innerHTML="🔇";

    }

}

audio.addEventListener("canplay",()=>{

    console.log("MP3 loaded");

});

audio.addEventListener("error",(e)=>{

    console.log(audio.error);

});

// 3. Efek Kelopak Bunga Berjatuhan secara Dinamis
const leavesContainer = document.getElementById('leaves');
function createLeaf() {
    const leaf = document.createElement('div');
    leaf.classList.add('leaf');
    leaf.style.left = Math.random() * 100 + 'vw';
    leaf.style.animationDuration = Math.random() * 3 + 4 + 's'; // antara 4-7 detik
    leaf.style.width = Math.random() * 10 + 10 + 'px';
    leaf.style.height = leaf.style.width;
    
    leavesContainer.appendChild(leaf);
    
    setTimeout(() => {
        leaf.remove();
    }, 7000);
}
setInterval(createLeaf, 300);

// 4. SlideShow 10 Foto Kenangan Berputar Setiap 5 Detik
let slideIndex = 0;
function showSlides() {
    let slides = document.getElementsByClassName("slide");
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";  
    }
    slideIndex++;
    if (slideIndex > slides.length) {slideIndex = 1}    
    if(slides[slideIndex-1]) {
        slides[slideIndex-1].style.display = "block";  
    }
    setTimeout(showSlides, 5000); // Ubah gambar setiap 5 detik
}
// Jalankan slider setelah dokumen siap
document.addEventListener("DOMContentLoaded", () => {
    showSlides();
});

// 5. Countdown / Hitung Mundur Ke Acara (25 Oktober 2026)
const targetDate = new Date("October 25, 2026 08:00:00").getTime();

const countdownInterval = setInterval(() => {
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference < 0) {
        clearInterval(countdownInterval);
        document.getElementById("countdown").innerHTML = "<h3>Hari Bahagia Telah Tiba!</h3>";
        return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    document.getElementById("days").innerText = days < 10 ? '0' + days : days;
    document.getElementById("hours").innerText = hours < 10 ? '0' + hours : hours;
    document.getElementById("minutes").innerText = minutes < 10 ? '0' + minutes : minutes;
    document.getElementById("seconds").innerText = seconds < 10 ? '0' + seconds : seconds;
}, 1000);

function copyAccount() {
    navigator.clipboard.writeText("8620684253");
    alert("Nomor rekening BCA berhasil disalin!");
}

// 6. Manipulasi Form Ucapan Simpel (Local Storage / Temporary UI)
const wishForm = document.getElementById('wish-form');
const wishesContainer = document.getElementById('wishes-container');

if (wishForm) {
    wishForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('wish-name').value;
        const text = document.getElementById('wish-text').value;

        const wishItem = document.createElement('div');
        wishItem.classList.add('wish-item');
        wishItem.innerHTML = `<strong>${name}</strong><p>${text}</p>`;
        
        // Tampilkan di paling atas daftar ucapan
        wishesContainer.insertBefore(wishItem, wishesContainer.firstChild);

        // Reset form setelah submit
        wishForm.reset();
    });
}
