// Fungsi untuk mendaftar ke Push Notification
export function subscribeToPushNotifications() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.pushManager
        .subscribe({
          userVisibleOnly: true,
          applicationServerKey: 'VAPID_PUBLIC_KEY', // Ganti dengan VAPID public key Anda
        })
        .then((subscription) => {
          console.log('Berhasil subscribe:', subscription);
          // Kirim subscription ke server untuk menyimpan data
        })
        .catch((err) => {
          console.error('Gagal subscribe:', err);
        });
    });
  }
}
  