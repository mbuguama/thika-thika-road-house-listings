const { query } = require('../config/db');

function slugify(value = '') {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toLocation(row) {
  return {
    id: row.id,
    value: row.name,
    label: row.name,
    name: row.name,
    description: row.description,
    summary: row.description,
    city: row.city,
    lat: row.latitude === null ? null : Number(row.latitude),
    lng: row.longitude === null ? null : Number(row.longitude),
    latitude: row.latitude === null ? null : Number(row.latitude),
    longitude: row.longitude === null ? null : Number(row.longitude),
    active: row.active,
    sort_order: Number(row.sort_order || 0),
  };
}

function toPropertyType(row) {
  return {
    id: row.id,
    label: row.label,
    value: row.value,
    active: row.active,
    sort_order: Number(row.sort_order || 0),
  };
}

function toBudgetRange(row) {
  return {
    id: row.id,
    label: row.label,
    value: row.value,
    min_price: Number(row.min_price || 0),
    max_price: row.max_price === null ? null : Number(row.max_price),
    active: row.active,
    sort_order: Number(row.sort_order || 0),
  };
}

async function listLocations({ includeInactive = false } = {}) {
  const rows = await query(
    `SELECT id, name, description, city, latitude, longitude, active, sort_order
     FROM estates
     WHERE ($1::boolean = TRUE OR active = TRUE)
     ORDER BY sort_order ASC, name ASC`,
    [Boolean(includeInactive)],
  );

  return rows.map(toLocation);
}

async function createLocation(data) {
  const rows = await query(
    `INSERT INTO estates (name, description, city, latitude, longitude, active, sort_order)
     VALUES ($1, $2, $3, $4, $5, TRUE, $6)
     ON CONFLICT (name) DO UPDATE
     SET description = EXCLUDED.description,
         city = EXCLUDED.city,
         latitude = EXCLUDED.latitude,
         longitude = EXCLUDED.longitude,
         active = TRUE,
         sort_order = EXCLUDED.sort_order,
         updated_at = NOW()
     RETURNING id, name, description, city, latitude, longitude, active, sort_order`,
    [
      data.name,
      data.description || null,
      data.city || 'Thika',
      data.latitude === undefined || data.latitude === '' ? null : Number(data.latitude),
      data.longitude === undefined || data.longitude === '' ? null : Number(data.longitude),
      data.sort_order === undefined || data.sort_order === '' ? 0 : Number(data.sort_order),
    ],
  );

  return toLocation(rows[0]);
}

async function listPropertyTypes({ includeInactive = false } = {}) {
  const rows = await query(
    `SELECT id, label, value, active, sort_order
     FROM property_types
     WHERE ($1::boolean = TRUE OR active = TRUE)
     ORDER BY sort_order ASC, label ASC`,
    [Boolean(includeInactive)],
  );

  return rows.map(toPropertyType);
}

async function createPropertyType(data) {
  const label = String(data.label || '').trim();
  const value = slugify(data.value || label);
  const rows = await query(
    `INSERT INTO property_types (label, value, active, sort_order)
     VALUES ($1, $2, TRUE, $3)
     ON CONFLICT (value) DO UPDATE
     SET label = EXCLUDED.label,
         active = TRUE,
         sort_order = EXCLUDED.sort_order,
         updated_at = NOW()
     RETURNING id, label, value, active, sort_order`,
    [
      label,
      value,
      data.sort_order === undefined || data.sort_order === '' ? 0 : Number(data.sort_order),
    ],
  );

  return toPropertyType(rows[0]);
}

async function listBudgetRanges({ includeInactive = false } = {}) {
  const rows = await query(
    `SELECT id, label, value, min_price, max_price, active, sort_order
     FROM budget_ranges
     WHERE ($1::boolean = TRUE OR active = TRUE)
     ORDER BY sort_order ASC, min_price ASC, label ASC`,
    [Boolean(includeInactive)],
  );

  return rows.map(toBudgetRange);
}

async function createBudgetRange(data) {
  const label = String(data.label || '').trim();
  const value = slugify(data.value || label);
  const maxPrice = data.max_price === undefined || data.max_price === '' ? null : Number(data.max_price);
  const rows = await query(
    `INSERT INTO budget_ranges (label, value, min_price, max_price, active, sort_order)
     VALUES ($1, $2, $3, $4, TRUE, $5)
     ON CONFLICT (value) DO UPDATE
     SET label = EXCLUDED.label,
         min_price = EXCLUDED.min_price,
         max_price = EXCLUDED.max_price,
         active = TRUE,
         sort_order = EXCLUDED.sort_order,
         updated_at = NOW()
     RETURNING id, label, value, min_price, max_price, active, sort_order`,
    [
      label,
      value,
      data.min_price === undefined || data.min_price === '' ? 0 : Number(data.min_price),
      maxPrice,
      data.sort_order === undefined || data.sort_order === '' ? 0 : Number(data.sort_order),
    ],
  );

  return toBudgetRange(rows[0]);
}

async function listAll(options = {}) {
  const [locations, propertyTypes, budgetRanges] = await Promise.all([
    listLocations(options),
    listPropertyTypes(options),
    listBudgetRanges(options),
  ]);

  return {
    locations,
    property_types: propertyTypes,
    budget_ranges: budgetRanges,
  };
}

module.exports = {
  createBudgetRange,
  createLocation,
  createPropertyType,
  listAll,
  listBudgetRanges,
  listLocations,
  listPropertyTypes,
  slugify,
};
