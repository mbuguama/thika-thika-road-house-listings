async function loadBookings(targetId = 'bookings-list') {
  const target = document.getElementById(targetId);
  if (!target || !window.ThikaApi) return;

  try {
    const { bookings } = await window.ThikaApi.bookings.list();
    target.innerHTML = bookings.length
      ? bookings.map((booking) => `
          <article class="feature-card">
            <h3>${booking.property_title}</h3>
            <p>${booking.status} ${booking.viewing_date ? `| ${new Date(booking.viewing_date).toLocaleString()}` : ''}</p>
          </article>
        `).join('')
      : '<p>No bookings yet.</p>';
  } catch (error) {
    target.innerHTML = `<p>${error.message}</p>`;
  }
}

async function createBooking(propertyId, payload) {
  if (!window.ThikaApi) throw new Error('API client is not loaded.');

  return window.ThikaApi.bookings.create({
    property_id: propertyId,
    ...payload,
  });
}

window.ThikaBookings = {
  createBooking,
  loadBookings,
};
