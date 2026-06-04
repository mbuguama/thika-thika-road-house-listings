const AdCampaign = require('../models/AdCampaign');
const { asyncHandler } = require('../middleware/errorMiddleware');

function booleanEnv(value, fallback = false) {
  if (value === undefined) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

function getAutomaticAdConfig() {
  const provider = process.env.AUTO_ADS_PROVIDER || 'adsense';
  const client = process.env.GOOGLE_ADSENSE_CLIENT || 'ca-pub-5752684232679683';

  return {
    provider,
    enabled: provider === 'adsense' && Boolean(client),
    adsense: {
      client,
      auto_ads: booleanEnv(process.env.GOOGLE_ADSENSE_AUTO_ADS, true),
      test_mode: booleanEnv(process.env.GOOGLE_ADSENSE_TEST_MODE, false),
      slots: {
        tenant_home: process.env.GOOGLE_ADSENSE_SLOT_TENANT_HOME || '',
        tenant_explore_top: process.env.GOOGLE_ADSENSE_SLOT_TENANT_EXPLORE_TOP || '',
        tenant_explore_inline: process.env.GOOGLE_ADSENSE_SLOT_TENANT_EXPLORE_INLINE || '',
        tenant_property_sidebar: process.env.GOOGLE_ADSENSE_SLOT_TENANT_PROPERTY_SIDEBAR || '',
        tenant_favorites: process.env.GOOGLE_ADSENSE_SLOT_TENANT_FAVORITES || '',
        tenant_profile: process.env.GOOGLE_ADSENSE_SLOT_TENANT_PROFILE || '',
      },
    },
  };
}

const listActiveAds = asyncHandler(async (req, res) => {
  const ads = await AdCampaign.listActive(req.query);
  res.json({ ads });
});

const getAdConfig = asyncHandler(async (req, res) => {
  res.json(getAutomaticAdConfig());
});

const recordAdImpression = asyncHandler(async (req, res) => {
  await AdCampaign.recordImpression(req.params.id);
  res.json({ ok: true });
});

const recordAdClick = asyncHandler(async (req, res) => {
  const ad = await AdCampaign.recordClick(req.params.id);
  if (!ad) {
    res.status(404);
    throw new Error('Ad not found.');
  }

  res.json({ ok: true, target_url: ad.target_url });
});

module.exports = {
  getAdConfig,
  listActiveAds,
  recordAdClick,
  recordAdImpression,
};
