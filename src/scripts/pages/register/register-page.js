// src/scripts/pages/register/register-page.js

// Sesuaikan path ini jika lokasi api.js Anda berbeda.
// Dari src/scripts/pages/register/register-page.js ke src/scripts/data/api.js
import { registerUser } from '../../data/api.js';

const RegisterPage = {
  /**
   * Merender konten HTML untuk halaman registrasi.
   * @returns {Promise<string>} String HTML untuk halaman registrasi.
   */
  async render() {
    return `
      <div class="container register-container">
        <h2>Registrasi Akun Baru</h2>
        <form id="registerForm" novalidate>
          <div class="form-group">
            <label for="registerName">Nama Lengkap:</label>
            <input type="text" id="registerName" name="name" class="form-control" required>
            <p class="input-error-message" id="registerNameError" aria-live="polite"></p>
          </div>
          <div class="form-group">
            <label for="registerEmail">Alamat Email:</label>
            <input type="email" id="registerEmail" name="email" class="form-control" required>
            <p class="input-error-message" id="registerEmailError" aria-live="polite"></p>
          </div>
          <div class="form-group">
            <label for="registerPassword">Kata Sandi (minimal 8 karakter):</label>
            <input type="password" id="registerPassword" name="password" class="form-control" required minlength="8">
            <p class="input-error-message" id="registerPasswordError" aria-live="polite"></p>
          </div>
          <div class="form-group">
            <label for="registerConfirmPassword">Konfirmasi Kata Sandi:</label>
            <input type="password" id="registerConfirmPassword" name="confirmPassword" class="form-control" required minlength="8">
            <p class="input-error-message" id="registerConfirmPasswordError" aria-live="polite"></p>
          </div>
          <button type="submit" id="registerButton" class="btn btn-primary">Daftar</button>
        </form>
        <p id="registerMessage" class="message" aria-live="polite"></p>
        <p class="auth-switch">Sudah punya akun? <a href="#login">Login di sini</a></p>
      </div>
    `;
  },

  /**
   * Fungsi yang dijalankan setelah halaman registrasi dirender.
   * Menambahkan event listener untuk form registrasi dan menangani logika submit.
   */
  async afterRender() {
    console.log('RegisterPage afterRender: Menjalankan afterRender...');
    const registerForm = document.getElementById('registerForm');
    const registerButton = document.getElementById('registerButton');
    const registerMessageElement = document.getElementById('registerMessage');

    // Fungsi utilitas (bisa juga di-refactor ke modul utilitas terpisah jika sering digunakan)
    const showInputError = (inputId, message) => {
      const errorElement = document.getElementById(`${inputId}Error`);
      const inputElement = document.getElementById(inputId);
      if (errorElement) errorElement.textContent = message;
      if (inputElement) {
        inputElement.classList.add('is-invalid');
        inputElement.setAttribute('aria-invalid', 'true');
        inputElement.setAttribute('aria-describedby', `${inputId}Error`);
      }
    };

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

    const showGeneralMessage = (message, isError = false) => {
      if (registerMessageElement) {
        registerMessageElement.textContent = message;
        registerMessageElement.className = isError ? 'message error-message' : 'message success-message';
        console.log(`Pesan umum registrasi ditampilkan: "${message}", Error: ${isError}`);
      }
    };

    const clearGeneralMessages = () => {
      if (registerMessageElement) {
        registerMessageElement.textContent = '';
        registerMessageElement.className = 'message';
      }
    };

    if (registerForm) {
      console.log('RegisterPage afterRender: Form registrasi ditemukan. Menambahkan event listener...');
      registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        console.log('RegisterPage afterRender: Form registrasi disubmit.');

        clearGeneralMessages();
        clearInputError('registerName');
        clearInputError('registerEmail');
        clearInputError('registerPassword');
        clearInputError('registerConfirmPassword');

        if (registerButton) {
          registerButton.disabled = true;
          registerButton.textContent = 'Memproses...';
        }

        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        let isValid = true;

        if (!name) {
          showInputError('registerName', 'Nama tidak boleh kosong.');
          isValid = false;
        }

        if (!email) {
          showInputError('registerEmail', 'Email tidak boleh kosong.');
          isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
          showInputError('registerEmail', 'Format email tidak valid.');
          isValid = false;
        }

        if (!password) {
          showInputError('registerPassword', 'Password tidak boleh kosong.');
          isValid = false;
        } else if (password.length < 8) {
          showInputError('registerPassword', 'Password minimal 8 karakter.');
          isValid = false;
        }

        if (!confirmPassword) {
          showInputError('registerConfirmPassword', 'Konfirmasi password tidak boleh kosong.');
          isValid = false;
        } else if (password !== confirmPassword) {
          showInputError('registerConfirmPassword', 'Password dan konfirmasi password tidak cocok.');
          isValid = false;
        }

        if (!isValid) {
          showGeneralMessage('Harap perbaiki error pada form.', true);
          if (registerButton) {
            registerButton.disabled = false;
            registerButton.textContent = 'Daftar';
          }
          console.log('RegisterPage afterRender: Validasi form gagal.');
          return;
        }

        console.log(`RegisterPage afterRender: Mencoba registrasi dengan nama: ${name}, email: ${email}`);
        try {
          const result = await registerUser(name, email, password);
          console.log('RegisterPage afterRender: Respons API registrasi diterima:', result);

          if (result.error) {
            showGeneralMessage(result.message || 'Registrasi gagal. Email mungkin sudah digunakan atau terjadi kesalahan lain.', true);
          } else {
            showGeneralMessage('Registrasi berhasil! Anda akan diarahkan ke halaman login.', false);
            setTimeout(() => {
              console.log('RegisterPage afterRender: Mengarahkan ke #login...');
              window.location.hash = '#login';
            }, 2000); // Tunggu 2 detik sebelum redirect
          }
        } catch (error) {
          console.error('RegisterPage afterRender: Error saat proses registrasi:', error);
          showGeneralMessage('Terjadi kesalahan tidak terduga saat mencoba registrasi. Silakan periksa koneksi Anda dan coba lagi.', true);
        } finally {
          // Aktifkan kembali tombol submit, hanya jika belum diarahkan dan tombol masih 'Memproses...'
          if (window.location.hash !== '#login' && registerButton && registerButton.textContent === 'Memproses...') {
             registerButton.disabled = false;
             registerButton.textContent = 'Daftar';
          }
        }
      });
    } else {
      console.error('RegisterPage afterRender: Form registrasi dengan ID "registerForm" tidak ditemukan di DOM.');
    }
    // Fokus ke input nama pertama saat halaman dimuat
    const firstInput = document.getElementById('registerName');
    if (firstInput) {
        firstInput.focus();
    }
  },
};

export default RegisterPage;