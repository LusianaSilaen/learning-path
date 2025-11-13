import { saveStory } from '../../utils/indexedDB';
import { getStories } from '../../data/api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// fix path untuk icon leaflet (karena webpack tidak otomatis memuatnya)
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

export default class HomePage {
  async render() {
    return `
      <section class="container">
        <h1>Berbagi Cerita</h1>
        <div id="map" style="height: 70vh; margin-bottom: 20px;"></div>
        <div id="story-list" class="story-list" aria-live="polite"></div>
      </section>
    `;
  }

  async afterRender() {
    // Inisialisasi peta
    const map = L.map('map').setView([-2.5, 118], 5); // posisi awal Indonesia
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
    }).addTo(map);

    try {
      // Ambil data cerita
      const response = await getStories();
      console.log('API Response:', response);

      // Pastikan bentuknya array
      const stories = Array.isArray(response)
        ? response
        : Array.isArray(response.listStory)
        ? response.listStory
        : [];

      const storyList = document.getElementById('story-list');

      if (stories.length === 0) {
        storyList.innerHTML = '<p>Tidak ada cerita untuk ditampilkan.</p>';
        console.warn('No stories found.');
        return;
      }

      // Tambahkan marker ke peta dan tampilkan di list
      storyList.innerHTML = stories
        .map((story) => {
          const title = story.name || 'Cerita tanpa judul';

          if (story.lat && story.lon) {
            L.marker([story.lat, story.lon])
              .addTo(map)
              .bindPopup(`
                <strong>${title}</strong><br>
                ${story.description || ''}
              `);
          }

          return `
            <article class="story-item" style="border-bottom:1px solid #ccc; padding:10px 0;">
              ${story.photoUrl
                ? `<img src="${story.photoUrl}" alt="${title}" style="width:100%; max-width:300px; border-radius:8px;"/>`
                : ''
              }
              <h2>${title}</h2>
              <p>${story.description || ''}</p>
              <small>${new Date(story.createdAt).toLocaleString()}</small>
              <button class="save-btn" data-id="${story.id}">Simpan</button>
            </article>
          `;
        })
        .join('');

      // Tambahkan event listener untuk tombol Simpan
      document.querySelectorAll('.save-btn').forEach(button => {
        button.addEventListener('click', (e) => {
          const storyId = e.target.dataset.id;
          const storyToSave = stories.find(story => story.id === storyId);
          saveStory(storyToSave); // Menyimpan cerita ke IndexedDB
          alert('Cerita berhasil disimpan!');

          // Redirect ke halaman saved-page setelah menyimpan cerita
          window.location.hash = '#/saved';  // Navigasi ke halaman saved
        });
      });

      console.log(`✅ ${stories.length} cerita berhasil dimuat.`);
    } catch (error) {
      console.error('❌ Error fetching stories:', error);
      alert('Terjadi kesalahan saat memuat cerita.');
    }
  }
}

const DefaultIcon = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;
