const Property = require('../models/Property');
const PropertyImage = require('../models/PropertyImage');
const Review = require('../models/Review');
const { asyncHandler } = require('../middleware/errorMiddleware');

function toImageBuffer(imageData) {
  if (Buffer.isBuffer(imageData)) return imageData;
  if (imageData instanceof Uint8Array) return Buffer.from(imageData);
  if (typeof imageData === 'string') {
    return Buffer.from(imageData.replace(/^\\x/, ''), 'hex');
  }

  return Buffer.from(imageData);
}

function ensureCanManageProperty(user, property) {
  if (!property) {
    const error = new Error('Property not found.');
    error.statusCode = 404;
    throw error;
  }

  if (user.role !== 'admin' && property.landlord_id !== user.id) {
    const error = new Error('You do not have permission to manage this property.');
    error.statusCode = 403;
    throw error;
  }
}

const listProperties = asyncHandler(async (req, res) => {
  const properties = await Property.list(req.query);
  res.json({ properties });
});

const getProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    res.status(404);
    throw new Error('Property not found.');
  }

  const [images, reviews] = await Promise.all([
    PropertyImage.listByProperty(req.params.id),
    Review.listByProperty(req.params.id),
  ]);

  res.json({ property, images, reviews });
});

const createProperty = asyncHandler(async (req, res) => {
  const landlordId = req.user.role === 'admin' && req.body.landlord_id ? req.body.landlord_id : req.user.id;
  const duplicates = await Property.findPossibleDuplicates(req.body);
  const property = await Property.create({
    ...req.body,
    landlord_id: landlordId,
    duplicate_warning: duplicates.length ? 'Possible duplicate listing detected. Admin should review title, location, and price.' : null,
  });

  res.status(201).json({ property, duplicates });
});

const updateProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  ensureCanManageProperty(req.user, property);

  const updatedProperty = await Property.update(req.params.id, req.body);
  res.json({ property: updatedProperty });
});

const deleteProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  ensureCanManageProperty(req.user, property);

  await Property.remove(req.params.id);
  res.json({ message: 'Property deleted.' });
});

const addPropertyImage = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  ensureCanManageProperty(req.user, property);

  let imageData = {
    image_url: req.body.image_url,
    public_id: req.body.public_id,
  };

  if (req.file) {
    imageData = {
      image_data: req.file.buffer,
      mime_type: req.file.mimetype,
      file_size: req.file.size,
    };
  }

  if (!imageData.image_url && !imageData.image_data) {
    res.status(400);
    throw new Error('Provide image_url or upload an image file.');
  }

  const image = await PropertyImage.create({
    property_id: req.params.id,
    image_url: imageData.image_url,
    image_data: imageData.image_data,
    mime_type: imageData.mime_type,
    file_size: imageData.file_size,
    public_id: imageData.public_id,
    caption: req.body.caption,
    is_primary: req.body.is_primary === 'true' || req.body.is_primary === true,
    sort_order: req.body.sort_order,
  });

  res.status(201).json({ image });
});

const getPropertyImageFile = asyncHandler(async (req, res) => {
  const image = await PropertyImage.findFileById(req.params.imageId);

  if (!image) {
    res.status(404);
    throw new Error('Image not found.');
  }

  const imageBuffer = toImageBuffer(image.image_data);

  res.setHeader('Content-Type', image.mime_type || 'application/octet-stream');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.setHeader('Content-Length', imageBuffer.length);

  res.end(imageBuffer);
});

module.exports = {
  addPropertyImage,
  createProperty,
  deleteProperty,
  getProperty,
  getPropertyImageFile,
  listProperties,
  updateProperty,
};
