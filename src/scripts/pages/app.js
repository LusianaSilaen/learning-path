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
    this._requestPushNotificationPermission(); // Meminta izin push notification
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
    const nav = this.#navigationDrawer;
    if (!nav) return;

    const isAuth = isAuthenticated();
    nav.querySelectorAll('[data-guest]').forEach(el => el.style.display = isAuth ? 'none' : '');
    nav.querySelectorAll('[data-user]').forEach(el => el.style.display = isAuth ? '' : 'none');
  }

  async renderPage() {
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
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Izin untuk menerima notifikasi diberikan.');
        this._subscribeToPushNotifications(); // Subscribe ke push notifications
      } else {
        console.log('Izin notifikasi ditolak.');
      }
    }
  }

  // Mendaftar ke Push Notification dan kirim subscription ke server
async _subscribeToPushNotifications() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: 'BLAJ4T12fMTkNQtSVKfUExV1952sG7sX3Q3Lhg6-cpRLJS5TJpb8ONgNHz8o2G4Bp0JVJBW__SdvAZtgKNY498s', // Ganti dengan public VAPID key Anda
    });

    console.log('Berhasil subscribe ke push notification:', subscription);

    // Kirim subscription ke server untuk menyimpan data subscription
    this._sendSubscriptionToServer(subscription);
  } catch (error) {
    console.error('Gagal mendaftar ke push notification:', error);
  }
}


  // Kirim data subscription ke server API
  async _sendSubscriptionToServer(subscription) {
    const token = localStorage.getItem('token'); // Ambil token dari localStorage

    if (!token) {
      console.log('Token tidak ditemukan!');
      return;
    }

    const body = JSON.stringify({
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    });

    try {
      const response = await fetch('/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Kirim token di header
        },
        body: body,
      });

      const result = await response.json();

      if (result.error) {
        console.error('Gagal mengirim subscription:', result.message);
      } else {
        console.log('Berhasil mengirim subscription ke server:', result);
      }
    } catch (error) {
      console.error('Terjadi kesalahan saat mengirim subscription ke server:', error);
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
