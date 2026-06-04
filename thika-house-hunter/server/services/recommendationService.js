const Property = require('../models/Property');
const { rankProperties } = require('./rankingService');

async function recommendProperties(preferences = {}) {
  const properties = await Property.list({
    query: preferences.location,
    type: preferences.type,
    max_price: preferences.max_price,
    limit: preferences.limit || 20,
    sort: 'recommended',
  });

  return rankProperties(properties, preferences);
}

module.exports = {
  recommendProperties,
};
