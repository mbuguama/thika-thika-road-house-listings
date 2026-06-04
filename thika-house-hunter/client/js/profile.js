const profileMessage = document.getElementById('profileMessage');
const refreshProfileBtn = document.getElementById('refreshProfileBtn');
const profileLogoutBtn = document.getElementById('profileLogoutBtn');

document.addEventListener('DOMContentLoaded', () => {
  loadProfile();
  loadSaved();
  loadRecent();
});

async function loadProfile() {
  const token = localStorage.getItem('token');

  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  try {
    const user = await window.ThikaApi.users.profile();
    localStorage.setItem('user', JSON.stringify(user));
    renderProfile(user);
  } catch (error) {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (storedUser.email) {
      renderProfile(storedUser);
      showProfileMessage('Showing saved profile details while the server reconnects.', 'error');
      return;
    }

    console.warn('Profile load error:', error.message);
    window.location.href = 'login.html';
  }
}

function showProfileMessage(message, type = 'success') {
  if (!profileMessage) return;
  profileMessage.innerHTML = message ? `<div class="form-${type}">${message}</div>` : '';
}

function roleLabel(role) {
  if (role === 'landlord') return 'Landlord';
  if (role === 'admin') return 'Admin';
  return 'Tenant';
}

function renderProfile(user) {
  const name = user.full_name || user.name || 'User';
  const role = user.role === 'user' ? 'renter' : user.role || 'renter';

  document.getElementById('userName').innerText = name;
  document.getElementById('userEmail').innerText = user.email || '';
  document.getElementById('nameInput').value = name;
  document.getElementById('emailInput').value = user.email || '';
  document.getElementById('roleInput').value = role === 'renter' ? 'user' : role;
  document.getElementById('avatarInitials').innerText = getInitials(name);

  const badge = document.getElementById('userRoleBadge');
  if (badge) {
    badge.textContent = roleLabel(role);
    badge.className = `status-badge role-${role}`;
  }
}

document.getElementById('profileForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const data = {
    full_name: document.getElementById('nameInput').value.trim(),
    email: document.getElementById('emailInput').value.trim(),
    role: document.getElementById('roleInput').value,
  };

  try {
    const user = await window.ThikaApi.users.updateProfile(data);
    localStorage.setItem('user', JSON.stringify(user));
    renderProfile(user);
    showProfileMessage('Profile updated successfully.');
  } catch (error) {
    showProfileMessage(error.message, 'error');
  }
});

function normaliseHomes(items) {
  return items
    .map((item) => item.property || item)
    .filter((home) => home && home.id && home.title);
}

function renderHomeLinks(container, homes, emptyCopy) {
  if (!container) return;

  if (!homes.length) {
    container.innerHTML = `<div class="empty-state"><h3>Nothing here yet</h3><p>${emptyCopy}</p></div>`;
    return;
  }

  container.innerHTML = homes.map((home) => `
    <a class="profile-home-card" href="property.html?id=${home.id}">
      <div class="profile-home-thumb">
        ${home.image || home.image_url ? `<img src="${home.image || home.image_url}" alt="${home.title}" />` : ''}
      </div>
      <div class="profile-home-body">
        <h3>${home.title}</h3>
        <p>${home.location || home.estate_name || 'Thika'}</p>
        <strong>KES ${Number(home.price || 0).toLocaleString()}</strong>
      </div>
    </a>
  `).join('');
}

async function loadSaved() {
  const container = document.getElementById('savedProperties');
  let saved = normaliseHomes(JSON.parse(localStorage.getItem('favorites') || '[]'));

  try {
    if (window.ThikaApi && localStorage.getItem('token')) {
      const response = await window.ThikaApi.favorites.list();
      saved = normaliseHomes(response.favorites || []);
    }
  } catch (error) {
    console.warn(error.message);
  }

  document.getElementById('savedCount').textContent = saved.length;
  renderHomeLinks(container, saved, 'Save homes from Explore and they will appear here.');
}

function loadRecent() {
  const container = document.getElementById('recentProperties');
  const recent = normaliseHomes(JSON.parse(localStorage.getItem('recent') || '[]'));

  document.getElementById('recentCount').textContent = recent.length;
  renderHomeLinks(container, recent, 'Open a few properties and they will appear here.');
}

async function logout() {
  try {
    if (window.ThikaApi) await window.ThikaApi.auth.logout();
  } catch (error) {
    console.warn(error.message);
  }

  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

if (refreshProfileBtn) {
  refreshProfileBtn.addEventListener('click', loadProfile);
}

if (profileLogoutBtn) {
  profileLogoutBtn.addEventListener('click', logout);
}
