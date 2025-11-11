import { loginUser } from '../../data/api';
import { setToken } from '../../utils/auth';

export default class LoginPage {
  async render() {
    return `
      <section class="auth-container">
        <div class="auth-card">
          <h1 class="auth-title">Selamat Datang Kembali</h1>
          <p class="auth-subtitle">Masuk untuk melanjutkan perjalananmu</p>

          <form id="loginForm" class="auth-form">
            <div class="auth-group">
              <label for="email">Email</label>
              <input type="email" id="email" name="email" required placeholder="nama@email.com" />
            </div>

            <div class="auth-group">
              <label for="password">Password</label>
              <input type="password" id="password" name="password" required placeholder="••••••••" />
            </div>

            <button class="auth-button" type="submit">Masuk</button>
          </form>

          <p class="auth-link">Belum punya akun? <a href="#/register">Daftar</a></p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const form = document.getElementById('loginForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = form.email.value.trim();
      const password = form.password.value;

      if (!email || !password) {
        alert('Email dan password wajib diisi.');
        return;
      }

      const result = await loginUser({ email, password });
      if (result.error) {
        alert(result.message || 'Login gagal.');
        return;
      }

      // API mengembalikan: { error:false, message:'success', loginResult:{ userId, name, token } }
      const token = result?.loginResult?.token;
      if (!token) {
        alert('Token tidak ditemukan dalam respons.');
        return;
      }

      setToken(token);
      alert('Login berhasil!');
      location.hash = '#/';
    });
  }
}
