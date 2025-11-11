export default class AboutPage {
  async render() {
    return `
      <section class="container about-page">
        <h1 class="page-title">Tentang Aplikasi</h1>

        <article class="about-card">
          <h2>Apa itu StoryMaps?</h2>
          <p>
            <strong>StoryMaps</strong> adalah aplikasi sederhana berbasis SPA (Single Page Application) 
            yang memungkinkan pengguna untuk membagikan cerita disertai foto dan lokasi pada peta digital. 
            Aplikasi ini dibuat sebagai bagian dari tugas akhir kelas <em>Belajar Fundamental Front-End Web Development</em>.
          </p>
        </article>

        <article class="about-card">
          <h2>Fitur Utama</h2>
          <ul>
            <li>📍 Melihat daftar cerita dari API beserta lokasi pada peta.</li>
            <li>🗺️ Marker interaktif dan peta digital berbasis Leaflet.</li>
            <li>➕ Menambahkan cerita baru lengkap dengan foto, deskripsi, dan titik lokasi.</li>
            <li>📸 Mengunggah foto dari file atau langsung dari kamera.</li>
            <li>🔐 Login & Register untuk autentikasi pengguna.</li>
            <li>⚡ Navigasi cepat tanpa reload (SPA + View Transition).</li>
          </ul>
        </article>

        <article class="about-card">
          <h2>Tujuan Pengembangan</h2>
          <p>
            Aplikasi ini bertujuan untuk memberikan pengalaman dalam:
          </p>
          <ul>
            <li>Menerapkan arsitektur SPA dan routing berbasis hash.</li>
            <li>Mengelola data dari API menggunakan fetch.</li>
            <li>Memvisualisasikan lokasi pada peta digital.</li>
            <li>Mengimplementasikan aksesibilitas yang baik melalui HTML semantik.</li>
            <li>Menerapkan form validation dan upload file.</li>
          </ul>
        </article>

        <article class="about-card">
          <h2>Teknologi yang Digunakan</h2>
          <ul>
            <li>⚙️ HTML5, CSS3, JavaScript</li>
            <li>🗺️ Leaflet.js untuk peta</li>
            <li>📦 Webpack untuk bundling</li>
            <li>🔐 Story API dari Dicoding</li>
          </ul>
        </article>

        <footer class="about-footer">
          <p>Dibuat dengan ❤️ oleh <strong>lusianasilaen0404</strong>.</p>
        </footer>
      </section>
    `;
  }

  async afterRender() {
    // tidak perlu logic tambahan untuk halaman statis
  }
}
