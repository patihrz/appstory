// src/scripts/pages/detail-story/detail-story-page.js

import { getStoryDetail } from '../../data/api.js';
import { getAuthToken } from '../../data/authService.js';
import UrlParser from '../../routes/url-parser.js'; // Untuk mendapatkan ID dari URL

const DetailStoryPage = {
  map: null,
  marker: null,

  async render() {
    return `
      <div class="container detail-story-container py-4">
        <div id="storyDetailContent" class="story-detail-content">
          <div class="loading-spinner text-center my-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Memuat detail cerita...</span>
            </div>
            <p class="mt-2">Memuat detail cerita...</p>
          </div>
          </div>
        <div class="text-center mt-4">
            <a href="#home" class="btn btn-outline-secondary">
                <i class="fas fa-arrow-left"></i> Kembali ke Home
            </a>
        </div>
      </div>
    `;
  },

  async afterRender() {
    console.log('DetailStoryPage afterRender: Menjalankan afterRender...');
    const storyDetailContentElement = document.getElementById('storyDetailContent');
    
    // Bersihkan peta lama jika ada dari render sebelumnya
    if (this.map) {
        this.map.remove();
        this.map = null;
        this.marker = null;
    }

    const url = UrlParser.parseActiveUrlWithoutCombiner(); // Mendapatkan { resource, id, verb }
    let storyId = url.id; // ID cerita dari URL, misalnya 'story-FvU4u0Vp2S3PMsFg'
    console.log('DetailStoryPage afterRender: Story ID dari URL:', storyId);

    if (!storyId) {
      storyDetailContentElement.innerHTML = '<p class="alert alert-danger text-center">ID Cerita tidak valid atau tidak ditemukan di URL.</p>';
      return;
    }
    
    // Sanitasi storyId: Hapus karakter setelah ':' jika ada (jika ini menjadi masalah)
    // Baris ini ada di versi Canvas sebelumnya, Anda bisa uncomment jika diperlukan.
    // if (storyId.includes(':')) {
    //   const originalStoryId = storyId;
    //   storyId = storyId.split(':')[0];
    //   console.warn(`DetailStoryPage afterRender: Story ID "${originalStoryId}" dibersihkan menjadi "${storyId}"`);
    // }


    const token = getAuthToken();
    if (!token) {
      storyDetailContentElement.innerHTML = '<p class="alert alert-warning text-center">Anda harus login untuk melihat detail cerita. Mengarahkan ke halaman login...</p>';
      setTimeout(() => {
        if (window.location.hash !== '#login') window.location.hash = '#login';
      }, 1500);
      return;
    }

    try {
      const result = await getStoryDetail(token, storyId);
      console.log('DetailStoryPage afterRender: Data detail cerita diterima:', result);

      if (storyDetailContentElement) {
        if (result.error || !result.story) {
          storyDetailContentElement.innerHTML = `<p class="alert alert-danger text-center">Gagal memuat detail cerita: ${result.message || 'Cerita tidak ditemukan.'}</p>`;
        } else {
          const story = result.story;
          storyDetailContentElement.innerHTML = this.renderStoryDetailContent(story);
          // Inisialisasi peta jika cerita memiliki lokasi
          if (story.lat && story.lon) {
            // Beri sedikit waktu agar elemen peta ada di DOM
            setTimeout(() => this.initStoryDetailMap(story), 0);
          }
        }
      }
    } catch (error) {
      console.error(`DetailStoryPage afterRender: Error saat mengambil atau merender detail cerita untuk ID ${storyId}:`, error);
      if (storyDetailContentElement) storyDetailContentElement.innerHTML = '<p class="alert alert-danger text-center">Terjadi kesalahan saat memuat detail cerita.</p>';
    }
  },

  /**
   * Merender konten HTML spesifik untuk detail cerita.
   * @param {object} story - Objek detail cerita.
   * @returns {string} String HTML untuk konten detail cerita.
   */
  renderStoryDetailContent(story) {
    const storyDate = new Date(story.createdAt).toLocaleString('id-ID', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short'
    });
    const mapPlaceholderId = `detail-map-${story.id}`;
    const mapHtml = (story.lat && story.lon) ? 
      `<div class="mt-4">
         <h4>Lokasi Cerita:</h4>
         <div id="${mapPlaceholderId}" class="story-detail-map" style="height: 300px; width: 100%; border-radius: var(--border-radius);"></div>
       </div>` : 
      '<p class="text-muted mt-3"><em>Tidak ada informasi lokasi untuk cerita ini.</em></p>';

    return `
      <article class="story-detail card shadow-sm">
        <header class="card-header bg-light py-3">
            <h1 class="h4 mb-0">Detail Cerita oleh: ${story.name || 'Anonim'}</h1>
        </header>
        <figure class="story-detail-image-figure text-center mt-3">
          <img 
            src="${story.photoUrl}" 
            alt="Foto untuk cerita ${story.name}: ${story.description ? story.description.substring(0, 70) : 'Tanpa deskripsi'}..." 
            class="img-fluid rounded shadow-sm" 
            style="max-height: 500px; width: auto; max-width: 100%;"
            onerror="this.onerror=null;this.src='https://placehold.co/800x600/E0E0E0/757575?text=Gambar+Tidak+Tersedia';this.alt='Gambar tidak dapat dimuat';">
        </figure>
        <div class="card-body">
          <h2 class="h5 card-title sr-only">Deskripsi</h2> <p class="story-detail-description card-text" style="white-space: pre-wrap;">${story.description || 'Tidak ada deskripsi.'}</p>
          ${mapHtml}
          <p class="story-detail-date card-text mt-4 pt-3 border-top">
            <small class="text-muted">
              <i class="fas fa-calendar-alt me-1"></i> Diposting pada: ${storyDate}
            </small>
          </p>
        </div>
      </article>
    `;
  },

  /**
   * Menginisialisasi peta Leaflet untuk detail cerita.
   * @param {object} story - Objek cerita yang memiliki lat dan lon.
   */
  initStoryDetailMap(story) {
    const mapId = `detail-map-${story.id}`;
    const mapElement = document.getElementById(mapId);

    // Versi Anda: if (this.map || !mapElement)
    // Ini bisa menyebabkan masalah jika this.map ada tapi untuk elemen lain, dan mapElement tidak ditemukan
    // Lebih aman untuk mengecek apakah this.map ada DAN apakah itu untuk mapId yang sama,
    // atau jika mapElement tidak ditemukan.
    // Namun, untuk mengikuti kode Anda:
    if (this.map || !mapElement) { 
        if (this.map && this.map.getContainer().id !== mapId && mapElement) {
            // Jika this.map ada tapi bukan untuk mapId ini, dan mapElement ada, kita perlu re-init
            console.log(`Peta lama (${this.map.getContainer().id}) ada, tapi kita butuh ${mapId}. Meremove peta lama.`);
            this.map.remove();
            this.map = null;
            this.marker = null;
        } else if (this.map && this.map.getContainer().id === mapId) {
            console.log(`Peta detail untuk ${mapId} sudah ada, tidak re-inisialisasi.`);
            return;
        } else if (!mapElement) {
             console.error(`Elemen peta ${mapId} tidak ditemukan untuk detail cerita.`);
             return;
        }
    }
    
    if (typeof L === 'undefined') {
        console.error('Leaflet.js (L) tidak terdefinisi. Pastikan sudah di-load di index.html.');
        if (mapElement) mapElement.innerHTML = '<p class="text-danger text-center">Pustaka peta gagal dimuat.</p>';
        return;
    }

    try {
      console.log(`DetailStoryPage initStoryDetailMap: Menginisialisasi peta untuk story ID ${story.id} di elemen ${mapId}`);
      const storyLat = parseFloat(story.lat);
      const storyLon = parseFloat(story.lon);

      if (isNaN(storyLat) || isNaN(storyLon)) {
          console.error(`Koordinat tidak valid untuk detail story ID ${story.id}: Lat=${story.lat}, Lon=${story.lon}`);
          if (mapElement) mapElement.innerHTML = '<p class="text-muted text-center small">Data lokasi tidak valid.</p>';
          return;
      }
      const storyCoords = [storyLat, storyLon];

      this.map = L.map(mapId, {
          scrollWheelZoom: true, 
          dragging: true,
          tap: true,
      }).setView(storyCoords, 16);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(this.map);

      this.marker = L.marker(storyCoords, {
          icon: L.icon({
              iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
              shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
              iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
          })
      }).addTo(this.map)
        .bindPopup(`<b>${story.name || 'Cerita'}</b><br>${story.description ? story.description.substring(0, 50) : 'Lokasi cerita'}...`)
        .openPopup();

      console.log(`Peta detail untuk ${mapId} berhasil diinisialisasi.`);
    } catch (error) {
        console.error(`Gagal menginisialisasi peta detail untuk story ID ${story.id}:`, error);
        if (mapElement) {
            mapElement.innerHTML = '<p class="text-muted text-center small">Peta tidak dapat dimuat.</p>';
        }
    }
  },
  
  async beforeUnload() {
    console.log('DetailStoryPage beforeUnload: Membersihkan peta detail...');
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.marker = null;
      console.log('Peta detail telah dihapus.');
    }
  }
};

export default DetailStoryPage;
