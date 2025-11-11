import { getToken } from "../utils/auth";
import CONFIG from "../utils/config";

const ENDPOINTS = {
  LOGIN: `${CONFIG.BASE_URL}/login`,
  REGISTER: `${CONFIG.BASE_URL}/register`,
  STORIES: `${CONFIG.BASE_URL}/stories`,
  STORY_DETAIL: (id) => `${CONFIG.BASE_URL}/stories/${id}`,
};

export async function registerUser({ name, email, password }) {
  const res = await fetch(ENDPOINTS.REGISTER, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  return res.json();
}

export async function loginUser({ email, password }) {
  const res = await fetch(ENDPOINTS.LOGIN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

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

export async function getStoryDetail(id) {
  const token = getToken();
  const res = await fetch(ENDPOINTS.STORY_DETAIL(id), {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}
