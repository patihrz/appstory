// src/scripts/pages/home/home-page.js

// Impor fungsi API yang relevan, termasuk untuk notifikasi
import { getAllStories, subscribeToPushNotification, unsubscribeFromPushNotification } from '../../data/api.js';
import { getAuthToken, getUserName, clearUserSession } from '../../data/authService.js';

const HomePage = {
  mapsRendered: {}, // Untuk melacak peta yang sudah dirender
  storyMapInstances: {}, // Untuk menyimpan instance peta Leaflet per cerita
  VAPID_PUBLIC_KEY: 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk', // VAPID Key dari Dicoding

  async render() {
    const userName = getUserName();
    return `
      <div class="container home-container py-4">
        <header class="home-header mb-4">
          <h1 id="welcomeMessage" class="home-title">Selamat Datang, ${userName || 'Pengguna'}!</h1>
          <div class="d-flex align-items-center">
            <button id="notificationSubscribeButton" class="btn btn-sm btn-info me-2" style="display: none;">
              <i class="fas fa-bell"></i> Aktifkan Notifikasi
            </button>
            <button id="notificationUnsubscribeButton" class="btn btn-sm btn-warning me-2" style="display: none;">
              <i class="fas fa-bell-slash"></i> Nonaktifkan Notifikasi
            </button>
            <button id="logoutButton" class="btn btn-outline-danger btn-sm">
              <i class="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </header>
        <p id="notificationStatus" class="text-center small text-muted mb-3"></p>
        <p class="text-center lead mb-4">Jelajahi cerita-cerita terbaru dari komunitas Dicoding.</p>
        <div id="storiesList" class="stories-list">
          <div class="loading-spinner text-center my-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Memuat cerita...</span>
            </div>
            <p class="mt-2">Memuat cerita...</p>
          </div>
        </div>
        <div class="add-story-fab-container">
          <a href="#add-story" class="add-story-fab shadow" aria-label="Tambah Cerita Baru" title="Tambah Cerita Baru">
            <i class="fas fa-plus"></i>
          </a>
        </div>
      </div>
    `;
  },

  async afterRender() {
    console.log('HomePage afterRender: Menjalankan afterRender...');
    const storiesListElement = document.getElementById('storiesList');
    const logoutButton = document.getElementById('logoutButton');
    const welcomeMessageElement = document.getElementById('welcomeMessage');
    const notificationSubscribeButton = document.getElementById('notificationSubscribeButton');
    const notificationUnsubscribeButton = document.getElementById('notificationUnsubscribeButton');
    const notificationStatusElement = document.getElementById('notificationStatus');
    
    await this.beforeUnload(); 

    const currentUserName = getUserName();
    if (welcomeMessageElement && currentUserName) {
        welcomeMessageElement.textContent = `Selamat Datang, ${currentUserName}!`;
    }

    if (logoutButton) {
      logoutButton.addEventListener('click', async () => {
        // Sebelum logout, coba unsubscribe notifikasi jika pengguna sudah subscribe
        // false berarti tidak menampilkan pesan sukses eksplisit saat logout
        await this.handleUnsubscribeNotifications(false, notificationSubscribeButton, notificationUnsubscribeButton, notificationStatusElement); 
        clearUserSession();
        window.location.hash = '#login';
      });
    }

    // --- Logika Push Notification ---
    if (notificationSubscribeButton && notificationUnsubscribeButton && notificationStatusElement) {
      if ('Notification' in window && 'PushManager' in window && 'serviceWorker' in navigator) {
        this.updateNotificationButtonState(notificationSubscribeButton, notificationUnsubscribeButton, notificationStatusElement);

        notificationSubscribeButton.addEventListener('click', async () => {
          await this.handleSubscribeNotifications(notificationSubscribeButton, notificationUnsubscribeButton, notificationStatusElement);
        });

        notificationUnsubscribeButton.addEventListener('click', async () => {
          // true berarti tampilkan alert/status saat unsubscribe manual
          await this.handleUnsubscribeNotifications(true, notificationSubscribeButton, notificationUnsubscribeButton, notificationStatusElement);
        });
      } else {
        notificationStatusElement.textContent = 'Push Notification atau Service Worker tidak didukung browser ini.';
        notificationSubscribeButton.style.display = 'none';
        notificationUnsubscribeButton.style.display = 'none';
      }
    }
    // --- Akhir Logika Push Notification ---

    const token = getAuthToken();
    if (!token) {
      if (storiesListElement) storiesListElement.innerHTML = '<p class="alert alert-warning text-center">Anda harus login untuk melihat cerita. Mengarahkan ke halaman login...</p>';
      setTimeout(() => {
        if (window.location.hash !== '#login') window.location.hash = '#login';
      }, 1500);
      return;
    }

    try {
      const result = await getAllStories(token, { size: 12, page: 1, location: 0 }); 
      console.log('HomePage afterRender: Data cerita diterima:', result);

      if (storiesListElement) {
        if (result.error) {
          storiesListElement.innerHTML = `<p class="alert alert-danger text-center">Gagal memuat cerita: ${result.message}</p>`;
        } else if (result.listStory && result.listStory.length > 0) {
          storiesListElement.innerHTML = result.listStory.map(story => this.renderStoryItem(story)).join('');
          result.listStory.forEach(story => {
            if (story.lat && story.lon) {
              setTimeout(() => this.initStoryMap(story), 0);
            }
          });
        } else {
          storiesListElement.innerHTML = '<p class="text-center text-muted mt-5">Belum ada cerita untuk ditampilkan. Jadilah yang pertama!</p>';
        }
      }
    } catch (error) {
      console.error('HomePage afterRender: Error saat mengambil atau merender cerita:', error);
      if (storiesListElement) storiesListElement.innerHTML = '<p class="alert alert-danger text-center">Terjadi kesalahan saat memuat cerita. Coba muat ulang halaman.</p>';
    }
  },

  renderStoryItem(story) {
    const mapPlaceholderId = `map-${story.id}`;
    const hasLocation = story.lat && story.lon;
    const mapHtml = hasLocation ? 
      `<div id="${mapPlaceholderId}" class="story-map mt-3" style="height: 180px; width: 100%; border-radius: 0.25rem;"></div>` : 
      '';
    const storyDate = new Date(story.createdAt).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
    const altText = `Cerita oleh ${story.name || 'Anonim'}: ${this.truncateDescription(story.description || 'Tanpa deskripsi.', 50)}`;
    const placeholderImage = "https://placehold.co/600x400/E0E0E0/757575?text=Gambar+Tidak+Tersedia";

    return `
      <article class="story-item card h-100 shadow-sm">
        <figure class="story-image-figure mb-0">
          <img 
            src="${story.photoUrl}" 
            alt="${altText}" 
            class="story-image card-img-top" 
            onerror="this.onerror=null; this.src='${placeholderImage}'; this.alt='Gambar tidak dapat dimuat';"
            loading="lazy">
        </figure>
        <div class="story-content card-body d-flex flex-column">
          <h3 class="story-name card-title h5 mb-2">${story.name || 'Pengguna Anonim'}</h3>
          <p class="story-description card-text text-secondary small mb-3 flex-grow-1">
            ${this.truncateDescription(story.description || 'Tidak ada deskripsi.', 100)}
          </p>
          ${mapHtml}
          <div class="mt-auto pt-2 border-top d-flex justify-content-between align-items-center">
            <p class="story-date card-text mb-0">
              <small class="text-muted">
                <i class="fas fa-calendar-alt me-1"></i> ${storyDate}
              </small>
            </p>
            <a href="#story/${story.id}" class="btn btn-sm btn-outline-primary">Lihat Detail</a>
          </div>
        </div>
      </article>
    `;
  },

  initStoryMap(story) {
    const mapId = `map-${story.id}`;
    const mapElement = document.getElementById(mapId);

    if (this.storyMapInstances[mapId] || !mapElement) {
      return;
    }
    
    if (typeof L === 'undefined') {
        console.error('Leaflet.js (L) tidak terdefinisi. Pastikan sudah di-load di index.html.');
        if (mapElement) mapElement.innerHTML = '<p class="text-danger text-center small">Pustaka peta gagal dimuat.</p>';
        return;
    }

    try {
      console.log(`HomePage initStoryMap: Menginisialisasi peta untuk story ID ${story.id} di elemen ${mapId}`);
      const storyLat = parseFloat(story.lat); 
      const storyLon = parseFloat(story.lon);
      
      if (isNaN(storyLat) || isNaN(storyLon)) {
          console.error(`Koordinat tidak valid untuk story ID ${story.id}: Lat=${story.lat}, Lon=${story.lon}`);
          if (mapElement) mapElement.innerHTML = '<p class="text-muted text-center small">Data lokasi tidak valid.</p>';
          return;
      }
      const storyCoords = [storyLat, storyLon];

      const map = L.map(mapId, {
          scrollWheelZoom: false,
          dragging: true, 
          tap: true,
          zoomControl: false, 
      }).setView(storyCoords, 14); 

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);
      
      L.marker(storyCoords, {
          icon: L.icon({ 
              iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
              shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
          })
      }).addTo(map)
        .bindPopup(`<b>${story.name || 'Cerita'}</b><br><small>${this.truncateDescription(story.description || 'Lokasi cerita.', 40)}</small>`)
        .openPopup();

      this.storyMapInstances[mapId] = map; 
      this.mapsRendered[mapId] = true;
      console.log(`Peta untuk ${mapId} berhasil diinisialisasi.`);
    } catch (error) {
        console.error(`Gagal menginisialisasi peta untuk story ID ${story.id}:`, error);
        if (mapElement) {
            mapElement.innerHTML = '<p class="text-muted text-center small">Peta tidak dapat dimuat.</p>';
        }
    }
  },

  truncateDescription(description, maxLength = 150) {
    if (typeof description !== 'string') return '';
    if (description.length > maxLength) {
      return `${description.substring(0, maxLength)}...`;
    }
    return description;
  },

  // --- Fungsi untuk Push Notification ---
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  },

  async updateNotificationButtonState(subscribeButton, unsubscribeButton, statusElement) {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        statusElement.textContent = 'Push Notification tidak didukung.';
        subscribeButton.style.display = 'none';
        unsubscribeButton.style.display = 'none';
        return;
    }
    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
        subscribeButton.style.display = 'none';
        unsubscribeButton.style.display = 'block';
        statusElement.textContent = 'Anda sudah subscribe notifikasi.';
        } else {
        subscribeButton.style.display = 'block';
        unsubscribeButton.style.display = 'none';
        statusElement.textContent = 'Aktifkan notifikasi untuk mendapatkan update terbaru.';
        }
    } catch (error) {
        console.error('Error getting push subscription state:', error);
        statusElement.textContent = 'Gagal memeriksa status notifikasi.';
    }
  },

  async handleSubscribeNotifications(subscribeButton, unsubscribeButton, statusElement) {
    statusElement.textContent = 'Memproses subscribe...';
    subscribeButton.disabled = true;
    try {
      if (Notification.permission === 'denied') {
        statusElement.textContent = 'Izin notifikasi diblokir. Harap aktifkan di pengaturan browser.';
        throw new Error('Notification permission denied.');
      }
      if (Notification.permission === 'default') {
        const permissionResult = await Notification.requestPermission();
        if (permissionResult !== 'granted') {
          statusElement.textContent = 'Izin notifikasi tidak diberikan.';
          throw new Error('Notification permission not granted.');
        }
      }
      
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(this.VAPID_PUBLIC_KEY),
        });
      }
      
      const token = getAuthToken();
      if (!token) {
          statusElement.textContent = 'Anda harus login untuk subscribe notifikasi.';
          throw new Error('User not authenticated for push subscription.');
      }

      const apiResult = await subscribeToPushNotification(token, subscription);
      if (apiResult.error) {
        statusElement.textContent = `Gagal subscribe ke server: ${apiResult.message}`;
        if(subscription) await subscription.unsubscribe(); // Batalkan subscription di browser jika gagal di server
      } else {
        statusElement.textContent = 'Berhasil subscribe notifikasi!';
        console.log('Berhasil subscribe:', subscription);
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      statusElement.textContent = `Error: ${error.message || 'Gagal melakukan subscribe.'}`;
    } finally {
      this.updateNotificationButtonState(subscribeButton, unsubscribeButton, statusElement);
      subscribeButton.disabled = false;
    }
  },

  async handleUnsubscribeNotifications(showAlerts = true, subscribeButton, unsubscribeButton, statusElement) {
    // Pastikan elemen ada sebelum mencoba mengubahnya
    if (showAlerts && statusElement) statusElement.textContent = 'Memproses unsubscribe...';
    if (unsubscribeButton) unsubscribeButton.disabled = true;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        if (showAlerts && statusElement) statusElement.textContent = 'Anda belum subscribe.';
        return;
      }
      
      const unsubscribedSuccessfully = await subscription.unsubscribe();
      if (!unsubscribedSuccessfully) {
        if (showAlerts && statusElement) statusElement.textContent = 'Gagal unsubscribe dari Push Manager.';
        throw new Error('Failed to unsubscribe from Push Manager.');
      }
      console.log('Berhasil unsubscribe dari Push Manager.');

      const token = getAuthToken();
      if (token) { 
        const apiResult = await unsubscribeFromPushNotification(token, subscription.endpoint);
        if (apiResult.error) {
          if (showAlerts && statusElement) statusElement.textContent = `Gagal unsubscribe dari server: ${apiResult.message}`;
        } else {
          if (showAlerts && statusElement) statusElement.textContent = 'Berhasil unsubscribe notifikasi.';
        }
      } else {
         if (showAlerts && statusElement) statusElement.textContent = 'Berhasil unsubscribe dari browser (tidak ada sesi login).';
      }

    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      if (showAlerts && statusElement) statusElement.textContent = `Error: ${error.message || 'Gagal melakukan unsubscribe.'}`;
    } finally {
      if (subscribeButton && unsubscribeButton && statusElement) { 
        this.updateNotificationButtonState(subscribeButton, unsubscribeButton, statusElement);
      }
      if (unsubscribeButton) unsubscribeButton.disabled = false;
    }
  },
  // --- Akhir Fungsi Baru untuk Push Notification ---

  async beforeUnload() {
    console.log('HomePage beforeUnload: Membersihkan peta...');
    Object.keys(this.storyMapInstances).forEach(mapId => {
      const mapInstance = this.storyMapInstances[mapId];
      if (mapInstance) {
        mapInstance.remove(); 
        console.log(`Peta dengan ID ${mapId} telah dihapus.`);
      }
    });
    this.storyMapInstances = {}; 
    this.mapsRendered = {}; 
  }
};

export default HomePage;