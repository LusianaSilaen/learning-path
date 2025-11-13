// src/scripts/pages/saved/saved-page.js
import { getStories, deleteStory } from '../../utils/indexedDB';
import 'leaflet/dist/leaflet.css';

export default class SavedPage {
  async render() {
    return `
      <section class="container">
        <h1>Cerita Tersimpan</h1>
        <div id="saved-story-list" class="story-list"></div>
      </section>
    `;
  }

  async afterRender() {
    const savedStoryList = document.getElementById('saved-story-list');

    try {
      let stories = await getStories();
      if (!Array.isArray(stories)) stories = [];

      if (stories.length === 0) {
        savedStoryList.innerHTML = '<p>Tidak ada cerita yang tersimpan.</p>';
        return;
      }

      savedStoryList.innerHTML = stories
        .map((story) => `
          <article class="story-item" style="border-bottom:1px solid #ccc; padding:10px 0;">
            ${story.photoUrl
              ? `<img src="${story.photoUrl}" alt="${story.name || 'Cerita'}" style="width:100%; max-width:300px; border-radius:8px;"/>`
              : ''
            }
            <h2>${story.name || 'Cerita tanpa judul'}</h2>
            <p>${story.description || ''}</p>
            <small>${story.createdAt ? new Date(story.createdAt).toLocaleString() : ''}</small>
            <button data-delete="${story.id}" class="btn danger">Hapus</button>
          </article>
        `)
        .join('');

      stories.forEach((story) => {
        const btn = document.querySelector(`[data-delete="${story.id}"]`);
        if (!btn) return;
        btn.addEventListener('click', async () => {
          await deleteStory(story.id);
          alert('Cerita berhasil dihapus!');
          window.location.reload();
        });
      });
    } catch (error) {
      console.error('Error fetching stories from IndexedDB:', error);
      savedStoryList.innerHTML = '<p>Terjadi kesalahan saat memuat cerita tersimpan.</p>';
    }
  }
}
