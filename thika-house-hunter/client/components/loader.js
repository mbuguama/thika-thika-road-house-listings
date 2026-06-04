function showLoader(target, message = 'Loading...') {
  const root = typeof target === 'string' ? document.querySelector(target) : target;
  if (!root) return;

  root.innerHTML = `
    <div class="loader" role="status" aria-live="polite">
      <span class="loader-spinner"></span>
      <span>${message}</span>
    </div>
  `;
}

function showEmptyState(target, title, copy) {
  const root = typeof target === 'string' ? document.querySelector(target) : target;
  if (!root) return;

  root.innerHTML = `
    <div class="empty-state">
      <h3>${title}</h3>
      <p>${copy}</p>
    </div>
  `;
}

window.ThikaUi = {
  showEmptyState,
  showLoader,
};
