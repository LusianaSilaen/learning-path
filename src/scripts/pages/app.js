import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import { isAuthenticated, clearToken } from '../utils/auth';
import { subscribePushNotification } from '../data/api'; // ⬅️ IMPORT fungsi API

// Helper untuk konversi VAPID key (WAJIB untuk PushManager.subscribe)
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// ⬅️ pakai VAPID public key kamu di sini (punya kamu sendiri sudah oke)
const VAPID_PUBLIC_KEY = 'BLAJ4T12fMTkNQtSVKfUExV1952sG7sX3Q3Lhg6-cpRLJS5TJpb8ONgNHz8o2G4Bp0JVJBW__SdvAZtgKNY498s';

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
    nav.querySelectorAll('[data-guest]').forEach((el) => { el.style.display = isAuth ? 'none' : ''; });
    nav.querySelectorAll('[data-user]').forEach((el) => { el.style.display = isAuth ? '' : 'none'; });
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
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      console.log('Browser tidak mendukung Notification atau Service Worker');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Izin untuk menerima notifikasi diberikan.');
        this._subscribeToPushNotifications();
      } else {
        console.log('Izin notifikasi ditolak.');
      }
    } catch (error) {
      console.error('Gagal meminta izin notifikasi:', error);
    }
  }

  // Mendaftar ke Push Notification dan kirim subscription ke server
  async _subscribeToPushNotifications() {
    try {
      const registration = await navigator.serviceWorker.ready;

      // Cek dulu apakah sudah pernah subscribe
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }

      console.log('Berhasil subscribe ke push notification:', subscription);

      // Kirim subscription ke server lewat API yang sudah kamu buat
      await subscribePushNotification(subscription);
      console.log('Subscription berhasil dikirim ke server');
    } catch (error) {
      console.error('Gagal mendaftar ke push notification:', error);
    }
  }
}

// ✅ Registrasi service worker (pastikan path-nya sama dengan hasil build)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js') // file ini biasanya dicopy dari src/public ke root dist/docs
      .then((registration) => {
        console.log('Service Worker registered successfully', registration.scope);
      })
      .catch((error) => console.log('Service Worker registration failed:', error));
  });
}

export default App;
