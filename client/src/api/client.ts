import axios from 'axios';

export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

    // In production (e.g. client-xi-lac.vercel.app), ALWAYS route to real production backend
    if (!isLocalhost) {
      const envUrl = import.meta.env.VITE_API_URL;
      if (envUrl && envUrl.startsWith('https://')) {
        return envUrl;
      }
      return 'https://rsb-portal-server.vercel.app/api';
    }
  }

  // Local development
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
};

export const API_BASE_URL = getApiBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token and device identification
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rsb_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  let deviceId = localStorage.getItem('rsb_device_id');
  if (!deviceId) {
    deviceId = 'dev_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
    localStorage.setItem('rsb_device_id', deviceId);
  }
  config.headers['x-device-id'] = deviceId;

  return config;
});

// Response interceptor to handle session eviction (Max 2 devices)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (error.response?.data?.error?.code === 'SESSION_EVICTED' || error.response?.data?.message?.includes('another device')) {
        alert('আপনার অ্যাকাউন্টটি অন্য ডিভাইসে লগইন করার কারণে এই সেশনটি বন্ধ করা হয়েছে (সর্বোচ্চ ২টি ডিভাইস অনুমোদিত)।');
        localStorage.removeItem('rsb_token');
        localStorage.removeItem('rsb_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
