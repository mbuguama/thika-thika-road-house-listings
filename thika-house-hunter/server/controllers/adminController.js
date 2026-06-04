const User = require('../models/User');
const Property = require('../models/Property');
const Report = require('../models/Report');
const MarketSetting = require('../models/MarketSetting');
const AdCampaign = require('../models/AdCampaign');
const { query } = require('../config/db');
const { asyncHandler } = require('../middleware/errorMiddleware');

const getDashboard = asyncHandler(async (req, res) => {
  const rows = await query(
    `SELECT
       (SELECT COUNT(*)::int FROM users WHERE deleted_at IS NULL) AS users,
       (SELECT COUNT(*)::int FROM properties WHERE deleted_at IS NULL) AS properties,
       (SELECT COUNT(*)::int FROM bookings) AS bookings,
       (SELECT COUNT(*)::int FROM contact_messages WHERE status = 'new') AS messages,
       (SELECT COUNT(*)::int FROM properties WHERE status = 'pending' AND deleted_at IS NULL) AS pending_properties,
       (SELECT COUNT(*)::int FROM listing_reports WHERE status IN ('new', 'reviewing')) AS open_reports,
       (SELECT COUNT(*)::int FROM users WHERE landlord_verification_status = 'pending' AND deleted_at IS NULL) AS pending_landlords,
       (SELECT COUNT(*)::int FROM ad_campaigns WHERE status = 'active') AS active_ads`,
  );

  res.json({ summary: rows[0] });
});

const listUsers = asyncHandler(async (req, res) => {
  const users = await User.list(req.query);
  res.json({ users });
});

const listPendingProperties = asyncHandler(async (req, res) => {
  const properties = await Property.list({ status: 'pending', sort: 'newest', limit: 100 });
  res.json({ properties });
});

const listProperties = asyncHandler(async (req, res) => {
  const properties = await Property.list({
    ...req.query,
    include_all: true,
    status: req.query.status || 'all',
    sort: req.query.sort || 'newest',
    limit: req.query.limit || 100,
  });

  res.json({ properties });
});

const approveProperty = asyncHandler(async (req, res) => {
  const property = await Property.update(req.params.id, {
    status: 'active',
    is_verified: true,
  });

  if (!property) {
    res.status(404);
    throw new Error('Property not found.');
  }

  res.json({ property });
});

const deactivateProperty = asyncHandler(async (req, res) => {
  const property = await Property.update(req.params.id, {
    status: 'inactive',
  });

  if (!property) {
    res.status(404);
    throw new Error('Property not found.');
  }

  res.json({ property });
});

const listLandlordVerifications = asyncHandler(async (req, res) => {
  const users = await User.listVerificationQueue(req.query.status || 'pending');
  res.json({ users });
});

const updateLandlordVerification = asyncHandler(async (req, res) => {
  const allowed = ['approved', 'rejected', 'pending'];
  const status = req.body.status;

  if (!allowed.includes(status)) {
    res.status(400);
    throw new Error('Invalid verification status.');
  }

  const user = await User.updateLandlordVerification(req.params.id, status, req.body.notes);

  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }

  res.json({ user });
});

const listReports = asyncHandler(async (req, res) => {
  const reports = await Report.list(req.query);
  res.json({ reports });
});

const updateReportStatus = asyncHandler(async (req, res) => {
  const allowed = ['new', 'reviewing', 'resolved', 'dismissed'];
  const status = req.body.status;

  if (!allowed.includes(status)) {
    res.status(400);
    throw new Error('Invalid report status.');
  }

  const report = await Report.updateStatus(req.params.id, status, req.body.admin_notes);

  if (!report) {
    res.status(404);
    throw new Error('Report not found.');
  }

  res.json({ report });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.remove(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }

  res.json({ message: 'User deleted.', user });
});

const createLocation = asyncHandler(async (req, res) => {
  if (!req.body.name?.trim()) {
    res.status(400);
    throw new Error('Location name is required.');
  }

  const location = await MarketSetting.createLocation(req.body);
  res.status(201).json({ location });
});

const createPropertyType = asyncHandler(async (req, res) => {
  if (!req.body.label?.trim()) {
    res.status(400);
    throw new Error('Property type label is required.');
  }

  const propertyType = await MarketSetting.createPropertyType(req.body);
  res.status(201).json({ property_type: propertyType });
});

const createBudgetRange = asyncHandler(async (req, res) => {
  if (!req.body.label?.trim()) {
    res.status(400);
    throw new Error('Budget label is required.');
  }

  const budgetRange = await MarketSetting.createBudgetRange(req.body);
  res.status(201).json({ budget_range: budgetRange });
});

const listAds = asyncHandler(async (req, res) => {
  const ads = await AdCampaign.listAll(req.query);
  res.json({ ads, placements: AdCampaign.allowedPlacements });
});

const createAd = asyncHandler(async (req, res) => {
  if (!req.body.title?.trim() || !req.body.advertiser_name?.trim() || !req.body.target_url?.trim()) {
    res.status(400);
    throw new Error('Ad title, advertiser, and target URL are required.');
  }

  const ad = await AdCampaign.create(req.body);
  res.status(201).json({ ad });
});

const updateAd = asyncHandler(async (req, res) => {
  const ad = await AdCampaign.update(req.params.id, req.body);

  if (!ad) {
    res.status(404);
    throw new Error('Ad not found.');
  }

  res.json({ ad });
});

module.exports = {
  approveProperty,
  createAd,
  createBudgetRange,
  createLocation,
  createPropertyType,
  deactivateProperty,
  deleteUser,
  getDashboard,
  listAds,
  listLandlordVerifications,
  listProperties,
  listPendingProperties,
  listReports,
  listUsers,
  updateLandlordVerification,
  updateReportStatus,
  updateAd,
};
