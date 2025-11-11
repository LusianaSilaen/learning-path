import { addStory } from '../../data/api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Perbaikan ikon Leaflet untuk bundler
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

export default class AddPage {
  #map = null;
  #marker = null;
  #mediaStream = null;

  async render() {
    return `
      <section class="container" aria-labelledby="add-title">
        <h1 id="add-title" class="page-title">Tambah Cerita Baru</h1>

        <form id="addStoryForm" class="story-form" novalidate>
          <div class="form-grid">

            <section class="form-card" aria-labelledby="info-title">
              <h2 id="info-title" class="card-title">Informasi Cerita</h2>

              <!-- Judul opsional (hanya untuk tampilan) -->
              <div class="form-group">
                <label for="title">Judul</label>
                <input type="text" id="title" name="title" placeholder="Misal: Sunrise di Bromo" aria-describedby="titleHelp" />
                <small id="titleHelp" class="help">Opsional. API tidak membutuhkan judul.</small>
                <p class="error" data-error-for="title"></p>
              </div>

              <div class="form-group">
                <label for="description">Deskripsi <span aria-hidden="true">*</span></label>
                <textarea id="description" name="description" rows="5" required placeholder="Ceritakan momenmu di sini..." aria-describedby="descHelp"></textarea>
                <small id="descHelp" class="help">Minimal 10 karakter.</small>
                <p class="error" data-error-for="description"></p>
              </div>

              <div class="form-group">
                <label for="image">Gambar <span aria-hidden="true">*</span></label>

                <div id="dropzone" class="dropzone" tabindex="0" aria-label="Dropzone unggah gambar (klik atau seret)">
                  <input type="file" id="image" name="image" accept="image/*" class="sr-only" required />
                  <div class="dz-internal">
                    <p>Tarik & lepas gambar ke sini, atau <button type="button" id="pickFileBtn" class="link-btn">pilih file</button></p>
                    <p class="dz-note">Maks 5MB. Format: JPG/PNG.</p>
                  </div>
                </div>

                <div class="preview-wrap">
                  <img id="imagePreview" alt="Pratinjau gambar" class="img-preview" />
                </div>

                <div class="camera-row">
                  <button type="button" id="openCameraBtn" class="btn secondary">Buka Kamera</button>
                  <button type="button" id="captureBtn" class="btn" disabled>Ambil Foto</button>
                  <button type="button" id="closeCameraBtn" class="btn danger" disabled>Tutup Kamera</button>
                </div>
                <video id="cameraView" class="camera-view" autoplay playsinline></video>

                <p class="error" data-error-for="image"></p>
              </div>
            </section>

            <section class="form-card" aria-labelledby="location-title">
              <h2 id="location-title" class="card-title">Lokasi</h2>

              <div class="map-actions">
                <button type="button" id="useMyLocationBtn" class="btn">Gunakan Lokasi Saya</button>
                <span class="hint">Atau klik pada peta untuk memilih titik.</span>
              </div>

              <div id="map" class="map-add" style="height:50vh;"></div>

              <div class="form-row">
                <div class="form-group">
                  <label for="lat">Latitude <span aria-hidden="true">*</span></label>
                  <input type="number" step="any" id="lat" name="lat" required placeholder="-6.2" inputmode="decimal" />
                  <p class="error" data-error-for="lat"></p>
                </div>
                <div class="form-group">
                  <label for="lon">Longitude <span aria-hidden="true">*</span></label>
                  <input type="number" step="any" id="lon" name="lon" required placeholder="106.8" inputmode="decimal" />
                  <p class="error" data-error-for="lon"></p>
                </div>
              </div>
            </section>

          </div>

          <div class="form-footer">
            <div id="formStatus" class="sr-only" aria-live="polite"></div>
            <button id="submitBtn" type="submit" class="btn primary">Kirim Cerita</button>
          </div>
        </form>
      </section>
    `;
  }

  async afterRender() {
    // --- PETA ---
    this.#map = L.map('map').setView([-2.5, 118], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
    }).addTo(this.#map);

    // klik peta -> set marker + isi lat/lon
    this.#map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      this.#placeMarker(lat, lng);
      this.#setLatLonInputs(lat, lng);
    });

    // tombol Gunakan Lokasi Saya
    document.querySelector('#useMyLocationBtn').addEventListener('click', async () => {
      try {
        const pos = await new Promise((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true }),
        );
        const { latitude, longitude } = pos.coords;
        this.#map.setView([latitude, longitude], 14);
        this.#placeMarker(latitude, longitude);
        this.#setLatLonInputs(latitude, longitude);
      } catch {
        alert('Tidak dapat mengakses lokasi. Pastikan izin lokasi diaktifkan.');
      }
    });

    // --- DROPZONE & PREVIEW ---
    const dropzone = document.querySelector('#dropzone');
    const fileInput = document.querySelector('#image');
    const pickBtn = document.querySelector('#pickFileBtn');
    const preview = document.querySelector('#imagePreview');

    const handleFiles = (files) => {
      const file = files?.[0];
      if (!file) return;

      if (!/image\/(png|jpg|jpeg)/i.test(file.type)) {
        this.#setError('image', 'Format harus JPG/PNG.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.#setError('image', 'Ukuran maksimal 5MB.');
        return;
      }
      this.#clearError('image');
      const url = URL.createObjectURL(file);
      preview.src = url;
      preview.style.display = 'block';
      fileInput.files = files; // simpan file ke input
    };

    pickBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

    ['dragenter', 'dragover'].forEach((evt) =>
      dropzone.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('dragover');
      }),
    );

    ['dragleave', 'drop'].forEach((evt) =>
      dropzone.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('dragover');
      }),
    );

    dropzone.addEventListener('drop', (e) => {
      if (e.dataTransfer?.files?.length) handleFiles(e.dataTransfer.files);
    });

    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') fileInput.click();
    });

    // --- KAMERA (getUserMedia) ---
    const openBtn = document.querySelector('#openCameraBtn');
    const captureBtn = document.querySelector('#captureBtn');
    const closeBtn = document.querySelector('#closeCameraBtn');
    const video = document.querySelector('#cameraView');

    openBtn.addEventListener('click', async () => {
      try {
        this.#mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        video.srcObject = this.#mediaStream;
        video.style.display = 'block';
        captureBtn.disabled = false;
        closeBtn.disabled = false;
      } catch {
        alert('Tidak bisa membuka kamera. Coba dari perangkat lain atau cek izin kamera.');
      }
    });

    captureBtn.addEventListener('click', async () => {
      if (!this.#mediaStream) return;
      const track = this.#mediaStream.getVideoTracks()[0];
      const settings = track.getSettings();
      const canvas = document.createElement('canvas');
      canvas.width = settings.width || 640;
      canvas.height = settings.height || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;

        preview.src = URL.createObjectURL(file);
        preview.style.display = 'block';
        this.#clearError('image');
      }, 'image/jpeg', 0.9);
    });

    closeBtn.addEventListener('click', () => this.#stopCamera(video, captureBtn, closeBtn));
    window.addEventListener('hashchange', () => this.#stopCamera(video, captureBtn, closeBtn), { once: true });

    // --- VALIDASI ---
    const descEl = document.querySelector('#description');
    const latEl = document.querySelector('#lat');
    const lonEl = document.querySelector('#lon');

    const checkText = (el, min, field) => {
      if (el.value.trim().length < min) {
        this.#setError(field, `Minimal ${min} karakter.`);
        return false;
      }
      this.#clearError(field);
      return true;
    };

    const checkCoord = (val, min, max, field) => {
      const num = Number(val);
      if (Number.isNaN(num) || num < min || num > max) {
        this.#setError(field, `Harus di antara ${min} s/d ${max}.`);
        return false;
      }
      this.#clearError(field);
      return true;
    };

    descEl.addEventListener('input', () => checkText(descEl, 10, 'description'));
    latEl.addEventListener('input', () => checkCoord(latEl.value, -90, 90, 'lat'));
    lonEl.addEventListener('input', () => checkCoord(lonEl.value, -180, 180, 'lon'));

    // --- SUBMIT ---
    const form = document.querySelector('#addStoryForm');
    const status = document.querySelector('#formStatus');
    const submitBtn = document.querySelector('#submitBtn');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const imageInputEl = document.querySelector('#image');
      const valid =
        checkText(descEl, 10, 'description') &&
        imageInputEl.files?.[0] &&
        checkCoord(latEl.value, -90, 90, 'lat') &&
        checkCoord(lonEl.value, -180, 180, 'lon');

      if (!valid) {
        if (!imageInputEl.files?.[0]) this.#setError('image', 'Gambar wajib diisi.');
        status.textContent = 'Periksa kembali isian kamu.';
        return;
      }

      const payload = {
        description: descEl.value.trim(),
        imageFile: imageInputEl.files[0], // dikirim sebagai "photo" oleh addStory()
        lat: parseFloat(latEl.value),
        lon: parseFloat(lonEl.value),
      };

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Mengirim...';
        status.textContent = 'Mengirim cerita...';

        const res = await addStory(payload);

        if (res?.error) {
          status.textContent = `Gagal: ${res.message || 'Terjadi kesalahan.'}`;
          alert(res.message || 'Gagal menambahkan cerita.');
          return;
        }

        status.textContent = 'Berhasil menambahkan cerita!';
        alert('Cerita berhasil ditambahkan 🎉');

        // view transition (kalau browser mendukung)
        if (document.startViewTransition) {
          document.startViewTransition(() => {
            window.location.hash = '#/';
          });
        } else {
          window.location.hash = '#/';
        }
      } catch {
        status.textContent = 'Gagal terhubung ke server.';
        alert('Terjadi kesalahan jaringan.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Kirim Cerita';
      }
    });
  }

  #placeMarker(lat, lon) {
    if (this.#marker) this.#map.removeLayer(this.#marker);
    this.#marker = L.marker([lat, lon]).addTo(this.#map);
  }

  #setLatLonInputs(lat, lon) {
    document.querySelector('#lat').value = lat.toFixed(6);
    document.querySelector('#lon').value = lon.toFixed(6);
  }

  #stopCamera(videoEl, captureBtn, closeBtn) {
    if (this.#mediaStream) {
      this.#mediaStream.getTracks().forEach((t) => t.stop());
      this.#mediaStream = null;
    }
    if (videoEl) videoEl.style.display = 'none';
    if (captureBtn) captureBtn.disabled = true;
    if (closeBtn) closeBtn.disabled = true;
  }

  #setError(field, msg) {
    const el = document.querySelector(`[data-error-for="${field}"]`);
    if (el) el.textContent = msg || '';
  }
  #clearError(field) { this.#setError(field, ''); }
}
