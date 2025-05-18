// src/scripts/data/authService.js

/**
 * Menyimpan token autentikasi ke localStorage.
 * @param {string} token - Token JWT.
 */
export const saveAuthToken = (token) => {
  if (typeof token !== 'string' || !token) {
    console.error('saveAuthToken: Invalid token provided.', token);
    return;
  }
  localStorage.setItem('authToken', token);
  console.log('AuthService: Token disimpan ke localStorage.');
};

/**
 * Mendapatkan token autentikasi dari localStorage.
 * @returns {string|null} Token atau null jika tidak ada.
 */
export const getAuthToken = () => {
  const token = localStorage.getItem('authToken');
  // console.log('AuthService: Mengambil token dari localStorage:', token ? 'Ditemukan' : 'Tidak ditemukan');
  return token;
};

/**
 * Menghapus token autentikasi dari localStorage.
 */
export const clearAuthToken = () => {
  localStorage.removeItem('authToken');
  console.log('AuthService: Token dihapus dari localStorage.');
};

/**
 * Menyimpan nama pengguna ke localStorage.
 * @param {string} name - Nama pengguna.
 */
export const saveUserName = (name) => {
  if (typeof name !== 'string') { // Nama bisa saja string kosong jika API mengizinkan
    console.warn('saveUserName: Invalid name provided.', name);
    // Anda bisa memilih untuk tidak menyimpan jika nama tidak valid, atau menyimpan apa adanya
  }
  localStorage.setItem('userName', name || ''); // Simpan string kosong jika nama null/undefined
  console.log('AuthService: Nama pengguna disimpan ke localStorage.');
};

/**
 * Mendapatkan nama pengguna dari localStorage.
 * @returns {string|null} Nama pengguna atau null jika tidak ada.
 */
export const getUserName = () => {
  const userName = localStorage.getItem('userName');
  // console.log('AuthService: Mengambil nama pengguna dari localStorage:', userName);
  return userName;
};

/**
 * Menghapus nama pengguna dari localStorage.
 */
export const clearUserName = () => {
  localStorage.removeItem('userName');
  console.log('AuthService: Nama pengguna dihapus dari localStorage.');
};

/**
 * Menyimpan User ID ke localStorage.
 * @param {string} userId - User ID.
 */
export const saveUserId = (userId) => {
  if (typeof userId !== 'string' || !userId) {
    console.error('saveUserId: Invalid userId provided.', userId);
    return;
  }
  localStorage.setItem('userId', userId);
  console.log('AuthService: User ID disimpan ke localStorage.');
};

/**
 * Mendapatkan User ID dari localStorage.
 * @returns {string|null} User ID atau null jika tidak ada.
 */
export const getUserId = () => {
  const userId = localStorage.getItem('userId');
  // console.log('AuthService: Mengambil User ID dari localStorage:', userId);
  return userId;
};

/**
 * Menghapus User ID dari localStorage.
 */
export const clearUserId = () => {
  localStorage.removeItem('userId');
  console.log('AuthService: User ID dihapus dari localStorage.');
};

/**
 * Membersihkan semua data sesi pengguna (token, nama, ID).
 * Biasanya dipanggil saat logout.
 */
export const clearUserSession = () => {
  clearAuthToken();
  clearUserName();
  clearUserId();
  console.log('AuthService: Sesi pengguna (token, nama, ID) telah dibersihkan.');
};
