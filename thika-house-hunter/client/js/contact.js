document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  const success = document.getElementById('form-success');
  const error = document.getElementById('form-error');

  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    success.hidden = true;
    error.hidden = true;

    const data = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      subject: form.subject.value.trim(),
      message: form.message.value.trim(),
    };

    if (!data.name || !data.email || !data.message) {
      error.textContent = 'Please fill required fields.';
      error.hidden = false;
      return;
    }

    try {
      if (window.ThikaApi) {
        await window.ThikaApi.contact.create(data);
      } else {
        await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      }

      form.reset();
      success.hidden = false;
    } catch (err) {
      error.textContent = err.message || 'Submission failed. Please try again.';
      error.hidden = false;
    }
  });
});
