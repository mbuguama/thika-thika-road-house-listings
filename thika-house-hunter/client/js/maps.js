const thikaLocationAreas = [
  {
    value: 'Thika Town',
    label: 'Thika Town',
    lat: -1.0333,
    lng: 37.0693,
    x: 48,
    y: 42,
    summary: 'Central access to CBD shops, Thika Level 5, banks, and matatu stages.',
  },
  {
    value: 'Makongeni',
    label: 'Makongeni',
    lat: -1.0500,
    lng: 37.1000,
    x: 58,
    y: 52,
    summary: 'Budget-friendly estates with local markets and quick town access.',
  },
  {
    value: 'Kenyatta Estate',
    label: 'Kenyatta Estate',
    lat: -1.0429,
    lng: 37.0813,
    x: 52,
    y: 48,
    summary: 'Popular residential estate near shops, schools, and commuter routes.',
  },
  {
    value: 'Section 9',
    label: 'Section 9',
    lat: -1.0365,
    lng: 37.0618,
    x: 43,
    y: 45,
    summary: 'Close to Thika CBD with convenient access to services.',
  },
  {
    value: 'Landless',
    label: 'Landless',
    lat: -1.0520,
    lng: 37.1160,
    x: 63,
    y: 57,
    summary: 'Residential area toward Garissa Road with practical local amenities.',
  },
  {
    value: 'Ngoingwa',
    label: 'Ngoingwa',
    lat: -1.0180,
    lng: 37.0840,
    x: 51,
    y: 34,
    summary: 'Quieter family estates with good links back into Thika town.',
  },
  {
    value: 'Jomoko',
    label: 'Jomoko',
    lat: -1.0105,
    lng: 37.1035,
    x: 59,
    y: 29,
    summary: 'Growing residential zone around Gatitu/Jomoko with affordable homes.',
  },
  {
    value: 'Juja',
    label: 'Juja',
    lat: -1.1018,
    lng: 37.0144,
    x: 30,
    y: 68,
    summary: 'Student and commuter market around JKUAT with direct Thika Road access.',
  },
  {
    value: 'Ruiru',
    label: 'Ruiru',
    lat: -1.1467,
    lng: 36.9617,
    x: 18,
    y: 78,
    summary: 'Large commuter hub with estates, malls, and direct superhighway access.',
  },
  {
    value: 'TRM / Roysambu',
    label: 'TRM/Roysambu',
    lat: -1.2180,
    lng: 36.8870,
    x: 10,
    y: 88,
    summary: 'Urban apartment market near TRM, Kasarani, USIU, and Thika Road.',
  },
  {
    value: 'Garden City',
    label: 'Garden City',
    lat: -1.2325,
    lng: 36.8782,
    x: 7,
    y: 82,
    summary: 'Premium Thika Road location near Garden City Mall and major offices.',
  },
  {
    value: 'Kenyatta Road / Theta',
    label: 'Kenyatta Road / Theta',
    lat: -1.1080,
    lng: 37.1010,
    x: 66,
    y: 72,
    summary: 'Fast-growing family-home corridor between Juja, Ruiru, and Thika.',
  },
  {
    value: 'Runda-Thika',
    label: 'Runda-Thika',
    lat: -1.0020,
    lng: 37.0800,
    x: 49,
    y: 22,
    aliases: ['Runda'],
    summary: 'Emerging residential pocket north of Thika with quieter family homes.',
  },
];

let selectExploreArea = () => {};

function pinPositionForCoordinates(latitude, longitude) {
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return {};

  const minLat = -1.24;
  const maxLat = -0.99;
  const minLng = 36.86;
  const maxLng = 37.13;
  const x = Math.min(Math.max(((lng - minLng) / (maxLng - minLng)) * 100, 5), 95);
  const y = Math.min(Math.max(((maxLat - lat) / (maxLat - minLat)) * 100, 5), 95);

  return { x: Math.round(x), y: Math.round(y) };
}

async function loadLocationSettings() {
  try {
    const response = await fetch('/api/settings');
    if (!response.ok) return thikaLocationAreas;

    const settings = await response.json();
    const locations = settings.locations || [];
    const existingKeys = new Map(thikaLocationAreas.map((area, index) => [normalizeLocation(area.value), index]));

    locations.forEach((location) => {
      const key = normalizeLocation(location.value || location.name || location.label);
      const lat = location.lat ?? location.latitude;
      const lng = location.lng ?? location.longitude;
      const pin = pinPositionForCoordinates(lat, lng);
      const area = {
        value: location.value || location.name || location.label,
        label: location.label || location.name || location.value,
        lat: Number.isFinite(Number(lat)) ? Number(lat) : null,
        lng: Number.isFinite(Number(lng)) ? Number(lng) : null,
        x: pin.x,
        y: pin.y,
        summary: location.summary || location.description || `${location.label || location.name} rental area.`,
      };

      if (existingKeys.has(key)) {
        thikaLocationAreas[existingKeys.get(key)] = {
          ...thikaLocationAreas[existingKeys.get(key)],
          ...area,
        };
        return;
      }

      existingKeys.set(key, thikaLocationAreas.length);
      thikaLocationAreas.push(area);
    });
  } catch (error) {
    console.warn('Using built-in location settings:', error.message);
  }

  return thikaLocationAreas;
}

function openDirections(latitude, longitude, label = 'Property') {
  if (!latitude || !longitude) return;

  window.open(getMapUrl(latitude, longitude), '_blank', 'noopener,noreferrer');
}

function getMapUrl(latitude, longitude) {
  if (!latitude || !longitude) return '';
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}

function normalizeLocation(value = '') {
  return String(value).toLowerCase().replace(/[^a-z0-9]/g, '');
}

function getArea(value) {
  const normalizedValue = normalizeLocation(value);
  return thikaLocationAreas.find((area) => (
    normalizeLocation(area.value) === normalizedValue ||
    normalizeLocation(area.label) === normalizedValue ||
    (area.aliases || []).some((alias) => normalizeLocation(alias) === normalizedValue)
  ));
}

function getPropertyCoordinates(property = {}) {
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

  const area = getArea(property.location || property.estate_name);
  if (!area) return null;

  return {
    latitude: area.lat,
    longitude: area.lng,
  };
}

function renderLocationOptions(select) {
  if (!select) return;

  const currentValue = select.value;
  const firstLabel = select.dataset.firstLabel || 'All areas';
  select.innerHTML = `<option value="">${firstLabel}</option>` + thikaLocationAreas
    .map((area) => `<option value="${area.value}">${area.label}</option>`)
    .join('');
  select.value = getArea(currentValue)?.value || currentValue;
}

function renderExploreLocationIntelligence() {
  const map = document.getElementById('location-map');
  const chips = document.getElementById('location-chips');
  const selected = document.getElementById('selected-location-insight');

  if (!map || !chips) return;

  const mappableAreas = thikaLocationAreas.filter((area) => Number.isFinite(Number(area.x)) && Number.isFinite(Number(area.y)));

  map.innerHTML = mappableAreas.map((area) => `
    <button
      type="button"
      class="map-pin"
      style="left:${area.x}%;top:${area.y}%"
      data-location="${area.value}"
      data-map-lat="${area.lat}"
      data-map-lng="${area.lng}"
      aria-label="Filter by ${area.label}"
      title="${area.label}"
    >
      <span></span>
    </button>
  `).join('');

  chips.innerHTML = [
    '<button type="button" class="location-chip active" data-location="">All areas</button>',
    ...thikaLocationAreas.map((area) => `<button type="button" class="location-chip" data-location="${area.value}">${area.label}</button>`),
  ].join('');

  function setSelected(value) {
    document.querySelectorAll('.location-chip').forEach((chip) => {
      chip.classList.toggle('active', chip.dataset.location === value);
    });
    document.querySelectorAll('.map-pin').forEach((pin) => {
      pin.classList.toggle('active', pin.dataset.location === value);
    });

    if (selected) {
      const area = getArea(value);
      selected.innerHTML = area
        ? `<strong>${area.label}</strong><span>${area.summary}</span><button type="button" class="map-link" data-map-lat="${area.lat}" data-map-lng="${area.lng}">Open map</button>`
        : '<strong>All Thika and Thika Road areas</strong><span>Use the pins or chips to focus your search by neighborhood.</span>';
    }
  }

  selectExploreArea = setSelected;

  function chooseLocation(value) {
    setSelected(value);
    document.dispatchEvent(new CustomEvent('thika:location-selected', { detail: { location: value } }));
  }

  map.querySelectorAll('.map-pin').forEach((pin) => {
    pin.addEventListener('click', () => chooseLocation(pin.dataset.location));
  });

  chips.querySelectorAll('.location-chip').forEach((chip) => {
    chip.addEventListener('click', () => chooseLocation(chip.dataset.location));
  });

  selected?.addEventListener('click', (event) => {
    const button = event.target.closest('.map-link');
    if (!button) return;
    openDirections(button.dataset.mapLat, button.dataset.mapLng);
  });

  setSelected('');
}

function bindMapButtons() {
  document.querySelectorAll('[data-map-button][data-map-lat][data-map-lng]').forEach((button) => {
    button.addEventListener('click', () => {
      openDirections(button.dataset.mapLat, button.dataset.mapLng, button.dataset.mapLabel);
    });
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadLocationSettings();
  document.querySelectorAll('select[data-location-select]').forEach(renderLocationOptions);
  renderExploreLocationIntelligence();
  bindMapButtons();
  document.dispatchEvent(new CustomEvent('thika:locations-loaded', { detail: { locations: thikaLocationAreas } }));
});

window.ThikaLocationAreas = thikaLocationAreas;
window.ThikaMaps = {
  getArea,
  getMapUrl,
  getPropertyCoordinates,
  loadLocationSettings,
  openDirections,
  renderLocationOptions,
  selectExploreArea: (value) => selectExploreArea(value || ''),
};
