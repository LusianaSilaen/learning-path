import { registerUser } from '../../data/api';
import { setToken } from '../../utils/auth';

export default class RegisterPage {
  async render() {
    return `
      <section class="auth-container">
        <div class="auth-card">
          <h1 class="auth-title">Buat Akun Baru</h1>
          <p class="auth-subtitle">Daftar untuk mulai menggunakan aplikasi</p>

          <form id="registerForm" class="auth-form">
            <div class="auth-group">
              <label for="name">Nama</label>
              <input type="text" id="name" name="name" required placeholder="Nama lengkap kamu" />
            </div>

            <div class="auth-group">
              <label for="email">Email</label>
              <input type="email" id="email" name="email" required placeholder="nama@email.com" />
            </div>

            <div class="auth-group">
              <label for="password">Password</label>
              <input type="password" id="password" name="password" required placeholder="••••••••" />
            </div>

            <div class="auth-group">
              <label for="confirmPassword">Konfirmasi Password</label>
              <input type="password" id="confirmPassword" name="confirmPassword" required placeholder="••••••••" />
            </div>

            <button class="auth-button" type="submit">Daftar</button>
          </form>

          <p class="auth-link">Sudah punya akun? <a href="#/login">Masuk</a></p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const form = document.getElementById('registerForm');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const password = form.password.value;
      const confirmPassword = form.confirmPassword.value;

      if (!name || !email || !password || !confirmPassword) {
        alert('Semua field wajib diisi.');
        return;
      }

      if (password !== confirmPassword) {
        alert('Password dan konfirmasi password tidak sama.');
        return;
      }

      const result = await registerUser({ name, email, password });

      if (result.error) {
        alert(result.message || 'Pendaftaran gagal.');
        return;
      }

      // misal API juga balikin token
      const token = result?.loginResult?.token;
      if (token) {
        setToken(token);
      }

      alert('Pendaftaran berhasil!');
      location.hash = '#/login';
    });
  }
}
