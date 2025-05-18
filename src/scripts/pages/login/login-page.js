// src/scripts/pages/login/login-page.js

// Sesuaikan path ini jika lokasi api.js atau authService.js Anda berbeda.
// Dari src/scripts/pages/login/login-page.js ke src/scripts/data/
import { loginUser } from '../../data/api.js';
import { saveAuthToken, saveUserName, saveUserId } from '../../data/authService.js'; // Impor helper dari AuthService

const LoginPage = {
  /**
   * Merender konten HTML untuk halaman login.
   * @returns {Promise<string>} String HTML untuk halaman login.
   */
  async render() {
    return `
      <div class="container login-container">
        <h2>Login Pengguna</h2>
        <form id="loginForm" novalidate>
          <div class="form-group">
            <label for="loginEmail">Alamat Email:</label>
            <input type="email" id="loginEmail" name="email" class="form-control" required>
            <p class="input-error-message" id="loginEmailError" aria-live="polite"></p>
          </div>
          <div class="form-group">
            <label for="loginPassword">Kata Sandi:</label>
            <input type="password" id="loginPassword" name="password" class="form-control" required>
            <p class="input-error-message" id="loginPasswordError" aria-live="polite"></p>
          </div>
          <button type="submit" id="loginButton" class="btn btn-primary">Masuk</button>
        </form>
        <p id="loginMessage" class="message" aria-live="polite"></p>
        <p class="auth-switch">Belum punya akun? <a href="#register">Daftar di sini</a></p>
      </div>
    `;
  },

  /**
   * Fungsi yang dijalankan setelah halaman login dirender.
   * Menambahkan event listener untuk form login dan menangani logika submit.
   */
  async afterRender() {
    console.log('LoginPage afterRender: Menjalankan afterRender...');
    const loginForm = document.getElementById('loginForm');
    const loginButton = document.getElementById('loginButton');
    const loginMessageElement = document.getElementById('loginMessage');

    // Fungsi utilitas untuk menampilkan pesan error pada input tertentu
    const showInputError = (inputId, message) => {
      const errorElement = document.getElementById(`${inputId}Error`);
      const inputElement = document.getElementById(inputId);
      if (errorElement) errorElement.textContent = message;
      if (inputElement) {
        inputElement.classList.add('is-invalid'); // Untuk styling error (jika ada)
        inputElement.setAttribute('aria-invalid', 'true');
        inputElement.setAttribute('aria-describedby', `${inputId}Error`);
      }
    };

    // Fungsi utilitas untuk membersihkan pesan error pada input tertentu
    const clearInputError = (inputId) => {
      const errorElement = document.getElementById(`${inputId}Error`);
      const inputElement = document.getElementById(inputId);
      if (errorElement) errorElement.textContent = '';
      if (inputElement) {
        inputElement.classList.remove('is-invalid');
        inputElement.removeAttribute('aria-invalid');
        inputElement.removeAttribute('aria-describedby');
      }
    };

    // Fungsi utilitas untuk menampilkan pesan umum (sukses/error global)
    const showGeneralMessage = (message, isError = false) => {
      if (loginMessageElement) {
        loginMessageElement.textContent = message;
        loginMessageElement.className = isError ? 'message error-message' : 'message success-message';
        console.log(`Pesan umum ditampilkan: "${message}", Error: ${isError}`);
      }
    };

    // Fungsi utilitas untuk membersihkan pesan umum
    const clearGeneralMessages = () => {
      if (loginMessageElement) {
        loginMessageElement.textContent = '';
        loginMessageElement.className = 'message';
      }
    };

    if (loginForm) {
      console.log('LoginPage afterRender: Form login ditemukan. Menambahkan event listener...');
      loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Mencegah submit form standar
        console.log('LoginPage afterRender: Form login disubmit.');

        // Bersihkan pesan error sebelumnya
        clearGeneralMessages();
        clearInputError('loginEmail');
        clearInputError('loginPassword');

        // Nonaktifkan tombol submit dan ubah teksnya untuk feedback ke pengguna
        if (loginButton) {
          loginButton.disabled = true;
          loginButton.textContent = 'Memproses...';
        }

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value; // Password tidak perlu di-trim
        let isValid = true;

        // Validasi input
        if (!email) {
          showInputError('loginEmail', 'Email tidak boleh kosong.');
          isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) { // Validasi format email sederhana
          showInputError('loginEmail', 'Format email tidak valid.');
          isValid = false;
        }

        if (!password) {
          showInputError('loginPassword', 'Password tidak boleh kosong.');
          isValid = false;
        }

        if (!isValid) {
          showGeneralMessage('Harap perbaiki error pada form.', true);
          if (loginButton) { // Aktifkan kembali tombol jika validasi gagal
            loginButton.disabled = false;
            loginButton.textContent = 'Masuk';
          }
          console.log('LoginPage afterRender: Validasi form gagal.');
          return;
        }

        console.log(`LoginPage afterRender: Mencoba login dengan email: ${email}`);
        try {
          const result = await loginUser(email, password); // Panggil fungsi login dari api.js
          console.log('LoginPage afterRender: Respons API login diterima:', result);

          if (result.error) {
            showGeneralMessage(result.message || 'Login gagal. Silakan coba lagi.', true);
          } else {
            // Login berhasil
            // Gunakan helper dari authService.js untuk menyimpan data
            saveAuthToken(result.loginResult.token);
            saveUserName(result.loginResult.name);
            saveUserId(result.loginResult.userId);
            console.log('LoginPage afterRender: Login berhasil. Token dan info pengguna disimpan menggunakan AuthService.');

            showGeneralMessage('Login berhasil! Mengarahkan ke halaman utama...', false); // Pesan disesuaikan
            // Arahkan ke halaman #home setelah beberapa saat
            setTimeout(() => {
              console.log('LoginPage afterRender: Mengarahkan ke #home...');
              window.location.hash = '#home'; // DIKEMBALIKAN ke #home
            }, 1500); // Tunggu 1.5 detik sebelum redirect
          }
        } catch (error) {
          console.error('LoginPage afterRender: Error saat proses login:', error);
          showGeneralMessage('Terjadi kesalahan tidak terduga saat mencoba login. Silakan periksa koneksi Anda dan coba lagi.', true);
        } finally {
          // Aktifkan kembali tombol submit, hanya jika belum diarahkan dan tombol masih 'Memproses...'
          // Periksa apakah hash sudah berubah ke #home
          if (window.location.hash !== '#home' && loginButton && loginButton.textContent === 'Memproses...') {
            loginButton.disabled = false;
            loginButton.textContent = 'Masuk';
          }
        }
      });
    } else {
      console.error('LoginPage afterRender: Form login dengan ID "loginForm" tidak ditemukan di DOM.');
    }

    // Fokus ke input email pertama saat halaman dimuat untuk UX yang lebih baik
    const firstInput = document.getElementById('loginEmail');
    if (firstInput) {
        firstInput.focus();
    }
  },
};

export default LoginPage;
