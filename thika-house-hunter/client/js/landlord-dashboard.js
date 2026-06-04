const propertiesTableBody = document.getElementById('properties-table-body');
const totalPropertiesEl = document.getElementById('total-properties');
const totalInquiriesEl = document.getElementById('total-inquiries');
const totalBookingsEl = document.getElementById('total-bookings');
const propertyForm = document.getElementById('property-form');
const propertyFormMessage = document.getElementById('property-form-message');
const landlordLogoutBtn = document.getElementById('landlord-logout-btn');
const verificationForm = document.getElementById('verification-form');
const verificationMessage = document.getElementById('verification-message');
const verificationStatusBadge = document.getElementById('verification-status-badge');
const bookingsTableBody = document.getElementById('bookings-table-body');
const propertyImagePreview = document.getElementById('property-image-preview');
const paymentPhoneInput = document.getElementById('payment-phone');
const paymentMessage = document.getElementById('payment-message');
const paymentsTableBody = document.getElementById('payments-table-body');
const payVerificationBtn = document.getElementById('pay-verification-btn');
const verificationFeeLabel = document.getElementById('verification-fee-label');

let landlordProperties = [];
let landlordBookings = [];
let imagePreviewUrls = [];
let mpesaReady = false;
let paymentProducts = {
  landlord_verification: { amount: 300 },
  featured_listing: { amount: 500, days: 7 },
};

const areaInsights = {
  'Thika Town': { nearest_stage: 'Thika town stage', nearby_school: 'Chania High School area', nearby_hospital: 'Thika Level 5 Hospital', nearby_mall: 'Ananas Mall / CBD shops', highway_access: 'Quick access to Garissa Road and Thika Superhighway' },
  Makongeni: { nearest_stage: 'Makongeni stage', nearby_school: 'Makongeni primary schools', nearby_hospital: 'Thika Level 5 Hospital', nearby_mall: 'Makongeni local market', highway_access: 'Close to Thika Road exits' },
  'Kenyatta Estate': { nearest_stage: 'Kenyatta Estate stage', nearby_school: 'Kenyatta Estate schools', nearby_hospital: 'Thika Nursing Home area', nearby_mall: 'Kenyatta Estate shops', highway_access: 'Good link to Thika CBD and Superhighway' },
  'Section 9': { nearest_stage: 'Section 9 stage', nearby_school: 'Section 9 schools', nearby_hospital: 'Thika Level 5 Hospital', nearby_mall: 'Thika CBD shops', highway_access: 'Near Thika town access roads' },
  Landless: { nearest_stage: 'Landless stage', nearby_school: 'Landless area schools', nearby_hospital: 'Nearby clinics toward Thika town', nearby_mall: 'Local shops', highway_access: 'Access toward Garissa Road' },
  Ngoingwa: { nearest_stage: 'Ngoingwa stage', nearby_school: 'Ngoingwa schools', nearby_hospital: 'Nearby private clinics', nearby_mall: 'Ngoingwa shops', highway_access: 'Access to Thika Superhighway via town' },
  Jomoko: { nearest_stage: 'Gatitu / Jomoko stage', nearby_school: 'PCEA Gatitu area schools', nearby_hospital: 'Thika town hospitals', nearby_mall: 'Local estate shops', highway_access: 'Access via Gatitu Road' },
  Juja: { nearest_stage: 'Juja stage', nearby_school: 'JKUAT area', nearby_hospital: 'Juja hospitals and clinics', nearby_mall: 'Juja City Mall area', highway_access: 'Direct Thika Superhighway access' },
  Ruiru: { nearest_stage: 'Ruiru stage', nearby_school: 'Ruiru schools', nearby_hospital: 'Ruiru hospitals and clinics', nearby_mall: 'Spur Mall / local markets', highway_access: 'Direct Thika Superhighway access' },
  'TRM / Roysambu': { nearest_stage: 'TRM / Roysambu stage', nearby_school: 'USIU / Kasarani area', nearby_hospital: 'St Francis / Kasarani clinics', nearby_mall: 'TRM', highway_access: 'Direct Thika Road access' },
  'Garden City': { nearest_stage: 'Garden City stage', nearby_school: 'Kasarani / USIU area', nearby_hospital: 'Nearby hospitals along Thika Road', nearby_mall: 'Garden City Mall', highway_access: 'Direct Thika Road access' },
  'Kenyatta Road / Theta': { nearest_stage: 'Kenyatta Road stage', nearby_school: 'Theta / Kenyatta Road schools', nearby_hospital: 'Juja and Thika health facilities', nearby_mall: 'Local shopping centres', highway_access: '5-10 minutes to Thika Road depending on estate' },
  'Runda-Thika': { nearest_stage: 'Runda-Thika stage / local boda links', nearby_school: 'Nearby Thika North schools', nearby_hospital: 'Thika town hospitals and clinics', nearby_mall: 'Thika town shops', highway_access: 'Access back to Thika town and connecting roads' },
};

function showPropertyFormMessage(message, type = 'success') {
  if (!propertyFormMessage) return;
  propertyFormMessage.innerHTML = message ? `<div class="form-${type}">${message}</div>` : '';
}

function showPaymentMessage(message, type = 'success') {
  if (!paymentMessage) return;
  paymentMessage.innerHTML = message ? `<div class="form-${type}">${message}</div>` : '';
}

function formatKes(value) {
  return `KES ${Number(value || 0).toLocaleString()}`;
}

function requireOwnerSession() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    showPropertyFormMessage('Please sign in with a landlord, agent, or broker account to publish listings.', 'error');
    return false;
  }

  if (!['landlord', 'admin'].includes(user.role)) {
    showPropertyFormMessage('This dashboard is for landlords, agents, and brokers.', 'error');
    return false;
  }

  return true;
}

function availabilityLabel(property) {
  if (property.availability_status === 'available_from' && property.available_from) {
    return `Available from ${new Date(property.available_from).toLocaleDateString()}`;
  }
  if (property.availability_status === 'occupied') return 'Occupied';
  if (property.availability_status === 'under_review') return 'Under review';
  return 'Available now';
}

function featuredLabel(property) {
  if (!property.is_featured || !property.featured_until) return '';
  return `<br><small class="featured-until">Featured until ${new Date(property.featured_until).toLocaleDateString()}</small>`;
}

function renderPropertiesTable(properties, summary = {}) {
  if (!propertiesTableBody) return;

  if (!properties.length) {
    propertiesTableBody.innerHTML = `
      <tr>
        <td colspan="6">No listings yet. Add your first property above.</td>
      </tr>
    `;
    updateSummary(properties, summary);
    return;
  }

  propertiesTableBody.innerHTML = properties
    .map((property) => {
      const promoteDisabled = mpesaReady ? '' : ' disabled';
      return `
      <tr>
        <td data-label="Property"><strong>${property.title}</strong>${property.duplicate_warning ? '<br><small class="warning-text">Possible duplicate</small>' : ''}</td>
        <td data-label="Location">${property.location || property.estate_name || 'Thika'}</td>
        <td data-label="Price">KES ${Number(property.price || 0).toLocaleString()}<br><small>Move-in: KES ${Number(property.move_in_cost || 0).toLocaleString()}</small></td>
        <td data-label="Status"><span class="status-badge status-${property.status}">${property.status}</span><br><small>${availabilityLabel(property)}</small>${featuredLabel(property)}</td>
        <td data-label="Bookings">${property.bookings || 0}</td>
        <td data-label="Actions" class="table-actions">
          <a class="button button-secondary" href="property.html?id=${property.id}">View</a>
          <button class="button button-primary" data-pay-featured="${property.id}"${promoteDisabled}>Promote</button>
          <label class="button button-secondary table-file-button">
            Add photos
            <input type="file" accept="image/*" multiple data-upload-property-images="${property.id}" />
          </label>
          <button class="button button-secondary" onclick="confirmAvailability('${property.id}')">Confirm Available</button>
          <button class="button button-secondary" onclick="deleteProperty('${property.id}')">Delete</button>
          <small class="row-upload-status" data-upload-status="${property.id}"></small>
        </td>
      </tr>
    `;
    })
    .join('');

  updateSummary(properties, summary);
}

function renderPaymentsTable(payments = []) {
  if (!paymentsTableBody) return;

  if (!payments.length) {
    paymentsTableBody.innerHTML = '<tr><td colspan="5">No payments yet.</td></tr>';
    return;
  }

  paymentsTableBody.innerHTML = payments.map((payment) => `
    <tr>
      <td data-label="Payment">
        <strong>${payment.metadata?.product_label || payment.description || payment.purpose}</strong>
        ${payment.property_title ? `<br><small>${payment.property_title}</small>` : ''}
      </td>
      <td data-label="Amount">${formatKes(payment.amount)}</td>
      <td data-label="Status"><span class="status-badge payment-status-${payment.status}">${payment.status}</span><br><small>${payment.result_description || ''}</small></td>
      <td data-label="Receipt">${payment.mpesa_receipt_number || '-'}</td>
      <td data-label="Actions" class="table-actions">
        ${payment.status === 'processing' || payment.status === 'pending' ? `<button class="button button-secondary" data-query-payment="${payment.id}">Check</button>` : ''}
      </td>
    </tr>
  `).join('');
}

function renderPaymentConfig(config = {}) {
  mpesaReady = Boolean(config.mpesa_configured);
  paymentProducts = config.products || paymentProducts;
  if (verificationFeeLabel) {
    verificationFeeLabel.textContent = formatKes(paymentProducts.landlord_verification?.amount || 300);
  }
  if (payVerificationBtn) payVerificationBtn.disabled = !mpesaReady;

  if (!mpesaReady) {
    showPaymentMessage('M-Pesa is not configured yet. Add Daraja credentials in .env before taking live payments.', 'error');
  } else if (!config.callback_url_configured) {
    showPaymentMessage('M-Pesa is configured. For live callbacks, set MPESA_CALLBACK_URL to your public HTTPS callback URL.', 'success');
  } else {
    showPaymentMessage('');
  }
}

function renderBookingsTable(bookings = []) {
  if (!bookingsTableBody) return;

  if (!bookings.length) {
    bookingsTableBody.innerHTML = '<tr><td colspan="5">No viewing bookings yet.</td></tr>';
    return;
  }

  bookingsTableBody.innerHTML = bookings.map((booking) => `
    <tr>
      <td data-label="Property"><strong>${booking.property_title || 'Property'}</strong></td>
      <td data-label="Tenant">${booking.renter_name || 'Tenant'}</td>
      <td data-label="Viewing time">${booking.viewing_date ? new Date(booking.viewing_date).toLocaleString() : 'Not set'}</td>
      <td data-label="Status"><span class="status-badge status-${booking.status}">${booking.status}</span></td>
      <td data-label="Actions" class="table-actions">
        ${booking.status === 'pending' ? `<button class="button button-primary" onclick="updateBookingStatus('${booking.id}', 'confirmed')">Confirm</button>` : ''}
        ${booking.status !== 'cancelled' && booking.status !== 'completed' ? `<button class="button button-secondary" onclick="updateBookingStatus('${booking.id}', 'cancelled')">Cancel</button>` : ''}
        ${booking.status === 'confirmed' ? `<button class="button button-secondary" onclick="updateBookingStatus('${booking.id}', 'completed')">Complete</button>` : ''}
      </td>
    </tr>
  `).join('');
}

function updateSummary(properties, summary = {}) {
  if (totalPropertiesEl) totalPropertiesEl.textContent = summary.total_properties ?? properties.length;
  if (totalInquiriesEl) totalInquiriesEl.textContent = summary.pending_inquiries ?? 0;
  if (totalBookingsEl) totalBookingsEl.textContent = summary.total_bookings ?? landlordBookings.length;
}

async function deleteProperty(id) {
  if (!confirm('Delete this property?')) return;

  try {
    await window.ThikaApi.request(`/properties/${id}`, { method: 'DELETE' });
    await loadLandlordDashboard();
  } catch (error) {
    alert(error.message);
  }
}

async function confirmAvailability(id) {
  try {
    await window.ThikaApi.properties.update(id, {
      availability_status: 'available_now',
      last_confirmed_at: new Date().toISOString(),
    });
    await loadLandlordDashboard();
  } catch (error) {
    alert(error.message);
  }
}

function formToPropertyPayload(form) {
  const amenities = form.amenities.value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  const locationDefaults = areaInsights[form.location.value] || {};
  const selectedArea = window.ThikaMaps?.getArea(form.location.value);

  return {
    title: form.title.value.trim(),
    property_type: form.property_type.value,
    price: Number(form.price.value),
    location: form.location.value,
    latitude: selectedArea?.lat || null,
    longitude: selectedArea?.lng || null,
    bedrooms: Number(form.bedrooms.value),
    bathrooms: Number(form.bathrooms.value),
    size_sqft: form.size_sqft.value ? Number(form.size_sqft.value) : null,
    image_url: null,
    availability_status: form.availability_status.value,
    available_from: form.available_from.value || null,
    deposit_amount: form.deposit_amount.value ? Number(form.deposit_amount.value) : Number(form.price.value),
    service_charge: Number(form.service_charge.value || 0),
    viewing_fee: Number(form.viewing_fee.value || 0),
    agent_fee: Number(form.agent_fee.value || 0),
    utility_terms: form.utility_terms.value.trim(),
    payment_notes: form.payment_notes.value.trim(),
    nearest_stage: form.nearest_stage.value.trim() || locationDefaults.nearest_stage,
    nearby_school: form.nearby_school.value.trim() || locationDefaults.nearby_school,
    nearby_hospital: form.nearby_hospital.value.trim() || locationDefaults.nearby_hospital,
    nearby_mall: form.nearby_mall.value.trim() || locationDefaults.nearby_mall,
    highway_access: form.highway_access.value.trim() || locationDefaults.highway_access,
    amenities,
    description: form.description.value.trim(),
    status: 'active',
    is_verified: false,
  };
}

function clearImagePreview() {
  imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
  imagePreviewUrls = [];
  if (propertyImagePreview) propertyImagePreview.innerHTML = '';
}

function renderImagePreview(files = []) {
  clearImagePreview();
  if (!propertyImagePreview || !files.length) return;

  propertyImagePreview.innerHTML = files.map((file, index) => {
    const url = URL.createObjectURL(file);
    imagePreviewUrls.push(url);
    return `
      <figure class="image-preview-item">
        <img src="${url}" alt="Selected listing image ${index + 1}" />
        <figcaption>${index === 0 ? 'Primary' : `Image ${index + 1}`}</figcaption>
      </figure>
    `;
  }).join('');
}

async function uploadPropertyImage(propertyId, file, index = 0, isPrimary = index === 0) {
  if (!file) return null;

  const formData = new FormData();
  formData.append('image', file);
  formData.append('is_primary', isPrimary ? 'true' : 'false');
  formData.append('sort_order', String(index));

  return window.ThikaApi.request(`/properties/${propertyId}/images`, {
    method: 'POST',
    body: formData,
  });
}

function getPaymentPhone() {
  const phone = paymentPhoneInput?.value.trim() || verificationForm?.phone.value.trim() || '';

  if (!phone) {
    showPaymentMessage('Enter the M-Pesa phone number to receive the payment prompt.', 'error');
    paymentPhoneInput?.focus();
    return '';
  }

  return phone;
}

async function refreshPayments() {
  try {
    const response = await window.ThikaApi.payments.list();
    renderPaymentsTable(response.payments || []);
  } catch (error) {
    renderPaymentsTable([]);
  }
}

async function pollPaymentStatus(paymentId, attempt = 0) {
  if (!paymentId || attempt > 6) return;

  window.setTimeout(async () => {
    try {
      const response = await window.ThikaApi.payments.get(paymentId);

      if (response.payment?.status === 'paid') {
        showPaymentMessage('Payment received successfully.');
        await loadLandlordDashboard();
        return;
      }

      if (['failed', 'cancelled'].includes(response.payment?.status)) {
        showPaymentMessage(response.payment.result_description || 'Payment was not completed.', 'error');
        await refreshPayments();
        return;
      }

      await refreshPayments();
      pollPaymentStatus(paymentId, attempt + 1);
    } catch (error) {
      await refreshPayments();
    }
  }, 5000);
}

async function startMpesaPayment(purpose, propertyId) {
  if (!mpesaReady) {
    showPaymentMessage('M-Pesa is not configured yet. Add Daraja credentials in .env before taking live payments.', 'error');
    return;
  }

  const phone = getPaymentPhone();
  if (!phone) return;

  showPaymentMessage('Sending M-Pesa prompt to your phone...');

  try {
    const response = await window.ThikaApi.payments.startMpesa({
      purpose,
      property_id: propertyId,
      phone,
    });

    showPaymentMessage('M-Pesa prompt sent. Complete it on your phone, then use Check if the status does not update.');
    await refreshPayments();
    pollPaymentStatus(response.payment?.id);
  } catch (error) {
    showPaymentMessage(error.message, 'error');
    await refreshPayments();
  }
}

async function handleExistingImagesUpload(event) {
  const input = event.target.closest('[data-upload-property-images]');
  if (!input) return;

  const propertyId = input.dataset.uploadPropertyImages;
  const files = Array.from(input.files || []);
  if (!files.length) return;

  const property = landlordProperties.find((item) => item.id === propertyId) || {};
  const statusEl = propertiesTableBody?.querySelector(`[data-upload-status="${propertyId}"]`);
  const shouldSetPrimary = !(property.image || property.image_url);

  if (statusEl) statusEl.textContent = `Uploading ${files.length} photo${files.length === 1 ? '' : 's'}...`;

  try {
    for (const [index, file] of files.entries()) {
      await uploadPropertyImage(propertyId, file, index, shouldSetPrimary && index === 0);
    }

    if (statusEl) statusEl.textContent = 'Photos added.';
    input.value = '';
    await loadLandlordDashboard();
  } catch (error) {
    if (statusEl) statusEl.textContent = error.message;
    input.value = '';
  }
}

async function handlePropertyActionClick(event) {
  const promoteButton = event.target.closest('[data-pay-featured]');
  const queryButton = event.target.closest('[data-query-payment]');

  if (promoteButton) {
    await startMpesaPayment('featured_listing', promoteButton.dataset.payFeatured);
  }

  if (queryButton) {
    try {
      showPaymentMessage('Checking M-Pesa payment status...');
      const response = await window.ThikaApi.payments.queryMpesa(queryButton.dataset.queryPayment);
      showPaymentMessage(response.payment?.status === 'paid' ? 'Payment received successfully.' : response.payment?.result_description || 'Payment status updated.');
      await loadLandlordDashboard();
    } catch (error) {
      showPaymentMessage(error.message, 'error');
      await refreshPayments();
    }
  }
}

async function handlePropertySubmit(event) {
  event.preventDefault();

  if (!requireOwnerSession()) return;

  showPropertyFormMessage('Publishing listing...');

  try {
    const payload = formToPropertyPayload(propertyForm);
    const response = await window.ThikaApi.properties.create(payload);
    const imageInput = propertyForm.elements.namedItem('image');
    const imageFiles = Array.from(imageInput?.files || []);
    let uploadWarning = '';

    if (imageFiles.length) {
      let uploadedCount = 0;

      for (const [index, file] of imageFiles.entries()) {
        try {
          await uploadPropertyImage(response.property.id, file, index);
          uploadedCount += 1;
        } catch (error) {
          uploadWarning = ` Listing was saved, but ${imageFiles.length - uploadedCount} image${imageFiles.length - uploadedCount === 1 ? '' : 's'} could not be uploaded: ${error.message}`;
          break;
        }
      }
    }

    const duplicateWarning = response.duplicates?.length ? ' Possible duplicate found; admin review is recommended.' : '';
    propertyForm.reset();
    clearImagePreview();
    showPropertyFormMessage(`Listing published successfully.${uploadWarning}${duplicateWarning}`);
    await loadLandlordDashboard();
  } catch (error) {
    showPropertyFormMessage(error.message, 'error');
  }
}

function renderVerification(user = {}) {
  if (!verificationStatusBadge) return;

  const status = user.landlord_verification_status || 'not_submitted';
  verificationStatusBadge.textContent = status.replace('_', ' ');
  verificationStatusBadge.className = `status-badge status-${status === 'approved' ? 'active' : status === 'rejected' ? 'inactive' : 'pending'}`;

  if (verificationForm) {
    verificationForm.phone.value = user.phone || '';
    verificationForm.id_number.value = user.id_number || '';
  }
}

async function handleVerificationSubmit(event) {
  event.preventDefault();

  try {
    const payload = {
      phone: verificationForm.phone.value.trim(),
      id_number: verificationForm.id_number.value.trim(),
      phone_verified: true,
    };
    const response = await window.ThikaApi.landlord.submitVerification(payload);
    localStorage.setItem('user', JSON.stringify(response.user));
    renderVerification(response.user);
    verificationMessage.innerHTML = '<div class="form-success">Verification submitted for admin review.</div>';
  } catch (error) {
    verificationMessage.innerHTML = `<div class="form-error">${error.message}</div>`;
  }
}

async function updateBookingStatus(id, status) {
  try {
    await window.ThikaApi.request(`/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    await loadLandlordDashboard();
  } catch (error) {
    alert(error.message);
  }
}

async function loadLandlordDashboard() {
  if (!requireOwnerSession()) {
    renderPropertiesTable([]);
    renderBookingsTable([]);
    return;
  }

  try {
    const [dashboard, user, paymentConfig, paymentsResponse] = await Promise.all([
      window.ThikaApi.landlord.dashboard(),
      window.ThikaApi.users.profile(),
      window.ThikaApi.payments.config(),
      window.ThikaApi.payments.list(),
    ]);
    landlordProperties = dashboard.properties || [];
    landlordBookings = dashboard.bookings || [];
    if (paymentPhoneInput && !paymentPhoneInput.value) paymentPhoneInput.value = user.phone || '';
    renderVerification(user);
    renderPaymentConfig(paymentConfig);
    renderPropertiesTable(landlordProperties, dashboard.summary || {});
    renderBookingsTable(landlordBookings);
    renderPaymentsTable(paymentsResponse.payments || []);
  } catch (error) {
    showPropertyFormMessage(error.message, 'error');
    renderPropertiesTable([]);
    renderBookingsTable([]);
  }
}

async function logout() {
  try {
    await window.ThikaApi.auth.logout();
  } catch (error) {
    console.warn(error.message);
  }

  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

if (propertyForm) {
  propertyForm.addEventListener('submit', handlePropertySubmit);
  propertyForm.addEventListener('reset', () => {
    window.setTimeout(clearImagePreview, 0);
  });
  propertyForm.elements.namedItem('image')?.addEventListener('change', (event) => {
    renderImagePreview(Array.from(event.target.files || []));
  });
  propertyForm.location.addEventListener('change', () => {
    const defaults = areaInsights[propertyForm.location.value] || {};
    propertyForm.nearest_stage.value = defaults.nearest_stage || '';
    propertyForm.nearby_school.value = defaults.nearby_school || '';
    propertyForm.nearby_hospital.value = defaults.nearby_hospital || '';
    propertyForm.nearby_mall.value = defaults.nearby_mall || '';
    propertyForm.highway_access.value = defaults.highway_access || '';
  });
}

if (verificationForm) {
  verificationForm.addEventListener('submit', handleVerificationSubmit);
}

if (landlordLogoutBtn) {
  landlordLogoutBtn.addEventListener('click', logout);
}

if (propertiesTableBody) {
  propertiesTableBody.addEventListener('change', handleExistingImagesUpload);
  propertiesTableBody.addEventListener('click', handlePropertyActionClick);
}

if (paymentsTableBody) {
  paymentsTableBody.addEventListener('click', handlePropertyActionClick);
}

if (payVerificationBtn) {
  payVerificationBtn.addEventListener('click', () => startMpesaPayment('landlord_verification'));
}

document.addEventListener('DOMContentLoaded', loadLandlordDashboard);
