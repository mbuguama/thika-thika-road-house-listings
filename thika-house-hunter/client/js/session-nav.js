function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch (error) {
    return {};
  }
}

function dashboardHrefForRole(role) {
  if (role === 'admin') return 'admin-dashboard.html';
  if (role === 'landlord') return 'landlord-dashboard.html';
  return 'profile.html';
}

function dashboardLabelForRole(role) {
  if (role === 'admin') return 'Admin';
  if (role === 'landlord') return 'Dashboard';
  return 'Profile';
}

async function signOutCurrentUser() {
  try {
    if (window.ThikaApi?.auth?.logout) {
      await window.ThikaApi.auth.logout();
    }
  } catch (error) {
    console.warn(error.message);
  }

  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

function renderSessionNav() {
  const cta = document.querySelector('.header-cta');
  const token = localStorage.getItem('token');

  if (!cta || !token) return;

  const user = getStoredUser();
  const role = user.role || 'renter';

  cta.innerHTML = `
    <a href="${dashboardHrefForRole(role)}" class="button button-secondary">${dashboardLabelForRole(role)}</a>
    <button type="button" class="button button-primary" id="session-sign-out">Sign Out</button>
  `;

  document.getElementById('session-sign-out')?.addEventListener('click', signOutCurrentUser);
}

document.addEventListener('DOMContentLoaded', renderSessionNav);
