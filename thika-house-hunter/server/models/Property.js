const { query } = require('../config/db');

const sortMap = {
  newest: 'p.created_at DESC',
  recommended: '(p.featured_until IS NOT NULL AND p.featured_until > NOW()) DESC, p.is_verified DESC, p.created_at DESC',
  'price-low': 'p.price ASC',
  'price-high': 'p.price DESC',
};

function normalizeLocation(value = '') {
  return String(value).toLowerCase().replace(/[^a-z0-9]/g, '');
}

function toClientProperty(row) {
  if (!row) return null;

  const amenities = Array.isArray(row.amenities) ? row.amenities : [];
  const price = Number(row.price || 0);

  return {
    id: row.id,
    landlord_id: row.landlord_id,
    landlord_name: row.landlord_name,
    estate_id: row.estate_id,
    estate_name: row.estate_name,
    title: row.title,
    description: row.description,
    location: row.location || row.estate_name || row.city || 'Thika',
    address: row.address,
    city: row.city,
    price,
    type: row.property_type,
    property_type: row.property_type,
    budget: budgetBucket(price),
    beds: Number(row.bedrooms || 0),
    bedrooms: Number(row.bedrooms || 0),
    baths: Number(row.bathrooms || 0),
    bathrooms: Number(row.bathrooms || 0),
    size_sqft: row.size_sqft ? Number(row.size_sqft) : null,
    status: row.status,
    availability_status: row.availability_status,
    available_from: row.available_from,
    last_confirmed_at: row.last_confirmed_at,
    deposit_amount: Number(row.deposit_amount || 0),
    service_charge: Number(row.service_charge || 0),
    viewing_fee: Number(row.viewing_fee || 0),
    agent_fee: Number(row.agent_fee || 0),
    utility_terms: row.utility_terms,
    payment_notes: row.payment_notes,
    move_in_cost: price + Number(row.deposit_amount || 0) + Number(row.service_charge || 0) + Number(row.viewing_fee || 0) + Number(row.agent_fee || 0),
    tags: amenities,
    amenities,
    image: row.image_url,
    image_url: row.image_url,
    latitude: row.latitude ? Number(row.latitude) : null,
    longitude: row.longitude ? Number(row.longitude) : null,
    is_verified: row.is_verified,
    is_featured: Boolean(row.featured_until && new Date(row.featured_until) > new Date()),
    featured_until: row.featured_until,
    landlord_verification_status: row.landlord_verification_status,
    landlord_verified_at: row.landlord_verified_at,
    nearest_stage: row.nearest_stage,
    nearby_school: row.nearby_school,
    nearby_hospital: row.nearby_hospital,
    nearby_mall: row.nearby_mall,
    highway_access: row.highway_access,
    duplicate_warning: row.duplicate_warning,
    report_count: Number(row.report_count || 0),
    average_rating: Number(row.average_rating || 0),
    review_count: Number(row.review_count || 0),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function budgetBucket(price) {
  if (price < 20000) return 'under-20000';
  if (price <= 40000) return '20000-40000';
  return '40000-plus';
}

function baseSelect() {
  return `
    SELECT
      p.*,
      COALESCE(e.name, p.location) AS estate_name,
      u.full_name AS landlord_name,
      u.landlord_verification_status,
      u.landlord_verified_at,
      COALESCE(
        (
          SELECT pi.image_url
          FROM property_images pi
          WHERE pi.property_id = p.id
            AND (pi.image_data IS NOT NULL OR pi.image_url NOT LIKE '/api/properties/images/%')
          ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.created_at ASC
          LIMIT 1
        ),
        p.image_url
      ) AS image_url,
      COALESCE(AVG(r.rating), 0) AS average_rating,
      COUNT(DISTINCT r.id) AS review_count,
      COUNT(DISTINCT lr.id) AS report_count
    FROM properties p
    LEFT JOIN estates e ON e.id = p.estate_id
    LEFT JOIN users u ON u.id = p.landlord_id
    LEFT JOIN reviews r ON r.property_id = p.id
    LEFT JOIN listing_reports lr ON lr.property_id = p.id AND lr.status IN ('new', 'reviewing')
  `;
}

async function list(filters = {}) {
  const params = [];
  const where = ['p.deleted_at IS NULL'];

  if (filters.status && filters.status !== 'all') {
    params.push(filters.status);
    where.push(`p.status = $${params.length}`);
  } else if (!filters.include_all && filters.status !== 'all') {
    where.push("p.status = 'active'");
  }

  if (filters.query) {
    params.push(`%${filters.query}%`);
    where.push(
      `(p.title ILIKE $${params.length} OR p.location ILIKE $${params.length} OR p.city ILIKE $${params.length} OR e.name ILIKE $${params.length})`,
    );
  }

  if (filters.location) {
    const normalizedLocation = normalizeLocation(filters.location);
    const locationValues = normalizedLocation === 'rundathika'
      ? [filters.location, 'Runda']
      : [filters.location];
    const locationChecks = locationValues.map((value) => {
      params.push(value);
      return `(REGEXP_REPLACE(LOWER(COALESCE(p.location, '')), '[^a-z0-9]', '', 'g') = REGEXP_REPLACE(LOWER($${params.length}), '[^a-z0-9]', '', 'g')
        OR REGEXP_REPLACE(LOWER(COALESCE(e.name, '')), '[^a-z0-9]', '', 'g') = REGEXP_REPLACE(LOWER($${params.length}), '[^a-z0-9]', '', 'g'))`;
    });
    where.push(`(${locationChecks.join(' OR ')})`);
  }

  if (filters.availability) {
    params.push(filters.availability);
    where.push(`p.availability_status = $${params.length}`);
  }

  if (filters.type) {
    params.push(filters.type);
    where.push(`p.property_type = $${params.length}`);
  }

  if (filters.landlord_id) {
    params.push(filters.landlord_id);
    where.push(`p.landlord_id = $${params.length}`);
  }

  if (filters.min_price) {
    params.push(Number(filters.min_price));
    where.push(`p.price >= $${params.length}`);
  }

  if (filters.max_price) {
    params.push(Number(filters.max_price));
    where.push(`p.price <= $${params.length}`);
  }

  if (filters.budget) {
    const budgetRows = await query(
      `SELECT min_price, max_price
       FROM budget_ranges
       WHERE value = $1 AND active = TRUE
       LIMIT 1`,
      [filters.budget],
    );
    const range = budgetRows[0];

    if (range) {
      params.push(Number(range.min_price || 0));
      where.push(`p.price >= $${params.length}`);

      if (range.max_price !== null) {
        params.push(Number(range.max_price));
        where.push(`p.price <= $${params.length}`);
      }
    } else if (filters.budget === 'under-20000') {
      where.push('p.price < 20000');
    } else if (filters.budget === '20000-40000') {
      where.push('p.price BETWEEN 20000 AND 40000');
    } else if (filters.budget === '40000-plus') {
      where.push('p.price > 40000');
    }
  }

  const sort = sortMap[filters.sort] || sortMap.recommended;
  const limit = Math.min(Number(filters.limit) || 50, 100);
  const offset = Number(filters.offset) || 0;
  params.push(limit, offset);

  const rows = await query(
    `${baseSelect()}
     WHERE ${where.join(' AND ')}
     GROUP BY p.id, e.name, u.full_name, u.landlord_verification_status, u.landlord_verified_at
     ORDER BY ${sort}
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );

  return rows.map(toClientProperty);
}

async function findById(id) {
  const rows = await query(
    `${baseSelect()}
     WHERE p.id = $1 AND p.deleted_at IS NULL
     GROUP BY p.id, e.name, u.full_name, u.landlord_verification_status, u.landlord_verified_at`,
    [id],
  );

  return toClientProperty(rows[0]);
}

async function create(data) {
  const rows = await query(
    `INSERT INTO properties (
       landlord_id, estate_id, title, description, property_type, price,
       bedrooms, bathrooms, size_sqft, location, address, city, latitude,
       longitude, amenities, image_url, status, is_verified, availability_status,
       available_from, last_confirmed_at, deposit_amount, service_charge, viewing_fee,
       agent_fee, utility_terms, payment_notes, nearest_stage, nearby_school,
       nearby_hospital, nearby_mall, highway_access, duplicate_warning
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15::jsonb, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33)
     RETURNING *`,
    [
      data.landlord_id,
      data.estate_id || null,
      data.title,
      data.description || null,
      data.property_type || data.type || 'apartment',
      Number(data.price),
      Number(data.bedrooms ?? data.beds ?? 0),
      Number(data.bathrooms ?? data.baths ?? 0),
      data.size_sqft || null,
      data.location || null,
      data.address || null,
      data.city || 'Thika',
      data.latitude || null,
      data.longitude || null,
      JSON.stringify(data.amenities || data.tags || []),
      data.image_url || data.image || null,
      data.status || 'active',
      Boolean(data.is_verified),
      data.availability_status || 'available_now',
      data.available_from || null,
      data.last_confirmed_at || new Date().toISOString(),
      Number(data.deposit_amount || data.price || 0),
      Number(data.service_charge || 0),
      Number(data.viewing_fee || 0),
      Number(data.agent_fee || 0),
      data.utility_terms || null,
      data.payment_notes || null,
      data.nearest_stage || null,
      data.nearby_school || null,
      data.nearby_hospital || null,
      data.nearby_mall || null,
      data.highway_access || null,
      data.duplicate_warning || null,
    ],
  );

  return findById(rows[0].id);
}

async function update(id, data) {
  const existing = await findById(id);
  if (!existing) return null;

  const rows = await query(
    `UPDATE properties
     SET estate_id = COALESCE($2, estate_id),
         title = COALESCE($3, title),
         description = COALESCE($4, description),
         property_type = COALESCE($5, property_type),
         price = COALESCE($6, price),
         bedrooms = COALESCE($7, bedrooms),
         bathrooms = COALESCE($8, bathrooms),
         size_sqft = COALESCE($9, size_sqft),
         location = COALESCE($10, location),
         address = COALESCE($11, address),
         city = COALESCE($12, city),
         latitude = COALESCE($13, latitude),
         longitude = COALESCE($14, longitude),
         amenities = COALESCE($15::jsonb, amenities),
         image_url = COALESCE($16, image_url),
         status = COALESCE($17, status),
         is_verified = COALESCE($18, is_verified),
         availability_status = COALESCE($19, availability_status),
         available_from = COALESCE($20, available_from),
         last_confirmed_at = COALESCE($21, last_confirmed_at),
         deposit_amount = COALESCE($22, deposit_amount),
         service_charge = COALESCE($23, service_charge),
         viewing_fee = COALESCE($24, viewing_fee),
         agent_fee = COALESCE($25, agent_fee),
         utility_terms = COALESCE($26, utility_terms),
         payment_notes = COALESCE($27, payment_notes),
         nearest_stage = COALESCE($28, nearest_stage),
         nearby_school = COALESCE($29, nearby_school),
         nearby_hospital = COALESCE($30, nearby_hospital),
         nearby_mall = COALESCE($31, nearby_mall),
         highway_access = COALESCE($32, highway_access),
         duplicate_warning = COALESCE($33, duplicate_warning),
         featured_until = COALESCE($34, featured_until),
         updated_at = NOW()
     WHERE id = $1 AND deleted_at IS NULL
     RETURNING id`,
    [
      id,
      data.estate_id || null,
      data.title || null,
      data.description || null,
      data.property_type || data.type || null,
      data.price === undefined ? null : Number(data.price),
      data.bedrooms === undefined && data.beds === undefined ? null : Number(data.bedrooms ?? data.beds),
      data.bathrooms === undefined && data.baths === undefined ? null : Number(data.bathrooms ?? data.baths),
      data.size_sqft || null,
      data.location || null,
      data.address || null,
      data.city || null,
      data.latitude || null,
      data.longitude || null,
      data.amenities || data.tags ? JSON.stringify(data.amenities || data.tags) : null,
      data.image_url || data.image || null,
      data.status || null,
      data.is_verified === undefined ? null : Boolean(data.is_verified),
      data.availability_status || null,
      data.available_from || null,
      data.last_confirmed_at || null,
      data.deposit_amount === undefined ? null : Number(data.deposit_amount),
      data.service_charge === undefined ? null : Number(data.service_charge),
      data.viewing_fee === undefined ? null : Number(data.viewing_fee),
      data.agent_fee === undefined ? null : Number(data.agent_fee),
      data.utility_terms || null,
      data.payment_notes || null,
      data.nearest_stage || null,
      data.nearby_school || null,
      data.nearby_hospital || null,
      data.nearby_mall || null,
      data.highway_access || null,
      data.duplicate_warning || null,
      data.featured_until || null,
    ],
  );

  return rows[0] ? findById(id) : null;
}

async function findPossibleDuplicates(data) {
  if (!data.title && !data.location) return [];

  const rows = await query(
    `${baseSelect()}
     WHERE p.deleted_at IS NULL
       AND p.price BETWEEN $1 AND $2
       AND (
         LOWER(p.title) = LOWER($3)
         OR LOWER(COALESCE(p.location, '')) = LOWER($4)
       )
     GROUP BY p.id, e.name, u.full_name, u.landlord_verification_status, u.landlord_verified_at
     ORDER BY p.created_at DESC
     LIMIT 5`,
    [
      Math.max(Number(data.price || 0) - 2000, 0),
      Number(data.price || 0) + 2000,
      data.title || '',
      data.location || '',
    ],
  );

  return rows.map(toClientProperty);
}

async function remove(id) {
  const rows = await query(
    `UPDATE properties
     SET deleted_at = NOW(), updated_at = NOW()
     WHERE id = $1 AND deleted_at IS NULL
     RETURNING id`,
    [id],
  );

  return rows[0] || null;
}

module.exports = {
  create,
  findById,
  findPossibleDuplicates,
  list,
  remove,
  toClientProperty,
  update,
};
