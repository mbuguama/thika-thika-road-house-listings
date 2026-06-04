const demoProperties = [
  {
    id: 'p1',
    title: '3BR Family House',
    location: 'Thika Town',
    latitude: -1.0333,
    longitude: 37.0693,
    price: 35000,
    type: 'house',
    budget: '20000-40000',
    beds: 3,
    baths: 2,
    tags: ['Furnished', 'Parking', 'Water storage'],
    image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
    availability_status: 'available_now',
    deposit_amount: 35000,
    move_in_cost: 70000,
    landlord_verification_status: 'approved',
  },
  {
    id: 'p2',
    title: 'Studio Apartment',
    location: 'Kenyatta Estate',
    latitude: -1.0429,
    longitude: 37.0813,
    price: 12000,
    type: 'studio',
    budget: 'under-20000',
    beds: 1,
    baths: 1,
    tags: ['Cozy', 'Near shops', 'Prepaid electricity'],
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
    availability_status: 'available_now',
    deposit_amount: 12000,
    move_in_cost: 24000,
  },
  {
    id: 'p3',
    title: '2BR Ruiru Apartment',
    location: 'Ruiru',
    latitude: -1.1467,
    longitude: 36.9617,
    price: 25000,
    type: 'apartment',
    budget: '20000-40000',
    beds: 2,
    baths: 2,
    tags: ['Secure', 'Balcony', 'Borehole'],
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=900&q=80',
    availability_status: 'available_from',
    available_from: '2026-07-01',
    deposit_amount: 25000,
    move_in_cost: 50000,
  },
  {
    id: 'p4',
    title: 'Executive 4BR Maisonette',
    location: 'Runda-Thika',
    latitude: -1.0020,
    longitude: 37.0800,
    price: 55000,
    type: 'house',
    budget: '40000-plus',
    beds: 4,
    baths: 3,
    tags: ['Garden', 'DSQ', 'Secure compound'],
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80',
    availability_status: 'available_now',
    deposit_amount: 55000,
    service_charge: 5000,
    move_in_cost: 115000,
  },
  {
    id: 'p5',
    title: '1BR Makongeni Apartment',
    location: 'Makongeni',
    latitude: -1.0500,
    longitude: 37.1000,
    price: 16000,
    type: 'apartment',
    budget: 'under-20000',
    beds: 1,
    baths: 1,
    tags: ['Near market', 'Water storage', 'Prepaid electricity'],
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80',
    availability_status: 'available_now',
    deposit_amount: 16000,
    move_in_cost: 32000,
  },
  {
    id: 'p6',
    title: '2BR Section 9 House',
    location: 'Section 9',
    latitude: -1.0365,
    longitude: 37.0618,
    price: 30000,
    type: 'house',
    budget: '20000-40000',
    beds: 2,
    baths: 2,
    tags: ['Close to CBD', 'Parking', 'Secure compound'],
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=900&q=80',
    availability_status: 'available_now',
    deposit_amount: 30000,
    move_in_cost: 60000,
  },
  {
    id: 'p7',
    title: 'Bedsitter in Landless',
    location: 'Landless',
    latitude: -1.0520,
    longitude: 37.1160,
    price: 9500,
    type: 'bedsitter',
    budget: 'under-20000',
    beds: 1,
    baths: 1,
    tags: ['Affordable', 'Near stage', 'Token meter'],
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
    availability_status: 'available_now',
    deposit_amount: 9500,
    move_in_cost: 19000,
  },
  {
    id: 'p8',
    title: '3BR Ngoingwa Family Home',
    location: 'Ngoingwa',
    latitude: -1.0180,
    longitude: 37.0840,
    price: 42000,
    type: 'house',
    budget: '40000-plus',
    beds: 3,
    baths: 2,
    tags: ['Quiet estate', 'Parking', 'Family friendly'],
    image: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=900&q=80',
    availability_status: 'available_from',
    available_from: '2026-07-15',
    deposit_amount: 42000,
    move_in_cost: 84000,
  },
  {
    id: 'p9',
    title: 'Jomoko 1BR Rental',
    location: 'Jomoko',
    latitude: -1.0105,
    longitude: 37.1035,
    price: 14500,
    type: 'apartment',
    budget: 'under-20000',
    beds: 1,
    baths: 1,
    tags: ['Growing area', 'Near shops', 'Borehole'],
    image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80',
    availability_status: 'available_now',
    deposit_amount: 14500,
    move_in_cost: 29000,
  },
  {
    id: 'p10',
    title: 'Juja Student Studio',
    location: 'Juja',
    latitude: -1.1018,
    longitude: 37.0144,
    price: 11000,
    type: 'studio',
    budget: 'under-20000',
    beds: 1,
    baths: 1,
    tags: ['Near JKUAT', 'Fast internet', 'Prepaid electricity'],
    image: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=900&q=80',
    availability_status: 'available_now',
    deposit_amount: 11000,
    move_in_cost: 22000,
  },
  {
    id: 'p11',
    title: 'TRM/Roysambu 2BR Apartment',
    location: 'TRM / Roysambu',
    latitude: -1.2180,
    longitude: 36.8870,
    price: 38000,
    type: 'apartment',
    budget: '20000-40000',
    beds: 2,
    baths: 2,
    tags: ['Near TRM', 'Lift access', 'Secure entry'],
    image: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=900&q=80',
    availability_status: 'available_from',
    available_from: '2026-07-05',
    deposit_amount: 38000,
    move_in_cost: 76000,
  },
  {
    id: 'p12',
    title: 'Garden City 1BR Apartment',
    location: 'Garden City',
    latitude: -1.2325,
    longitude: 36.8782,
    price: 45000,
    type: 'apartment',
    budget: '40000-plus',
    beds: 1,
    baths: 1,
    tags: ['Mall access', 'Modern finishes', 'Secure parking'],
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80',
    availability_status: 'available_now',
    deposit_amount: 45000,
    service_charge: 3500,
    move_in_cost: 93500,
  },
  {
    id: 'p13',
    title: 'Kenyatta Road / Theta Bungalow',
    location: 'Kenyatta Road / Theta',
    latitude: -1.1080,
    longitude: 37.1010,
    price: 33000,
    type: 'house',
    budget: '20000-40000',
    beds: 3,
    baths: 2,
    tags: ['Own compound', 'Family estate', 'Water storage'],
    image: 'https://images.unsplash.com/photo-1605146769289-440113cc3d00?auto=format&fit=crop&w=900&q=80',
    availability_status: 'available_now',
    deposit_amount: 33000,
    move_in_cost: 66000,
  },
];

window.properties = demoProperties;

const resultsSummary = document.getElementById('results-summary');
const listingGrid = document.getElementById('listing-grid');

function formatPrice(value) {
  return `KES ${Number(value || 0).toLocaleString()}`;
}

function saveLocalFavorite(property) {
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  const exists = favorites.some((item) => item.id === property.id);
  if (!exists) {
    favorites.push(property);
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }
}

function normalizeLocation(value = '') {
  return String(value).toLowerCase().replace(/[^a-z0-9]/g, '');
}

const fallbackAreaCoordinates = {
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

function getFallbackCoordinates(property = {}) {
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

  return fallbackAreaCoordinates[normalizeLocation(property.location || property.estate_name)];
}

function propertyMapAction(property) {
  const coordinates = window.ThikaMaps?.getPropertyCoordinates(property) || getFallbackCoordinates(property);
  const mapUrl = coordinates ? `https://www.google.com/maps/search/?api=1&query=${coordinates.latitude},${coordinates.longitude}` : '';

  return mapUrl
    ? `<a href="${mapUrl}" target="_blank" rel="noreferrer" class="button button-secondary map-pin-link" aria-label="Open ${property.title} location on map"><span class="pin-icon" aria-hidden="true"></span>Map</a>`
    : '';
}

function renderPropertyCard(property) {
  if (window.PropertyCard?.template) return window.PropertyCard.template(property);
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
          <span class="badge">${property.type || property.property_type}</span>
          <span class="badge">${property.location}</span>
          ${property.is_featured ? '<span class="badge badge-featured">Featured</span>' : ''}
          ${property.landlord_verification_status === 'approved' || property.is_verified ? '<span class="badge badge-verified">Verified</span>' : ''}
        </div>
        <h3>${property.title}</h3>
        <p class="property-price">${formatPrice(property.price)}</p>
        <ul class="property-meta">
          <li>${property.beds || property.bedrooms || 0} beds</li>
          <li>${property.baths || property.bathrooms || 0} baths</li>
          <li>${property.availability_status === 'available_from' ? 'Available from date' : 'Available now'}</li>
          <li>Move-in KES ${Number(property.move_in_cost || property.price || 0).toLocaleString()}</li>
        </ul>
        <div class="property-actions">
          <a href="property.html?id=${property.id}" class="button button-secondary">View</a>
          ${propertyMapAction(property)}
          <button type="button" class="button button-primary add-favorite">Favorite</button>
        </div>
      </div>
    </article>
  `;
}

function renderProperties(list) {
  if (!listingGrid) return;

  listingGrid.innerHTML = list.length
    ? list.map(renderPropertyCard).join('')
    : '<div class="empty-state"><h3>No properties found</h3><p>Try a different search or budget range.</p></div>';

  if (resultsSummary) {
    resultsSummary.textContent = `Showing ${list.length} ${list.length === 1 ? 'property' : 'properties'}`;
  }

  document.querySelectorAll('.add-favorite').forEach((button) => {
    button.addEventListener('click', async () => {
      const card = button.closest('.property-card');
      const property = window.properties.find((item) => item.id === card?.dataset.id);
      if (!property) return;

      button.textContent = 'Saving...';
      button.disabled = true;

      try {
        if (window.ThikaApi && localStorage.getItem('token')) {
          await window.ThikaApi.favorites.add(property.id);
        }
        saveLocalFavorite(property);
        button.textContent = 'Saved';
      } catch (error) {
        saveLocalFavorite(property);
        button.textContent = 'Saved locally';
      }
    });
  });
}

function filterProperties(filters) {
  return demoProperties.filter((property) => {
    const query = filters.query || filters.q || '';
    const matchesQuery =
      !query ||
      property.title.toLowerCase().includes(query) ||
      property.location.toLowerCase().includes(query);
    const matchesType = !filters.type || property.type === filters.type;
    const matchesLocation = !filters.location || normalizeLocation(property.location) === normalizeLocation(filters.location);
    const budgetRange = filters.budget ? window.ThikaMarketSettings?.getBudgetRange(filters.budget) : null;
    const matchesBudget = !filters.budget ||
      (budgetRange
        ? property.price >= Number(budgetRange.min_price || 0) &&
          (budgetRange.max_price === null || property.price <= Number(budgetRange.max_price))
        : property.budget === filters.budget);
    const matchesAvailability = !filters.availability || property.availability_status === filters.availability;
    return matchesQuery && matchesType && matchesLocation && matchesBudget && matchesAvailability;
  });
}

function sortProperties(list, sortKey) {
  if (sortKey === 'price-low') return [...list].sort((a, b) => a.price - b.price);
  if (sortKey === 'price-high') return [...list].sort((a, b) => b.price - a.price);
  return list;
}

function getFilterValues() {
  const form = document.getElementById('explore-filters');
  if (!form) return {};
  const fields = form.elements;

  return {
    query: fields.namedItem('query')?.value.trim().toLowerCase() || '',
    location: fields.namedItem('location')?.value || '',
    type: fields.namedItem('type')?.value || '',
    budget: fields.namedItem('budget')?.value || '',
    availability: fields.namedItem('availability')?.value || '',
    sort: fields.namedItem('sort')?.value || 'recommended',
  };
}

async function loadProperties(filters = {}) {
  if (listingGrid) listingGrid.innerHTML = '<div class="loader">Loading properties...</div>';

  try {
    if (window.ThikaApi) {
      const response = await window.ThikaApi.properties.list(filters);
      window.properties = response.properties || [];
      renderProperties(window.properties);
      return;
    }
  } catch (error) {
    console.warn('Using demo properties:', error.message);
  }

  const filtered = filterProperties(filters);
  const sorted = sortProperties(filtered, filters.sort);
  window.properties = demoProperties;
  renderProperties(sorted);
}

function applyFilters(event) {
  if (event) event.preventDefault();
  loadProperties(getFilterValues());
}

function applyQueryStringToForm() {
  const form = document.getElementById('explore-filters');
  if (!form) return {};
  const fields = form.elements;

  const params = new URLSearchParams(window.location.search);
  const query = params.get('q') || params.get('query') || '';
  const location = params.get('location') || '';
  const type = params.get('type') || '';
  const budget = params.get('budget') || '';

  if (query) fields.namedItem('query').value = query;
  if (location && fields.namedItem('location')) {
    const selectedArea = window.ThikaMaps?.getArea(location)?.value || location;
    fields.namedItem('location').value = selectedArea;
    window.ThikaMaps?.selectExploreArea(selectedArea);
  }
  if (type) fields.namedItem('type').value = type;
  if (budget) fields.namedItem('budget').value = budget;

  return getFilterValues();
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('explore-filters');
  if (form) {
    form.addEventListener('submit', (event) => {
      window.ThikaMaps?.selectExploreArea(form.elements.namedItem('location')?.value || '');
      applyFilters(event);
    });
  }

  document.addEventListener('thika:location-selected', (event) => {
    const locationField = form?.elements.namedItem('location');
    if (!locationField) return;
    locationField.value = event.detail?.location || '';
    loadProperties(getFilterValues());
  });

  document.addEventListener('thika:market-settings-loaded', () => {
    loadProperties(applyQueryStringToForm());
  });

  loadProperties(applyQueryStringToForm());
});

window.ThikaProperties = {
  demoProperties,
  formatPrice,
  loadProperties,
  renderProperties,
};
