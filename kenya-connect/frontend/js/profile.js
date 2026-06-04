const fallbackProfile = {
  id: '10000000-0000-0000-0000-000000000101',
  display_name: 'Amani',
  age: 26,
  town: 'Nairobi',
  relationship_goal: 'Long-term dating',
  occupation: 'Designer',
  education: 'University',
  bio: 'Creative, warm, and intentional. Looking for mature conversations and real chemistry.',
  interests: ['coffee', 'art', 'road trips'],
  profile_completion: 96,
  verification_badge: 'full',
  primary_photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1100&q=80',
};

function profileTemplate(profile) {
  const interests = (profile.interests || []).map((interest) => `<span class="pill">${interest}</span>`).join('');
  const verified = profile.verification_badge && profile.verification_badge !== 'none' ? '<span class="pill verified">Verified adult</span>' : '<span class="pill">Unverified</span>';
  return `
    <article class="profile-card">
      <img src="${profile.primary_photo || '/assets/profile-placeholder.svg'}" alt="${profile.display_name}" />
      <div class="profile-card-body">
        <p class="eyebrow">Profile</p>
        <h1>${profile.display_name}, ${profile.age || '18+'}</h1>
        <p>${profile.town || 'Kenya'} - ${profile.relationship_goal || 'Open to connect'} - ${profile.occupation || 'Occupation not set'}</p>
        <div class="pill-row">${verified}<span class="pill accent">${profile.profile_completion || 0}% complete</span>${interests}</div>
      </div>
    </article>
    <aside class="panel filter-panel">
      <p class="eyebrow">Profile details</p>
      <h2>About</h2>
      <p class="hero-copy">${profile.bio || 'This member has not added a bio yet.'}</p>
      <div class="settings-grid">
        <div class="list-item"><strong>Education</strong><br /><span>${profile.education || 'Not set'}</span></div>
        <div class="list-item"><strong>Town</strong><br /><span>${profile.town || 'Not set'}</span></div>
      </div>
      <div class="inline-actions">
        <button class="button button-muted" data-pass="${profile.id}" type="button">Pass</button>
        <button class="button button-primary" data-like="${profile.id}" type="button">Like</button>
        <button class="button button-secondary" data-super-like="${profile.id}" type="button">Super Like</button>
        <button class="button button-muted" data-favorite="${profile.id}" type="button">Save</button>
        <button class="button button-danger" data-report="${profile.id}" type="button">Report</button>
      </div>
    </aside>
  `;
}

async function loadProfile() {
  const root = document.querySelector('#profileRoot');
  if (!root) return;
  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) {
    root.innerHTML = profileTemplate(fallbackProfile);
    return;
  }

  try {
    const data = await window.KenyaConnect.apiRequest(`/profiles/${id}`);
    root.innerHTML = profileTemplate(data.profile || fallbackProfile);
  } catch (error) {
    root.innerHTML = `<section class="panel feature-card"><h2>Profile unavailable</h2><p>${error.message}</p><a class="button button-primary" href="/pages/discovery.html">Back to discovery</a></section>`;
  }
}

async function act(profileId, type) {
  try {
    const data = await window.KenyaConnect.apiRequest(`/matches/${profileId}/action`, {
      method: 'POST',
      body: JSON.stringify({ type }),
    });
    window.KCUI.toast(data.match ? 'It is a mutual match.' : 'Action saved.');
  } catch (error) {
    window.KCUI.toast(error.message);
  }
}

async function favorite(profileId) {
  try {
    await window.KenyaConnect.apiRequest(`/profiles/${profileId}/favorite`, { method: 'POST' });
    window.KCUI.toast('Profile saved to favorites.');
  } catch (error) {
    window.KCUI.toast(error.message);
  }
}

async function report(profileId) {
  try {
    await window.KenyaConnect.apiRequest('/reports', {
      method: 'POST',
      body: JSON.stringify({ reported_profile_id: profileId, reason: 'profile_review', details: 'User requested admin review from profile page.' }),
    });
    window.KCUI.toast('Report sent to moderation.');
  } catch (error) {
    window.KCUI.toast(error.message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadProfile();
  document.addEventListener('click', (event) => {
    const like = event.target.closest('[data-like]');
    const pass = event.target.closest('[data-pass]');
    const superLike = event.target.closest('[data-super-like]');
    const favoriteButton = event.target.closest('[data-favorite]');
    const reportButton = event.target.closest('[data-report]');
    if (like) act(like.dataset.like, 'like');
    if (pass) act(pass.dataset.pass, 'pass');
    if (superLike) act(superLike.dataset.superLike, 'super_like');
    if (favoriteButton) favorite(favoriteButton.dataset.favorite);
    if (reportButton) report(reportButton.dataset.report);
  });
});
