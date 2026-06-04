const Report = require('../models/Report');
const Property = require('../models/Property');
const { asyncHandler } = require('../middleware/errorMiddleware');

const createReport = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.propertyId || req.body.property_id);

  if (!property) {
    res.status(404);
    throw new Error('Property not found.');
  }

  if (!req.body.reason) {
    res.status(400);
    throw new Error('Report reason is required.');
  }

  const report = await Report.create({
    property_id: property.id,
    reporter_id: req.user?.id || null,
    reason: req.body.reason,
    details: req.body.details,
  });

  res.status(201).json({ report });
});

module.exports = {
  createReport,
};
