function formatPropertyPrice(value) {
  return `KES ${Number(value || 0).toLocaleString()}`;
}

const propertyCardAreaCoordinates = {
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

function normalizePropertyCardLocation(value = '') {
  return String(value).toLowerCase().replace(/[^a-z0-9]/g, '');
}

function getPropertyCardCoordinates(property = {}) {
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

  const helperCoordinates = window.ThikaMaps?.getPropertyCoordinates(property);
  if (helperCoordinates) return helperCoordinates;

  return propertyCardAreaCoordinates[normalizePropertyCardLocation(property.location || property.estate_name)];
}

function propertyCardMapUrl(coordinates) {
  if (!coordinates) return '';
  return `https://www.google.com/maps/search/?api=1&query=${coordinates.latitude},${coordinates.longitude}`;
}

function propertyCardTemplate(property, options = {}) {
  const action = options.favorite
    ? '<button type="button" class="button button-secondary remove-favorite">Remove</button>'
    : '<button type="button" class="button button-primary add-favorite">Favorite</button>';
  const coordinates = getPropertyCardCoordinates(property);
  const mapUrl = propertyCardMapUrl(coordinates);
  const mapAction = mapUrl
    ? `<a href="${mapUrl}" target="_blank" rel="noreferrer" class="button button-secondary map-pin-link" aria-label="Open ${property.title} location on map"><span class="pin-icon" aria-hidden="true"></span>Map</a>`
    : '';
  const imageUrl = property.image || property.image_url;
  const imageMarkup = imageUrl
    ? `<img src="${imageUrl}" alt="${property.title}" />`
    : '<div class="property-thumb-placeholder">No photo yet</div>';

  return `
    <article class="property-card" data-id="${property.id}">
      <div class="property-thumb">
        ${imageMarkup}
      </div>
      <div class="property-card-body">
        <div class="property-labels">
          <span class="badge">${property.type || property.property_type || 'home'}</span>
          <span class="badge">${property.location || 'Thika'}</span>
          ${property.is_featured ? '<span class="badge badge-featured">Featured</span>' : ''}
          ${property.landlord_verification_status === 'approved' || property.is_verified ? '<span class="badge badge-verified">Verified</span>' : ''}
        </div>
        <h3>${property.title}</h3>
        <p class="property-price">${formatPropertyPrice(property.price)}</p>
        <ul class="property-meta">
          <li>${property.beds || property.bedrooms || 0} beds</li>
          <li>${property.baths || property.bathrooms || 0} baths</li>
          <li>${availabilityText(property)}</li>
          <li>Move-in KES ${Number(property.move_in_cost || property.price || 0).toLocaleString()}</li>
        </ul>
        <div class="property-actions">
          <a href="property.html?id=${property.id}" class="button button-secondary">View</a>
          ${mapAction}
          ${action}
        </div>
      </div>
    </article>
  `;
}

window.PropertyCard = {
  formatPropertyPrice,
  template: propertyCardTemplate,
};

function availabilityText(property) {
  if (property.availability_status === 'available_from' && property.available_from) {
    return `Available ${new Date(property.available_from).toLocaleDateString()}`;
  }
  if (property.availability_status === 'occupied') return 'Occupied';
  if (property.availability_status === 'under_review') return 'Under review';
  return 'Available now';
}
