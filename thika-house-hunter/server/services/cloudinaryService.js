const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');
const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');

function bufferToDataUri(buffer, mimetype = 'image/jpeg') {
  return `data:${mimetype};base64,${buffer.toString('base64')}`;
}

function extensionFromMime(mimetype = 'image/jpeg') {
  if (mimetype.includes('png')) return 'png';
  if (mimetype.includes('webp')) return 'webp';
  if (mimetype.includes('gif')) return 'gif';
  return 'jpg';
}

async function saveLocalImage(buffer, folder, mimetype) {
  const section = String(folder || 'properties').split('/').filter(Boolean).pop() || 'properties';
  const uploadDir = path.join(__dirname, '..', '..', 'client', 'uploads', section);
  const filename = `${crypto.randomUUID()}.${extensionFromMime(mimetype)}`;

  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, filename), buffer);

  return {
    image_url: `/uploads/${section}/${filename}`,
    public_id: `local/${section}/${filename}`,
  };
}

async function uploadImageBuffer(buffer, folder = 'thika-house-hunter', mimetype = 'image/jpeg') {
  if (!isCloudinaryConfigured) {
    return saveLocalImage(buffer, folder, mimetype);
  }

  const result = await cloudinary.uploader.upload(bufferToDataUri(buffer, mimetype), {
    folder,
    resource_type: 'image',
  });

  return {
    image_url: result.secure_url,
    public_id: result.public_id,
  };
}

async function deleteImage(publicId) {
  if (!isCloudinaryConfigured || !publicId) return null;
  return cloudinary.uploader.destroy(publicId);
}

module.exports = {
  deleteImage,
  uploadImageBuffer,
};
