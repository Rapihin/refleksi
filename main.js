// main.js (Lengkap - Final Version with Fixes and Enhancements)

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

// --- Variabel Global untuk Data Feedback ---
let feedbackBank = null; // Akan diisi dari JSON

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

// --- Variasi Konten Dinamis (Placeholder/Labels) ---
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
    buruk: './illustrations/ilustrasi-buruk.svg',   // atau nama file lain yang sesuai
    default: './illustrations/ilustrasi-default.svg'
};

// --- Fungsi Utilitas ---
const getRandomElement = (arr) => arr ? arr[Math.floor(Math.random() * arr.length)] : "";
const sanitize = (str) => {
    if (!str) return ''; // Handle jika string null atau undefined
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
};


// --- Fungsi Baru: Memuat Data Feedback dari JSON ---
async function loadFeedbackData() {
    try {
        const response = await fetch('./feedback_data.json');
        if (!response.ok) {
            // Jika file tidak ditemukan (404) atau error lain
            throw new Error(`HTTP error! status: ${response.status} for feedback_data.json`);
        }
        feedbackBank = await response.json();
        console.log("Feedback data loaded successfully.");
        submitButton.disabled = false; // Aktifkan tombol submit
        submitButton.textContent = 'Lihat Feedback ✨';
    } catch (error) {
        console.error("Could not load feedback data:", error);
        submitButton.textContent = 'Gagal Muat Data!'; // Beri indikasi error
        // Anda bisa menambahkan pesan error yang lebih jelas di UI jika mau
        // Misalnya: feedbackContainer.innerHTML = '<p class="error">Gagal memuat data feedback. Coba refresh halaman.</p>';
    }
}

// --- Fungsi Inisialisasi ---
function initializeApp() {
    submitButton.disabled = true; // Nonaktifkan tombol saat awal
    submitButton.textContent = 'Memuat data...'; // Teks awal tombol

    // Setel placeholder acak
    activitiesInput.placeholder = getRandomElement(activityPlaceholders);
    document.getElementById('label-activities').textContent = getRandomElement(activityLabels);
    document.getElementById('distractions').placeholder = getRandomElement(distractionPlaceholders);
    document.getElementById('label-distractions').textContent = getRandomElement(distractionLabels);
    document.getElementById('pride').placeholder = getRandomElement(pridePlaceholders);
    document.getElementById('label-pride').textContent = getRandomElement(prideLabels);

    setupTheme(); // Atur tema
    showNextStep(0); // Tampilkan form step awal
    loadReflectionHistory(); // Muat riwayat (sekarang dengan fungsi yg diperbaiki)
    activitiesInput.focus(); // Fokus ke input pertama

    // Set tahun copyright
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Set ilustrasi default awal (pastikan path benar!)
    updateMoodIllustration('default');

    // Muat data feedback dari JSON
    loadFeedbackData();
}

// --- Logika Tema ---
function setupTheme() { const savedTheme = localStorage.getItem('theme'); const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches; setTheme(savedTheme || (prefersDark ? 'dark' : 'light')); updateToggleButtonAriaLabel(); }
function setTheme(theme) { body.classList.remove('dark-mode', 'light-mode'); body.classList.add(theme + '-mode'); localStorage.setItem('theme', theme); updateToggleButtonAriaLabel(); }
function toggleTheme() { const isDarkMode = body.classList.contains('dark-mode'); setTheme(isDarkMode ? 'light' : 'dark'); if (!audioCtx) getAudioContext(); }
function updateToggleButtonAriaLabel() { const isDarkMode = body.classList.contains('dark-mode'); themeToggleButton.setAttribute('aria-label', `Ganti ke Mode ${isDarkMode ? 'Terang' : 'Gelap'}`); }

// --- Logika Form Dinamis ---
let stepTimeouts = []; function showNextStep(index) { stepTimeouts.forEach(clearTimeout); stepTimeouts = []; for (let i = index; i < formSteps.length; i++) { const timeoutId = setTimeout(() => formSteps[i]?.classList.add('visible'), (i - index) * 120); stepTimeouts.push(timeoutId); } }

// --- AI Feedback Generator (Menggunakan feedbackBank & Logika yang Disempurnakan) ---
function generateFeedback(data) {
    if (!feedbackBank) {
        console.error("Feedback data not loaded yet!");
        return "Maaf, data feedback belum siap. Coba lagi nanti.";
    }

    const { mood, activities, distractions, pride } = data;

    const fillPlaceholder = (template, placeholder, value) => {
        const maxLength = 30;
        const truncatedValue = value.length > maxLength ? value.substring(0, maxLength) + '...' : value;
        return template.replace(new RegExp(`{${placeholder}}`, 'g'), sanitize(truncatedValue));
    };

    let feedbackParts = [];

    // 1. Opening
    if (feedbackBank.openings?.[mood]) {
        feedbackParts.push(getRandomElement(feedbackBank.openings[mood]));
    }

    // 2. Activity Comment (80% Chance)
    if (Math.random() < 0.8 && feedbackBank.activityComments?.length) {
        feedbackParts.push(getRandomElement(feedbackBank.activityComments));
    }

    // 3. Distraction Comment (Conditional & 60% Chance if exists)
    if (distractions && distractions.trim() !== "") {
        if (Math.random() < 0.6 && feedbackBank.distractionComments?.withDistraction?.length) {
            let comment = getRandomElement(feedbackBank.distractionComments.withDistraction);
            feedbackParts.push(fillPlaceholder(comment, 'distractions', distractions));
        }
    } else {
        // Hanya tambahkan komentar 'noDistraction' kadang-kadang (50% chance)
        if (Math.random() < 0.5 && feedbackBank.distractionComments?.noDistraction?.length) {
             feedbackParts.push(getRandomElement(feedbackBank.distractionComments.noDistraction));
        }
    }

    // 4. Pride Comment (Selalu ada)
    if (pride && pride.trim() !== "" && feedbackBank.prideComments?.length) {
        let comment = getRandomElement(feedbackBank.prideComments);
        feedbackParts.push(fillPlaceholder(comment, 'pride', pride));
    }

    // 5. Closing
    if (feedbackBank.closings?.[mood]) {
        feedbackParts.push(getRandomElement(feedbackBank.closings[mood]));
    }

    // 6. Encouragement (60% Chance)
    if (feedbackBank.encouragement?.length && Math.random() < 0.6) {
        feedbackParts.push(getRandomElement(feedbackBank.encouragement));
    }

    // 7. Humor atau Tips Ringan (25% Chance)
    if (Math.random() < 0.25) {
        const categoryChoice = Math.random() < 0.5 ? 'humor' : 'tipsRingan';
        if (feedbackBank[categoryChoice]?.length) {
            feedbackParts.push(getRandomElement(feedbackBank[categoryChoice]));
        }
    }

    return feedbackParts.filter(part => part && part.trim() !== "").join(" ");
}

// --- Tampilkan Feedback ---
function displayFeedback(feedback, reflectionData) {
    feedbackContainer.innerHTML = '';
    const moodDiv = document.createElement('div'); moodDiv.classList.add('mood-visualizer');
    const moodEmojis = { baik: '😊', netral: '🙂', buruk: '🤔' };
    moodDiv.textContent = moodEmojis[reflectionData.mood] || '🤔';
    feedbackContainer.appendChild(moodDiv);

    const card = document.createElement('div'); card.classList.add('feedback-card');
    // Cek jika feedback adalah string error dari generateFeedback
    if (feedback.startsWith("Maaf, data feedback belum siap")) {
         const p = document.createElement('p');
         p.textContent = feedback;
         p.style.color = 'red'; // Beri indikasi error
         card.appendChild(p);
    } else {
        const sentences = feedback.match( /[^\.!\?]+[\.!\?]+/g ) || [feedback];
        sentences.forEach(sentence => { if (sentence.trim()) { const p = document.createElement('p'); p.textContent = sentence.trim(); card.appendChild(p); } });
    }
    feedbackContainer.appendChild(card);

    // Hanya tambahkan tombol share jika feedback berhasil dibuat
    if (!feedback.startsWith("Maaf, data feedback belum siap")) {
        const shareButton = document.createElement('button'); shareButton.id = 'share-button'; shareButton.classList.add('share-button');
        shareButton.textContent = 'Bagikan Refleksi 📋';
        shareButton.addEventListener('click', () => shareReflection(reflectionData, feedback));
        feedbackContainer.appendChild(shareButton);
        playSuccessSound(); // Mainkan suara sukses hanya jika feedback valid
    }

    updateMoodIllustration(reflectionData.mood);
    setTimeout(() => feedbackContainer.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
}

// --- Fungsi Share Refleksi ---
function shareReflection(data, feedback) {
    const { mood, activities, distractions, pride } = data;
    const moodText = mood.charAt(0).toUpperCase() + mood.slice(1);
    const shareText = `Refleksi Harian Saya:\n--------------------\nMood: ${moodText}\nAktivitas: ${activities || '-'}\nGangguan: ${distractions || '-'}\nKebanggaan: ${pride || '-'}\nFeedback AI: ${feedback || '-'}\n--------------------\nDicatat via "Refleksi Diri Harian" (${new Date().toLocaleDateString('id-ID')})`;
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(shareText).then(() => { showNotification("Refleksi disalin ke clipboard! 👍"); playClickSound(); }).catch(err => { console.warn("Gagal menyalin:", err); showNotification("Gagal menyalin.", true); });
    } else { console.warn("Clipboard API tidak tersedia."); showNotification("Fitur salin butuh HTTPS.", true); }
}

// --- Fungsi Tampilkan Notifikasi ---
let notificationTimeout; function showNotification(message, isError = false) { clearTimeout(notificationTimeout); notificationElement.textContent = message; notificationElement.style.backgroundColor = isError ? '#dc3545' : ''; notificationElement.classList.add('show'); notificationTimeout = setTimeout(() => notificationElement.classList.remove('show'), 3000); }

// --- Update Ilustrasi SVG ---
function updateMoodIllustration(mood) {
    const url = illustrationUrls[mood] || illustrationUrls.default;
    // Periksa elemen moodIllustration sebelum menggunakannya
    if (!moodIllustration) {
        console.error("Elemen #mood-illustration tidak ditemukan!");
        return;
    }
    const currentSrc = moodIllustration.getAttribute('src');
    // Hanya update jika URL berbeda ATAU jika src awal kosong (saat init)
    if (currentSrc !== url) {
        moodIllustration.style.opacity = '0';
        setTimeout(() => {
            moodIllustration.src = url;
            moodIllustration.alt = `Ilustrasi mood ${mood}`;
            moodIllustration.style.opacity = '0.9'; // Fade in

            // Tambahkan error handler untuk image
            moodIllustration.onerror = () => {
                console.error(`Gagal memuat ilustrasi: ${url}`);
                moodIllustration.alt = `Gagal memuat ilustrasi mood ${mood}`;
                // Anda bisa set src ke placeholder rusak standar atau biarkan saja
                // moodIllustration.src = ''; // Atau gambar placeholder lain
            };
        }, 200);
    } else if (moodIllustration.style.opacity === '0' && currentSrc) {
         // Jika src sama tapi sedang tersembunyi (misal: error load sebelumnya)
         moodIllustration.style.opacity = '0.9';
    }
}


// --- Penyimpanan Lokal & Riwayat ---
function saveReflection(data, feedback) { const reflections = JSON.parse(localStorage.getItem('reflections') || '[]'); const newReflection = { date: new Date().toISOString(), ...data, feedback }; reflections.unshift(newReflection); const MAX_HISTORY = 21; if (reflections.length > MAX_HISTORY) reflections.pop(); localStorage.setItem('reflections', JSON.stringify(reflections)); updateHistoryList(newReflection, true); }
function loadReflectionHistory() { historyList.innerHTML = ''; const reflections = JSON.parse(localStorage.getItem('reflections') || '[]'); historyContainer.style.display = 'block'; if (reflections.length > 0) { reflections.forEach((reflection, index) => updateHistoryList(reflection, false, index * 80)); } else { historyList.innerHTML = '<p class="no-history">Belum ada riwayat refleksi tersimpan. Yuk, mulai!</p>'; } }

// --- updateHistoryList (Dengan Perbaikan Sebelumnya) ---
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
        `; // Menggunakan reflection.feedback

    if (prepend) { historyList.insertBefore(item, historyList.firstChild); void item.offsetWidth; item.style.animation = 'none'; setTimeout(() => { item.style.animation = ''; item.style.animationDelay = '0ms'; }, 10); } else { historyList.appendChild(item); }
}


// --- Event Listener Form Submit ---
form.addEventListener('submit', function(event) {
    event.preventDefault();
    if (!feedbackBank || submitButton.disabled) { // Cek jika data belum siap ATAU tombol memang disable
        alert("Harap tunggu data selesai dimuat atau periksa koneksi.");
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
         const generatedFeedback = generateFeedback(data);
         displayFeedback(generatedFeedback, data);
         saveReflection(data, generatedFeedback);
         loadingIndicator.style.display = 'none';
         // Hanya enable tombol jika feedback data valid (tidak error)
         if (feedbackBank) {
             submitButton.disabled = false;
             submitButton.innerHTML = 'Lihat Feedback ✨';
         } else {
             submitButton.textContent = 'Error Data'; // Tetap disable jika ada error data
         }
    }, 700);
});

// --- Event Listener Lain ---
themeToggleButton.addEventListener('click', toggleTheme);
moodSelect.addEventListener('change', () => { updateMoodIllustration(moodSelect.value); if (!audioCtx) getAudioContext(); });

// --- Inisialisasi Aplikasi ---
document.addEventListener('DOMContentLoaded', initializeApp);

// --- PWA Service Worker Registration ---
if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('./service-worker.js').then(reg => console.log('✅ SW registration successful:', reg.scope)).catch(err => console.log('❌ SW registration failed:', err)); }); }
