// main.js (Lengkap dengan Fetch JSON Feedback & Logika AI Asli)

// --- Strict Mode ---
'use strict';

// --- Seleksi Elemen DOM ---
// (Tidak berubah dari sebelumnya)
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

// --- Variabel Global untuk Data Feedback ---
let feedbackBank = null; // Akan diisi dari JSON

// --- Web Audio API Setup ---
// (Tidak berubah dari sebelumnya)
let audioCtx; function getAudioContext() { if (!audioCtx) { try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { console.warn("Web Audio API is not supported."); } } return audioCtx; } function playSound(type = 'sine', frequency = 440, duration = 0.05, volume = 0.05) { const ctx = getAudioContext(); if (!ctx) return; try { const o = ctx.createOscillator(); const g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(frequency, ctx.currentTime); g.gain.setValueAtTime(volume, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration * 0.9); o.connect(g); g.connect(ctx.destination); o.start(ctx.currentTime); o.stop(ctx.currentTime + duration); } catch (e) { console.error("Error playing sound:", e); } } const playClickSound = () => playSound('triangle', 300, 0.05, 0.08); const playSuccessSound = () => playSound('sine', 600, 0.15, 0.06);

// --- Variasi Konten Dinamis (Placeholder/Labels) ---
// (Tidak berubah dari sebelumnya)
const activityPlaceholders = ["Ceritakan singkat kegiatan utamamu...", "Apa saja momen penting hari ini?", "Tuliskan beberapa hal yang mengisi harimu...", "Bagaimana kamu menghabiskan waktumu hari ini?", "Aktivitas apa yang paling menyita energimu?"]; const activityLabels = ["Apa saja yang kamu lakukan hari ini?", "Bagaimana harimu berjalan? Ceritakan aktivitasmu:", "Ringkasan kegiatan hari ini:", "Yuk, ceritakan apa saja yang terjadi hari ini:", "Aktivitas penting hari ini:"]; const distractionPlaceholders = ["Apakah ada tantangan atau hambatan?", "Hal apa yang membuatmu sedikit 'off'?", "Tuliskan jika ada gangguan yang muncul...", "Adakah sesuatu yang tidak berjalan sesuai rencana?", "Jika ada, apa yang mengusik pikiranmu?"]; const distractionLabels = ["Adakah hal yang mengganggu fokus atau harimu?", "Apa saja tantangan yang kamu hadapi hari ini?", "Apakah ada distraksi yang muncul?", "Hal yang kurang menyenangkan hari ini (jika ada):", "Gangguan atau hambatan hari ini?"]; const pridePlaceholders = ["Pencapaian kecil pun berarti!", "Apa momen yang membuatmu tersenyum bangga?", "Satu hal baik yang kamu lakukan/rasakan...", "Bisa berupa hal sederhana, lho!", "Apa highlight positif hari ini?"]; const prideLabels = ["Apa satu hal kecil (atau besar!) yang membuatmu bangga hari ini?", "Pencapaian terbaikmu hari ini:", "Momen positif yang patut diapresiasi:", "Satu hal yang kamu syukuri atau banggakan:", "Highlight kebanggaan hari ini:"];

// --- Ilustrasi SVG URLs (Menggunakan Path Lokal) ---
// (Tidak berubah dari sebelumnya)
const illustrationUrls = { baik: './illustrations/ilustrasi-baik.svg', netral: './illustrations/ilustrasi-netral.svg', buruk: './illustrations/ilustrasi-buruk.svg', default: './illustrations/ilustrasi-default.svg' };

// --- Fungsi Utilitas ---
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const sanitize = (str) => { const temp = document.createElement('div'); temp.textContent = str; return temp.innerHTML; };

// --- Fungsi Baru: Memuat Data Feedback dari JSON ---
async function loadFeedbackData() {
    try {
        const response = await fetch('./feedback_data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        feedbackBank = await response.json();
        console.log("Feedback data loaded successfully.");
        submitButton.disabled = false; // Aktifkan tombol submit setelah data siap
        submitButton.textContent = 'Lihat Feedback ✨'; // Set teks tombol awal
    } catch (error) {
        console.error("Could not load feedback data:", error);
        // Beri tahu pengguna atau handle error (misal: tombol tetap disable)
        submitButton.textContent = 'Gagal memuat data';
        // Mungkin tampilkan pesan error di UI
    }
}

// --- Fungsi Inisialisasi ---
function initializeApp() {
    // Nonaktifkan tombol submit di awal sampai data JSON dimuat
    submitButton.disabled = true;
    submitButton.textContent = 'Memuat data...';

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
    if (yearSpan) { yearSpan.textContent = new Date().getFullYear(); }
    updateMoodIllustration('default');

    // Panggil fungsi untuk memuat data JSON
    loadFeedbackData();
}

// --- Logika Tema ---
// (Tidak berubah dari sebelumnya)
function setupTheme() { const savedTheme = localStorage.getItem('theme'); const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches; setTheme(savedTheme || (prefersDark ? 'dark' : 'light')); } function setTheme(theme) { body.classList.remove('dark-mode', 'light-mode'); body.classList.add(theme + '-mode'); localStorage.setItem('theme', theme); updateToggleButtonAriaLabel(); } function toggleTheme() { const isDarkMode = body.classList.contains('dark-mode'); setTheme(isDarkMode ? 'light' : 'dark'); if (!audioCtx) getAudioContext(); } function updateToggleButtonAriaLabel() { const isDarkMode = body.classList.contains('dark-mode'); themeToggleButton.setAttribute('aria-label', `Ganti ke Mode ${isDarkMode ? 'Terang' : 'Gelap'}`); }

// --- Logika Form Dinamis ---
// (Tidak berubah dari sebelumnya)
let stepTimeouts = []; function showNextStep(index) { stepTimeouts.forEach(clearTimeout); stepTimeouts = []; for (let i = index; i < formSteps.length; i++) { const timeoutId = setTimeout(() => formSteps[i]?.classList.add('visible'), (i - index) * 120); stepTimeouts.push(timeoutId); } }

// --- AI Feedback Generator (Menggunakan feedbackBank dari JSON) ---
function generateFeedback(data) {
    // Pastikan data feedback sudah dimuat
    if (!feedbackBank) {
        console.error("Feedback data not loaded yet!");
        return "Maaf, data feedback belum siap. Coba lagi nanti.";
    }

    const { mood, activities, distractions, pride } = data;

    // Fungsi helper untuk mengganti placeholder
    const fillPlaceholder = (template, placeholder, value) => {
        // Potong value jika terlalu panjang untuk dimasukkan ke kalimat
        const maxLength = 35;
        const truncatedValue = value.length > maxLength ? value.substring(0, maxLength) + '...' : value;
        return template.replace(`{${placeholder}}`, sanitize(truncatedValue)); // Sanitasi input sebelum dimasukkan
    };

    let feedbackText = "";

    // Opening
    if (feedbackBank.openings?.[mood]) {
        feedbackText += getRandomElement(feedbackBank.openings[mood]) + " ";
    }

    // Activity Comment
    if (feedbackBank.activityComments?.length) {
         // Logika tambahan bisa ditambahkan di sini jika ingin komentar berbeda
         // berdasarkan panjang 'activities'
         feedbackText += getRandomElement(feedbackBank.activityComments) + " ";
    }

    // Distraction Comment
    if (distractions && distractions.trim() !== "" && feedbackBank.distractionComments?.withDistraction?.length) {
         let comment = getRandomElement(feedbackBank.distractionComments.withDistraction);
         feedbackText += fillPlaceholder(comment, 'distractions', distractions) + " ";
    } else if (feedbackBank.distractionComments?.noDistraction?.length) {
         feedbackText += getRandomElement(feedbackBank.distractionComments.noDistraction) + " ";
    }

    // Pride Comment
    if (pride && pride.trim() !== "" && feedbackBank.prideComments?.length) {
        let comment = getRandomElement(feedbackBank.prideComments);
        feedbackText += fillPlaceholder(comment, 'pride', pride) + " ";
    }

    // Closing
    if (feedbackBank.closings?.[mood]) {
        feedbackText += getRandomElement(feedbackBank.closings[mood]);
    }

    // Encouragement (random)
    if (feedbackBank.encouragement?.length && Math.random() > 0.5) {
        feedbackText += " " + getRandomElement(feedbackBank.encouragement);
    }

    return feedbackText.replace(/\s+/g, ' ').trim();
}
// --- AKHIR DARI FUNGSI generateFeedback YANG BARU ---

// --- Tampilkan Feedback ---
// (Tidak berubah dari sebelumnya)
function displayFeedback(feedback, reflectionData) { /* ... */ }

// --- Fungsi Share Refleksi ---
// (Tidak berubah dari sebelumnya)
function shareReflection(data, feedback) { /* ... */ }

// --- Fungsi Tampilkan Notifikasi ---
// (Tidak berubah dari sebelumnya)
let notificationTimeout; function showNotification(message, isError = false) { /* ... */ }

// --- Update Ilustrasi SVG ---
// (Tidak berubah dari sebelumnya)
function updateMoodIllustration(mood) { /* ... */ }

// --- Penyimpanan Lokal & Riwayat ---
// (Tidak berubah dari sebelumnya)
function saveReflection(data, feedback) { /* ... */ } function loadReflectionHistory() { /* ... */ } function updateHistoryList(reflection, prepend = false, delay = 0) { /* ... */ }

// --- Event Listener Form Submit ---
// (Sedikit diubah untuk cek feedbackBank)
form.addEventListener('submit', function(event) {
    event.preventDefault();
    if (!feedbackBank) { // Cek jika data belum siap
        alert("Data feedback sedang dimuat, mohon tunggu sebentar.");
        return;
    }
    playClickSound();
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
         const generatedFeedback = generateFeedback(data); // Panggil fungsi yg sudah diupdate
         displayFeedback(generatedFeedback, data);
         saveReflection(data, generatedFeedback);
         loadingIndicator.style.display = 'none'; submitButton.disabled = false; submitButton.innerHTML = 'Lihat Feedback ✨';
    }, 700);
});

// --- Event Listener Lain ---
// (Tidak berubah dari sebelumnya)
themeToggleButton.addEventListener('click', toggleTheme); moodSelect.addEventListener('change', () => { updateMoodIllustration(moodSelect.value); if (!audioCtx) getAudioContext(); });

// --- Inisialisasi Aplikasi ---
document.addEventListener('DOMContentLoaded', initializeApp);

// --- PWA Service Worker Registration ---
// (Tidak berubah dari sebelumnya)
if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('./service-worker.js').then(reg => console.log('✅ SW registration successful:', reg.scope)).catch(err => console.log('❌ SW registration failed:', err)); }); }
