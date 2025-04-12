# Refleksi Diri Harian 📝✨

[![Live Demo](https://img.shields.io/badge/Live_Demo-Kunjungi-brightgreen)](https://rapihin.github.io/refleksi)

Aplikasi web sederhana untuk membantu Anda mencatat refleksi harian, mengenali pola mood, dan merayakan pencapaian kecil setiap hari. Dibuat dengan HTML, CSS, dan JavaScript vanilla, tanpa framework eksternal.

![Screenshot Aplikasi Refleksi Diri](./screenshot.png)

## Deskripsi

Aplikasi ini dirancang sebagai alat bantu pribadi untuk refleksi diri. Pengguna dapat mengisi form singkat mengenai aktivitas harian, mood, gangguan, dan hal yang dibanggakan. Berdasarkan input tersebut, aplikasi akan memberikan feedback generatif sederhana untuk mendorong pengguna lebih mengenali diri dan perjalanannya. Semua data disimpan secara lokal di browser pengguna.

Cocok untuk siapa saja yang ingin memulai kebiasaan refleksi harian dengan cara yang ringan dan modern.

## Fitur Utama ⭐

* **Form Refleksi Sederhana:** Input untuk Aktivitas, Mood (Baik, Netral, Buruk), Gangguan (opsional), dan Kebanggaan.
* **Feedback Generatif:** Respon "AI" sederhana berdasarkan mood dan input pengguna (menggunakan bank kalimat dari file JSON eksternal).
* **Desain Modern Minimalis:** Tampilan bersih bergaya flat design.
* **Mode Gelap Otomatis:** Mendeteksi preferensi sistem (`prefers-color-scheme`) dan menyediakan tombol toggle manual.
* **Ilustrasi SVG Dinamis:** Ilustrasi di header berubah sesuai mood yang dipilih (menggunakan file SVG lokal).
* **Riwayat Refleksi:** Menyimpan dan menampilkan hingga 21 entri refleksi terakhir di LocalStorage browser.
* **Bagikan Refleksi:** Tombol untuk menyalin ringkasan refleksi ke clipboard.
* **Animasi & Microinteraction:** Efek staggered pada form, hover/active pada item riwayat, efek klik tombol.
* **Feedback Suara:** Efek suara lembut saat submit dan saat feedback muncul (menggunakan Web Audio API).
* **Progressive Web App (PWA):** Dapat di-install di perangkat mobile/desktop untuk akses seperti aplikasi native.
* **Desain Responsif:** Tampilan menyesuaikan diri dengan berbagai ukuran layar.
* **Vanilla Stack:** Dibangun murni dengan HTML, CSS, dan JavaScript, tanpa library atau framework eksternal (kecuali Google Fonts).

## Teknologi yang Digunakan 🛠️

* HTML5
* CSS3 (dengan CSS Variables untuk theming)
* JavaScript (ES6+)
* Web Audio API
* LocalStorage API
* Service Workers (untuk PWA)
* JSON (untuk data feedback)
* Google Fonts (Inter & Space Grotesk)

## Struktur File 📁


/
├── index.html          # Halaman utama
├── styles.css          # Styling CSS
├── main.js             # Logika utama JavaScript
├── feedback_data.json  # Bank kalimat feedback AI
├── manifest.json       # Konfigurasi PWA
├── service-worker.js   # Logika PWA & Offline Cache
├── illustrations/      # Folder berisi file SVG ilustrasi lokal
│   ├── ilustrasi-baik.svg
│   ├── ilustrasi-netral.svg
│   ├── ilustrasi-buruk.svg
│   └── ilustrasi-default.svg
├── icons/              # Folder ikon PWA
│   ├── logo192.png
│   └── logo512.png
└── README.md           # File ini

## Menjalankan Secara Lokal (Opsional)

1.  Clone repositori ini.
2.  Buka file `index.html` langsung di browser Anda.

## Atribusi 🙏

* Ilustrasi dari [Storyset](https://storyset.com) (atau sebutkan sumber lain jika Anda menggunakan yang berbeda). *Jangan lupa sertakan link ini jika ilustrasi Anda memerlukannya.*
* Font dari [Google Fonts](https://fonts.google.com/).

## Author

Dibuat oleh Fawwaz Dzaky Amrulloh Bersama AI