const MarketSetting = require('../models/MarketSetting');
const { asyncHandler } = require('../middleware/errorMiddleware');

const listSettings = asyncHandler(async (req, res) => {
  const settings = await MarketSetting.listAll();
  res.json(settings);
});

module.exports = {
  listSettings,
};
