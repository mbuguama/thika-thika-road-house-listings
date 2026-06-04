const { apiRequest, formToJson, setToken, setCsrfToken, clearToken } = window.KenyaConnect;

function bindRegister() {
  const form = document.querySelector('#registerForm');
  if (!form) return;
  const message = document.querySelector('#formMessage');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const payload = formToJson(form);
      const data = await apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
      setToken(data.token);
      setCsrfToken(data.csrfToken);
      message.textContent = 'Account created. Redirecting to dashboard...';
      window.location.href = '/pages/dashboard.html';
    } catch (error) {
      message.textContent = error.message;
    }
  });
}

function bindLogin() {
  const form = document.querySelector('#loginForm');
  if (!form) return;
  const message = document.querySelector('#formMessage');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const data = await apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(formToJson(form)) });
      setToken(data.token);
      setCsrfToken(data.csrfToken);
      message.textContent = 'Signed in. Redirecting...';
      window.location.href = data.user.role === 'admin' ? '/pages/admin.html' : '/pages/dashboard.html';
    } catch (error) {
      message.textContent = error.message;
    }
  });
}

function bindForgotPassword() {
  const form = document.querySelector('#forgotForm');
  if (!form) return;
  const message = document.querySelector('#formMessage');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await apiRequest('/auth/password/forgot', { method: 'POST', body: JSON.stringify(formToJson(form)) });
      message.textContent = 'If the account exists, recovery instructions have been sent.';
    } catch (error) {
      message.textContent = error.message;
    }
  });
}

function bindLogout() {
  document.querySelectorAll('[data-logout]').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        await apiRequest('/auth/logout', { method: 'POST' });
      } finally {
        clearToken();
        window.location.href = '/';
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  bindRegister();
  bindLogin();
  bindForgotPassword();
  bindLogout();
});
