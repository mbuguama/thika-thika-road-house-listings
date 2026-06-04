function setupMobileMenu() {
  const header = document.querySelector('.site-header');
  const headerInner = document.querySelector('.header-inner');
  const nav = document.querySelector('.main-nav');

  if (!header || !headerInner || !nav || document.querySelector('.mobile-nav-toggle')) return;

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'mobile-nav-toggle';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Open navigation menu');
  toggle.innerHTML = `
    <span class="mobile-nav-line"></span>
    <span class="mobile-nav-line"></span>
    <span class="mobile-nav-line"></span>
  `;

  const brand = headerInner.querySelector('.brand');
  if (brand?.nextSibling) {
    headerInner.insertBefore(toggle, brand.nextSibling);
  } else {
    headerInner.prepend(toggle);
  }

  function setOpen(isOpen) {
    header.classList.toggle('nav-open', isOpen);
    toggle.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
  }

  toggle.addEventListener('click', (event) => {
    event.stopPropagation();
    setOpen(!header.classList.contains('nav-open'));
  });

  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      setOpen(false);
    }
  });

  document.addEventListener('click', (event) => {
    if (!header.contains(event.target)) {
      setOpen(false);
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 960) {
      setOpen(false);
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupMobileMenu);
} else {
  setupMobileMenu();
}
