// /scripts/index.js

// CSS imports
// Pastikan path ini benar relatif terhadap index.js
// Jika index.js ada di /scripts/ dan styles.css ada di /styles/ (di dalam src)
import '../styles/styles.css';

// Impor objek 'app' dari app.js
// Path disesuaikan: jika index.js ada di /scripts/ dan app.js ada di /scripts/pages/
import appInstance from './pages/app.js';

// Impor fungsi yang diperlukan dari authService.js
// Path disesuaikan: jika index.js ada di /scripts/ dan authService.js ada di /scripts/data/
import { getAuthToken, clearUserSession } from './data/authService.js';

/**
 * Fungsi untuk mengatur dan menangani interaksi navbar.
 */
function setupNavbar() {
  const navbarToggler = document.getElementById('navbarToggler');
  const navbarNav = document.getElementById('navbarNav');
  const navbarLogoutButton = document.getElementById('navbarLogoutButton');
  
  const navLoginLink = document.getElementById('nav-login');
  const navRegisterLink = document.getElementById('nav-register');
  const navLogoutItem = document.getElementById('nav-logout');

  // 1. Handle Toggle untuk Mobile
  if (navbarToggler && navbarNav) {
    navbarToggler.addEventListener('click', () => {
      navbarNav.classList.toggle('show'); // Class 'show' akan dikontrol oleh CSS Anda
      const isExpanded = navbarNav.classList.contains('show');
      navbarToggler.setAttribute('aria-expanded', isExpanded.toString());
      console.log('Navbar toggled, show:', isExpanded);
    });
  } else {
    console.warn('Elemen #navbarToggler atau #navbarNav tidak ditemukan.');
  }

  // 2. Update Tampilan Link Login/Logout saat setup awal
  updateNavbarLoginStatus(navLoginLink, navRegisterLink, navLogoutItem);

  // 3. Handle Klik Tombol Logout di Navbar
  if (navbarLogoutButton) {
    navbarLogoutButton.addEventListener('click', () => {
      console.log('Tombol Logout di Navbar diklik.');
      clearUserSession(); // Hapus token dan info pengguna
      updateNavbarLoginStatus(navLoginLink, navRegisterLink, navLogoutItem); // Perbarui UI Navbar
      window.location.hash = '#login'; // Arahkan ke halaman login

      // Tutup menu jika terbuka (di tampilan mobile)
      if (navbarNav && navbarNav.classList.contains('show')) {
        navbarNav.classList.remove('show');
        if (navbarToggler) navbarToggler.setAttribute('aria-expanded', 'false');
      }
    });
  } else {
    console.warn('Elemen #navbarLogoutButton tidak ditemukan.');
  }

  // 4. (Opsional) Tutup menu mobile setelah link navigasi diklik
  if (navbarNav) {
    const navLinks = navbarNav.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      // Jangan tambahkan ke tombol logout karena sudah punya handler sendiri
      if (link.parentElement.id !== 'nav-logout') {
        link.addEventListener('click', () => {
          if (navbarNav.classList.contains('show')) {
            navbarNav.classList.remove('show');
            if (navbarToggler) navbarToggler.setAttribute('aria-expanded', 'false');
          }
        });
      }
    });
  }
}

/**
 * Fungsi untuk memperbarui tampilan link Login, Register, dan Logout di navbar
 * berdasarkan status token autentikasi.
 */
function updateNavbarLoginStatus(navLogin, navRegister, navLogout) {
  const token = getAuthToken(); // Ambil token dari authService

  // Pastikan elemen ada sebelum mencoba mengubah style
  if (!navLogin || !navRegister || !navLogout) {
    // console.warn('Satu atau lebih elemen navigasi (login/register/logout) tidak ditemukan untuk pembaruan UI navbar.');
    return;
  }

  if (token) { // Jika pengguna sudah login
    navLogin.style.display = 'none';
    navRegister.style.display = 'none';
    navLogout.style.display = 'list-item'; // Atau 'block' jika <li> tidak digunakan sebagai display utama
  } else { // Jika pengguna belum login
    navLogin.style.display = 'list-item';
    navRegister.style.display = 'list-item';
    navLogout.style.display = 'none';
  }
  console.log('Status login navbar diperbarui. Token ada:', !!token);
}

// Event listener utama saat DOM sudah siap
document.addEventListener('DOMContentLoaded', async () => {
  console.log('index.js: DOMContentLoaded terdeteksi.');

  // Inisialisasi objek app dari app.js
  // Pastikan appInstance.init tidak memanggil setupNavbar sendiri untuk menghindari duplikasi
  await appInstance.init({
    contentSelector: '#main-content', // Atau '#app-root' jika itu kontainer utama Anda
  });
  console.log('index.js: appInstance.init() selesai.');

  // Panggil setupNavbar setelah DOM siap dan appInstance mungkin sudah melakukan setup awal
  setupNavbar(); 

  // Panggil renderPage() dari appInstance untuk memuat halaman awal berdasarkan hash saat ini
  await appInstance.renderPage();
  console.log('index.js: renderPage() awal selesai.');
  
  // Panggil updateNavbarLoginStatus sekali lagi setelah renderPage awal
  // untuk memastikan status navbar benar setelah konten halaman dimuat.
  const navLoginLinkOnInit = document.getElementById('nav-login');
  const navRegisterLinkOnInit = document.getElementById('nav-register');
  const navLogoutItemOnInit = document.getElementById('nav-logout');
  updateNavbarLoginStatus(navLoginLinkOnInit, navRegisterLinkOnInit, navLogoutItemOnInit);


  // Registrasi Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // Pastikan path ke sw.js benar.
      // Jika sw.js ada di src/public/sw.js dan publicDir adalah src/public, maka /sw.js adalah benar.
      navigator.serviceWorker.register('/sw.js') 
        .then((registration) => {
          console.log('Service Worker: Registrasi berhasil, scope:', registration.scope);
        })
        .catch((error) => {
          console.error('Service Worker: Registrasi gagal:', error);
        });
    });
  } else {
    console.log('Service Worker tidak didukung oleh browser ini.');
  }

  // Logika untuk drawer Anda
  const drawerButton = document.querySelector('#drawer-button'); // ID ini tidak ada di HTML navbar Anda
  const navigationDrawer = document.querySelector('#navigation-drawer'); // ID ini tidak ada di HTML navbar Anda

  // Jika Anda menggunakan #navbarToggler dan #navbarNav untuk drawer, logika ini mungkin perlu disesuaikan
  // atau digabungkan dengan setupNavbar. Untuk saat ini, saya biarkan logika drawer Anda.
  if (drawerButton && navigationDrawer) {
    console.log('index.js: Elemen drawer (#drawer-button, #navigation-drawer) ditemukan.');
    drawerButton.addEventListener('click', (event) => {
      event.stopPropagation();
      navigationDrawer.classList.toggle('open');
      console.log('index.js: Tombol drawer diklik, status drawer:', navigationDrawer.classList.contains('open'));
    });

    document.body.addEventListener('click', (event) => {
      if (navigationDrawer.classList.contains('open') && !navigationDrawer.contains(event.target) && event.target !== drawerButton) {
        navigationDrawer.classList.remove('open');
        console.log('index.js: Klik di luar drawer, drawer ditutup.');
      }
    });
  } else {
    console.warn('index.js: Tombol drawer (#drawer-button) atau panel navigasi (#navigation-drawer) tidak ditemukan.');
    // Jika #navbarToggler adalah drawerButton Anda, maka logika di atas tidak akan berjalan.
  }

  // Tambahkan listener untuk memperbarui UI navbar setiap kali hash berubah
  window.addEventListener('hashchange', () => {
    console.log('index.js: Event hashchange terdeteksi, memperbarui status navbar.');
    const navLoginLink = document.getElementById('nav-login');
    const navRegisterLink = document.getElementById('nav-register');
    const navLogoutItem = document.getElementById('nav-logout');
    updateNavbarLoginStatus(navLoginLink, navRegisterLink, navLogoutItem);
  });

  console.log('index.js: Inisialisasi selesai.');
});
