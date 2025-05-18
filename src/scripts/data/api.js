// src/scripts/data/api.js

const BASE_URL = 'https://story-api.dicoding.dev/v1';

// Fungsi loginUser, registerUser, getAllStories, addNewStory, getStoryDetail yang sudah ada...
// (Pastikan semua fungsi sebelumnya masih ada di sini)

const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  } catch (error) {
    console.error('Error during login API call:', error);
    return { error: true, message: 'Login failed due to a network or server error.' };
  }
};

const registerUser = async (name, email, password) => {
  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return response.json();
  } catch (error) {
    console.error('Error during registration API call:', error);
    return { error: true, message: 'Registration failed due to a network or server error.' };
  }
};

const getAllStories = async (token, params = {}) => {
  if (!token) return { error: true, message: 'Authentication token is missing.' };
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page);
  if (params.size) queryParams.append('size', params.size);
  if (params.location !== undefined) queryParams.append('location', params.location);
  const queryString = queryParams.toString();
  const requestUrl = `${BASE_URL}/stories${queryString ? `?${queryString}` : ''}`;
  try {
    const response = await fetch(requestUrl, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  } catch (error) {
    console.error('Error during getAllStories API call:', error);
    return { error: true, message: 'Failed to fetch stories.' };
  }
};

const addNewStory = async (token, formData) => {
  if (!token) return { error: true, message: 'Authentication token is missing.' };
  if (!formData.has('description') || !formData.has('photo')) {
    return { error: true, message: 'Deskripsi dan foto wajib diisi.' };
  }
  try {
    const response = await fetch(`${BASE_URL}/stories`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
    return response.json();
  } catch (error) {
    console.error('Error during addNewStory API call:', error);
    return { error: true, message: 'Failed to add new story.' };
  }
};

const getStoryDetail = async (token, storyId) => {
  if (!token) return { error: true, message: 'Authentication token is missing.' };
  if (!storyId) return { error: true, message: 'Story ID tidak ditemukan.' };
  const requestUrl = `${BASE_URL}/stories/${storyId}`;
  try {
    const response = await fetch(requestUrl, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  } catch (error) {
    console.error(`Error during getStoryDetail API call for story ID ${storyId}:`, error);
    return { error: true, message: 'Failed to fetch story detail.' };
  }
};

/**
 * Mengirim data subscription push notification ke server API.
 * @param {string} token - Token JWT untuk autentikasi.
 * @param {PushSubscription} subscription - Objek PushSubscription dari browser.
 * @returns {Promise<Object>} Promise yang resolve dengan respons JSON dari API.
 */
const subscribeToPushNotification = async (token, subscription) => {
  if (!token) {
    console.error('subscribeToPushNotification: Token is required.');
    return { error: true, message: 'Authentication token is missing.' };
  }
  if (!subscription) {
    console.error('subscribeToPushNotification: Subscription object is required.');
    return { error: true, message: 'Subscription object is missing.' };
  }

  const subscriptionData = subscription.toJSON(); // Konversi ke objek JSON standar

  const body = {
    endpoint: subscriptionData.endpoint,
    keys: { // API Dicoding mengharapkan object keys dengan p256dh dan auth
      p256dh: subscriptionData.keys.p256dh,
      auth: subscriptionData.keys.auth,
    },
  };
  
  console.log('subscribeToPushNotification: Mengirim data subscription:', body);

  try {
    const response = await fetch(`${BASE_URL}/notifications/subscribe`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const responseJson = await response.json();
    console.log('API Response (subscribeToPushNotification):', responseJson);
    return responseJson;
  } catch (error) {
    console.error('Error during subscribeToPushNotification API call:', error);
    return {
      error: true,
      message: 'Failed to subscribe to push notifications due to a network or server error.',
    };
  }
};

/**
 * Mengirim permintaan unsubscribe push notification ke server API.
 * @param {string} token - Token JWT untuk autentikasi.
 * @param {string} endpoint - Endpoint dari PushSubscription yang ingin di-unsubscribe.
 * @returns {Promise<Object>} Promise yang resolve dengan respons JSON dari API.
 */
const unsubscribeFromPushNotification = async (token, endpoint) => {
  if (!token) {
    console.error('unsubscribeFromPushNotification: Token is required.');
    return { error: true, message: 'Authentication token is missing.' };
  }
  if (!endpoint) {
    console.error('unsubscribeFromPushNotification: Endpoint is required.');
    return { error: true, message: 'Subscription endpoint is missing.' };
  }

  console.log('unsubscribeFromPushNotification: Mengirim permintaan unsubscribe untuk endpoint:', endpoint);

  try {
    const response = await fetch(`${BASE_URL}/notifications/subscribe`, { // Endpoint sama, method beda
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json', // Body tetap JSON
      },
      body: JSON.stringify({ endpoint: endpoint }), // API mengharapkan endpoint di body
    });
    // API Dicoding untuk DELETE tidak selalu mengembalikan JSON body,
    // jadi kita cek statusnya saja.
    if (response.ok) { // Status 200-299
        // Coba parse JSON jika ada, jika tidak, kembalikan sukses berdasarkan status
        try {
            const responseJson = await response.json();
            console.log('API Response (unsubscribeFromPushNotification):', responseJson);
            return responseJson; // Seharusnya { error: false, message: "Success to unsubscribe web push notification." }
        } catch (e) {
            // Jika tidak ada body JSON atau parsing gagal, tapi status OK
            console.log('API Response (unsubscribeFromPushNotification): Status OK, no JSON body or parse error.');
            return { error: false, message: 'Successfully unsubscribed (status OK).' };
        }
    } else {
        // Jika status tidak OK, coba baca error message jika ada
        let errorMessage = `Failed to unsubscribe: ${response.status} ${response.statusText}`;
        try {
            const errorJson = await response.json();
            if (errorJson && errorJson.message) {
                errorMessage = errorJson.message;
            }
        } catch (e) {
            // Biarkan errorMessage default
        }
        console.error('API Error (unsubscribeFromPushNotification):', errorMessage);
        return { error: true, message: errorMessage };
    }
  } catch (error) {
    console.error('Error during unsubscribeFromPushNotification API call:', error);
    return {
      error: true,
      message: 'Failed to unsubscribe from push notifications due to a network or server error.',
    };
  }
};

// Ekspor semua fungsi yang akan digunakan oleh modul lain
export {
  loginUser,
  registerUser,
  getAllStories,
  addNewStory,
  getStoryDetail,
  subscribeToPushNotification,
  unsubscribeFromPushNotification,
};
