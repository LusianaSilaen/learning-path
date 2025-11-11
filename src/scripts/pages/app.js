import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import { isAuthenticated, clearToken } from '../utils/auth';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this._setupDrawer();
    this._setupLogout();
    this._requestPushNotificationPermission();
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (!this.#navigationDrawer.contains(event.target) && !this.#drawerButton.contains(event.target)) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      });
    });
  }

  _setupLogout() {
    // Delegation: cari link dengan [data-logout]
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-logout]');
      if (target) {
        e.preventDefault();
        clearToken();
        alert('Kamu sudah logout.');
        location.hash = '#/login';
      }
    });
  }

  _updateAuthLinks() {
    // opsi: sembunyikan/ tampilkan link menu berdasarkan login
    const nav = this.#navigationDrawer;
    if (!nav) return;

    const isAuth = isAuthenticated();
    nav.querySelectorAll('[data-guest]').forEach(el => el.style.display = isAuth ? 'none' : '');
    nav.querySelectorAll('[data-user]').forEach(el => el.style.display = isAuth ? '' : 'none');
  }

  async renderPage() {
    // Guard halaman yang butuh login (stories & add membutuhkan token)
    const needAuthRoutes = ['/', '/add'];
    const url = getActiveRoute() || '/';
    if (needAuthRoutes.includes(url) && !isAuthenticated()) {
      location.hash = '#/login';
      return;
    }

    const page = routes[url] || routes['/'];
    this.#content.innerHTML = await page.render();
    this._updateAuthLinks();
    await page.afterRender?.();
  }

  // Meminta izin untuk Push Notification
  async _requestPushNotificationPermission() {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      // Meminta izin untuk menerima notifikasi
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        console.log('Izin untuk menerima notifikasi diberikan.');
        this._subscribeToPushNotifications();
      } else {
        console.log('Izin notifikasi ditolak.');
      }
    }
  }

  // Mendaftar ke Push Notification
  async _subscribeToPushNotifications() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: 'VAPID_PUBLIC_KEY', // Ganti dengan VAPID public key Anda
      });

      console.log('Berhasil subscribe ke push notification:', subscription);

      // Kirim subscription ke server untuk menyimpan data subscription
      // Bisa menggunakan fetch API atau library lain untuk menyimpan data subscription
      // Contoh kirim subscription ke server:
      // await fetch('/api/subscribe', { method: 'POST', body: JSON.stringify(subscription) });
    } catch (error) {
      console.error('Gagal mendaftar ke push notification:', error);
    }
  }
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')  // pastikan file ini terdaftar dengan benar
      .then(() => console.log('Service Worker registered successfully'))
      .catch((error) => console.log('Service Worker registration failed:', error));
  });
}

export default App;
