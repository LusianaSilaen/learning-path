// src/scripts/utils/pushNotification.js
import { subscribePushNotification } from '../data/api'; // ⬅️ tambah impor ke API

// helper standar untuk VAPID key (kalau belum ada)
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

const VAPID_PUBLIC_KEY = 'VAPID_PUBLIC_KEY'; 
// ⬆️ Ganti string ini dengan VAPID public key (format base64 dari Dicoding)

export function subscribeToPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notification tidak didukung di browser ini');
    return;
  }

  navigator.serviceWorker.ready.then(async (registration) => {
    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      console.log('Berhasil subscribe:', subscription);

      // ⬇️ INI BAGIAN PENTING YANG TADINYA KOMENTAR
      await subscribePushNotification(subscription);
      console.log('Subscription berhasil dikirim ke server');
    } catch (err) {
      console.error('Gagal subscribe:', err);
    }
  });
}
