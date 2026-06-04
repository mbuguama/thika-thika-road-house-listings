function scoreProperty(property, preferences = {}) {
  let score = 0;

  if (property.is_verified) score += 20;
  if (property.average_rating) score += Number(property.average_rating) * 5;
  if (property.review_count) score += Math.min(Number(property.review_count), 10);

  if (preferences.type && property.type === preferences.type) score += 15;
  if (preferences.location && property.location?.toLowerCase().includes(preferences.location.toLowerCase())) {
    score += 15;
  }

  if (preferences.max_price && Number(property.price) <= Number(preferences.max_price)) score += 10;
  if (preferences.bedrooms && Number(property.bedrooms || property.beds) >= Number(preferences.bedrooms)) {
    score += 10;
  }

  return score;
}

function rankProperties(properties, preferences = {}) {
  return [...properties]
    .map((property) => ({
      ...property,
      recommendation_score: scoreProperty(property, preferences),
    }))
    .sort((a, b) => b.recommendation_score - a.recommendation_score);
}

module.exports = {
  rankProperties,
  scoreProperty,
};
