function setupHeader() {
  const button = document.querySelector('[data-menu-button]');
  const nav = document.querySelector('[data-nav]');
  if (!button || !nav) return;

  button.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    button.setAttribute('aria-expanded', String(open));
  });
}

function setupTheme() {
  const button = document.querySelector('[data-theme-toggle]');
  const saved = localStorage.getItem('kenya_connect_theme');
  if (saved === 'dark') document.body.classList.add('dark');
  if (!button) return;

  button.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('kenya_connect_theme', document.body.classList.contains('dark') ? 'dark' : 'light');
  });
}

function toast(message) {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = message;
  window.setTimeout(() => { el.textContent = ''; }, 3200);
}

function setupMobileNavigation() {
  if (document.querySelector('.bottom-tabbar')) return;

  const links = [
    { href: '/', label: 'Home', mark: 'H' },
    { href: '/pages/discovery.html', label: 'Discover', mark: 'D' },
    { href: '/pages/messages.html', label: 'Messages', mark: 'M' },
    { href: '/pages/dashboard.html', label: 'Account', mark: 'A' },
  ];
  const current = window.location.pathname;
  const tabbar = document.createElement('nav');
  tabbar.className = 'bottom-tabbar';
  tabbar.setAttribute('aria-label', 'Mobile navigation');
  tabbar.innerHTML = links.map((link) => {
    const active = current === link.href || (link.href !== '/' && current.endsWith(link.href));
    return `<a class="${active ? 'active' : ''}" href="${link.href}"><span>${link.mark}</span>${link.label}</a>`;
  }).join('');
  document.body.appendChild(tabbar);
}

function setupFloatingAction() {
  const excluded = ['/pages/login.html', '/pages/register.html', '/pages/forgot-password.html'];
  if (excluded.includes(window.location.pathname) || document.querySelector('.floating-action')) return;

  const action = document.createElement('a');
  action.className = 'floating-action';
  action.href = '/pages/discovery.html';
  action.setAttribute('aria-label', 'Open discovery');
  action.textContent = '+';
  document.body.appendChild(action);
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {});
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setupHeader();
  setupTheme();
  setupMobileNavigation();
  setupFloatingAction();
  registerServiceWorker();
});

window.KCUI = { toast };
