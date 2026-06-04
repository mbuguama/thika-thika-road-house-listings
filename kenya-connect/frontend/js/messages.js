let activeMatchId = '';
let currentUserId = '';

async function loadCurrentUser() {
  try {
    const data = await window.KenyaConnect.apiRequest('/auth/me');
    currentUserId = data.user.id;
  } catch (error) {
    currentUserId = '';
  }
}

async function loadMatches() {
  const list = document.querySelector('#conversationList');
  if (!list) return;
  try {
    const data = await window.KenyaConnect.apiRequest('/matches');
    list.innerHTML = data.matches.length ? data.matches.map((match) => `
      <button class="list-item" data-match="${match.id}">
        <strong>${match.matched_name}</strong><br />
        <span>${match.matched_town} - ${match.compatibility_score}% compatible</span>
      </button>
    `).join('') : '<p>No matches yet.</p>';
  } catch (error) {
    list.innerHTML = `<p>${error.message}</p>`;
  }
}

async function loadMessages(matchId) {
  const windowEl = document.querySelector('#messageWindow');
  activeMatchId = matchId;
  try {
    const data = await window.KenyaConnect.apiRequest(`/messages/${matchId}`);
    windowEl.innerHTML = data.messages.map((message) => `<div class="message ${message.sender_id === currentUserId ? 'sent' : ''}">${message.body}</div>`).join('');
  } catch (error) {
    windowEl.innerHTML = `<p>${error.message}</p>`;
  }
}

function bindMessageForm() {
  const form = document.querySelector('#messageForm');
  if (!form) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!activeMatchId) return;
    const body = form.message.value.trim();
    if (!body) return;
    await window.KenyaConnect.apiRequest(`/messages/${activeMatchId}`, { method: 'POST', body: JSON.stringify({ body }) });
    form.reset();
    loadMessages(activeMatchId);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadCurrentUser();
  loadMatches();
  bindMessageForm();
  document.querySelector('#conversationList')?.addEventListener('click', (event) => {
    const item = event.target.closest('[data-match]');
    if (item) loadMessages(item.dataset.match);
  });
});
