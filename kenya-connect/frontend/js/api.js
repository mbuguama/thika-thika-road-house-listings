const configuredApiBase = window.KENYA_CONNECT_API_BASE || localStorage.getItem('kenya_connect_api_base') || '';
const API_BASE = configuredApiBase || (window.location.protocol === 'file:' ? 'http://localhost:5100/api' : '/api');

function getToken() {
  return localStorage.getItem('kenya_connect_token') || '';
}

function setToken(token) {
  if (token) localStorage.setItem('kenya_connect_token', token);
}

function setCsrfToken(token) {
  if (token) localStorage.setItem('kenya_connect_csrf', token);
}

function clearToken() {
  localStorage.removeItem('kenya_connect_token');
  localStorage.removeItem('kenya_connect_csrf');
}

async function apiRequest(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(options.headers || {}),
  };
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const csrfToken = localStorage.getItem('kenya_connect_csrf');
  if (csrfToken) headers['X-CSRF-Token'] = csrfToken;

  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Request failed.');
  }
  return data;
}

function formToJson(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  if (data.interests) {
    data.interests = data.interests.split(',').map((item) => item.trim()).filter(Boolean);
  }
  return data;
}

window.KenyaConnect = {
  API_BASE,
  apiRequest,
  clearToken,
  formToJson,
  getToken,
  setCsrfToken,
  setToken,
};
