// main.js (Lengkap dengan Path Lokal untuk Ilustrasi)

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
function getAudioContext() {
    if (!audioCtx) {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) { console.warn("Web Audio API is not supported."); }
    }
    return audioCtx;
}
function playSound(type = 'sine', frequency = 440, duration = 0.05, volume = 0.05) {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.type = type; o.frequency.setValueAtTime(frequency, ctx.currentTime);
        g.gain.setValueAtTime(volume, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration * 0.9);
        o.connect(g); g.connect(ctx.destination);
        o.start(ctx.currentTime); o.stop(ctx.currentTime + duration);
    } catch (e) { console.error("Error playing sound:", e); }
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
function initializeApp() {
    activitiesInput.placeholder = getRandomElement(activityPlaceholders);
    document.getElementById('label-activities').textContent = getRandomElement(activityLabels);
    document.getElementById('distractions').placeholder = getRandomElement(distractionPlaceholders);
    document.getElementById('label-distractions').textContent = getRandomElement(distractionLabels);
    document.getElementById('pride').placeholder = getRandomElement(pridePlaceholders);
    document.getElementById('label-pride').textContent = getRandomElement(prideLabels);
    setupTheme();
    showNextStep(0);
    loadReflectionHistory();
    activitiesInput.focus();
    if (yearSpan) { yearSpan.textContent = new Date().getFullYear(); } // Update tahun
    updateMoodIllustration('default'); // Set ilustrasi awal
}

// --- Logika Tema ---
function setupTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    setTheme(savedTheme || (prefersDark ? 'dark' : 'light'));
}
function setTheme(theme) {
    body.classList.remove('dark-mode', 'light-mode');
    body.classList.add(theme + '-mode');
    localStorage.setItem('theme', theme);
    updateToggleButtonAriaLabel();
}
function toggleTheme() {
    const isDarkMode = body.classList.contains('dark-mode');
    setTheme(isDarkMode ? 'light' : 'dark');
    if (!audioCtx) getAudioContext(); // Init audio on interaction
}
function updateToggleButtonAriaLabel() {
    const isDarkMode = body.classList.contains('dark-mode');
    themeToggleButton.setAttribute('aria-label', `Ganti ke Mode ${isDarkMode ? 'Terang' : 'Gelap'}`);
}

// --- Logika Form Dinamis ---
let stepTimeouts = [];
function showNextStep(index) {
    stepTimeouts.forEach(clearTimeout); stepTimeouts = [];
    for (let i = index; i < formSteps.length; i++) {
       const timeoutId = setTimeout(() => formSteps[i]?.classList.add('visible'), (i - index) * 120);
       stepTimeouts.push(timeoutId);
    }
}

// --- AI Feedback Generator ---
function generateFeedback(data) { /* ... (Kode feedback generator tidak berubah, bisa disalin dari versi sebelumnya) ... */
    const { mood, activities, distractions, pride } = data;
    const openings = { /* ... */ }; const activityComments = [/* ... */]; const distractionComments = [/* ... */]; const prideComments = [/* ... */]; const closings = { /* ... */ }; const encouragement = [/* ... */];
    // (Salin lengkap bagian ini dari kode main.js sebelumnya)
    // Contoh singkat:
    return `Feedback untuk mood ${mood}: Aktivitas ${activities}, Bangga ${pride}.`; // Ganti dengan logika lengkap Anda
}

// --- Tampilkan Feedback ---
function displayFeedback(feedback, reflectionData) {
    feedbackContainer.innerHTML = '';
    const moodDiv = document.createElement('div'); moodDiv.classList.add('mood-visualizer');
    const moodEmojis = { baik: '😊', netral: '🙂', buruk: '🤔' };
    moodDiv.textContent = moodEmojis[reflectionData.mood] || '🤔';
    feedbackContainer.appendChild(moodDiv);

    const card = document.createElement('div'); card.classList.add('feedback-card');
    const sentences = feedback.match( /[^\.!\?]+[\.!\?]+/g ) || [feedback];
    sentences.forEach(sentence => { if (sentence.trim()) { const p = document.createElement('p'); p.textContent = sentence.trim(); card.appendChild(p); } });
    feedbackContainer.appendChild(card);

    const shareButton = document.createElement('button'); shareButton.id = 'share-button'; shareButton.classList.add('share-button');
    shareButton.textContent = 'Bagikan Refleksi 📋';
    shareButton.addEventListener('click', () => shareReflection(reflectionData, feedback));
    feedbackContainer.appendChild(shareButton);

    playSuccessSound();
    updateMoodIllustration(reflectionData.mood);
    setTimeout(() => feedbackContainer.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
}

// --- Fungsi Share Refleksi ---
function shareReflection(data, feedback) {
    const { mood, activities, distractions, pride } = data;
    const moodText = mood.charAt(0).toUpperCase() + mood.slice(1);
    const shareText = `Refleksi Harian Saya:\n--------------------\nMood: ${moodText}\nAktivitas: ${activities || '-'}\nGangguan: ${distractions || '-'}\nKebanggaan: ${pride || '-'}\nFeedback AI: ${feedback || '-'}\n--------------------\nDicatat via Aplikasi Refleksi Diri (${new Date().toLocaleDateString('id-ID')})`;
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(shareText).then(() => { showNotification("Refleksi disalin ke clipboard! 👍"); playClickSound(); }).catch(err => { console.warn("Gagal menyalin:", err); showNotification("Gagal menyalin.", true); });
    } else { console.warn("Clipboard API tidak tersedia."); showNotification("Fitur salin butuh HTTPS.", true); }
}

// --- Fungsi Tampilkan Notifikasi ---
let notificationTimeout;
function showNotification(message, isError = false) {
    clearTimeout(notificationTimeout);
    notificationElement.textContent = message;
    notificationElement.style.backgroundColor = isError ? '#dc3545' : '';
    notificationElement.classList.add('show');
    notificationTimeout = setTimeout(() => notificationElement.classList.remove('show'), 3000);
}

// --- Update Ilustrasi SVG ---
function updateMoodIllustration(mood) {
    const url = illustrationUrls[mood] || illustrationUrls.default;
    // Cek jika path berbeda ATAU jika src belum diset (penting untuk load awal)
    if (moodIllustration.getAttribute('src') !== url) {
        moodIllustration.style.opacity = '0';
        setTimeout(() => {
            moodIllustration.src = url; // Set src ke path lokal
            moodIllustration.alt = `Ilustrasi mood ${mood}`;
            moodIllustration.style.opacity = '0.9';
        }, 200); // Delay untuk efek fade
    } else if (moodIllustration.style.opacity === '0') {
         // Jika path sama tapi sedang tersembunyi (jarang terjadi di skenario ini)
         moodIllustration.style.opacity = '0.9';
    }
}

// --- Penyimpanan Lokal & Riwayat ---
function saveReflection(data, feedback) {
    const reflections = JSON.parse(localStorage.getItem('reflections') || '[]');
    const newReflection = { date: new Date().toISOString(), ...data, feedback };
    reflections.unshift(newReflection);
    const MAX_HISTORY = 21;
    if (reflections.length > MAX_HISTORY) reflections.pop();
    localStorage.setItem('reflections', JSON.stringify(reflections));
    updateHistoryList(newReflection, true);
}
function loadReflectionHistory() {
    historyList.innerHTML = '';
    const reflections = JSON.parse(localStorage.getItem('reflections') || '[]');
    historyContainer.style.display = 'block'; // Selalu tampilkan container
    if (reflections.length > 0) {
        reflections.forEach((reflection, index) => updateHistoryList(reflection, false, index * 80));
    } else {
        historyList.innerHTML = '<p class="no-history">Belum ada riwayat refleksi tersimpan. Yuk, mulai!</p>';
    }
}
function updateHistoryList(reflection, prepend = false, delay = 0) {
    const noHistoryMsg = historyList.querySelector('.no-history');
    if (noHistoryMsg) historyList.innerHTML = '';

    const item = document.createElement('div'); item.classList.add('history-item');
    item.style.animationDelay = `${delay}ms`;

    const reflectionDate = new Date(reflection.date);
    const formattedDate = reflectionDate.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
    const formattedTime = reflectionDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const moodEmojis = { baik: '😊', netral: '🙂', buruk: '🤔' };
    const moodEmoji = moodEmojis[reflection.mood] || '🤔';
    const moodText = reflection.mood.charAt(0).toUpperCase() + reflection.mood.slice(1);

    item.innerHTML = `
        <h3>${formattedDate} <span>(${formattedTime})</span></h3>
        <p><strong>Mood:</strong> ${moodEmoji} ${sanitize(moodText)}</p>
        <p><strong>Aktivitas:</strong> ${sanitize(reflection.activities)}</p>
        ${reflection.distractions ? `<p><strong>Gangguan:</strong> ${sanitize(reflection.distractions)}</p>` : ''}
        <p><strong>Kebanggaan:</strong> ${sanitize(reflection.pride)}</p>
        <p class="history-feedback"><strong>Feedback AI:</strong> ${sanitize(reflection.feedback)}</p>
    `;
    if (prepend) {
        historyList.insertBefore(item, historyList.firstChild);
        void item.offsetWidth; item.style.animation = 'none';
        setTimeout(() => { item.style.animation = ''; item.style.animationDelay = '0ms'; }, 10);
    } else { historyList.appendChild(item); }
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
    if (!audioCtx) getAudioContext(); // Init audio on interaction

    loadingIndicator.style.display = 'block'; submitButton.disabled = true; submitButton.innerHTML = 'Menganalisis... 🤔';
    feedbackContainer.innerHTML = '';
    setTimeout(() => {
         const generatedFeedback = generateFeedback(data); // Pastikan generateFeedback lengkap
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
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(reg => console.log('✅ SW registration successful:', reg.scope))
      .catch(err => console.log('❌ SW registration failed:', err));
  });
}
