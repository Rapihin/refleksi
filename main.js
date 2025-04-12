// main.js (Lengkap dengan URL Storyset)

// --- Strict Mode & Polyfills (Optional but good practice) ---
'use strict';

// --- Seleksi Elemen DOM ---
const form = document.getElementById('reflection-form');
const formSteps = Array.from(form.querySelectorAll('.form-step'));
const activitiesInput = document.getElementById('activities'); // Point 3: For focus
const moodSelect = document.getElementById('mood'); // Point 5: For illustration change
const submitButton = document.getElementById('submit-button');
const loadingIndicator = document.getElementById('loading');
const feedbackContainer = document.getElementById('feedback-container');
const historyList = document.getElementById('history-list');
const historyContainer = document.getElementById('history-container');
const themeToggleButton = document.getElementById('theme-toggle');
const moodIllustration = document.getElementById('mood-illustration'); // Point 5
const notificationElement = document.getElementById('copy-notification'); // Point 4
const yearSpan = document.getElementById('copyright-year');
const body = document.body;

// --- Web Audio API Setup (Point 2) ---
let audioCtx; // Initialize later on user interaction

function getAudioContext() {
    if (!audioCtx) {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn("Web Audio API is not supported in this browser.");
        }
    }
    return audioCtx;
}

function playSound(type = 'sine', frequency = 440, duration = 0.05, volume = 0.05) {
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

        gainNode.gain.setValueAtTime(volume, ctx.currentTime);
        // Quick fade out to prevent clicking
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration * 0.9);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
        console.error("Error playing sound:", e);
    }
}

const playClickSound = () => playSound('triangle', 300, 0.05, 0.08); // Lower, short click
const playSuccessSound = () => playSound('sine', 600, 0.15, 0.06); // Higher, longer success chime

// --- Variasi Konten Dinamis (Placeholder/Labels) ---
const activityPlaceholders = ["Ceritakan singkat kegiatan utamamu...", "Apa saja momen penting hari ini?", "Tuliskan beberapa hal yang mengisi harimu...", "Bagaimana kamu menghabiskan waktumu hari ini?", "Aktivitas apa yang paling menyita energimu?"];
const activityLabels = ["Apa saja yang kamu lakukan hari ini?", "Bagaimana harimu berjalan? Ceritakan aktivitasmu:", "Ringkasan kegiatan hari ini:", "Yuk, ceritakan apa saja yang terjadi hari ini:", "Aktivitas penting hari ini:"];
const distractionPlaceholders = ["Apakah ada tantangan atau hambatan?", "Hal apa yang membuatmu sedikit 'off'?", "Tuliskan jika ada gangguan yang muncul...", "Adakah sesuatu yang tidak berjalan sesuai rencana?", "Jika ada, apa yang mengusik pikiranmu?"];
const distractionLabels = ["Adakah hal yang mengganggu fokus atau harimu?", "Apa saja tantangan yang kamu hadapi hari ini?", "Apakah ada distraksi yang muncul?", "Hal yang kurang menyenangkan hari ini (jika ada):", "Gangguan atau hambatan hari ini?"];
const pridePlaceholders = ["Pencapaian kecil pun berarti!", "Apa momen yang membuatmu tersenyum bangga?", "Satu hal baik yang kamu lakukan/rasakan...", "Bisa berupa hal sederhana, lho!", "Apa highlight positif hari ini?"];
const prideLabels = ["Apa satu hal kecil (atau besar!) yang membuatmu bangga hari ini?", "Pencapaian terbaikmu hari ini:", "Momen positif yang patut diapresiasi:", "Satu hal yang kamu syukuri atau banggakan:", "Highlight kebanggaan hari ini:"];

// --- Ilustrasi SVG URLs (Diganti ke Storyset) ---
const illustrationUrls = {
    baik: 'https://stories.freepik.com/storage/11593/people-celebrating-pana-2878.svg', // People celebrating by Storyset
    netral: 'https://stories.freepik.com/storage/44187/meditating-cuate-8398.svg', // Meditating by Storyset
    buruk: 'https://stories.freepik.com/storage/11593/thought-process-pana-2949.svg', // Thought process by Storyset (Pengganti mood buruk)
    default: 'https://stories.freepik.com/storage/18368/questions-cuate-4666.svg' // Questions by Storyset (Untuk default awal)
};

// --- Fungsi Utilitas ---
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

// --- Fungsi Inisialisasi ---
function initializeApp() {
    // Setel Placeholder & Label Acak
    activitiesInput.placeholder = getRandomElement(activityPlaceholders);
    document.getElementById('label-activities').textContent = getRandomElement(activityLabels);
    document.getElementById('distractions').placeholder = getRandomElement(distractionPlaceholders);
    document.getElementById('label-distractions').textContent = getRandomElement(distractionLabels);
    document.getElementById('pride').placeholder = getRandomElement(pridePlaceholders);
    document.getElementById('label-pride').textContent = getRandomElement(prideLabels);

    // Setel tema
    setupTheme();

    // Tampilkan step form pertama
    showNextStep(0);

    // Muat riwayat refleksi
    loadReflectionHistory();

    // Auto-focus pada input pertama (Point 3)
    activitiesInput.focus();

    // Set tahun copyright
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Set ilustrasi awal
    updateMoodIllustration('default');
}

// --- Logika Tema ---
function setupTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        setTheme(prefersDark ? 'dark' : 'light');
    }
    updateToggleButtonAriaLabel();
}

function setTheme(theme) {
    body.classList.remove('dark-mode', 'light-mode');
    body.classList.add(theme + '-mode');
    localStorage.setItem('theme', theme); // Selalu simpan pilihan
    updateToggleButtonAriaLabel();
}

function toggleTheme() {
    const isDarkMode = body.classList.contains('dark-mode');
    setTheme(isDarkMode ? 'light' : 'dark');
    // Inisialisasi AudioContext saat user berinteraksi pertama kali (ganti tema)
    if (!audioCtx) getAudioContext();
}

function updateToggleButtonAriaLabel() {
    const isDarkMode = body.classList.contains('dark-mode');
    themeToggleButton.setAttribute('aria-label', `Ganti ke Mode ${isDarkMode ? 'Terang' : 'Gelap'}`);
}

// --- Logika Form Dinamis (Animasi Staggered) ---
let stepTimeouts = [];
function showNextStep(index) {
    stepTimeouts.forEach(clearTimeout);
    stepTimeouts = [];

    for (let i = index; i < formSteps.length; i++) {
       const timeoutId = setTimeout(() => {
            if (formSteps[i]) {
                formSteps[i].classList.add('visible');
            }
        }, (i - index) * 120); // Sedikit lebih cepat stagger
         stepTimeouts.push(timeoutId);
    }
}


// --- AI Feedback Generator (Manual Logic) ---
function generateFeedback(data) {
    const { mood, activities, distractions, pride } = data;

    const openings = {
        baik: ["Luar biasa! Senang mendengar harimu berjalan baik. 😊", "Wow, terdengar seperti hari yang sangat positif!", "Hebat! Pertahankan energi baik ini. ✨", "Syukurlah, sepertinya harimu menyenangkan.", "Keren! Mood yang baik adalah awal yang bagus."],
        netral: ["Oke, hari yang cukup standar ya. Itu tidak apa-apa. 🙂", "Terima kasih sudah berbagi. Hari netral juga bagian dari proses.", "Netral itu lebih baik daripada buruk, mari kita lihat detailnya.", "Dipahami. Kadang hari memang berjalan datar saja.", "Baiklah, mari kita telaah hari yang biasa ini."],
        buruk: ["Hm, maaf mendengar harimu terasa berat. Tetap semangat ya. 🤗", "Tidak apa-apa merasa seperti ini. Terima kasih sudah jujur.", "Mengirim pelukan virtual untukmu. Semoga besok lebih baik.", "Tarik napas dulu. Hari buruk bukan berarti kamu buruk.", "Sedih mendengarnya. Mari kita lihat apa yang bisa dipelajari."]
    };
    const activityComments = [`Melakukan ${activities.length > 50 ? 'banyak hal' : 'beberapa kegiatan'} menunjukkan usahamu.`, `Aktivitasmu hari ini terdengar ${activities.length > 70 ? 'padat' : 'cukup beragam'}.`, "Terima kasih sudah berbagi tentang kegiatanmu.", `Melihat aktivitasmu, sepertinya kamu cukup ${mood === 'baik' ? 'produktif' : 'sibuk'}.`, "Setiap aktivitas adalah bagian dari perjalananmu."];
    const distractionComments = [`Tentang "${distractions.substring(0, 30)}${distractions.length > 30 ? '...' : ''}", memang kadang ada saja gangguan. Itu manusiawi.`, `Menghadapi "${distractions.substring(0, 30)}${distractions.length > 30 ? '...' : ''}" pasti tidak mudah. Kamu sudah berusaha.`, `Gangguan bisa jadi pengingat untuk lebih fleksibel atau sabar. Ambil hikmahnya ya.`, `Wajar jika ada hal yang mengganggu. Yang penting bagaimana kamu meresponnya.`, `Tidak apa-apa jika ada gangguan. Besok coba lagi dengan strategi baru.`];
    const prideComments = [`Dan yang terpenting, kamu bangga dengan "${pride.substring(0, 40)}${pride.length > 40 ? '...' : ''}"! Itu pencapaian hebat! 🌟`, `Fokus pada "${pride.substring(0, 40)}${pride.length > 40 ? '...' : ''}" ya! Itu bukti kekuatan dan progresmu.`, `Ingatlah rasa bangga saat mencapai "${pride.substring(0, 40)}${pride.length > 40 ? '...' : ''}". Simpan energi positif ini!`, `"${pride.substring(0, 40)}${pride.length > 40 ? '...' : ''}" adalah highlight yang bagus! Jangan lupakan momen ini.`, `Selamat atas "${pride.substring(0, 40)}${pride.length > 40 ? '...' : ''}"! Sekecil apapun, itu layak dirayakan. 🎉`];
    const closings = {
        baik: ["Semoga energi positif ini bisa kamu bawa ke hari esok!", "Terus lakukan hal-hal yang membuatmu merasa baik. Kamu hebat!", "Hari yang baik adalah berkah. Nikmati dan syukuri.", "Pertahankan momentum positif ini!", "Semoga besok harimu secerah hari ini!"],
        netral: ["Ingat, hari netral adalah kesempatan untuk istirahat dan mengisi ulang energi.", "Semoga besok ada sedikit percikan semangat baru untukmu.", "Tidak setiap hari harus luar biasa. Cukup adalah baik.", "Fokus pada hal kecil yang bisa membuat besok sedikit lebih baik.", "Terima kasih sudah refleksi. Istirahat yang cukup malam ini. 🌙"],
        buruk: ["Ingat, badai pasti berlalu. Kamu lebih kuat dari yang kamu kira.", "Fokus pada istirahat malam ini. Besok adalah lembaran baru.", "Jangan terlalu keras pada diri sendiri. Kamu sudah melakukan yang terbaik.", "Semoga besok pagi membawa harapan dan ketenangan baru.", "Satu langkah kecil untuk hari esok yang lebih baik sudah cukup."]
    };
    const encouragement = ["Ingatlah untuk selalu baik pada dirimu sendiri.", "Proses refleksi ini adalah langkah positif lho.", "Kamu melakukan pekerjaan yang baik dengan merenungkan harimu.", "Setiap hari adalah kesempatan belajar.", "Kamu keren sudah meluangkan waktu untuk ini."];

    let feedbackText = "";
    feedbackText += getRandomElement(openings[mood]) + " ";
    feedbackText += getRandomElement(activityComments) + " ";

    if (distractions && distractions.trim() !== "") {
         feedbackText += getRandomElement(distractionComments) + " ";
    } else {
         const noDistractionComments = ["Senang mengetahui tidak ada gangguan berarti hari ini.", "Syukurlah harimu berjalan relatif lancar.", "Fokus yang baik tanpa banyak distraksi itu bagus!"];
         feedbackText += getRandomElement(noDistractionComments) + " ";
    }

    feedbackText += getRandomElement(prideComments) + " ";
    feedbackText += getRandomElement(closings[mood]);

    if (Math.random() > 0.5) { // Increase chance of encouragement
        feedbackText += " " + getRandomElement(encouragement);
    }

    return feedbackText.replace(/\s+/g, ' ').trim(); // Clean up extra spaces
}

// --- Tampilkan Feedback (Termasuk Tombol Share - Point 4) ---
function displayFeedback(feedback, reflectionData) {
    feedbackContainer.innerHTML = ''; // Bersihkan kontainer

    // 1. Buat Mood Visualizer
    const moodDiv = document.createElement('div');
    moodDiv.classList.add('mood-visualizer');
    const moodEmojis = { baik: '😊', netral: '🙂', buruk: '🤔' }; // Ganti emoji buruk jadi netral/thinking
    moodDiv.textContent = moodEmojis[reflectionData.mood] || '🤔';
    feedbackContainer.appendChild(moodDiv);

    // 2. Buat Card Feedback
    const card = document.createElement('div');
    card.classList.add('feedback-card');
    const sentences = feedback.match( /[^\.!\?]+[\.!\?]+/g ) || [feedback]; // Split into sentences
    sentences.forEach(sentence => {
        if (sentence.trim()) {
            const p = document.createElement('p');
            p.textContent = sentence.trim();
            card.appendChild(p);
        }
    });
    feedbackContainer.appendChild(card);

    // 3. Buat Tombol Bagikan (Point 4)
    const shareButton = document.createElement('button');
    shareButton.id = 'share-button';
    shareButton.classList.add('share-button'); // Use class for styling
    shareButton.textContent = 'Bagikan Refleksi 📋';
    shareButton.addEventListener('click', () => shareReflection(reflectionData, feedback));
    feedbackContainer.appendChild(shareButton);

    // Putar suara sukses (Point 2)
    playSuccessSound();

    // Update ilustrasi (Point 5)
    updateMoodIllustration(reflectionData.mood);

    // Scroll ke feedback
    setTimeout(() => {
        feedbackContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
}

// --- Fungsi Share Refleksi (Point 4) ---
function shareReflection(data, feedback) {
    const { mood, activities, distractions, pride } = data;
    const moodText = mood.charAt(0).toUpperCase() + mood.slice(1); // Capitalize mood

    const shareText = `Refleksi Harian Saya:
--------------------
Mood: ${moodText}
Aktivitas: ${activities || '-'}
Gangguan: ${distractions || '-'}
Kebanggaan: ${pride || '-'}
Feedback AI: ${feedback || '-'}
--------------------
Dicatat via Aplikasi Refleksi Diri (${new Date().toLocaleDateString('id-ID')})`; // Tambah tanggal

    // Coba copy ke clipboard
    if (navigator.clipboard && window.isSecureContext) { // Clipboard API needs secure context (HTTPS or localhost)
        navigator.clipboard.writeText(shareText).then(() => {
            showNotification("Refleksi disalin ke clipboard! 👍");
            playClickSound(); // Feedback suara copy
        }).catch(err => {
            console.warn("Gagal menyalin ke clipboard:", err);
            showNotification("Gagal menyalin. Coba lagi.", true); // Tampilkan pesan error
        });
    } else {
        console.warn("Clipboard API tidak tersedia. Gunakan HTTPS.");
        showNotification("Fitur salin butuh HTTPS.", true);
    }
}

// --- Fungsi Tampilkan Notifikasi (Point 4) ---
let notificationTimeout;
function showNotification(message, isError = false) {
    clearTimeout(notificationTimeout); // Hapus timeout sebelumnya jika ada
    notificationElement.textContent = message;
    notificationElement.style.backgroundColor = isError ? '#dc3545' : ''; // Warna error jika perlu
    notificationElement.classList.add('show');

    notificationTimeout = setTimeout(() => {
        notificationElement.classList.remove('show');
    }, 3000); // Tampilkan selama 3 detik
}

// --- Update Ilustrasi SVG (Point 5) ---
function updateMoodIllustration(mood) {
    const url = illustrationUrls[mood] || illustrationUrls.default;
    if (moodIllustration.src !== url) { // Only update if different
        moodIllustration.style.opacity = '0'; // Fade out old
        setTimeout(() => {
            moodIllustration.src = url;
            // Update alt text based on the new source if needed, or keep generic
            moodIllustration.alt = `Ilustrasi mood ${mood} (by Storyset)`;
            moodIllustration.style.opacity = '0.9'; // Fade in new
        }, 200); // Wait for fade out
    } else if (moodIllustration.style.opacity === '0') {
         // Jika src sama tapi tersembunyi
         moodIllustration.style.opacity = '0.9';
    }
}


// --- Penyimpanan Lokal & Riwayat ---
function saveReflection(data, feedback) {
    const reflections = JSON.parse(localStorage.getItem('reflections') || '[]');
    const newReflection = {
        date: new Date().toISOString(),
        ...data,
        feedback: feedback
    };
    reflections.unshift(newReflection); // Tambah di awal
    const MAX_HISTORY = 21; // Batasi jumlah riwayat
    if (reflections.length > MAX_HISTORY) {
        reflections.pop(); // Hapus yang paling lama
    }
    localStorage.setItem('reflections', JSON.stringify(reflections));
    updateHistoryList(newReflection, true); // Tambahkan ke tampilan (prepend)
}

function loadReflectionHistory() {
    historyList.innerHTML = ''; // Clear previous display
    const reflections = JSON.parse(localStorage.getItem('reflections') || '[]');
    if (reflections.length > 0) {
        historyContainer.style.display = 'block';
        // Tampilkan item dengan delay untuk animasi stagger
        reflections.forEach((reflection, index) => {
            updateHistoryList(reflection, false, index * 80); // Apply delay
        });
    } else {
        historyContainer.style.display = 'block';
        historyList.innerHTML = '<p class="no-history">Belum ada riwayat refleksi tersimpan. Yuk, mulai!</p>';
    }
}

function updateHistoryList(reflection, prepend = false, delay = 0) {
    const noHistoryMsg = historyList.querySelector('.no-history');
    if (noHistoryMsg) {
         historyList.innerHTML = ''; // Hapus pesan jika ada item baru
    }

    const item = document.createElement('div');
    item.classList.add('history-item');
    item.style.animationDelay = `${delay}ms`; // Set delay untuk animasi stagger

    const reflectionDate = new Date(reflection.date);
    const formattedDate = reflectionDate.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
    const formattedTime = reflectionDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const moodEmojis = { baik: '😊', netral: '🙂', buruk: '🤔' }; // Ganti emoji buruk jadi netral/thinking
    const moodEmoji = moodEmojis[reflection.mood] || '🤔';
    const moodText = reflection.mood.charAt(0).toUpperCase() + reflection.mood.slice(1);

    // Sanitasi sederhana
    const sanitize = (str) => {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    };

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
        // Force reflow & re-trigger animation for prepend
        void item.offsetWidth;
        item.style.animation = 'none';
        setTimeout(() => {
             item.style.animation = '';
             item.style.animationDelay = '0ms'; // Animate immediately
        }, 10);
    } else {
        historyList.appendChild(item);
    }
     historyContainer.style.display = 'block';
}

// --- Event Listener Form Submit ---
form.addEventListener('submit', function(event) {
    event.preventDefault();
    playClickSound(); // Suara klik saat submit (Point 2)

    const formData = new FormData(form);
    const data = {
        activities: formData.get('activities')?.trim() ?? '', // Nullish coalescing
        mood: formData.get('mood'),
        distractions: formData.get('distractions')?.trim() ?? '',
        pride: formData.get('pride')?.trim() ?? ''
    };

    // Validasi sederhana
    if (!data.mood || !data.activities || !data.pride) {
        alert('Mohon isi bagian Aktivitas, Mood, dan Kebanggaan ya.');
        return;
    }

    // Inisialisasi AudioContext jika belum (saat interaksi pertama)
     if (!audioCtx) getAudioContext();

    loadingIndicator.style.display = 'block';
    submitButton.disabled = true;
    submitButton.innerHTML = 'Menganalisis... 🤔'; // Update teks dengan emoji
    feedbackContainer.innerHTML = ''; // Clear old feedback

    // Simulasi proses AI & tampilkan hasil
    setTimeout(() => {
         const generatedFeedback = generateFeedback(data);
         displayFeedback(generatedFeedback, data); // Pass data for share button
         saveReflection(data, generatedFeedback);

         loadingIndicator.style.display = 'none';
         submitButton.disabled = false;
         submitButton.innerHTML = 'Lihat Feedback ✨'; // Kembalikan teks asli

    }, 700); // Sedikit lebih cepat
});

// --- Event Listener Toggle Tema ---
themeToggleButton.addEventListener('click', toggleTheme);

// --- Event Listener perubahan Mood untuk update Ilustrasi (Point 5) ---
moodSelect.addEventListener('change', () => {
    updateMoodIllustration(moodSelect.value);
    // Inisialisasi AudioContext jika belum (saat interaksi pertama)
    if (!audioCtx) getAudioContext();
});

// --- Panggil Inisialisasi Saat DOM Siap ---
document.addEventListener('DOMContentLoaded', initializeApp);


// --- PWA Service Worker Registration (Point 9) ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => { // Register after page load is complete
    navigator.serviceWorker.register('./service-worker.js') // Pastikan path benar
      .then(registration => {
        console.log('✅ ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(error => {
        console.log('❌ ServiceWorker registration failed: ', error);
      });
  });
}
