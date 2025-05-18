// src/scripts/pages/add-story/add-story-page.js

import { addNewStory } from '../../data/api.js';
import { getAuthToken } from '../../data/authService.js';

const AddStoryPage = {
  stream: null, // Untuk menyimpan stream kamera
  map: null, // Untuk menyimpan instance peta Leaflet
  marker: null, // Untuk menyimpan marker di peta

  async render() {
    return `
      <div class="container add-story-container py-4">
        <header class="text-center mb-4">
          <h2 class="h3">Buat Cerita Baru Anda</h2>
        </header>
        <form id="addStoryForm" novalidate>
          <div class="form-group mb-3">
            <label for="storyDescription" class="form-label">Deskripsi Cerita:</label>
            <textarea id="storyDescription" name="description" class="form-control" rows="4" required placeholder="Tuliskan cerita menarik Anda di sini..."></textarea>
            <p class="input-error-message" id="storyDescriptionError" aria-live="polite"></p>
          </div>

          <div class="form-group mb-3">
            <label for="storyPhoto" class="form-label">Foto Cerita:</label>
            <div class="photo-input-area">
                <button type="button" id="openCameraButton" class="btn btn-secondary mb-2">
                  <i class="fas fa-camera"></i> Buka Kamera
                </button>
                <div class="camera-feed my-2">
                    <video id="cameraPreview" class="camera-preview" autoplay playsinline style="display: none;"></video>
                    <canvas id="photoCanvas" style="display: none;"></canvas> 
                </div>
                <img id="photoPreview" src="#" alt="Pratinjau Foto" class="photo-preview mb-2" style="display: none;" />
                <input type="file" id="storyPhoto" name="photo" class="form-control" accept="image/jpeg, image/png, image/gif">
                <p class="input-error-message" id="storyPhotoError" aria-live="polite"></p>
                <small class="form-text text-muted">Anda bisa menggunakan kamera atau unggah file (JPG, PNG, GIF, maks 1MB).</small>
            </div>
          </div>
          
          <div class="form-group mb-3">
            <label class="form-label">Lokasi Cerita (Opsional):</label>
            <div id="mapPickerContainer" class="mb-2">
                <div id="mapPicker" style="height: 300px; width: 100%; border-radius: var(--border-radius); border: 1px solid var(--border-color);"></div>
            </div>
            <small class="form-text text-muted">Klik pada peta untuk memilih lokasi, atau biarkan kosong.</small>
          </div>

          <div class="row mb-3">
            <div class="form-group col-md-6">
              <label for="storyLat" class="form-label">Latitude:</label>
              <input type="number" step="any" id="storyLat" name="lat" class="form-control" readonly placeholder="Dipilih dari peta">
            </div>
            <div class="form-group col-md-6">
              <label for="storyLon" class="form-label">Longitude:</label>
              <input type="number" step="any" id="storyLon" name="lon" class="form-control" readonly placeholder="Dipilih dari peta">
            </div>
          </div>

          <div class="d-grid gap-2">
            <button type="submit" id="submitStoryButton" class="btn btn-primary btn-lg">
                <i class="fas fa-cloud-upload-alt"></i> Unggah Cerita
            </button>
          </div>
        </form>
        <p id="addStoryMessage" class="message mt-3" aria-live="polite"></p>
        <div class="text-center mt-3">
            <a href="#home" class="btn btn-link">Kembali ke Home</a>
        </div>
      </div>
    `;
  },

  async afterRender() {
    console.log('AddStoryPage afterRender: Menjalankan afterRender...');
    const addStoryForm = document.getElementById('addStoryForm');
    const submitStoryButton = document.getElementById('submitStoryButton');
    const descriptionInput = document.getElementById('storyDescription');
    const photoInput = document.getElementById('storyPhoto');
    const openCameraButton = document.getElementById('openCameraButton');
    const cameraPreview = document.getElementById('cameraPreview');
    const photoCanvas = document.getElementById('photoCanvas');
    const photoPreview = document.getElementById('photoPreview');
    const addStoryMessageElement = document.getElementById('addStoryMessage');
    const latInput = document.getElementById('storyLat');
    const lonInput = document.getElementById('storyLon');

    let capturedPhotoBlob = null;

    const _showInputError = (inputId, message) => {
        const errorElement = document.getElementById(`${inputId}Error`);
        const inputElement = document.getElementById(inputId);
        if (errorElement) errorElement.textContent = message;
        if (inputElement) {
            inputElement.classList.add('is-invalid');
            inputElement.setAttribute('aria-invalid', 'true');
            inputElement.setAttribute('aria-describedby', `${inputId}Error`);
        }
    };
    const _clearInputError = (inputId) => {
        const errorElement = document.getElementById(`${inputId}Error`);
        const inputElement = document.getElementById(inputId);
        if (errorElement) errorElement.textContent = '';
        if (inputElement) {
            inputElement.classList.remove('is-invalid');
            inputElement.removeAttribute('aria-invalid');
            inputElement.removeAttribute('aria-describedby');
        }
    };
    const _showGeneralMessage = (message, isError = false) => {
        if (addStoryMessageElement) {
            addStoryMessageElement.textContent = message;
            addStoryMessageElement.className = isError ? 'message error-message mt-3' : 'message success-message mt-3';
        }
    };
    const _clearGeneralMessages = () => {
        if (addStoryMessageElement) {
            addStoryMessageElement.textContent = '';
            addStoryMessageElement.className = 'message mt-3';
        }
    };

    this.initMap(latInput, lonInput);

    const stopCameraStream = () => {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            console.log('Stream kamera dihentikan.');
            this.stream = null;
            if(cameraPreview) cameraPreview.style.display = 'none';
            if(openCameraButton) openCameraButton.innerHTML = '<i class="fas fa-camera"></i> Buka Kamera';
        }
    };

    if (openCameraButton && cameraPreview && photoCanvas && photoPreview) {
        openCameraButton.addEventListener('click', async () => {
            if (this.stream) { 
                const context = photoCanvas.getContext('2d');
                photoCanvas.width = cameraPreview.videoWidth;
                photoCanvas.height = cameraPreview.videoHeight;
                context.drawImage(cameraPreview, 0, 0, photoCanvas.width, photoCanvas.height);
                
                photoCanvas.toBlob(blob => {
                    capturedPhotoBlob = blob;
                    photoPreview.src = URL.createObjectURL(blob);
                    photoPreview.style.display = 'block';
                    cameraPreview.style.display = 'none';
                    console.log('Foto diambil dari kamera.');
                    stopCameraStream(); 
                    if(photoInput) photoInput.value = ''; 
                }, 'image/jpeg', 0.9);

            } else { 
                _clearGeneralMessages();
                _clearInputError('storyPhoto');
                try {
                    this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
                    cameraPreview.srcObject = this.stream;
                    cameraPreview.style.display = 'block';
                    if(photoPreview) photoPreview.style.display = 'none'; 
                    capturedPhotoBlob = null; 
                    if(photoInput) photoInput.value = ''; 
                    openCameraButton.innerHTML = '<i class="fas fa-camera-retro"></i> Ambil Foto';
                    console.log('Kamera berhasil diakses.');
                } catch (err) {
                    console.error("Error mengakses kamera: ", err);
                    _showGeneralMessage("Tidak dapat mengakses kamera. Pastikan Anda memberikan izin.", true);
                    _showInputError('storyPhoto', 'Kamera tidak dapat diakses.');
                }
            }
        });
    }
    
    if (photoInput && photoPreview) {
        photoInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                stopCameraStream(); 
                capturedPhotoBlob = null; 
                const reader = new FileReader();
                reader.onload = (e) => {
                    photoPreview.src = e.target.result;
                    photoPreview.style.display = 'block';
                    cameraPreview.style.display = 'none';
                }
                reader.readAsDataURL(file);
            } else {
                if(photoPreview) {
                    photoPreview.style.display = 'none';
                    photoPreview.src = '#';
                }
            }
        });
    }

    if (addStoryForm) {
      addStoryForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        _clearGeneralMessages();
        _clearInputError('storyDescription');
        _clearInputError('storyPhoto');

        if (submitStoryButton) {
          submitStoryButton.disabled = true;
          submitStoryButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Mengunggah...';
        }

        const description = descriptionInput.value.trim();
        const photoFile = photoInput.files[0];
        const latValue = latInput.value; // Ambil nilai dari input
        const lonValue = lonInput.value; // Ambil nilai dari input

        let isValid = true;
        if (!description) {
          _showInputError('storyDescription', 'Deskripsi tidak boleh kosong.');
          isValid = false;
        }
        if (!photoFile && !capturedPhotoBlob) {
          _showInputError('storyPhoto', 'Foto cerita wajib diunggah atau diambil dari kamera.');
          isValid = false;
        } else if (photoFile && photoFile.size > 1000000) {
            _showInputError('storyPhoto', 'Ukuran file foto maksimal 1MB.');
            isValid = false;
        } else if (capturedPhotoBlob && capturedPhotoBlob.size > 1000000) {
            _showInputError('storyPhoto', 'Ukuran foto dari kamera maksimal 1MB (coba lagi).');
            isValid = false;
        }

        if (!isValid) {
          _showGeneralMessage('Harap perbaiki error pada form.', true);
          if (submitStoryButton) {
            submitStoryButton.disabled = false;
            submitStoryButton.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Unggah Cerita';
          }
          return;
        }

        const token = getAuthToken();
        if (!token) {
          _showGeneralMessage('Sesi Anda telah berakhir. Silakan login kembali.', true);
          window.location.hash = '#login';
          return;
        }

        const formData = new FormData();
        formData.append('description', description);
        if (capturedPhotoBlob) {
            formData.append('photo', capturedPhotoBlob, 'photo-from-camera.jpg');
        } else if (photoFile) {
            formData.append('photo', photoFile);
        }
        
        // Pastikan latValue dan lonValue adalah string yang tidak kosong sebelum parseFloat
        if (latValue && latValue.trim() !== '' && !isNaN(parseFloat(latValue))) {
            formData.append('lat', parseFloat(latValue));
        }
        if (lonValue && lonValue.trim() !== '' && !isNaN(parseFloat(lonValue))) {
            formData.append('lon', parseFloat(lonValue));
        }

        console.log('Mengirim FormData detail:');
        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }
        
        try {
          const result = await addNewStory(token, formData);
          if (result.error) {
            _showGeneralMessage(result.message || 'Gagal menambahkan cerita.', true);
          } else {
            _showGeneralMessage('Cerita berhasil ditambahkan!', false);
            stopCameraStream();
            addStoryForm.reset(); // Reset form
            if(photoPreview) photoPreview.style.display = 'none'; // Sembunyikan preview
            if(this.marker) { // Hapus marker dari peta
                this.map.removeLayer(this.marker);
                this.marker = null;
            }
            // latInput dan lonInput akan di-reset oleh addStoryForm.reset() karena mereka bagian dari form

            setTimeout(() => {
              window.location.hash = '#home';
            }, 1500);
          }
        } catch (error) {
          console.error('Error saat menambahkan cerita:', error);
          _showGeneralMessage('Terjadi kesalahan saat menambahkan cerita. Coba lagi.', true);
        } finally {
          if (window.location.hash !== '#home' && submitStoryButton) {
            submitStoryButton.disabled = false;
            submitStoryButton.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Unggah Cerita';
          }
        }
      });
    }
    if(descriptionInput) descriptionInput.focus();
  },

  initMap(latInputElement, lonInputElement) {
    const mapContainer = document.getElementById('mapPicker');
    if (!mapContainer) {
        console.error('Elemen kontainer peta "mapPicker" tidak ditemukan.');
        return;
    }
    if (this.map) { // Jika peta sudah ada, hapus dulu
        this.map.remove();
        this.map = null;
        this.marker = null; // Pastikan marker juga di-reset
        console.log('Peta lama dihapus sebelum inisialisasi baru.');
    }

    console.log('AddStoryPage initMap: Menginisialisasi peta Leaflet...');
    const defaultCoords = [-6.2088, 106.8456]; 
    
    if (typeof L === 'undefined') {
        console.error('Leaflet.js (L) tidak terdefinisi. Pastikan sudah di-load di index.html.');
        mapContainer.innerHTML = '<p class="text-danger text-center">Pustaka peta gagal dimuat.</p>';
        return;
    }

    this.map = L.map('mapPicker', {
        // Opsi untuk meningkatkan pengalaman peta di dalam form
        scrollWheelZoom: true, // Izinkan zoom dengan scroll
        // dragging: true, // Defaultnya true
        // tap: true, // Defaultnya true
    }).setView(defaultCoords, 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(this.map);
    
    // Coba dapatkan lokasi pengguna saat ini untuk view awal peta
    // Hanya jika belum ada nilai di input lat/lon (misalnya, bukan dari edit atau kembali ke halaman)
    if (navigator.geolocation && !latInputElement.value && !lonInputElement.value) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords = [position.coords.latitude, position.coords.longitude];
          this.map.setView(userCoords, 13);
          console.log('Lokasi pengguna ditemukan dan peta diatur ke lokasi pengguna:', userCoords);
          // Jika ingin langsung menempatkan marker di lokasi pengguna:
          // if (latInputElement && lonInputElement) {
          //   latInputElement.value = userCoords[0].toFixed(6);
          //   lonInputElement.value = userCoords[1].toFixed(6);
          //   if (this.marker) this.map.removeLayer(this.marker);
          //   this.marker = L.marker(userCoords).addTo(this.map)
          //     .bindPopup(`Lokasi Anda Saat Ini`).openPopup();
          // }
        },
        (err) => {
          console.warn(`Geolocation error: ${err.message}. Menggunakan lokasi default.`);
        }
      );
    } else if (latInputElement.value && lonInputElement.value) {
        // Jika sudah ada nilai di input (misalnya saat kembali ke halaman ini atau edit)
        const initialLat = parseFloat(latInputElement.value);
        const initialLon = parseFloat(lonInputElement.value);
        if (!isNaN(initialLat) && !isNaN(initialLon)) {
            const initialCoords = [initialLat, initialLon];
            this.marker = L.marker(initialCoords).addTo(this.map)
                .bindPopup(`Lokasi Dipilih: <br>Lat: ${initialLat.toFixed(4)}, Lon: ${initialLon.toFixed(4)}`).openPopup();
            this.map.setView(initialCoords, 15);
            console.log('Peta diatur ke lokasi dari input yang sudah ada:', initialCoords);
        }
    }


    this.map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      if (latInputElement && lonInputElement) {
        latInputElement.value = lat.toFixed(6);
        lonInputElement.value = lng.toFixed(6);
        console.log(`Lokasi DIPILIH di peta: Lat: ${latInputElement.value}, Lon: ${lonInputElement.value}`);
      }

      if (this.marker) {
        this.map.removeLayer(this.marker);
      }
      this.marker = L.marker([lat, lng]).addTo(this.map)
        .bindPopup(`Lokasi Dipilih: <br>Lat: ${lat.toFixed(4)}, Lon: ${lng.toFixed(4)}`)
        .openPopup();
      this.map.panTo([lat, lng]);
    });
  },

  async beforeUnload() {
      if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop());
          console.log('AddStoryPage: Stream kamera dihentikan saat meninggalkan halaman.');
          this.stream = null;
      }
      if (this.map) {
          this.map.remove(); // Hapus instance peta Leaflet
          this.map = null;
          this.marker = null; // Pastikan marker juga di-reset
          console.log('AddStoryPage: Peta Leaflet dihapus.');
      }
  }
};

export default AddStoryPage;