// src/scripts/app.js
// Diasumsikan file ini adalah entry point utama Anda atau diimpor olehnya.
// Path impor di bawah ini mungkin perlu disesuaikan berdasarkan lokasi aktual app.js.

// Jika app.js ada di src/scripts/app.js, maka pathnya menjadi './routes/routes.js'
// Jika app.js ada di src/scripts/pages/app.js, maka pathnya menjadi '../routes/routes.js'
import routes from '../routes/routes.js'; // Sesuaikan path ini!
import UrlParser from '../routes/url-parser.js'; // Sesuaikan path ini!
// import { getAuthToken } from '../data/authService.js'; // Uncomment jika Anda menggunakan getAuthToken di sini

const app = {
  content: null, // Akan diinisialisasi di init
  currentPage: null, // Untuk melacak halaman aktif, penting untuk beforeUnload

  /**
   * Metode inisialisasi aplikasi.
   * Mengatur elemen konten utama dan event listener untuk navigasi.
   */
  async init() {
    console.log('Menginisialisasi aplikasi (app.js)...');
    // Dapatkan elemen kontainer utama dari index.html
    // Pastikan ID ini ('app-root') atau tag <main> ada di index.html Anda
    this.content = document.getElementById('app-root') || document.querySelector('main');

    if (!this.content) {
      console.error("Kritis: Elemen konten utama ('app-root' atau 'main') tidak ditemukan dalam DOM!");
      document.body.innerHTML = '<p style="color: red; text-align: center; margin-top: 50px;">Error Kritis: Kontainer aplikasi tidak ditemukan. Periksa struktur HTML Anda.</p>';
      return;
    }
    console.log('Elemen konten utama (app.js) ditemukan:', this.content);

    window.addEventListener('hashchange', () => {
      console.log('app.js: Event hashchange terdeteksi. Hash baru:', window.location.hash);
      this.renderPage();
    });

    window.addEventListener('load', () => {
      console.log('app.js: Event load terdeteksi. Hash saat ini:', window.location.hash);
      if (!window.location.hash) {
        console.log('app.js: Tidak ada hash pada URL. Mengarahkan ke #login...');
        window.location.hash = '#login';
      } else {
        this.renderPage();
      }
    });
  },

  /**
   * Metode untuk merender halaman berdasarkan URL hash saat ini.
   * Menangani logika routing dan pemanggilan metode render dari modul halaman.
   */
  async renderPage() {
    if (!this.content) {
      console.error("app.js: renderPage dipanggil tetapi elemen konten (this.content) tidak terdefinisi.");
      return;
    }

    // Panggil beforeUnload pada halaman saat ini sebelum merender yang baru
    if (this.currentPage && typeof this.currentPage.beforeUnload === 'function') {
      console.log(`app.js: Menjalankan beforeUnload untuk halaman sebelumnya...`);
      await this.currentPage.beforeUnload();
    }

    const url = UrlParser.parseActiveUrlWithCombiner();
    console.log(`app.js renderPage: URL yang diparsing adalah "${url}"`);

    // Daftar rute yang tidak memerlukan login
    const publicRoutes = ['#login', '#register', '#about']; // Hapus '#home' jika ingin diproteksi
    const token = localStorage.getItem('authToken'); // Mengambil token langsung
    console.log(`app.js renderPage: Token ditemukan di localStorage: ${token ? 'Ya' : 'Tidak'}`);

    if (!publicRoutes.includes(url) && !token) {
      console.warn(`app.js: Akses ke rute terproteksi "${url}" ditolak (tidak ada token). Mengarahkan ke #login.`);
      window.location.hash = '#login';
      return;
    }

    if (token && (url === '#login' || url === '#register')) {
      if (window.location.hash !== '#home') {
        console.log(`app.js: Pengguna sudah login dan mencoba akses "${url}". Mengarahkan ke #home.`);
        window.location.hash = '#home';
        return;
      }
    }

    let pageModule = routes[url];
    if (!pageModule) {
      console.warn(`app.js: Rute "${url}" tidak ditemukan. Menggunakan fallback ke modul #login.`);
      pageModule = routes['#login']; // Fallback ke login
    }
    
    this.currentPage = pageModule; // Simpan referensi ke modul halaman saat ini

    console.log(`app.js renderPage: Modul halaman yang dipilih untuk "${url}":`, pageModule ? pageModule.constructor.name || 'Objek Halaman' : 'Tidak ada');

    if (pageModule && typeof pageModule.render === 'function') {
      console.log(`app.js renderPage: Merender modul halaman untuk "${url}"...`);

      // Implementasi View Transition API
      if (document.startViewTransition) {
        console.log('app.js: View Transitions API didukung. Memulai transisi...');
        document.startViewTransition(async () => {
          try {
            this.content.innerHTML = await pageModule.render();
            console.log(`app.js (transisi): Konten HTML untuk "${url}" berhasil dirender.`);
            if (typeof pageModule.afterRender === 'function') {
              await pageModule.afterRender();
              console.log(`app.js (transisi): afterRender untuk "${url}" selesai.`);
            }
          } catch (error) {
            console.error(`app.js (transisi): Error saat merender halaman untuk rute "${url}":`, error);
            this.content.innerHTML = `<p style="color: red;">Terjadi kesalahan saat memuat halaman "${url}".</p>`;
          }
        });
      } else {
        // Fallback jika View Transitions API tidak didukung
        console.log('app.js: View Transitions API tidak didukung. Merender secara langsung.');
        try {
            this.content.innerHTML = await pageModule.render();
            console.log(`app.js (langsung): Konten HTML untuk "${url}" berhasil dirender.`);
            if (typeof pageModule.afterRender === 'function') {
              await pageModule.afterRender();
              console.log(`app.js (langsung): afterRender untuk "${url}" selesai.`);
            }
        } catch (error) {
            console.error(`app.js (langsung): Error saat merender halaman untuk rute "${url}":`, error);
            this.content.innerHTML = `<p style="color: red;">Terjadi kesalahan saat memuat halaman "${url}".</p>`;
        }
      }
    } else {
      console.warn(`app.js: Modul halaman untuk rute "${url}" (atau fallbacknya) tidak valid. Menampilkan 404.`);
      this.content.innerHTML = `<p>Halaman untuk rute <strong>${url}</strong> tidak ditemukan (404).</p>`;
    }
  },
};

// Inisialisasi aplikasi ketika seluruh struktur DOM sudah siap
// Ini akan dijalankan jika app.js adalah skrip utama yang dimuat oleh index.html
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM sepenuhnya dimuat dan diparsing. Menginisialisasi app (app.js)...');
  app.init();
});

export default app;