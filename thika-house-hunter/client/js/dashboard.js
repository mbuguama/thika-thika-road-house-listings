const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebar = document.getElementById('admin-sidebar');
const adminMessage = document.getElementById('admin-message');
const adminUsersBody = document.getElementById('admin-users-body');
const adminPropertiesBody = document.getElementById('admin-properties-body');
const adminVerificationBody = document.getElementById('admin-verification-body');
const adminReportsBody = document.getElementById('admin-reports-body');
const adminLogoutBtn = document.getElementById('admin-logout-btn');
const locationSettingsForm = document.getElementById('location-settings-form');
const propertyTypeSettingsForm = document.getElementById('property-type-settings-form');
const budgetSettingsForm = document.getElementById('budget-settings-form');
const adCampaignForm = document.getElementById('ad-campaign-form');
const adminLocationsList = document.getElementById('admin-locations-list');
const adminPropertyTypesList = document.getElementById('admin-property-types-list');
const adminBudgetsList = document.getElementById('admin-budgets-list');
const adminAdsBody = document.getElementById('admin-ads-body');

let currentUserRoleFilter = '';
let currentPropertyStatusFilter = 'all';

function showAdminMessage(message, type = 'success') {
  if (!adminMessage) return;
  adminMessage.innerHTML = message ? `<div class="form-${type}">${message}</div>` : '';
}

function requireAdminSession() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    showAdminMessage('Please sign in as an admin to view this dashboard.', 'error');
    return false;
  }

  if (user.role !== 'admin') {
    showAdminMessage('This dashboard is restricted to admin accounts.', 'error');
    return false;
  }

  return true;
}

function roleLabel(role) {
  if (role === 'renter') return 'Tenant';
  if (role === 'landlord') return 'Landlord';
  return role || 'User';
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
}

function renderSummary(summary = {}) {
  document.getElementById('admin-users-count').textContent = summary.users ?? 0;
  document.getElementById('admin-properties-count').textContent = summary.properties ?? 0;
  document.getElementById('admin-bookings-count').textContent = summary.bookings ?? 0;
  document.getElementById('admin-pending-count').textContent = summary.pending_properties ?? 0;
  document.getElementById('admin-landlord-verifications-count').textContent = summary.pending_landlords ?? 0;
  document.getElementById('admin-reports-count').textContent = summary.open_reports ?? 0;
  const adsCount = document.getElementById('admin-ads-count');
  if (adsCount) adsCount.textContent = summary.active_ads ?? 0;
}

function renderUsers(users = []) {
  if (!adminUsersBody) return;

  if (!users.length) {
    adminUsersBody.innerHTML = '<tr><td colspan="5">No users found.</td></tr>';
    return;
  }

  adminUsersBody.innerHTML = users.map((user) => `
    <tr>
      <td data-label="Name"><strong>${user.full_name || user.name || 'User'}</strong></td>
      <td data-label="Email">${user.email}</td>
      <td data-label="Role"><span class="status-badge role-${user.role}">${roleLabel(user.role)}</span></td>
      <td data-label="Joined">${formatDate(user.created_at)}</td>
      <td data-label="Actions" class="table-actions">
        <button class="button button-secondary" onclick="deleteUser('${user.id}')">Remove</button>
      </td>
    </tr>
  `).join('');
}

function renderProperties(properties = []) {
  if (!adminPropertiesBody) return;

  if (!properties.length) {
    adminPropertiesBody.innerHTML = '<tr><td colspan="6">No listings found.</td></tr>';
    return;
  }

  adminPropertiesBody.innerHTML = properties.map((property) => `
    <tr>
      <td data-label="Listing"><strong>${property.title}</strong></td>
      <td data-label="Landlord">${property.landlord_name || '-'}</td>
      <td data-label="Location">${property.location || property.estate_name || 'Thika'}</td>
      <td data-label="Price">KES ${Number(property.price || 0).toLocaleString()}</td>
      <td data-label="Status"><span class="status-badge status-${property.status}">${property.status}</span></td>
      <td data-label="Actions" class="table-actions">
        <a class="button button-secondary" href="property.html?id=${property.id}">View</a>
        ${property.duplicate_warning ? '<span class="warning-text">Possible duplicate</span>' : ''}
        ${property.status === 'pending' ? `<button class="button button-primary" onclick="approveProperty('${property.id}')">Approve</button>` : ''}
        ${property.status !== 'inactive' ? `<button class="button button-secondary" onclick="deactivateProperty('${property.id}')">Deactivate</button>` : ''}
      </td>
    </tr>
  `).join('');
}

function renderVerificationQueue(users = []) {
  if (!adminVerificationBody) return;

  if (!users.length) {
    adminVerificationBody.innerHTML = '<tr><td colspan="5">No landlord verification requests.</td></tr>';
    return;
  }

  adminVerificationBody.innerHTML = users.map((user) => `
    <tr>
      <td data-label="Landlord"><strong>${user.full_name || user.name}</strong><br><small>${user.email}</small></td>
      <td data-label="Phone">${user.phone || '-'}</td>
      <td data-label="ID number">${user.id_number || '-'}</td>
      <td data-label="Status"><span class="status-badge status-pending">${user.landlord_verification_status}</span></td>
      <td data-label="Actions" class="table-actions">
        <button class="button button-primary" onclick="updateVerification('${user.id}', 'approved')">Approve</button>
        <button class="button button-secondary" onclick="updateVerification('${user.id}', 'rejected')">Reject</button>
      </td>
    </tr>
  `).join('');
}

function renderReports(reports = []) {
  if (!adminReportsBody) return;

  if (!reports.length) {
    adminReportsBody.innerHTML = '<tr><td colspan="5">No open listing reports.</td></tr>';
    return;
  }

  adminReportsBody.innerHTML = reports.map((report) => `
    <tr>
      <td data-label="Listing"><strong>${report.property_title || 'Listing'}</strong><br><a href="property.html?id=${report.property_id}">Open listing</a></td>
      <td data-label="Reporter">${report.reporter_name || 'Signed-in user'}<br><small>${report.reporter_email || ''}</small></td>
      <td data-label="Reason">${report.reason}${report.details ? `<br><small>${report.details}</small>` : ''}</td>
      <td data-label="Status"><span class="status-badge status-${report.status}">${report.status}</span></td>
      <td data-label="Actions" class="table-actions">
        <button class="button button-primary" onclick="updateReport('${report.id}', 'reviewing')">Reviewing</button>
        <button class="button button-secondary" onclick="updateReport('${report.id}', 'resolved')">Resolve</button>
        <button class="button button-secondary" onclick="updateReport('${report.id}', 'dismissed')">Dismiss</button>
      </td>
    </tr>
  `).join('');
}

function renderSettingsPills(container, items = [], formatter = (item) => item.label || item.name) {
  if (!container) return;

  container.innerHTML = items.length
    ? items.map((item) => `<span class="settings-pill"><span>${formatter(item)}</span></span>`).join('')
    : '<span class="settings-pill"><span>No items yet</span></span>';
}

function renderMarketSettings(settings = {}) {
  renderSettingsPills(adminLocationsList, settings.locations || [], (location) => location.label || location.name);
  renderSettingsPills(adminPropertyTypesList, settings.property_types || [], (type) => type.label);
  renderSettingsPills(adminBudgetsList, settings.budget_ranges || [], (budget) => {
    const min = Number(budget.min_price || 0).toLocaleString();
    const max = budget.max_price === null || budget.max_price === undefined
      ? '+'
      : Number(budget.max_price).toLocaleString();
    return `${budget.label} (${min} - ${max})`;
  });
}

function placementLabel(value = '') {
  const labels = {
    tenant_home: 'Home page',
    tenant_explore_top: 'Explore top',
    tenant_explore_inline: 'Explore inline',
    tenant_property_sidebar: 'Property detail',
    tenant_favorites: 'Favorites',
    tenant_profile: 'Profile',
  };

  return labels[value] || value.replace(/_/g, ' ');
}

function renderAds(ads = []) {
  if (!adminAdsBody) return;

  if (!ads.length) {
    adminAdsBody.innerHTML = '<tr><td colspan="5">No ad campaigns yet.</td></tr>';
    return;
  }

  adminAdsBody.innerHTML = ads.map((ad) => `
    <tr>
      <td data-label="Campaign">
        <strong>${ad.title}</strong>
        <br><small>${ad.advertiser_name}</small>
        ${ad.target_url ? `<br><a href="${ad.target_url}" target="_blank" rel="noreferrer">Open sponsor link</a>` : ''}
      </td>
      <td data-label="Placement">${placementLabel(ad.placement)}<br><small>Priority ${ad.sort_order || 0}</small></td>
      <td data-label="Status"><span class="status-badge status-${ad.status === 'active' ? 'active' : 'inactive'}">${ad.status}</span></td>
      <td data-label="Performance">${Number(ad.impressions_count || 0).toLocaleString()} views<br><small>${Number(ad.clicks_count || 0).toLocaleString()} clicks</small></td>
      <td data-label="Actions" class="table-actions">
        <button class="button button-secondary" onclick="updateAdStatus('${ad.id}', '${ad.status === 'active' ? 'inactive' : 'active'}')">${ad.status === 'active' ? 'Pause' : 'Activate'}</button>
      </td>
    </tr>
  `).join('');
}

async function loadAdminDashboard() {
  if (!requireAdminSession()) {
    renderSummary();
    renderUsers();
    renderProperties();
    return;
  }

  try {
    showAdminMessage('');
    const [dashboard, usersResponse, propertiesResponse, verificationResponse, reportsResponse, settingsResponse, adsResponse] = await Promise.all([
      window.ThikaApi.admin.dashboard(),
      window.ThikaApi.admin.users({ role: currentUserRoleFilter }),
      window.ThikaApi.admin.properties({ status: currentPropertyStatusFilter }),
      window.ThikaApi.admin.verificationQueue({ status: 'pending' }),
      window.ThikaApi.admin.reports({ status: 'all' }),
      window.ThikaApi.settings.list(),
      window.ThikaApi.admin.ads({ status: 'all' }),
    ]);

    renderSummary(dashboard.summary || {});
    renderUsers(usersResponse.users || []);
    renderProperties(propertiesResponse.properties || []);
    renderVerificationQueue(verificationResponse.users || []);
    renderReports(reportsResponse.reports || []);
    renderMarketSettings(settingsResponse || {});
    renderAds(adsResponse.ads || []);
  } catch (error) {
    showAdminMessage(error.message, 'error');
  }
}

function formPayload(form) {
  return Object.fromEntries(new FormData(form).entries());
}

async function handleLocationSettingSubmit(event) {
  event.preventDefault();

  try {
    await window.ThikaApi.admin.createLocation(formPayload(locationSettingsForm));
    locationSettingsForm.reset();
    showAdminMessage('Location added.');
    await loadAdminDashboard();
  } catch (error) {
    showAdminMessage(error.message, 'error');
  }
}

async function handlePropertyTypeSettingSubmit(event) {
  event.preventDefault();

  try {
    await window.ThikaApi.admin.createPropertyType(formPayload(propertyTypeSettingsForm));
    propertyTypeSettingsForm.reset();
    showAdminMessage('Property type added.');
    await loadAdminDashboard();
  } catch (error) {
    showAdminMessage(error.message, 'error');
  }
}

async function handleBudgetSettingSubmit(event) {
  event.preventDefault();

  try {
    await window.ThikaApi.admin.createBudgetRange(formPayload(budgetSettingsForm));
    budgetSettingsForm.reset();
    showAdminMessage('Budget range added.');
    await loadAdminDashboard();
  } catch (error) {
    showAdminMessage(error.message, 'error');
  }
}

async function handleAdCampaignSubmit(event) {
  event.preventDefault();

  try {
    await window.ThikaApi.admin.createAd(formPayload(adCampaignForm));
    adCampaignForm.reset();
    showAdminMessage('Ad campaign added.');
    await loadAdminDashboard();
  } catch (error) {
    showAdminMessage(error.message, 'error');
  }
}

async function updateVerification(id, status) {
  const notes = status === 'rejected' ? prompt('Reason for rejection?') || '' : 'Approved by admin.';

  try {
    await window.ThikaApi.admin.updateVerification(id, { status, notes });
    showAdminMessage(`Landlord verification ${status}.`);
    await loadAdminDashboard();
  } catch (error) {
    showAdminMessage(error.message, 'error');
  }
}

async function updateReport(id, status) {
  try {
    await window.ThikaApi.admin.updateReport(id, { status, admin_notes: `Marked ${status} by admin.` });
    showAdminMessage(`Report marked ${status}.`);
    await loadAdminDashboard();
  } catch (error) {
    showAdminMessage(error.message, 'error');
  }
}

async function updateAdStatus(id, status) {
  try {
    await window.ThikaApi.admin.updateAd(id, { status });
    showAdminMessage(`Ad ${status === 'active' ? 'activated' : 'paused'}.`);
    await loadAdminDashboard();
  } catch (error) {
    showAdminMessage(error.message, 'error');
  }
}

async function deleteUser(id) {
  if (!confirm('Remove this user account?')) return;

  try {
    await window.ThikaApi.request(`/admin/users/${id}`, { method: 'DELETE' });
    showAdminMessage('User removed.');
    await loadAdminDashboard();
  } catch (error) {
    showAdminMessage(error.message, 'error');
  }
}

async function approveProperty(id) {
  try {
    await window.ThikaApi.request(`/admin/properties/${id}/approve`, { method: 'PATCH' });
    showAdminMessage('Listing approved.');
    await loadAdminDashboard();
  } catch (error) {
    showAdminMessage(error.message, 'error');
  }
}

async function deactivateProperty(id) {
  if (!confirm('Deactivate this listing?')) return;

  try {
    await window.ThikaApi.request(`/admin/properties/${id}/deactivate`, { method: 'PATCH' });
    showAdminMessage('Listing deactivated.');
    await loadAdminDashboard();
  } catch (error) {
    showAdminMessage(error.message, 'error');
  }
}

async function logout() {
  try {
    await window.ThikaApi.auth.logout();
  } catch (error) {
    console.warn(error.message);
  }

  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('is-collapsed');
    });
  }

  document.querySelectorAll('.user-filter').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.user-filter').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      currentUserRoleFilter = button.dataset.role || '';
      loadAdminDashboard();
    });
  });

  document.querySelectorAll('.property-filter').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.property-filter').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      currentPropertyStatusFilter = button.dataset.status || 'all';
      loadAdminDashboard();
    });
  });

  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', logout);
  }

  if (locationSettingsForm) locationSettingsForm.addEventListener('submit', handleLocationSettingSubmit);
  if (propertyTypeSettingsForm) propertyTypeSettingsForm.addEventListener('submit', handlePropertyTypeSettingSubmit);
  if (budgetSettingsForm) budgetSettingsForm.addEventListener('submit', handleBudgetSettingSubmit);
  if (adCampaignForm) adCampaignForm.addEventListener('submit', handleAdCampaignSubmit);

  loadAdminDashboard();
});
