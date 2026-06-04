const { query } = require('../config/db');

const allowedPlacements = [
  'tenant_home',
  'tenant_explore_top',
  'tenant_explore_inline',
  'tenant_property_sidebar',
  'tenant_favorites',
  'tenant_profile',
];

function normalizePlacement(value) {
  return allowedPlacements.includes(value) ? value : 'tenant_explore_inline';
}

function toClientAd(row) {
  if (!row) return null;

  return {
    id: row.id,
    title: row.title,
    advertiser_name: row.advertiser_name,
    placement: row.placement,
    description: row.description,
    image_url: row.image_url,
    target_url: row.target_url,
    cta_label: row.cta_label,
    status: row.status,
    start_at: row.start_at,
    end_at: row.end_at,
    sort_order: Number(row.sort_order || 0),
    impressions_count: Number(row.impressions_count || 0),
    clicks_count: Number(row.clicks_count || 0),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function requireValidUrl(value, fieldName) {
  if (!value) return null;

  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Invalid protocol');
    return url.toString();
  } catch (error) {
    const validationError = new Error(`${fieldName} must be a valid http or https URL.`);
    validationError.statusCode = 400;
    throw validationError;
  }
}

async function listActive({ placement, limit = 2 } = {}) {
  const params = [];
  const where = [
    "status = 'active'",
    '(start_at IS NULL OR start_at <= NOW())',
    '(end_at IS NULL OR end_at >= NOW())',
  ];

  if (placement) {
    params.push(normalizePlacement(placement));
    where.push(`placement = $${params.length}`);
  }

  params.push(Math.min(Number(limit) || 2, 6));

  const rows = await query(
    `SELECT *
     FROM ad_campaigns
     WHERE ${where.join(' AND ')}
     ORDER BY sort_order ASC, created_at DESC
     LIMIT $${params.length}`,
    params,
  );

  return rows.map(toClientAd);
}

async function listAll({ placement, status, limit = 100 } = {}) {
  const params = [];
  const where = [];

  if (placement && placement !== 'all') {
    params.push(normalizePlacement(placement));
    where.push(`placement = $${params.length}`);
  }

  if (status && status !== 'all') {
    params.push(status === 'inactive' ? 'inactive' : 'active');
    where.push(`status = $${params.length}`);
  }

  params.push(Math.min(Number(limit) || 100, 200));

  const rows = await query(
    `SELECT *
     FROM ad_campaigns
     ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY created_at DESC
     LIMIT $${params.length}`,
    params,
  );

  return rows.map(toClientAd);
}

async function create(data) {
  const rows = await query(
    `INSERT INTO ad_campaigns (
       title, advertiser_name, placement, description, image_url, target_url,
       cta_label, status, start_at, end_at, sort_order
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [
      data.title,
      data.advertiser_name,
      normalizePlacement(data.placement),
      data.description || null,
      requireValidUrl(data.image_url, 'Image URL'),
      requireValidUrl(data.target_url, 'Target URL'),
      data.cta_label || 'Learn more',
      data.status === 'inactive' ? 'inactive' : 'active',
      data.start_at || null,
      data.end_at || null,
      Number(data.sort_order || 0),
    ],
  );

  return toClientAd(rows[0]);
}

async function update(id, data) {
  const rows = await query(
    `UPDATE ad_campaigns
     SET title = COALESCE($2, title),
         advertiser_name = COALESCE($3, advertiser_name),
         placement = COALESCE($4, placement),
         description = COALESCE($5, description),
         image_url = COALESCE($6, image_url),
         target_url = COALESCE($7, target_url),
         cta_label = COALESCE($8, cta_label),
         status = COALESCE($9, status),
         start_at = COALESCE($10, start_at),
         end_at = COALESCE($11, end_at),
         sort_order = COALESCE($12, sort_order),
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [
      id,
      data.title || null,
      data.advertiser_name || null,
      data.placement ? normalizePlacement(data.placement) : null,
      data.description || null,
      data.image_url ? requireValidUrl(data.image_url, 'Image URL') : null,
      data.target_url ? requireValidUrl(data.target_url, 'Target URL') : null,
      data.cta_label || null,
      data.status ? (data.status === 'inactive' ? 'inactive' : 'active') : null,
      data.start_at || null,
      data.end_at || null,
      data.sort_order === undefined ? null : Number(data.sort_order),
    ],
  );

  return toClientAd(rows[0]);
}

async function recordImpression(id) {
  const rows = await query(
    `UPDATE ad_campaigns
     SET impressions_count = impressions_count + 1
     WHERE id = $1
     RETURNING id`,
    [id],
  );

  return rows[0] || null;
}

async function recordClick(id) {
  const rows = await query(
    `UPDATE ad_campaigns
     SET clicks_count = clicks_count + 1
     WHERE id = $1
     RETURNING id, target_url`,
    [id],
  );

  return rows[0] || null;
}

module.exports = {
  allowedPlacements,
  create,
  listActive,
  listAll,
  recordClick,
  recordImpression,
  update,
};
