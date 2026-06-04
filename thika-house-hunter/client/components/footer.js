function renderFooter(target = '#footer-root') {
  const root = document.querySelector(target);
  if (!root) return;

  root.innerHTML = `
    <footer class="site-footer">
      <div class="container footer-content">
        <p>&copy; 2026 Thika House Hunter. All rights reserved.</p>
        <nav class="footer-nav">
          <a href="about.html">About</a>
          <a href="contact.html">Contact</a>
          <a href="explore.html">Explore</a>
          <a href="privacy.html">Privacy</a>
          <a href="terms.html">Terms</a>
        </nav>
      </div>
    </footer>
  `;
}

window.renderFooter = renderFooter;
