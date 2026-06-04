function notificationItem(notification) {
  const date = notification.created_at ? new Date(notification.created_at).toLocaleString() : '';
  const read = notification.read_at ? 'Read' : 'Unread';
  return `
    <button class="list-item" data-notification="${notification.id}">
      <strong>${notification.title || notification.type}</strong><br />
      <span>${notification.body || 'Account activity'} - ${read}</span><br />
      <small>${date}</small>
    </button>
  `;
}

async function loadNotifications() {
  const list = document.querySelector('#notificationsList');
  if (!list) return;
  try {
    const data = await window.KenyaConnect.apiRequest('/notifications');
    list.innerHTML = data.notifications.length
      ? data.notifications.map(notificationItem).join('')
      : '<p>No notifications yet.</p>';
  } catch (error) {
    list.innerHTML = `<p>${error.message}</p><a class="button button-primary" href="/pages/login.html">Sign in</a>`;
  }
}

async function markRead(id) {
  try {
    await window.KenyaConnect.apiRequest(`/notifications/${id}/read`, { method: 'POST' });
    loadNotifications();
  } catch (error) {
    window.KCUI.toast(error.message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadNotifications();
  document.querySelector('#notificationsList')?.addEventListener('click', (event) => {
    const item = event.target.closest('[data-notification]');
    if (item) markRead(item.dataset.notification);
  });
});
