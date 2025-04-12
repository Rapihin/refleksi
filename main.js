// main.js (Lengkap dengan Logika Feedback AI Asli & Path Lokal Ilustrasi)

// --- Strict Mode ---
'use strict';

// --- Seleksi Elemen DOM ---
const form = document.getElementById('reflection-form');
const formSteps = Array.from(form.querySelectorAll('.form-step'));
const activitiesInput = document.getElementById('activities');
const moodSelect = document.getElementById('mood');
const submitButton = document.getElementById('submit-button');
const loadingIndicator = document.getElementById('loading');
const feedbackContainer = document.getElementById('feedback-container');
const historyList = document.getElementById('history-list');
const historyContainer = document.getElementById('history-container');
const themeToggleButton = document.getElementById('theme-toggle');
const moodIllustration = document.getElementById('mood-illustration');
const notificationElement = document.getElementById('copy-notification');
const yearSpan = document.getElementById('copyright-year');
const body = document.body;

// --- Web Audio API Setup ---
let audioCtx;
function getAudioContext() { /* ... (Kode Audio tidak berubah) ... */
    if (!audioCtx) { try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { console.warn("Web Audio API is not supported."); } } return audioCtx;
}
function playSound(type = 'sine', frequency = 440, duration = 0.05, volume = 0.05) { /* ... (Kode Audio tidak berubah) ... */
    const ctx = getAudioContext(); if (!ctx) return; try { const o = ctx.createOscillator(); const g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(frequency, ctx.currentTime); g.gain.setValueAtTime(volume, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration * 0.9); o.connect(g); g.connect(ctx.destination); o.start(ctx.currentTime); o.stop(ctx.currentTime + duration); } catch (e) { console.error("Error playing sound:", e); }
}
const playClickSound = () => playSound('triangle', 300, 0.05, 0.08);
const playSuccessSound = () => playSound('sine', 600, 0.15, 0.06);

// --- Variasi Konten Dinamis ---
const activityPlaceholders = ["Ceritakan singkat kegiatan utamamu...", "Apa saja momen penting hari ini?", "Tuliskan beberapa hal yang mengisi harimu...", "Bagaimana kamu menghabiskan waktumu hari ini?", "Aktivitas apa yang paling menyita energimu?"];
const activityLabels = ["Apa saja yang kamu lakukan hari ini?", "Bagaimana harimu berjalan? Ceritakan aktivitasmu:", "Ringkasan kegiatan hari ini:", "Yuk, ceritakan apa saja yang terjadi hari ini:", "Aktivitas penting hari ini:"];
const distractionPlaceholders = ["Apakah ada tantangan atau hambatan?", "Hal apa yang membuatmu sedikit 'off'?", "Tuliskan jika ada gangguan yang muncul...", "Adakah sesuatu yang tidak berjalan sesuai rencana?", "Jika ada, apa yang mengusik pikiranmu?"];
const distractionLabels = ["Adakah hal yang mengganggu fokus atau harimu?", "Apa saja tantangan yang kamu hadapi hari ini?", "Apakah ada distraksi yang muncul?", "Hal yang kurang menyenangkan hari ini (jika ada):", "Gangguan atau hambatan hari ini?"];
const pridePlaceholders = ["Pencapaian kecil pun berarti!", "Apa momen yang membuatmu tersenyum bangga?", "Satu hal baik yang kamu lakukan/rasakan...", "Bisa berupa hal sederhana, lho!", "Apa highlight positif hari ini?"];
const prideLabels = ["Apa satu hal kecil (atau besar!) yang membuatmu bangga hari ini?", "Pencapaian terbaikmu hari ini:", "Momen positif yang patut diapresiasi:", "Satu hal yang kamu syukuri atau banggakan:", "Highlight kebanggaan hari ini:"];

// --- Ilustrasi SVG URLs (Menggunakan Path Lokal) ---
// PASTIKAN NAMA FILE INI SAMA DENGAN FILE SVG DI FOLDER /illustrations/
const illustrationUrls = {
    baik: './illustrations/ilustrasi-baik.svg',
    netral: './illustrations/ilustrasi-netral.svg',
    buruk: './illustrations/ilustrasi-buruk.svg',   // atau ilustrasi-berpikir.svg, dll.
    default: './illustrations/ilustrasi-default.svg'
};

// --- Fungsi Utilitas ---
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const sanitize = (str) => { const temp = document.createElement('div'); temp.textContent = str; return temp.innerHTML; };

// --- Fungsi Inisialisasi ---
function initializeApp() { /* ... (Kode inisialisasi tidak berubah) ... */
    activitiesInput.placeholder = getRandomElement(activityPlaceholders); document.getElementById('label-activities').textContent = getRandomElement(activityLabels); document.getElementById('distractions').placeholder = getRandomElement(distractionPlaceholders); document.getElementById('label-distractions').textContent = getRandomElement(distractionLabels); document.getElementById('pride').placeholder = getRandomElement(pridePlaceholders); document.getElementById('label-pride').textContent = getRandomElement(prideLabels); setupTheme(); showNextStep(0); loadReflectionHistory(); activitiesInput.focus(); if (yearSpan) { yearSpan.textContent = new Date().getFullYear(); } updateMoodIllustration('default');
}

// --- Logika Tema ---
function setupTheme() { /* ... (Kode tema tidak berubah) ... */
    const savedTheme = localStorage.getItem('theme'); const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches; setTheme(savedTheme || (prefersDark ? 'dark' : 'light'));
}
function setTheme(theme) { /* ... (Kode tema tidak berubah) ... */
    body.classList.remove('dark-mode', 'light-mode'); body.classList.add(theme + '-mode'); localStorage.setItem('theme', theme); updateToggleButtonAriaLabel();
}
function toggleTheme() { /* ... (Kode tema tidak berubah) ... */
    const isDarkMode = body.classList.contains('dark-mode'); setTheme(isDarkMode ? 'light' : 'dark'); if (!audioCtx) getAudioContext();
}
function updateToggleButtonAriaLabel() { /* ... (Kode tema tidak berubah) ... */
    const isDarkMode = body.classList.contains('dark-mode'); themeToggleButton.setAttribute('aria-label', `Ganti ke Mode ${isDarkMode ? 'Terang' : 'Gelap'}`);
}

// --- Logika Form Dinamis ---
let stepTimeouts = [];
function showNextStep(index) { /* ... (Kode form tidak berubah) ... */
    stepTimeouts.forEach(clearTimeout); stepTimeouts = []; for (let i = index; i < formSteps.length; i++) { const timeoutId = setTimeout(() => formSteps[i]?.classList.add('visible'), (i - index) * 120); stepTimeouts.push(timeoutId); }
}

// --- AI Feedback Generator (VERSI LENGKAP DAN BENAR) ---
function generateFeedback(data) {
    const { mood, activities, distractions, pride } = data;

    // Bank Kalimat (Sama seperti kode awal Anda)
    const openings = {
        baik: ["Luar biasa! Senang mendengar harimu berjalan baik. 😊", "Wow, terdengar seperti hari yang sangat positif!", "Hebat! Pertahankan energi baik ini. ✨", "Syukurlah, sepertinya harimu menyenangkan.", "Keren! Mood yang baik adalah awal yang bagus."],
        netral: ["Oke, hari yang cukup standar ya. Itu tidak apa-apa. 🙂", "Terima kasih sudah berbagi. Hari netral juga bagian dari proses.", "Netral itu lebih baik daripada buruk, mari kita lihat detailnya.", "Dipahami. Kadang hari memang berjalan datar saja.", "Baiklah, mari kita telaah hari yang biasa ini."],
        buruk: ["Hm, maaf mendengar harimu terasa berat. Tetap semangat ya. 🤗", "Tidak apa-apa merasa seperti ini. Terima kasih sudah jujur.", "Mengirim pelukan virtual untukmu. Semoga besok lebih baik.", "Tarik napas dulu. Hari buruk bukan berarti kamu buruk.", "Sedih mendengarnya. Mari kita lihat apa yang bisa dipelajari."]
    };
    const activityComments = [
        `Melakukan ${activities.length > 50 ? 'banyak hal' : 'beberapa kegiatan'} hari ini menunjukkan usahamu.`,
        `Aktivitasmu hari ini terdengar ${activities.length > 70 ? 'padat' : 'cukup beragam'}.`,
        "Terima kasih sudah berbagi tentang kegiatanmu.",
        `Melihat aktivitasmu, sepertinya kamu cukup ${mood === 'baik' ? 'produktif' : 'sibuk'} ya.`,
        "Setiap aktivitas, besar atau kecil, adalah bagian dari perjalananmu."
    ];
    const distractionComments = [
        `Tentang "${distractions.substring(0, 30)}${distractions.length > 30 ? '...' : ''}", memang kadang ada saja gangguan tak terduga. Itu manusiawi.`,
        `Menghadapi "${distractions.substring(0, 30)}${distractions.length > 30 ? '...' : ''}" pasti tidak mudah. Kamu sudah berusaha.`,
        `Gangguan seperti "${distractions.substring(0, 30)}${distractions.length > 30 ? '...' : ''}" bisa jadi pengingat untuk lebih fleksibel atau sabar. Ambil hikmahnya ya.`,
        `Wajar jika "${distractions.substring(0, 30)}${distractions.length > 30 ? '...' : ''}" mengganggu. Yang penting bagaimana kamu meresponnya ke depan.`,
        `Tidak apa-apa jika "${distractions.substring(0, 30)}${distractions.length > 30 ? '...' : ''}" membuat harimu kurang optimal. Besok coba lagi.`
    ];
     const prideComments = [
        `Dan yang terpenting, kamu bangga dengan "${pride.substring(0, 40)}${pride.length > 40 ? '...' : ''}"! Itu pencapaian hebat! 🌟`,
        `Fokus pada "${pride.substring(0, 40)}${pride.length > 40 ? '...' : ''}" ya! Itu adalah bukti kekuatan dan progresmu. Teruslah bangga!`,
        `Ingatlah rasa bangga saat mencapai "${pride.substring(0, 40)}${pride.length > 40 ? '...' : ''}". Simpan energi positif ini!`,
        `"${pride.substring(0, 40)}${pride.length > 40 ? '...' : ''}" adalah highlight yang bagus! Jangan lupakan momen ini.`,
        `Selamat atas "${pride.substring(0, 40)}${pride.length > 40 ? '...' : ''}"! Sekecil apapun, itu layak dirayakan. 🎉`
    ];
    const closings = {
        baik: ["Semoga energi positif ini bisa kamu bawa ke hari esok!", "Terus lakukan hal-hal yang membuatmu merasa baik. Kamu hebat!", "Hari yang baik adalah berkah. Nikmati dan syukuri.", "Pertahankan momentum positif ini!", "Semoga besok harimu secerah hari ini!"],
        netral: ["Ingat, hari netral adalah kesempatan untuk istirahat dan mengisi ulang energi.", "Semoga besok ada sedikit percikan semangat baru untukmu.", "Tidak setiap hari harus luar biasa. Cukup adalah baik.", "Fokus pada hal kecil yang bisa membuat besok sedikit lebih baik.", "Terima kasih sudah refleksi. Istirahat yang cukup malam ini. 🌙"],
        buruk: ["Ingat, badai pasti berlalu. Kamu lebih kuat dari yang kamu kira.", "Fokus pada istirahat malam ini. Besok adalah lembaran baru.", "Jangan terlalu keras pada diri sendiri. Kamu sudah melakukan yang terbaik hari ini.", "Semoga besok pagi membawa harapan dan ketenangan baru untukmu.", "Satu langkah kecil untuk hari esok yang lebih baik sudah cukup."]
    };
    const encouragement = [
        "Ingatlah untuk selalu baik pada dirimu sendiri.",
        "Proses refleksi ini adalah langkah positif lho.",
        "Kamu melakukan pekerjaan yang baik dengan merenungkan harimu.",
        "Setiap hari adalah kesempatan belajar.",
        "Kamu keren sudah meluangkan waktu untuk ini."
    ];

    // Logika Penggabungan Kalimat
    let feedbackText = "";
    feedbackText += getRandomElement(openings[mood]) + " ";
    feedbackText += getRandomElement(activityComments) + " ";

    if (distractions && distractions.trim() !== "") {
         // Hanya tambahkan komentar jika ada distraksi yang diisi
         feedbackText += getRandomElement(distractionComments) + " ";
    } else {
         // Komentar alternatif jika tidak ada distraksi
         const noDistractionComments = ["Senang mengetahui tidak ada gangguan berarti hari ini.", "Syukurlah harimu berjalan relatif lancar.", "Fokus yang baik tanpa banyak distraksi itu bagus!"];
         feedbackText += getRandomElement(noDistractionComments) + " ";
    }

    // Selalu tambahkan komentar kebanggaan karena field ini wajib
    feedbackText += getRandomElement(prideComments) + " ";
    feedbackText += getRandomElement(closings[mood]);

    // Tambahkan kalimat penyemangat secara acak (50% kemungkinan)
    if (Math.random() > 0.5) {
        feedbackText += " " + getRandomElement(encouragement);
    }

    // Bersihkan spasi ganda dan trim hasil akhir
    return feedbackText.replace(/\s+/g, ' ').trim();
}
// --- AKHIR DARI FUNGSI generateFeedback YANG BENAR ---

// --- Tampilkan Feedback ---
function displayFeedback(feedback, reflectionData) { /* ... (Kode displayFeedback tidak berubah) ... */
    feedbackContainer.innerHTML = ''; const moodDiv = document.createElement('div'); moodDiv.classList.add('mood-visualizer'); const moodEmojis = { baik: '😊', netral: '🙂', buruk: '🤔' }; moodDiv.textContent = moodEmojis[reflectionData.mood] || '🤔'; feedbackContainer.appendChild(moodDiv); const card = document.createElement('div'); card.classList.add('feedback-card'); const sentences = feedback.match( /[^\.!\?]+[\.!\?]+/g ) || [feedback]; sentences.forEach(sentence => { if (sentence.trim()) { const p = document.createElement('p'); p.textContent = sentence.trim(); card.appendChild(p); } }); feedbackContainer.appendChild(card); const shareButton = document.createElement('button'); shareButton.id = 'share-button'; shareButton.classList.add('share-button'); shareButton.textContent = 'Bagikan Refleksi 📋'; shareButton.addEventListener('click', () => shareReflection(reflectionData, feedback)); feedbackContainer.appendChild(shareButton); playSuccessSound(); updateMoodIllustration(reflectionData.mood); setTimeout(() => feedbackContainer.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
}

// --- Fungsi Share Refleksi ---
function shareReflection(data, feedback) { /* ... (Kode shareReflection tidak berubah) ... */
    const { mood, activities, distractions, pride } = data; const moodText = mood.charAt(0).toUpperCase() + mood.slice(1); const shareText = `Refleksi Harian Saya:\n--------------------\nMood: ${moodText}\nAktivitas: ${activities || '-'}\nGangguan: ${distractions || '-'}\nKebanggaan: ${pride || '-'}\nFeedback AI: ${feedback || '-'}\n--------------------\nDicatat via Aplikasi Refleksi Diri (${new Date().toLocaleDateString('id-ID')})`; if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(shareText).then(() => { showNotification("Refleksi disalin ke clipboard! 👍"); playClickSound(); }).catch(err => { console.warn("Gagal menyalin:", err); showNotification("Gagal menyalin.", true); }); } else { console.warn("Clipboard API tidak tersedia."); showNotification("Fitur salin butuh HTTPS.", true); }
}

// --- Fungsi Tampilkan Notifikasi ---
let notificationTimeout;
function showNotification(message, isError = false) { /* ... (Kode showNotification tidak berubah) ... */
    clearTimeout(notificationTimeout); notificationElement.textContent = message; notificationElement.style.backgroundColor = isError ? '#dc3545' : ''; notificationElement.classList.add('show'); notificationTimeout = setTimeout(() => notificationElement.classList.remove('show'), 3000);
}

// --- Update Ilustrasi SVG ---
function updateMoodIllustration(mood) { /* ... (Kode updateMoodIllustration tidak berubah) ... */
    const url = illustrationUrls[mood] || illustrationUrls.default; if (moodIllustration.getAttribute('src') !== url) { moodIllustration.style.opacity = '0'; setTimeout(() => { moodIllustration.src = url; moodIllustration.alt = `Ilustrasi mood ${mood}`; moodIllustration.style.opacity = '0.9'; }, 200); } else if (moodIllustration.style.opacity === '0') { moodIllustration.style.opacity = '0.9'; }
}

// --- Penyimpanan Lokal & Riwayat ---
function saveReflection(data, feedback) { /* ... (Kode saveReflection tidak berubah) ... */
    const reflections = JSON.parse(localStorage.getItem('reflections') || '[]'); const newReflection = { date: new Date().toISOString(), ...data, feedback }; reflections.unshift(newReflection); const MAX_HISTORY = 21; if (reflections.length > MAX_HISTORY) reflections.pop(); localStorage.setItem('reflections', JSON.stringify(reflections)); updateHistoryList(newReflection, true);
}
function loadReflectionHistory() { /* ... (Kode loadReflectionHistory tidak berubah) ... */
    historyList.innerHTML = ''; const reflections = JSON.parse(localStorage.getItem('reflections') || '[]'); historyContainer.style.display = 'block'; if (reflections.length > 0) { reflections.forEach((reflection, index) => updateHistoryList(reflection, false, index * 80)); } else { historyList.innerHTML = '<p class="no-history">Belum ada riwayat refleksi tersimpan. Yuk, mulai!</p>'; }
}
function updateHistoryList(reflection, prepend = false, delay = 0) { /* ... (Kode updateHistoryList tidak berubah) ... */
    const noHistoryMsg = historyList.querySelector('.no-history'); if (noHistoryMsg) historyList.innerHTML = ''; const item = document.createElement('div'); item.classList.add('history-item'); item.style.animationDelay = `${delay}ms`; const reflectionDate = new Date(reflection.date); const formattedDate = reflectionDate.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }); const formattedTime = reflectionDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }); const moodEmojis = { baik: '😊', netral: '🙂', buruk: '🤔' }; const moodEmoji = moodEmojis[reflection.mood] || '🤔'; const moodText = reflection.mood.charAt(0).toUpperCase() + reflection.mood.slice(1); item.innerHTML = `<h3>${formattedDate} <span>(${formattedTime})</span></h3><p><strong>Mood:</strong> ${moodEmoji} ${sanitize(moodText)}</p><p><strong>Aktivitas:</strong> ${sanitize(reflection.activities)}</p>${reflection.distractions ? `<p><strong>Gangguan:</strong> ${sanitize(reflection.distractions)}</p>` : ''}<p><strong>Kebanggaan:</strong> ${sanitize(reflection.pride)}</p><p class="history-feedback"><strong>Feedback AI:</strong> ${sanitize(reflection.feedback)}</p>`; if (prepend) { historyList.insertBefore(item, historyList.firstChild); void item.offsetWidth; item.style.animation = 'none'; setTimeout(() => { item.style.animation = ''; item.style.animationDelay = '0ms'; }, 10); } else { historyList.appendChild(item); }
}

// --- Event Listener Form Submit ---
form.addEventListener('submit', function(event) {
    event.preventDefault(); playClickSound();
    const formData = new FormData(form);
    const data = {
        activities: formData.get('activities')?.trim() ?? '', mood: formData.get('mood'),
        distractions: formData.get('distractions')?.trim() ?? '', pride: formData.get('pride')?.trim() ?? ''
    };
    if (!data.mood || !data.activities || !data.pride) { alert('Mohon isi bagian Aktivitas, Mood, dan Kebanggaan ya.'); return; }
    if (!audioCtx) getAudioContext();

    loadingIndicator.style.display = 'block'; submitButton.disabled = true; submitButton.innerHTML = 'Menganalisis... 🤔';
    feedbackContainer.innerHTML = '';
    setTimeout(() => {
         // Memanggil fungsi generateFeedback yang sudah lengkap
         const generatedFeedback = generateFeedback(data);
         displayFeedback(generatedFeedback, data);
         saveReflection(data, generatedFeedback);
         loadingIndicator.style.display = 'none'; submitButton.disabled = false; submitButton.innerHTML = 'Lihat Feedback ✨';
    }, 700);
});

// --- Event Listener Lain ---
themeToggleButton.addEventListener('click', toggleTheme);
moodSelect.addEventListener('change', () => { updateMoodIllustration(moodSelect.value); if (!audioCtx) getAudioContext(); });

// --- Inisialisasi Aplikasi ---
document.addEventListener('DOMContentLoaded', initializeApp);

// --- PWA Service Worker Registration ---
if ('serviceWorker' in navigator) { /* ... (Kode SW registration tidak berubah) ... */
  window.addEventListener('load', () => { navigator.serviceWorker.register('./service-worker.js').then(reg => console.log('✅ SW registration successful:', reg.scope)).catch(err => console.log('❌ SW registration failed:', err)); });
}
