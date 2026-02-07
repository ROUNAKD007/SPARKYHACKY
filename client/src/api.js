const BASE_URL = 'http://localhost:5000';

export const getToken = () => localStorage.getItem('token');

export const setToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export const apiFetch = async (path, options = {}) => {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data?.error?.message || 'Request failed';
    const code = data?.error?.code || 'REQUEST_FAILED';
    const error = new Error(message);
    error.code = code;
    throw error;
  }

  return data;
};

export const register = (payload) =>
  apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const login = (payload) =>
  apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const getMe = () => apiFetch('/auth/me');
