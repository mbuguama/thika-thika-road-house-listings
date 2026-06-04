const propertyTitle = document.getElementById('property-title');
const propertyLocation = document.getElementById('property-location');
const propertyPrice = document.getElementById('property-price');
const propertyBeds = document.getElementById('property-beds');
const propertyBaths = document.getElementById('property-baths');
const propertyType = document.getElementById('property-type');
const propertyAvailability = document.getElementById('property-availability');
const propertyTags = document.getElementById('property-tags');
const propertyImage = document.getElementById('property-main-image');
const propertyImageGallery = document.getElementById('property-image-gallery');
const propertyMapLink = document.getElementById('property-map-link');
const inquiryForm = document.getElementById('inquiry-form');
const bookingForm = document.getElementById('booking-form');
const inquiryMessage = document.getElementById('inquiry-message');
const saveFavoriteBtn = document.getElementById('save-favorite-btn');
const shareBtn = document.getElementById('share-btn');
const reportListingBtn = document.getElementById('report-listing-btn');
const reportMessage = document.getElementById('report-message');
const agreementBtn = document.getElementById('agreement-btn');
const agreementOutput = document.getElementById('agreement-output');

const urlParams = new URLSearchParams(window.location.search);
const propertyId = urlParams.get('id') || 'p1';
let currentProperty = null;

const detailAreaCoordinates = {
  thikatown: { latitude: -1.0333, longitude: 37.0693 },
  makongeni: { latitude: -1.0500, longitude: 37.1000 },
  kenyattaestate: { latitude: -1.0429, longitude: 37.0813 },
  section9: { latitude: -1.0365, longitude: 37.0618 },
  landless: { latitude: -1.0520, longitude: 37.1160 },
  ngoingwa: { latitude: -1.0180, longitude: 37.0840 },
  jomoko: { latitude: -1.0105, longitude: 37.1035 },
  juja: { latitude: -1.1018, longitude: 37.0144 },
  ruiru: { latitude: -1.1467, longitude: 36.9617 },
  trmroysambu: { latitude: -1.2180, longitude: 36.8870 },
  gardencity: { latitude: -1.2325, longitude: 36.8782 },
  kenyattaroadtheta: { latitude: -1.1080, longitude: 37.1010 },
  rundathika: { latitude: -1.0020, longitude: 37.0800 },
  runda: { latitude: -1.0020, longitude: 37.0800 },
  greenvalley: { latitude: -1.0217, longitude: 37.0870 },
};

function normalizeDetailLocation(value = '') {
  return String(value).toLowerCase().replace(/[^a-z0-9]/g, '');
}

function getDetailCoordinates(property = {}) {
  const hasCoordinates = property.latitude !== null &&
    property.longitude !== null &&
    property.latitude !== undefined &&
    property.longitude !== undefined &&
    property.latitude !== '' &&
    property.longitude !== '';
  const latitude = Number(property.latitude);
  const longitude = Number(property.longitude);

  if (hasCoordinates && Number.isFinite(latitude) && Number.isFinite(longitude)) {
    return { latitude, longitude };
  }

  return window.ThikaMaps?.getPropertyCoordinates(property) ||
    detailAreaCoordinates[normalizeDetailLocation(property.location || property.estate_name)];
}

function renderProperty(property, images = []) {
  currentProperty = property;
  const displayImages = normalizePropertyImages(property, images);
  const mainImage = displayImages[0]?.image_url || property.image || property.image_url || '';

  propertyTitle.textContent = property.title;
  propertyLocation.textContent = property.location || 'Thika';
  renderPropertyMapLink(property);
  propertyPrice.textContent = `KES ${Number(property.price || 0).toLocaleString()}`;
  propertyBeds.textContent = `${property.beds || property.bedrooms || 0} bed${Number(property.beds || property.bedrooms || 0) === 1 ? '' : 's'}`;
  propertyBaths.textContent = `${property.baths || property.bathrooms || 0} bath${Number(property.baths || property.bathrooms || 0) === 1 ? '' : 's'}`;
  propertyType.textContent = (property.type || property.property_type || 'home').replace('-', ' ');
  propertyAvailability.textContent = availabilityText(property);
  propertyImage.parentElement?.classList.toggle('no-image', !mainImage);
  if (mainImage) {
    propertyImage.src = mainImage;
  } else {
    propertyImage.removeAttribute('src');
  }
  propertyImage.alt = property.title;
  renderPropertyGallery(displayImages, property.title);
  propertyTags.innerHTML = (property.tags || property.amenities || []).map((tag) => `<li>${tag}</li>`).join('');
  renderTrust(property);
  renderMoveIn(property);
  renderLocationIntelligence(property);
  renderContactState();
  rememberRecentProperty(property);
}

function normalizePropertyImages(property, images = []) {
  const seen = new Set();
  const normalized = images
    .map((image) => ({
      image_url: image.image_url || image.image || image.url,
      caption: image.caption || property.title,
    }))
    .filter((image) => image.image_url && !seen.has(image.image_url) && seen.add(image.image_url));

  const fallback = property.image || property.image_url;
  if (fallback && !seen.has(fallback)) {
    normalized.unshift({ image_url: fallback, caption: property.title });
  }

  return normalized;
}

function renderPropertyGallery(images = [], title = 'Property') {
  if (!propertyImageGallery) return;

  if (images.length <= 1) {
    propertyImageGallery.innerHTML = '';
    return;
  }

  propertyImageGallery.innerHTML = images.map((image, index) => `
    <button type="button" class="gallery-thumb${index === 0 ? ' active' : ''}" data-image-url="${image.image_url}" aria-label="Show image ${index + 1}">
      <img src="${image.image_url}" alt="${image.caption || title}" />
    </button>
  `).join('');

  propertyImageGallery.querySelectorAll('.gallery-thumb').forEach((button) => {
    button.addEventListener('click', () => {
      propertyImage.src = button.dataset.imageUrl;
      propertyImageGallery.querySelectorAll('.gallery-thumb').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
    });
  });
}

function renderPropertyMapLink(property) {
  if (!propertyMapLink) return;

  const coordinates = getDetailCoordinates(property);
  const mapUrl = coordinates ? `https://www.google.com/maps/search/?api=1&query=${coordinates.latitude},${coordinates.longitude}` : '';

  propertyMapLink.hidden = !mapUrl;
  propertyMapLink.href = mapUrl || '#';
  propertyMapLink.setAttribute('aria-label', `Open ${property.title || 'property'} location on map`);
}

function availabilityText(property) {
  if (property.availability_status === 'available_from' && property.available_from) {
    return `From ${new Date(property.available_from).toLocaleDateString()}`;
  }
  if (property.availability_status === 'occupied') return 'Occupied';
  if (property.availability_status === 'under_review') return 'Under review';
  return 'Now';
}

function renderTrust(property) {
  const badge = document.getElementById('verified-badge');
  const lastConfirmed = document.getElementById('last-confirmed');
  const isVerified = property.landlord_verification_status === 'approved' || property.is_verified;

  if (badge) {
    badge.textContent = isVerified ? 'Verified landlord/listing' : 'Verification pending';
    badge.className = `status-badge ${isVerified ? 'status-active' : 'status-pending'}`;
  }

  if (lastConfirmed) {
    lastConfirmed.textContent = property.last_confirmed_at
      ? `Availability last confirmed ${new Date(property.last_confirmed_at).toLocaleDateString()}`
      : 'Availability has not been confirmed recently.';
  }
}

function renderMoveIn(property) {
  const total = Number(property.move_in_cost || property.price || 0);
  const moveInTotal = document.getElementById('move-in-total');
  const breakdown = document.getElementById('move-in-breakdown');

  if (moveInTotal) {
    moveInTotal.textContent = `Estimated move-in: KES ${total.toLocaleString()}`;
  }

  if (breakdown) {
    const items = [
      ['First month rent', property.price],
      ['Deposit', property.deposit_amount],
      ['Service charge', property.service_charge],
      ['Viewing fee', property.viewing_fee],
      ['Agent fee', property.agent_fee],
      ['Utilities', property.utility_terms || 'Confirm with landlord'],
      ['Payment notes', property.payment_notes || 'Confirm before paying'],
    ];

    breakdown.innerHTML = items.map(([label, value]) => {
      const display = typeof value === 'number' || !Number.isNaN(Number(value))
        ? `KES ${Number(value || 0).toLocaleString()}`
        : value;
      return `<li><strong>${label}:</strong> ${display}</li>`;
    }).join('');
  }
}

function renderLocationIntelligence(property) {
  const target = document.getElementById('location-intelligence');
  if (!target) return;

  const items = [
    ['Matatu stage', property.nearest_stage],
    ['School', property.nearby_school],
    ['Hospital', property.nearby_hospital],
    ['Mall / market', property.nearby_mall],
    ['Highway access', property.highway_access],
  ].filter((item) => item[1]);

  target.innerHTML = items.length
    ? items.map(([label, value]) => `<li><strong>${label}:</strong> ${value}</li>`).join('')
    : '<li>Location details are being verified.</li>';
}

function renderContactState() {
  const isSignedIn = Boolean(localStorage.getItem('token'));
  const note = document.getElementById('contact-login-note');

  if (note) {
    note.textContent = isSignedIn
      ? 'Send an inquiry or book a viewing with the landlord.'
      : 'Sign in to contact verified landlords and book viewings.';
  }

  if (inquiryForm) inquiryForm.hidden = !isSignedIn;
  if (bookingForm) bookingForm.hidden = !isSignedIn;
}

function rememberRecentProperty(property) {
  const recent = JSON.parse(localStorage.getItem('recent') || '[]');
  const next = [
    property,
    ...recent.filter((item) => item.id !== property.id),
  ].slice(0, 6);

  localStorage.setItem('recent', JSON.stringify(next));
}

async function renderPropertyDetail(id) {
  try {
    if (window.ThikaApi) {
      const { property, images } = await window.ThikaApi.properties.get(id);
      renderProperty(property, images || []);
      return;
    }
  } catch (error) {
    console.warn('Using demo property:', error.message);
  }

  const property = (window.properties || []).find((item) => item.id === id) || (window.properties || [])[0];

  if (!property) {
    propertyTitle.textContent = 'Property not found';
    return;
  }

  renderProperty(property, property.images || []);
}

if (inquiryForm) {
  inquiryForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const fields = inquiryForm.querySelectorAll('input, textarea');
    const payload = {
      property_id: currentProperty?.id,
      name: fields[0]?.value.trim(),
      email: fields[1]?.value.trim(),
      phone: fields[2]?.value.trim(),
      message: fields[3]?.value.trim() || `I am interested in ${currentProperty?.title || 'this property'}.`,
      subject: `Property inquiry: ${currentProperty?.title || 'Listing'}`,
    };

    try {
      if (!localStorage.getItem('token')) {
        throw new Error('Please sign in before contacting the landlord.');
      }
      if (window.ThikaApi) {
        await window.ThikaApi.contact.create(payload);
      }
      inquiryMessage.innerHTML = '<div class="form-success">Inquiry sent. The landlord will contact you soon.</div>';
      inquiryForm.reset();
    } catch (error) {
      inquiryMessage.innerHTML = `<div class="form-error">${error.message}</div>`;
    }
  });
}

if (bookingForm) {
  bookingForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    try {
      if (!localStorage.getItem('token')) {
        throw new Error('Please sign in before booking a viewing.');
      }

      await window.ThikaApi.bookings.create({
        property_id: currentProperty.id,
        viewing_date: document.getElementById('viewing-date').value,
        message: document.getElementById('booking-message').value.trim(),
      });

      inquiryMessage.innerHTML = '<div class="form-success">Viewing request sent. The landlord can confirm it from their dashboard.</div>';
      bookingForm.reset();
    } catch (error) {
      inquiryMessage.innerHTML = `<div class="form-error">${error.message}</div>`;
    }
  });
}

if (saveFavoriteBtn) {
  saveFavoriteBtn.addEventListener('click', async () => {
    if (!currentProperty) return;
    saveFavoriteBtn.textContent = 'Saving...';
    saveFavoriteBtn.disabled = true;

    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (!favorites.some((item) => item.id === currentProperty.id)) {
      favorites.push(currentProperty);
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }

    try {
      if (window.ThikaApi && localStorage.getItem('token')) {
        await window.ThikaApi.favorites.add(currentProperty.id);
      }
      saveFavoriteBtn.textContent = 'Saved to Favorites';
    } catch (error) {
      saveFavoriteBtn.textContent = 'Saved locally';
    }
  });
}

if (shareBtn) {
  shareBtn.addEventListener('click', async () => {
    const shareData = {
      title: propertyTitle.textContent,
      text: `Check out this property in ${propertyLocation.textContent}`,
      url: window.location.href,
    };

    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }

    await navigator.clipboard.writeText(window.location.href);
    shareBtn.textContent = 'Link Copied';
  });
}

if (reportListingBtn) {
  reportListingBtn.addEventListener('click', async () => {
    try {
      if (!localStorage.getItem('token')) {
        throw new Error('Please sign in before reporting a listing.');
      }

      const reason = prompt('Why are you reporting this listing? Examples: scam, unavailable, duplicate, wrong price.');
      if (!reason) return;
      const details = prompt('Add any helpful details for admin review.') || '';
      await window.ThikaApi.properties.report(currentProperty.id, { reason, details });
      reportMessage.innerHTML = '<div class="form-success">Report submitted to admin review.</div>';
    } catch (error) {
      reportMessage.innerHTML = `<div class="form-error">${error.message}</div>`;
    }
  });
}

if (agreementBtn) {
  agreementBtn.addEventListener('click', () => {
    if (!currentProperty) return;
    const draft = [
      'TENANCY AGREEMENT DRAFT',
      '',
      `Property: ${currentProperty.title}`,
      `Location: ${currentProperty.location || 'Thika'}`,
      `Monthly rent: KES ${Number(currentProperty.price || 0).toLocaleString()}`,
      `Deposit: KES ${Number(currentProperty.deposit_amount || 0).toLocaleString()}`,
      `Service charge: KES ${Number(currentProperty.service_charge || 0).toLocaleString()}`,
      `Utilities: ${currentProperty.utility_terms || 'To be confirmed by landlord and tenant'}`,
      '',
      'Notice period: 30 days unless the signed agreement states otherwise.',
      'Maintenance: Landlord handles structural repairs; tenant handles damage caused by misuse.',
      'Payment: Tenant should only pay to verified landlord or authorized account after viewing and confirming terms.',
      '',
      'This is a draft checklist and should be reviewed before signing.',
    ].join('\\n');

    agreementOutput.hidden = false;
    agreementOutput.textContent = draft;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderPropertyDetail(propertyId);
});
