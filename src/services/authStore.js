import { create } from 'zustand';
import api from './api';

const TOKEN_KEY = 'uv_token';
const USER_KEY = 'uv_user';

const readUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const persist = (token, user) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);

  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
};

export const useAuthStore = create((set) => ({
  token: localStorage.getItem(TOKEN_KEY) || null,
  user: readUser(),
  loading: false,
  error: null,

  login: async ({ university_email, password }) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', {
        university_email,
        password,
      });
      const token = data?.token;
      const user = data?.user ?? null;
      persist(token, user);
      set({ token, user, loading: false });
      return { ok: true, user };
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Giriş başarısız oldu';
      set({ loading: false, error: message });
      return { ok: false, error: message };
    }
  },

  register: async ({
    full_name,
    university_email,
    password,
    university,
    department,
  }) => {
    set({ loading: true, error: null });
    try {
      const payload = { full_name, university_email, password };
      if (university) payload.university = university;
      if (department) payload.department = department;

      const { data } = await api.post('/auth/register', payload);
      const token = data?.token;
      const user = data?.user ?? null;
      if (token) {
        persist(token, user);
        set({ token, user });
      }
      set({ loading: false });
      return { ok: true, user };
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Kayıt başarısız oldu';
      set({ loading: false, error: message });
      return { ok: false, error: message };
    }
  },

  logout: () => {
    persist(null, null);
    set({ token: null, user: null, error: null });
  },

  clearError: () => set({ error: null }),
}));
