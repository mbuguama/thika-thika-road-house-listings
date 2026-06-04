async function loadDashboard() {
  const root = document.querySelector('#dashboardRoot');
  if (!root) return;
  try {
    const [me, profile, matches, notifications] = await Promise.all([
      window.KenyaConnect.apiRequest('/auth/me'),
      window.KenyaConnect.apiRequest('/profiles/me'),
      window.KenyaConnect.apiRequest('/matches'),
      window.KenyaConnect.apiRequest('/notifications'),
    ]);
    const p = profile.profile || {};
    root.innerHTML = `
      <section class="panel feature-card">
        <p class="eyebrow">Profile</p>
        <h2>${p.display_name || me.user.email}</h2>
        <p>${p.town || 'Town not set'} - ${p.relationship_goal || 'Relationship goal not set'}</p>
        <div class="pill-row"><span class="pill">${p.profile_completion || 0}% complete</span><span class="pill verified">${p.verification_badge || 'none'}</span></div>
      </section>
      <section class="panel feature-card">
        <p class="eyebrow">Matches</p>
        <h2>${matches.matches.length}</h2>
        <p>Mutual matches ready for conversation.</p>
      </section>
      <section class="panel feature-card">
        <p class="eyebrow">Notifications</p>
        <h2>${notifications.notifications.length}</h2>
        <p>Unread and recent account activity.</p>
      </section>
    `;
  } catch (error) {
    root.innerHTML = `<section class="panel feature-card"><h2>Sign in required</h2><p>${error.message}</p><a class="button button-primary" href="/pages/login.html">Sign in</a></section>`;
  }
}

function bindProfileForm() {
  const form = document.querySelector('#profileForm');
  if (!form) return;
  const message = document.querySelector('#profileMessage');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await window.KenyaConnect.apiRequest('/profiles/me', {
        method: 'PUT',
        body: JSON.stringify(window.KenyaConnect.formToJson(form)),
      });
      message.textContent = 'Profile updated.';
      loadDashboard();
    } catch (error) {
      message.textContent = error.message;
    }
  });
}

function bindPhotoForm() {
  const form = document.querySelector('#photoForm');
  if (!form) return;
  const message = document.querySelector('#photoMessage');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const body = new FormData(form);
      await window.KenyaConnect.apiRequest('/profiles/me/photos', {
        method: 'POST',
        body,
      });
      message.textContent = 'Photo uploaded and waiting for moderation.';
      form.reset();
    } catch (error) {
      message.textContent = error.message;
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadDashboard();
  bindProfileForm();
  bindPhotoForm();
});
