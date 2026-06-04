function profileCompletionScore(profile = {}) {
  const fields = [
    'display_name',
    'bio',
    'gender',
    'age',
    'town',
    'occupation',
    'education',
    'relationship_goal',
  ];

  const filled = fields.filter((field) => Boolean(profile[field])).length;
  const hasInterests = Array.isArray(profile.interests) && profile.interests.length > 0;
  return Math.min(Math.round(((filled + (hasInterests ? 1 : 0)) / (fields.length + 1)) * 100), 100);
}

function compatibilityScore(profile, viewerProfile) {
  if (!profile || !viewerProfile) return 50;

  const commonInterests = (profile.interests || []).filter((interest) => (viewerProfile.interests || []).includes(interest)).length;
  const townBoost = profile.town && viewerProfile.town && profile.town === viewerProfile.town ? 15 : 0;
  const goalBoost = profile.relationship_goal === viewerProfile.relationship_goal ? 10 : 0;
  const completenessBoost = Math.round((profile.profile_completion || 0) / 10);

  return Math.min(40 + commonInterests * 6 + townBoost + goalBoost + completenessBoost, 99);
}

module.exports = {
  compatibilityScore,
  profileCompletionScore,
};
