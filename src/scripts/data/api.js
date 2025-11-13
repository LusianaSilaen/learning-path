import { getToken } from "../utils/auth";
import CONFIG from "../utils/config";

const ENDPOINTS = {
  LOGIN: `${CONFIG.BASE_URL}/login`,
  REGISTER: `${CONFIG.BASE_URL}/register`,
  STORIES: `${CONFIG.BASE_URL}/stories`,
  STORY_DETAIL: (id) => `${CONFIG.BASE_URL}/stories/${id}`,
  NOTIFICATIONS_SUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,  // URL endpoint untuk subscribe
};

// Fungsi untuk register user
export async function registerUser({ name, email, password }) {
  const res = await fetch(ENDPOINTS.REGISTER, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  return res.json();
}

// Fungsi untuk login user
export async function loginUser({ email, password }) {
  const res = await fetch(ENDPOINTS.LOGIN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

// Fungsi untuk mendapatkan daftar stories
export async function getStories({ page = 1, size = 10, location = 1 } = {}) {
  const token = getToken();
  const url = new URL(ENDPOINTS.STORIES);
  url.searchParams.set("page", page);
  url.searchParams.set("size", size);
  url.searchParams.set("location", location);

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

// Fungsi untuk menambahkan cerita baru
export async function addStory({ description, imageFile, lat, lon }) {
  const token = getToken();

  const formData = new FormData();
  formData.append("description", description);
  formData.append("photo", imageFile); // ✅ FIX
  formData.append("lat", lat);
  formData.append("lon", lon);

  const res = await fetch(ENDPOINTS.STORIES, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // ❌ JANGAN pakai Content-Type multipart manual,
      // formData akan mengatur boundary otomatis
    },
    body: formData,
  });

  return res.json();
}

// Fungsi untuk mendapatkan detail cerita
export async function getStoryDetail(id) {
  const token = getToken();
  const res = await fetch(ENDPOINTS.STORY_DETAIL(id), {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

// Fungsi untuk subscribe ke push notification
export async function subscribePushNotification(subscription) {
  const token = getToken();

  if (!token) {
    throw new Error('Token tidak ditemukan');
  }

  const { endpoint, keys } = subscription.toJSON();

  const body = JSON.stringify({
    endpoint,
    keys, // { p256dh, auth }
  });

  try {
    const response = await fetch(ENDPOINTS.NOTIFICATIONS_SUBSCRIBE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body,
    });

    const result = await response.json();

    if (result.error) {
      console.error('Error during subscription:', result.message);
      return;
    }

    console.log('Berhasil subscribe ke push notification:', result);
    return result;
  } catch (error) {
    console.error('Gagal mengirim subscription ke server:', error);
    throw error;
  }
}
