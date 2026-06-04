const API_BASE = window.location.protocol === 'file:' ? 'http://localhost:5000/api' : '/api';

function getAuthToken() {
  return localStorage.getItem('token');
}

async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = getAuthToken();

  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...options,
    headers,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(data.message || 'Request failed.');
  }

  return data;
}

window.ThikaApi = {
  request: apiRequest,
  auth: {
    login: (payload) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
    register: (payload) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
    logout: () => apiRequest('/auth/logout', { method: 'POST' }),
    me: () => apiRequest('/auth/me'),
  },
  users: {
    profile: () => apiRequest('/users/profile'),
    updateProfile: (payload) => apiRequest('/users/profile', { method: 'PUT', body: JSON.stringify(payload) }),
  },
  properties: {
    list: (params = {}) => apiRequest(`/properties?${new URLSearchParams(params).toString()}`),
    get: (id) => apiRequest(`/properties/${id}`),
    create: (payload) => apiRequest('/properties', { method: 'POST', body: JSON.stringify(payload) }),
    update: (id, payload) => apiRequest(`/properties/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    report: (id, payload) => apiRequest(`/properties/${id}/reports`, { method: 'POST', body: JSON.stringify(payload) }),
  },
  favorites: {
    list: () => apiRequest('/favorites'),
    add: (propertyId) => apiRequest(`/favorites/${propertyId}`, { method: 'POST' }),
    remove: (propertyId) => apiRequest(`/favorites/${propertyId}`, { method: 'DELETE' }),
  },
  bookings: {
    list: () => apiRequest('/bookings'),
    create: (payload) => apiRequest('/bookings', { method: 'POST', body: JSON.stringify(payload) }),
  },
  reviews: {
    list: (propertyId) => apiRequest(`/reviews/property/${propertyId}`),
    create: (propertyId, payload) => apiRequest(`/reviews/property/${propertyId}`, { method: 'POST', body: JSON.stringify(payload) }),
  },
  contact: {
    create: (payload) => apiRequest('/contact', { method: 'POST', body: JSON.stringify(payload) }),
  },
  settings: {
    list: () => apiRequest('/settings'),
  },
  payments: {
    config: () => apiRequest('/payments/config'),
    list: () => apiRequest('/payments'),
    get: (id) => apiRequest(`/payments/${id}`),
    startMpesa: (payload) => apiRequest('/payments/mpesa/stk-push', { method: 'POST', body: JSON.stringify(payload) }),
    queryMpesa: (id) => apiRequest(`/payments/${id}/query`, { method: 'POST' }),
  },
  landlord: {
    dashboard: () => apiRequest('/landlord/dashboard'),
    submitVerification: (payload) => apiRequest('/landlord/verification', { method: 'POST', body: JSON.stringify(payload) }),
  },
  admin: {
    dashboard: () => apiRequest('/admin/dashboard'),
    users: (params = {}) => apiRequest(`/admin/users?${new URLSearchParams(params).toString()}`),
    properties: (params = {}) => apiRequest(`/admin/properties?${new URLSearchParams(params).toString()}`),
    verificationQueue: (params = {}) => apiRequest(`/admin/landlords/verification?${new URLSearchParams(params).toString()}`),
    updateVerification: (id, payload) => apiRequest(`/admin/landlords/${id}/verification`, { method: 'PATCH', body: JSON.stringify(payload) }),
    reports: (params = {}) => apiRequest(`/admin/reports?${new URLSearchParams(params).toString()}`),
    updateReport: (id, payload) => apiRequest(`/admin/reports/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
    ads: (params = {}) => apiRequest(`/admin/ads?${new URLSearchParams(params).toString()}`),
    createAd: (payload) => apiRequest('/admin/ads', { method: 'POST', body: JSON.stringify(payload) }),
    updateAd: (id, payload) => apiRequest(`/admin/ads/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
    createLocation: (payload) => apiRequest('/admin/locations', { method: 'POST', body: JSON.stringify(payload) }),
    createPropertyType: (payload) => apiRequest('/admin/property-types', { method: 'POST', body: JSON.stringify(payload) }),
    createBudgetRange: (payload) => apiRequest('/admin/budget-ranges', { method: 'POST', body: JSON.stringify(payload) }),
  },
};
