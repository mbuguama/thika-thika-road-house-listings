const fallbackProfiles = [
  {
    id: 'seed-1',
    display_name: 'Amani',
    age: 26,
    town: 'Nairobi',
    relationship_goal: 'Long-term dating',
    bio: 'Creative, warm, and intentional. Looking for real chemistry.',
    interests: ['coffee', 'art', 'road trips'],
    profile_completion: 96,
    verification_badge: 'full',
    primary_photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1100&q=80',
  },
  {
    id: 'seed-2',
    display_name: 'Brian',
    age: 31,
    town: 'Thika',
    relationship_goal: 'Casual connection',
    bio: 'Direct, respectful, and clear about boundaries.',
    interests: ['music', 'gym', 'privacy'],
    profile_completion: 84,
    verification_badge: 'email',
    primary_photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1100&q=80',
  },
  {
    id: 'seed-3',
    display_name: 'Leila',
    age: 24,
    town: 'Mombasa',
    relationship_goal: 'Long-term dating',
    bio: 'Beach walks, great food, and people who keep their word.',
    interests: ['beach', 'food', 'kindness'],
    profile_completion: 90,
    verification_badge: 'phone',
    primary_photo: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=1100&q=80',
  },
];

function profileCard(profile) {
  const interests = (profile.interests || []).slice(0, 4).map((interest) => `<span class="pill">${interest}</span>`).join('');
  const verified = profile.verification_badge && profile.verification_badge !== 'none' ? '<span class="pill verified">Verified</span>' : '';
  const profileHref = `/pages/profile.html?id=${encodeURIComponent(profile.id)}`;
  return `
    <article class="profile-card">
      <a href="${profileHref}"><img loading="lazy" src="${profile.primary_photo || '/assets/profile-placeholder.svg'}" alt="${profile.display_name}" /></a>
      <div class="profile-card-body">
        <div>
          <h3>${profile.display_name}, ${profile.age || '18+'}</h3>
          <p>${profile.town || 'Kenya'} - ${profile.relationship_goal || 'Open to connect'}</p>
        </div>
        <p>${profile.bio || 'Ready to meet new people on Connect254.'}</p>
        <div class="pill-row">${verified}<span class="pill">${profile.profile_completion || 0}% complete</span>${interests}</div>
        <div class="card-actions">
          <button class="button button-muted" data-pass="${profile.id}">Pass</button>
          <button class="button button-primary" data-like="${profile.id}">Like</button>
          <button class="button button-secondary" data-super-like="${profile.id}">Super</button>
        </div>
        <div class="card-actions">
          <a class="button button-muted" href="${profileHref}">View</a>
          <button class="button button-muted" data-favorite="${profile.id}">Save</button>
        </div>
      </div>
    </article>
  `;
}

function paramsFromFilters() {
  const form = document.querySelector('#searchForm');
  if (!form) return new URLSearchParams();
  const data = new FormData(form);
  const params = new URLSearchParams();
  data.forEach((value, key) => {
    if (value && value !== 'all') params.set(key, value);
  });
  return params;
}

async function loadProfiles() {
  const grid = document.querySelector('#profilesGrid');
  if (!grid) return;
  grid.innerHTML = '<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>';
  try {
    const data = await window.KenyaConnect.apiRequest(`/search?${paramsFromFilters().toString()}`);
    const profiles = data.profiles.length ? data.profiles : fallbackProfiles;
    grid.innerHTML = profiles.map(profileCard).join('');
  } catch (error) {
    grid.innerHTML = fallbackProfiles.map(profileCard).join('');
  }
}

async function act(profileId, type) {
  if (String(profileId).startsWith('seed-')) {
    window.KCUI.toast(`${type === 'pass' ? 'Passed' : 'Saved'} locally. Sign in to match for real.`);
    return;
  }
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
  if (String(profileId).startsWith('seed-')) {
    window.KCUI.toast('Saved locally. Sign in to keep favorites.');
    return;
  }

  try {
    await window.KenyaConnect.apiRequest(`/profiles/${profileId}/favorite`, { method: 'POST' });
    window.KCUI.toast('Profile saved to favorites.');
  } catch (error) {
    window.KCUI.toast(error.message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadProfiles();
  document.querySelector('#searchForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    loadProfiles();
  });
  document.addEventListener('click', (event) => {
    const like = event.target.closest('[data-like]');
    const pass = event.target.closest('[data-pass]');
    const superLike = event.target.closest('[data-super-like]');
    const favoriteButton = event.target.closest('[data-favorite]');
    if (like) act(like.dataset.like, 'like');
    if (pass) act(pass.dataset.pass, 'pass');
    if (superLike) act(superLike.dataset.superLike, 'super_like');
    if (favoriteButton) favorite(favoriteButton.dataset.favorite);
  });
});
