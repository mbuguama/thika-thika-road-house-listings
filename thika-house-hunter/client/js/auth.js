const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginMessage = document.getElementById('login-message');
const registerMessage = document.getElementById('register-message');

function showAuthMessage(target, message, type = 'success') {
  if (!target) return;
  target.innerHTML = `<div class="form-${type}">${message}</div>`;
}

function storeSession(response) {
  if (response.token) localStorage.setItem('token', response.token);
  if (response.user) localStorage.setItem('user', JSON.stringify(response.user));
}

function redirectForRole(role) {
  if (role === 'admin') return 'admin-dashboard.html';
  if (role === 'landlord') return 'landlord-dashboard.html';
  return 'explore.html';
}

if (loginForm) {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    try {
      const response = await window.ThikaApi.auth.login({
        email: loginForm.email.value.trim(),
        password: loginForm.password.value.trim(),
      });
      storeSession(response);
      showAuthMessage(loginMessage, 'Login successful. Redirecting...');
      setTimeout(() => {
        window.location.href = redirectForRole(response.user?.role);
      }, 800);
    } catch (error) {
      showAuthMessage(loginMessage, error.message, 'error');
    }
  });
}

if (registerForm) {
  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    try {
      const response = await window.ThikaApi.auth.register({
        name: registerForm.name.value.trim(),
        email: registerForm.email.value.trim(),
        password: registerForm.password.value.trim(),
        role: registerForm.role.value,
        privacy_consent: Boolean(registerForm.privacy_consent?.checked),
      });
      storeSession(response);
      showAuthMessage(registerMessage, 'Account created. Redirecting...');
      setTimeout(() => {
        window.location.href = redirectForRole(response.user?.role);
      }, 800);
    } catch (error) {
      showAuthMessage(registerMessage, error.message, 'error');
    }
  });
}
