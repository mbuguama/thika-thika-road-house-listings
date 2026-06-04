const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

function uploadImageBuffer(file, folder = process.env.CLOUDINARY_FOLDER || 'kenya-connect') {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured.');
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );

    stream.end(file.buffer);
  });
}

module.exports = {
  uploadImageBuffer,
};
