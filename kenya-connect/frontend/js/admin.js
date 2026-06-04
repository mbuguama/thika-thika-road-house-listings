async function loadAdmin() {
  const root = document.querySelector('#adminRoot');
  if (!root) return;
  try {
    const [dashboard, users, reports] = await Promise.all([
      window.KenyaConnect.apiRequest('/admin/dashboard'),
      window.KenyaConnect.apiRequest('/admin/users'),
      window.KenyaConnect.apiRequest('/admin/reports'),
    ]);
    root.innerHTML = `
      <section class="metrics-grid">
        <article class="metric-card"><span>Daily registrations</span><strong>${dashboard.analytics.daily_registrations}</strong></article>
        <article class="metric-card"><span>Active users</span><strong>${dashboard.analytics.active_users}</strong></article>
        <article class="metric-card"><span>Matches today</span><strong>${dashboard.analytics.matches_created}</strong></article>
        <article class="metric-card"><span>Messages today</span><strong>${dashboard.analytics.messages_sent}</strong></article>
      </section>
      <section class="panel table-wrap">
        <h2>Users</h2>
        <table><thead><tr><th>Email</th><th>Name</th><th>Status</th><th>Town</th></tr></thead><tbody>
          ${users.users.map((user) => `<tr><td>${user.email}</td><td>${user.display_name || '-'}</td><td>${user.status}</td><td>${user.town || '-'}</td></tr>`).join('')}
        </tbody></table>
      </section>
      <section class="panel table-wrap">
        <h2>Reports</h2>
        <table><thead><tr><th>Reason</th><th>Status</th><th>Created</th></tr></thead><tbody>
          ${reports.reports.map((report) => `<tr><td>${report.reason}</td><td>${report.status}</td><td>${new Date(report.created_at).toLocaleDateString()}</td></tr>`).join('')}
        </tbody></table>
      </section>
    `;
  } catch (error) {
    root.innerHTML = `<section class="panel feature-card"><h2>Admin access required</h2><p>${error.message}</p></section>`;
  }
}

document.addEventListener('DOMContentLoaded', loadAdmin);
