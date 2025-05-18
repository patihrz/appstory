# Dicoding Story App (Submission Proyek Akhir)

Aplikasi ini adalah submission untuk proyek akhir kelas "Belajar Fundamental Aplikasi Web dengan React" atau kelas terkait pengembangan frontend di Dicoding. Aplikasi ini memungkinkan pengguna untuk berbagi cerita (mirip postingan Instagram) dengan deskripsi dan gambar, serta melihat cerita dari pengguna lain.

**Link Aplikasi yang Telah Di-deploy:**
[https://appstorypthrz.netlify.app](https://appstorypthrz.netlify.app)

## Fitur Utama

* **Autentikasi Pengguna:**
    * Registrasi pengguna baru.
    * Login pengguna.
    * Logout.
* **Manajemen Cerita:**
    * Menampilkan daftar semua cerita dari pengguna.
    * Menampilkan detail satu cerita.
    * Menambahkan cerita baru dengan deskripsi dan unggahan foto.
    * Pengambilan foto langsung dari kamera perangkat.
    * Penambahan informasi lokasi (latitude dan longitude) pada cerita menggunakan peta interaktif.
* **PWA (Progressive Web App):**
    * Dapat diinstal di perangkat pengguna (Add to Home Screen).
    * Caching aset inti untuk akses offline (Application Shell).
    * Strategi caching runtime untuk data API dan gambar.
* **Push Notification:**
    * Pengguna dapat subscribe dan unsubscribe untuk menerima notifikasi (implementasi sisi klien).
    * Service Worker untuk menerima dan menampilkan notifikasi push.
* **Aksesibilitas (WCAG):**
    * Implementasi "Skip to Content".
    * Penggunaan teks alternatif (alt text) untuk gambar.
    * Asosiasi label dengan form control.
    * Penggunaan elemen HTML semantik.
* **Transisi Halaman Halus:**
    * Menggunakan View Transition API untuk pengalaman navigasi yang lebih baik.
* **Penyimpanan Data Lokal:**
    * Menggunakan IndexedDB untuk menyimpan data cerita secara offline.
    * Fitur untuk menyimpan, menampilkan, dan menghapus data cerita dari IndexedDB.
* **Desain Responsif:**
    * Tampilan yang beradaptasi dengan baik di berbagai ukuran perangkat (mobile, tablet, desktop).
* **Tampilan Menarik (Opsional):**
    * Pemilihan warna, font, dan tata letak yang dipertimbangkan.
    * Penggunaan ikon untuk memperjelas antarmuka.

## Teknologi yang Digunakan

* **Frontend:**
    * HTML5
    * CSS3 (dengan variabel CSS, Flexbox, Grid)
    * Vanilla JavaScript (ES6+)
    * Leaflet.js (untuk fitur peta)
    * Workbox (untuk Service Worker dan PWA)
    * IDB (library wrapper untuk IndexedDB)
* **Backend API:**
    * Dicoding Story API (`https://story-api.dicoding.dev/v1`)
* **Build Tool:**
    * Vite
* **Deployment:**
    * Netlify (terhubung dengan GitHub)
* **Version Control:**
    * Git & GitHub

## Struktur Folder Proyek (Utama)


├── src/
│   ├── public/         # Aset statis (manifest, ikon, sw.js jika manual)
│   ├── scripts/
│   │   ├── data/       # Modul untuk interaksi API (api.js), IndexedDB (idb-service.js), auth (authService.js)
│   │   ├── pages/      # Modul untuk setiap halaman/tampilan (app.js, home-page.js, dll.)
│   │   ├── routes/     # Modul untuk routing (routes.js, url-parser.js)
│   │   └── utils/      # (Jika ada utilitas umum)
│   │   └── index.js    # Entry point JavaScript utama yang dimuat oleh index.html
│   ├── styles/
│   │   └── styles.css  # File CSS utama
│   └── index.html      # File HTML utama (root untuk Vite)
├── dist/                 # Folder output build (dihasilkan oleh 'npm run build')
├── .gitignore
├── package.json
├── vite.config.js
└── README.md

*(Catatan: Struktur folder `src/scripts/` mungkin sedikit berbeda berdasarkan implementasi spesifik Anda, misalnya `app.js` bisa berada di `src/scripts/` atau di dalam `src/scripts/pages/`)*

## Cara Menjalankan Proyek Secara Lokal

1.  **Clone repositori ini:**
    ```bash
    git clone [https://github.com/patihrz/appstory.git](https://github.com/patihrz/appstory.git)
    cd appstory
    ```
2.  **Instal dependencies:**
    ```bash
    npm install
    ```
    atau jika menggunakan Yarn:
    ```bash
    yarn install
    ```
3.  **Jalankan server pengembangan Vite:**
    ```bash
    npm run dev
    ```
    Aplikasi akan tersedia di `http://localhost:5173` (atau port lain jika 5173 sudah digunakan).

4.  **Untuk membuat build produksi:**
    ```bash
    npm run build
    ```
    Hasil build akan ada di folder `dist/`.

## Kontributor

* **[Nama Anda/patihrz]** - ([Link Profil GitHub Anda jika mau])

Terima kasih kepada Dicoding atas materi pembelajaran dan API yang disediakan.
